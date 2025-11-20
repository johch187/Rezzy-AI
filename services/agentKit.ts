import { GoogleGenAI, Chat, FunctionDeclaration, Tool, Type } from "@google/genai";

const env = (import.meta as any).env || {};
const GEMINI_API_KEY = env.VITE_GEMINI_API_KEY as string | undefined;

// Initialize the GoogleGenAI instance (Singleton pattern)
let genAIInstance: GoogleGenAI | null = null;

const getGenAI = (): GoogleGenAI => {
  if (!genAIInstance) {
    if (!GEMINI_API_KEY) {
      throw new Error("VITE_GEMINI_API_KEY is not set. Frontend access is disabled; route Gemini calls through the backend.");
    }
    genAIInstance = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  }
  return genAIInstance;
};

export type ToolExecutor = (args: any, context: any) => Promise<any> | any;

export interface AgentTool {
    declaration: FunctionDeclaration;
    execute: ToolExecutor;
}

export interface AgentConfig {
    model: string;
    systemInstruction?: string;
    tools?: AgentTool[];
    thinkingBudget?: number;
    responseMimeType?: string;
    responseSchema?: any;
    temperature?: number;
}

/**
 * A lightweight Agent class that wraps Google Gemini's Chat API.
 * It automatically handles the "Tool Use Loop":
 * Model -> Function Call -> Execute -> Function Response -> Model -> Text
 */
export class Agent {
    private chatSession: Chat;
    private tools: Map<string, ToolExecutor>;
    private config: AgentConfig;

    constructor(config: AgentConfig) {
        this.config = config;
        this.tools = new Map();

        // Map tool names to their executors
        const toolDeclarations: FunctionDeclaration[] = [];
        if (config.tools) {
            config.tools.forEach(t => {
                this.tools.set(t.declaration.name, t.execute);
                toolDeclarations.push(t.declaration);
            });
        }

        const ai = getGenAI();
        
        // Configure the tool definitions for the model
        const agentTools: Tool[] = toolDeclarations.length > 0 
            ? [{ functionDeclarations: toolDeclarations }] 
            : [];

        this.chatSession = ai.chats.create({
            model: config.model,
            config: {
                systemInstruction: config.systemInstruction,
                tools: agentTools,
                responseMimeType: config.responseMimeType,
                responseSchema: config.responseSchema,
                temperature: config.temperature,
                ...(config.thinkingBudget ? { thinkingConfig: { thinkingBudget: config.thinkingBudget } } : {}),
            },
        });
    }

    /**
     * Sends a message to the agent and resolves when the agent returns a final text response.
     * The agent will autonomously loop through tool calls if necessary.
     * Includes retry logic for robustness.
     * 
     * @param message The user's input message.
     * @param context Context data to be passed to tool executors (e.g., current user profile).
     * @param onStep Optional callback to receive updates during the loop (e.g., "Thinking...", "Calling tool X...").
     * @param retries Number of retries on API failure (default: 1).
     */
    async chat(message: string, context: any = {}, onStep?: (status: string) => void, retries = 1): Promise<string> {
        let lastError: Error | undefined;

        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                let response = await this.chatSession.sendMessage({ message });

                // The Loop: Keep going while the model wants to call functions
                while (response.functionCalls && response.functionCalls.length > 0) {
                    const functionResponses = [];

                    for (const call of response.functionCalls) {
                        const executor = this.tools.get(call.name);
                        if (executor) {
                            if (onStep) onStep(`Executing action: ${call.name}...`);
                            
                            try {
                                // Execute the tool
                                const result = await executor(call.args, context);
                                
                                functionResponses.push({
                                    functionResponse: {
                                        name: call.name,
                                        id: call.id,
                                        response: { result: result }
                                    }
                                });
                            } catch (error: any) {
                                console.error(`Error executing tool ${call.name}:`, error);
                                functionResponses.push({
                                    functionResponse: {
                                        name: call.name,
                                        id: call.id,
                                        response: { error: error.message || "Unknown error occurred during tool execution." }
                                    }
                                });
                            }
                        } else {
                            console.warn(`Tool ${call.name} requested but not found.`);
                            functionResponses.push({
                                functionResponse: {
                                    name: call.name,
                                    id: call.id,
                                    response: { error: `Tool ${call.name} not found.` }
                                }
                            });
                        }
                    }

                    // Send function results back to the model
                    if (onStep) onStep('Processing results...');
                    response = await this.chatSession.sendMessage({ message: functionResponses });
                }

                const text = response.text || "";
                if (!text && !this.config.responseSchema) {
                    throw new Error("Model returned empty response.");
                }
                return text;

            } catch (error: any) {
                console.error(`Agent chat attempt ${attempt + 1} failed:`, error);
                lastError = error;
                if (attempt < retries) {
                    await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1))); // Backoff
                    // Re-initialize chat session on retry to clear potential bad state if needed, 
                    // though for simplicity we'll just retry the message on the existing session 
                    // or throw if it's a critical error.
                    // Ideally, we might want to recreate the Agent instance here, but that requires refactoring.
                }
            }
        }
        
        throw new Error(lastError?.message || "Agent failed to respond after retries.");
    }
}

/**
 * Helper to parse JSON from Agent response, handling potential markdown code blocks.
 */
export const parseAgentJson = <T>(text: string): T => {
    try {
        // Remove markdown code blocks if present (e.g. ```json ... ```)
        const cleanText = text.replace(/```json\n?|```/g, '').trim();
        return JSON.parse(cleanText) as T;
    } catch (e) {
        console.error("Failed to parse JSON from agent response:", text);
        throw new Error("The AI returned a malformed JSON response.");
    }
};
