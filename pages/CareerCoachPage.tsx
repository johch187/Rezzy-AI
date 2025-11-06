
import React, { useState, useEffect, useContext, useRef, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProfileContext } from '../App';
import { createCareerCoachSession } from '../services/careerCoachService';
import { generateCareerPath } from '../services/generationService';
import { LoadingSpinnerIcon, UserIcon } from '../components/Icons';
import type { Chat, GenerateContentResponse, Part } from '@google/genai';

// Simple markdown parser for bold text and lists
const SimpleMarkdown: React.FC<{ text: string }> = ({ text }) => {
    // A simple regex to check if there are list items to avoid wrapping single lines in <ul>
    const hasListItems = /^- .*/m.test(text);

    let html = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/^- (.*$)/gm, '<li class="list-disc ml-6">$1</li>');
        
    if(hasListItems) {
      html = html.replace(/(<li.*<\/li>)/gs, '<ul>$1</ul>');
    }
    
    html = html.replace(/\n/g, '<br />');

    return <div dangerouslySetInnerHTML={{ __html: html }} />;
};

const CareerCoachPage: React.FC = () => {
    const profileContext = useContext(ProfileContext);
    const navigate = useNavigate();
    const [messages, setMessages] = useState<{ role: 'user' | 'model' | 'system'; content: string; id: string }[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatSession = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    const [careerPathPrompt, setCareerPathPrompt] = useState<{
        show: boolean;
        currentRole: string;
        targetRole: string;
        isReplacing: boolean;
    } | null>(null);
    const [isGeneratingPath, setIsGeneratingPath] = useState(false);


    if (!profileContext) return <div>Loading...</div>
    const { profile, setProfile, documentHistory, activeProfileId } = profileContext;

    useEffect(() => {
        if (profile) {
            chatSession.current = createCareerCoachSession(profile, documentHistory);
            setMessages([{
                role: 'model',
                content: `Hi! I'm your Keju AI Career Coach. I've reviewed your "${profile.name}" profile and am ready to help. How can I assist you today?`,
                id: crypto.randomUUID()
            }]);
        }
    }, [profile, documentHistory, activeProfileId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, careerPathPrompt]);

    const handleFunctionCall = async (response: GenerateContentResponse): Promise<GenerateContentResponse | null> => {
        const functionCalls = response.functionCalls;
        if (!functionCalls || functionCalls.length === 0 || !profile) {
            return null; // No function call to handle
        }
    
        const functionResponses: Part[] = [];
        // Defer state updates until after the API call to avoid race conditions
        const postSendActions: (() => void)[] = [];
        let shouldNavigate = false;
    
        for (const call of functionCalls) {
            let functionExecutionResult: any;
    
            switch (call.name) {
                case 'updateProfessionalSummary': {
                    const { newSummary } = call.args;
                    functionExecutionResult = { result: "The user's professional summary was successfully updated." };
                    postSendActions.push(() => {
                        setProfile(prev => ({ ...prev, summary: newSummary as string }));
                        setMessages(prev => [...prev, {
                            role: 'system',
                            content: "Success! I've updated your professional summary on your Profile page.",
                            id: crypto.randomUUID()
                        }]);
                    });
                    break;
                }
                case 'navigateToResumeGenerator': {
                    if (shouldNavigate) break;
                    shouldNavigate = true;
                    const { jobDescription } = call.args;
                    functionExecutionResult = { result: "Successfully navigated user to the resume generator." };
                    postSendActions.push(() => {
                        setMessages(prev => [...prev, {
                            role: 'system',
                            content: "Perfect! Let's build a tailored resume for that role. I'll take you to the generator and pre-fill the job description.",
                            id: crypto.randomUUID()
                        }]);
                        setTimeout(() => {
                            navigate('/generate', { state: { jobDescription: jobDescription as string } });
                        }, 1500);
                    });
                    break;
                }
                 case 'navigateToCoffeeChat': {
                    if (shouldNavigate) break;
                    shouldNavigate = true;
                     const { counterpartInfo, mode } = call.args;
                     functionExecutionResult = { result: "Successfully navigated user to the coffee chat tool." };
                     postSendActions.push(() => {
                         const modeText = (mode as string) === 'prep' ? "prepare for your chat" : "write an outreach message";
                         setMessages(prev => [...prev, {
                            role: 'system',
                            content: `Great idea. I can definitely help you ${modeText}. I'm taking you to the Coffee Chat tool now.`,
                            id: crypto.randomUUID()
                        }]);
                         setTimeout(() => {
                            navigate('/coffee-chats', { state: { initialCounterpartInfo: counterpartInfo as string, initialMode: mode as 'prep' | 'reach_out' } });
                        }, 1500);
                     });
                    break;
                }
                case 'promptToCreateCareerPath': {
                    const { currentRole, targetRole, isReplacing } = call.args;
                    functionExecutionResult = { result: "The user has been prompted via a special UI to create a career path. I will wait for their next text response to know their decision." };
                    postSendActions.push(() => {
                        setCareerPathPrompt({
                            show: true,
                            currentRole: currentRole as string,
                            targetRole: targetRole as string,
                            isReplacing: isReplacing as boolean,
                        });
                    });
                    break;
                }
                default:
                    console.warn(`Unknown function call requested by model: ${call.name}`);
                    continue;
            }
            
            functionResponses.push({
                functionResponse: {
                  name: call.name,
                  response: functionExecutionResult,
                },
            });
        }
    
        if (chatSession.current && functionResponses.length > 0) {
            const modelResponse = await chatSession.current.sendMessage({ message: functionResponses });
            // After the API call is complete, execute all deferred state updates.
            postSendActions.forEach(action => action());
            return modelResponse;
        }
    
        return null;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading || !chatSession.current) return;

        const newUserMessage = { role: 'user' as const, content: userInput, id: crypto.randomUUID() };
        setMessages(prev => [...prev, newUserMessage]);
        const currentInput = userInput;
        setUserInput('');
        setIsLoading(true);
        setCareerPathPrompt(null); // Hide any open prompts when user types something new

        try {
            let response = await chatSession.current.sendMessage({ message: currentInput });
            
            if (response && response.text) {
                const modelResponse = { role: 'model' as const, content: response.text, id: crypto.randomUUID() };
                setMessages(prev => [...prev, modelResponse]);
            }
            
            const functionCallFollowUpResponse = await handleFunctionCall(response);

            if (functionCallFollowUpResponse && functionCallFollowUpResponse.text) {
                const modelResponse = { role: 'model' as const, content: functionCallFollowUpResponse.text, id: crypto.randomUUID() };
                setMessages(prev => [...prev, modelResponse]);
            }

        } catch (error) {
            console.error("Error chatting with coach:", error);
            const errorMessage = { role: 'system' as const, content: 'Sorry, I encountered an error. Please try again.', id: crypto.randomUUID() };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCreatePath = () => {
        if (!careerPathPrompt || !profile) return;
        const { currentRole, targetRole } = careerPathPrompt;

        setIsGeneratingPath(true);
        setCareerPathPrompt(null);

        setMessages(prev => [...prev, {
            role: 'system',
            content: `Great! I've started creating your personalized career path to become a ${targetRole}. This can take a minute or two. Feel free to ask me other questions while you wait!`,
            id: crypto.randomUUID(),
        }]);

        // Run the generation in the background without awaiting
        generateCareerPath(profile, currentRole, targetRole)
            .then(newPath => {
                setProfile(prev => ({...prev, careerPath: newPath}));
                
                const confirmationText = `I've finished creating your career path to becoming a **${targetRole}**! You can see the full, detailed plan on the 'Career Path' page. What should we look at next?`;
                
                setMessages(prev => [...prev, { 
                    role: 'model', 
                    content: confirmationText, 
                    id: crypto.randomUUID() 
                }]);
            })
            .catch(err => {
                console.error("Failed to generate career path:", err);
                const errorMessage = `I'm sorry, I ran into an issue while creating your career path: ${err.message}. Please try asking again in a few moments.`;
                setMessages(prev => [...prev, { role: 'system', content: errorMessage, id: crypto.randomUUID() }]);
            })
            .finally(() => {
                setIsGeneratingPath(false);
            });
    };

    const handleDeclinePath = () => {
        setCareerPathPrompt(null);
        if (chatSession.current) {
            // Let the AI know the user declined, so it can respond appropriately.
            setIsLoading(true); // show thinking indicator
            chatSession.current.sendMessage({ message: "The user has clicked the 'No, thank you' button and chosen not to create a career path at this time. Please acknowledge this and ask how else you can help." })
                .then(response => {
                    if (response && response.text) {
                        setMessages(prev => [...prev, { role: 'model', content: response.text, id: crypto.randomUUID() }]);
                    }
                })
                .catch(error => {
                     console.error("Error sending decline message to coach:", error);
                     setMessages(prev => [...prev, { role: 'system', content: 'Understood. How else can I help you?', id: crypto.randomUUID() }]);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    };

    const ModelIcon: React.FC = () => (
        <div className="w-8 h-8 rounded-full bg-brand-blue/10 flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-blue" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 4a1 1 0 00-.526.92V15a1 1 0 00.526.92l7 4a1 1 0 00.788 0l7-4a1 1 0 00.526-.92V6.994a1 1 0 00-.526-.92l-7-4zM10 18.341L3.5 14.5v-7.842L10 10.341v8zM16.5 14.5L10 18.341v-8L16.5 6.658v7.842zM10 3.659l6.5 3.714-6.5 3.715L3.5 7.373 10 3.659z" />
            </svg>
        </div>
    );
    
    const renderCareerPathPrompt = () => {
        if (!careerPathPrompt?.show) return null;

        const promptText = careerPathPrompt.isReplacing
            ? `I see you have an existing career plan. I can generate a new one to help you become a ${careerPathPrompt.targetRole}. This will replace your current path.`
            : `I can generate a step-by-step career path to help you become a ${careerPathPrompt.targetRole}. Would you like me to create one for you?`;

        return (
             <div className="flex items-start gap-4">
                <ModelIcon />
                <div className="max-w-xl w-full p-4 rounded-xl shadow-sm bg-indigo-50 text-slate-800 rounded-bl-none border border-indigo-200">
                    <p className="font-medium">{promptText}</p>
                    <div className="mt-4 flex items-center gap-3">
                        <button
                            onClick={handleCreatePath}
                            disabled={isGeneratingPath}
                            className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-sm hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors"
                        >
                            {isGeneratingPath ? (
                                <>
                                 <LoadingSpinnerIcon className="h-5 w-5 mr-2" />
                                 Creating...
                                </>
                            ) : (
                                "Create Career Path"
                            )}
                        </button>
                        <button
                            onClick={handleDeclinePath}
                            disabled={isGeneratingPath}
                            className="px-4 py-2 bg-transparent text-slate-600 font-medium rounded-lg hover:bg-indigo-100 disabled:opacity-50 transition-colors"
                        >
                            No, thank you
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-[calc(100vh-80px)] bg-base-200">
            {/* Messages */}
            <div className="flex-grow overflow-y-auto">
                <div className="pt-8 pb-28">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-slate-900">AI Career Coach</h1>
                        <p className="text-base text-slate-500 mt-2">Your personal guide for career development.</p>
                    </div>
                    <div className="space-y-6 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                                {msg.role === 'model' && <ModelIcon />}
                                {msg.role === 'user' && <div className="order-2 w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0"><UserIcon /></div>}
                                
                                <div className={`max-w-xl p-4 rounded-xl shadow-sm ${msg.role === 'user' ? 'bg-brand-blue text-white rounded-br-none' : msg.role === 'model' ? 'bg-white text-slate-800 rounded-bl-none border border-slate-200' : 'bg-yellow-100 text-yellow-800 w-full text-center'}`}>
                                    <SimpleMarkdown text={msg.content} />
                                </div>
                            </div>
                        ))}

                        {renderCareerPathPrompt()}
                        
                        {isLoading && (
                            <div className="flex items-start gap-4">
                                <ModelIcon />
                                <div className="max-w-xl p-4 rounded-xl bg-white text-slate-800 rounded-bl-none border border-slate-200 flex items-center shadow-sm">
                                    <LoadingSpinnerIcon className="h-5 w-5 mr-3" />
                                    <span>Thinking...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>
            </div>
            {/* Input Form */}
            <div className="sticky bottom-0 bg-white/80 backdrop-blur-md border-t border-slate-200">
                <div className="max-w-4xl mx-auto p-4">
                    {isGeneratingPath && (
                        <div className="text-sm text-slate-600 flex items-center justify-center mb-2 animate-fade-in">
                            <LoadingSpinnerIcon className="h-4 w-4 mr-2" />
                            <span>Generating your career path in the background...</span>
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="flex items-start gap-4">
                        <textarea
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit(e);
                                }
                            }}
                            placeholder="Ask me anything about your career..."
                            className="flex-grow p-3 border border-slate-300 rounded-lg resize-y max-h-40 focus:ring-2 focus:ring-brand-blue focus:outline-none transition"
                            rows={2}
                            disabled={isLoading}
                        />
                        <button type="submit" disabled={isLoading || !userInput.trim()} className="px-6 py-3 bg-brand-blue text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors self-end">
                            Send
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CareerCoachPage;
