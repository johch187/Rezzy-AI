import React, { useState, useEffect, useContext, useRef, FormEvent, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { ProfileContext } from '../App';
import { createCareerAgent, AgentUICallbacks } from '../services/careerAgent';
import { generateCareerPath, getVideosForMilestone } from '../services/actions/careerActions';
import { LoadingSpinnerIcon, UserIcon } from '../components/Icons';
import { SimpleMarkdown } from '../components/SimpleMarkdown';
import PageHeader from '../components/PageHeader';
import { useAnimatedText } from '../components/ui/animated-text';
import { PromptSuggestion } from '../components/ui/prompt-suggestion';
import { TextShimmer } from '../components/ui/text-shimmer';
import type { ChatMessage } from '../types';

type Message = { 
    role: 'user' | 'model' | 'system'; 
    content: string; 
    id: string; 
    action?: React.ReactNode;
    disableAnimation?: boolean;
};

const AnimatedModelMessage: React.FC<{ content: string }> = ({ content }) => {
    const animatedText = useAnimatedText(content, "");
    return <SimpleMarkdown text={animatedText} />;
};

const ModelIcon: React.FC = () => (
    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 ring-4 ring-white">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-auto text-primary">
            <path d="M6 40 C 18 25, 12 45, 24 24 C 36 3, 30 23, 42 8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 32 C 16 20, 20 32, 24 24" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    </div>
);

// Keywords that indicate user wants a career path
const CAREER_PATH_KEYWORDS = [
    'career path', 'career plan', 'roadmap', 'how to become', 'steps to become',
    'transition to', 'switch to', 'move into', 'get into', 'break into',
    'path to', 'journey to', 'route to', 'way to become', 'plan to become',
    'create a path', 'create a plan', 'generate a path', 'make a plan',
    'career roadmap', 'career journey', 'career transition'
];

const CareerCoachPage: React.FC = () => {
    const profileContext = useContext(ProfileContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const chatId = searchParams.get('chat');
    
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentChatId, setCurrentChatId] = useState<string | null>(null);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [agentStatus, setAgentStatus] = useState<string>('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const prevChatIdRef = useRef<string | null>(null);
    
    const [careerPathPrompt, setCareerPathPrompt] = useState<{
        show: boolean;
        currentRole: string;
        targetRole: string;
        isReplacing: boolean;
    } | null>(null);

    if (!profileContext) return <div>Loading...</div>
    const { profile, setProfile, documentHistory, addCareerChatSummary, getChatById, backgroundTasks, startBackgroundTask, updateBackgroundTask } = profileContext;

    // Initialize the Agent with UI callbacks
    const agent = useMemo(() => {
        const callbacks: AgentUICallbacks = {
            navigate: (path, state) => {
                setTimeout(() => navigate(path, { state }), 1000);
            },
            updateProfile: (updates) => {
                setProfile(prev => prev ? ({ ...prev, ...updates }) : null);
            },
            promptCareerPath: (data) => {
                setCareerPathPrompt({
                    show: true,
                    ...data
                });
            }
        };
        return createCareerAgent(callbacks, documentHistory);
    }, [navigate, setProfile, documentHistory]);

    const isGeneratingPath = backgroundTasks.some(t => t.type === 'career-path' && t.status === 'running');

    // Convert messages to ChatMessage format for saving
    const messagesToChatMessages = useCallback((msgs: Message[]): ChatMessage[] => {
        return msgs
            .filter(m => m.role !== 'system' || !m.action)
            .map(m => ({
                id: m.id,
                role: m.role,
                content: m.content,
                timestamp: new Date().toISOString(),
            }));
    }, []);

    // Convert ChatMessage to Message format for display
    const chatMessagesToMessages = useCallback((chatMsgs: ChatMessage[]): Message[] => {
        return chatMsgs.map(m => ({
            id: m.id,
            role: m.role,
            content: m.content,
            disableAnimation: true,
        }));
    }, []);

    // Save current conversation
    const saveConversation = useCallback((msgs: Message[], chatIdToSave: string, title: string) => {
        const chatMessages = messagesToChatMessages(msgs);
        if (chatMessages.length === 0) return;
        
        addCareerChatSummary({
            id: chatIdToSave,
            title,
            timestamp: new Date().toISOString(),
            messages: chatMessages,
        });
    }, [addCareerChatSummary, messagesToChatMessages]);

    // Scroll to bottom helper
    const scrollToBottom = useCallback(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, []);

    // Initialize chat - handles both new chats and loading existing ones
    const initializeChat = useCallback((loadChatId: string | null) => {
        if (!profile) return;
        
        // If chat ID provided, load that conversation
        if (loadChatId) {
            const existingChat = getChatById(loadChatId);
            if (existingChat && existingChat.messages && existingChat.messages.length > 0) {
                setMessages(chatMessagesToMessages(existingChat.messages));
                setCurrentChatId(loadChatId);
                setTimeout(scrollToBottom, 100);
                return;
            }
        }
        
        // Otherwise start a new conversation
        const newChatId = crypto.randomUUID();
        setCurrentChatId(newChatId);
        
        const isProfileEffectivelyEmpty = (
            !profile.summary.trim() &&
            profile.experience.length === 0 &&
            profile.education.length === 0 &&
            !profile.jobTitle.trim()
        );

        if (isProfileEffectivelyEmpty) {
            const initialMessage = `Hi! I'm your Keju Career Coach. To give you the best, most personalized advice, I need to know a bit about you.\n\nPlease start by filling out your professional profile. Once that's done, I can help you with anything from crafting the perfect resume to planning your long-term career goals.`;
            const actionButton = (
                <button
                    onClick={() => navigate('/builder')}
                    className="mt-4 inline-flex items-center justify-center px-4 py-2 bg-white text-primary font-semibold rounded-lg shadow-sm border border-primary/30 hover:bg-primary/10 transition-colors"
                >
                    Go to My Profile
                </button>
            );
            setMessages([{
                role: 'model',
                content: initialMessage,
                id: crypto.randomUUID(),
                action: actionButton,
                disableAnimation: true
            }]);
        } else {
            const initialMessage = `Hi! I'm your Keju Career Coach. I've reviewed your profile and I'm ready to help you navigate your career.\n\nYou can ask me anything, such as:\n* "How can I improve my resume for a Project Manager role?"\n* "Help me prepare for a coffee chat with a senior engineer at Google."\n* "Create a career path to become a Senior Product Manager"\n\nWhat's on your mind today?`;
            setMessages([{
                role: 'model',
                content: initialMessage,
                id: crypto.randomUUID(),
                disableAnimation: true
            }]);
        }
    }, [profile, getChatById, chatMessagesToMessages, navigate, scrollToBottom]);

    // Watch for chatId changes in URL and reload chat
    useEffect(() => {
        if (chatId !== prevChatIdRef.current) {
            prevChatIdRef.current = chatId;
            initializeChat(chatId);
        }
    }, [chatId, initializeChat]);

    // Initial load
    useEffect(() => {
        if (profile && prevChatIdRef.current === undefined) {
            prevChatIdRef.current = chatId;
            initializeChat(chatId);
        }
    }, [profile, chatId, initializeChat]);

    // Auto-scroll when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages, careerPathPrompt, scrollToBottom]);
    
    // Continuous scroll during loading (for streaming effect)
    useEffect(() => {
        if (!isLoading) return;
        
        const interval = setInterval(() => {
            scrollToBottom();
        }, 200);
        
        return () => clearInterval(interval);
    }, [isLoading, scrollToBottom]);

    // Start new chat
    const handleNewChat = useCallback(() => {
        setMessages([]);
        setCurrentChatId(null);
        setCareerPathPrompt(null);
        prevChatIdRef.current = null;
        setSearchParams({});
        // Small delay to ensure state is cleared before reinitializing
        setTimeout(() => initializeChat(null), 50);
    }, [setSearchParams, initializeChat]);

    // Detect if user is asking about career path
    const detectCareerPathIntent = useCallback((message: string): { detected: boolean; targetRole: string } => {
        const lowerMessage = message.toLowerCase();
        
        // Check if message contains career path keywords
        const hasKeyword = CAREER_PATH_KEYWORDS.some(keyword => lowerMessage.includes(keyword));
        if (!hasKeyword) return { detected: false, targetRole: '' };
        
        // Try to extract target role from message
        let targetRole = '';
        
        // Common patterns: "become a X", "transition to X", "path to X", etc.
        const patterns = [
            /(?:become|be)\s+(?:a|an)\s+(.+?)(?:\?|$|\.|\!)/i,
            /(?:transition|switch|move|get|break)\s+(?:to|into)\s+(?:a|an)?\s*(.+?)(?:\?|$|\.|\!)/i,
            /(?:path|roadmap|plan|journey|route)\s+to\s+(?:become\s+)?(?:a|an)?\s*(.+?)(?:\?|$|\.|\!)/i,
            /(?:career\s+path)\s+(?:to|for)\s+(?:a|an)?\s*(.+?)(?:\?|$|\.|\!)/i,
            /(?:how\s+to\s+become)\s+(?:a|an)?\s*(.+?)(?:\?|$|\.|\!)/i,
        ];
        
        for (const pattern of patterns) {
            const match = message.match(pattern);
            if (match && match[1]) {
                targetRole = match[1].trim();
                // Clean up common words at the end
                targetRole = targetRole.replace(/\s+(role|position|job)$/i, '').trim();
                break;
            }
        }
        
        // If no target found but has keyword, use profile target or default
        if (!targetRole && profile?.targetJobTitle) {
            targetRole = profile.targetJobTitle;
        }
        
        return { detected: hasKeyword && targetRole.length > 0, targetRole };
    }, [profile?.targetJobTitle]);

    const submitMessage = async (message: string) => {
        const currentInput = message.trim();
        if (!currentInput || isLoading || !profile) return;

        const newUserMessage: Message = { role: 'user', content: currentInput, id: crypto.randomUUID() };
        const updatedMessages = [...messages, newUserMessage];
        setMessages(updatedMessages);
        setUserInput('');
        setIsLoading(true);
        setAgentStatus('');
        setCareerPathPrompt(null);

        // Check if user wants to create a career path
        const { detected, targetRole } = detectCareerPathIntent(currentInput);
        
        if (detected && targetRole) {
            // Show career path prompt instead of sending to AI
            setIsLoading(false);
            const currentRole = profile.jobTitle || 'your current role';
            const isReplacing = !!profile.careerPath;
            
            setCareerPathPrompt({
                show: true,
                currentRole,
                targetRole,
                isReplacing,
            });
            
            // Add a response acknowledging the request
            const ackMessage: Message = {
                role: 'model',
                content: `I can help you create a detailed career path to become a **${targetRole}**! This will include specific milestones, skills to develop, and actionable steps.`,
                id: crypto.randomUUID(),
                disableAnimation: true,
            };
            setMessages(prev => [...prev, ackMessage]);
            return;
        }

        // Get the title from first user message
        const firstUserMessage = updatedMessages.find(m => m.role === 'user');
        const chatTitle = firstUserMessage 
            ? firstUserMessage.content.substring(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '')
            : 'New Chat';

        try {
            const responseText = await agent.chat(
                currentInput, 
                { profile },
                (status) => setAgentStatus(status)
            );
            
            const newModelMessage: Message = { role: 'model', content: responseText, id: crypto.randomUUID() };
            const finalMessages = [...updatedMessages, newModelMessage];
            setMessages(finalMessages);

            // Save the conversation
            if (currentChatId) {
                saveConversation(finalMessages, currentChatId, chatTitle);
                if (!chatId) {
                    setSearchParams({ chat: currentChatId });
                }
            }

        } catch (error: any) {
            console.error("Error chatting with agent:", error);
            const errorMessage: Message = { role: 'system', content: error.message || 'Sorry, I encountered an error. Please try again.', id: crypto.randomUUID() };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
            setAgentStatus('');
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        submitMessage(userInput);
    };

    const handleSuggestionClick = (suggestion: string) => {
        submitMessage(suggestion);
    };
    
    const handleCreatePath = () => {
        if (!careerPathPrompt || !profile) return;
        const { currentRole, targetRole } = careerPathPrompt;

        setCareerPathPrompt(null);

        setMessages(prev => [...prev, {
            role: 'system',
            content: `Creating your personalized career path to become a ${targetRole}...`,
            id: crypto.randomUUID(),
        }]);

        const taskId = startBackgroundTask({
            type: 'career-path',
            description: `Career Path to ${targetRole}`
        });

        (async () => {
            try {
                const newPath = await generateCareerPath(profile, currentRole, targetRole);

                const pathWithVideos: any[] = [];
                for (const milestone of newPath.path) {
                    try {
                        const videos = await getVideosForMilestone(newPath.targetRole, milestone);
                        pathWithVideos.push({ ...milestone, recommendedVideos: videos });
                    } catch (videoError) {
                        console.error(`Failed to fetch videos for milestone: ${milestone.milestoneTitle}`, videoError);
                        pathWithVideos.push({ ...milestone, recommendedVideos: [] });
                    }
                    await new Promise(resolve => setTimeout(resolve, 300));
                }

                const finalPathWithVideos = { ...newPath, path: pathWithVideos };

                setProfile(prev => prev ? ({...prev, careerPath: finalPathWithVideos}) : null);
                updateBackgroundTask(taskId, { status: 'completed', result: { success: true } });
                
                // Add success message
                setMessages(prev => [...prev, {
                    role: 'model',
                    content: `✨ Your career path to **${targetRole}** is ready! I've created a detailed roadmap with milestones and resources. [View your Career Path](/career-path)`,
                    id: crypto.randomUUID(),
                    disableAnimation: true,
                }]);

            } catch (err: any) {
                console.error("Failed to generate career path:", err);
                updateBackgroundTask(taskId, { status: 'error', result: { message: err.message } });
                const errorMessage = `I'm sorry, I ran into an issue while creating your career path: ${err.message}. Please try again.`;
                setMessages(prev => [...prev, { role: 'system', content: errorMessage, id: crypto.randomUUID() }]);
            }
        })();
    };

    const handleDeclinePath = async () => {
        if (!profile) return;
        setCareerPathPrompt(null);
        setMessages(prev => [...prev, {
            role: 'model',
            content: "No problem! Let me know if you'd like help with anything else - resume tips, interview prep, or general career advice.",
            id: crypto.randomUUID(),
            disableAnimation: true,
        }]);
    };
    
    const renderCareerPathPrompt = () => {
        if (!careerPathPrompt?.show) return null;

        const promptText = careerPathPrompt.isReplacing
            ? `This will replace your existing career path. Ready to create a new path to **${careerPathPrompt.targetRole}**?`
            : `Ready to generate your personalized career path to **${careerPathPrompt.targetRole}**?`;

        return (
             <div className="flex items-start gap-4">
                <ModelIcon />
                <div className="max-w-xl w-full p-4 rounded-xl shadow-sm bg-primary/5 text-slate-800 border border-primary/20">
                    <p className="font-medium">{promptText}</p>
                    <p className="text-sm text-slate-600 mt-2">This will include milestones, skills, timeline, and learning resources.</p>
                    <div className="mt-4 flex items-center gap-3">
                        <button
                            onClick={handleCreatePath}
                            disabled={isGeneratingPath}
                            className="inline-flex items-center justify-center px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-sm hover:bg-primary-600 disabled:bg-primary/50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isGeneratingPath ? (
                                <>
                                 <LoadingSpinnerIcon className="h-5 w-5 mr-2" />
                                 Creating...
                                </>
                            ) : (
                                "🚀 Create Career Path"
                            )}
                        </button>
                        <button
                            onClick={handleDeclinePath}
                            disabled={isGeneratingPath}
                            className="px-4 py-2 bg-transparent text-slate-600 font-medium rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors"
                        >
                            Not now
                        </button>
                    </div>
                </div>
            </div>
        );
    };
    
    const lastModelMessageIndex = messages.map(m => m.role).lastIndexOf('model');

    const isProfileEffectivelyEmpty = (
        !profile?.summary.trim() &&
        (profile?.experience.length ?? 0) === 0 &&
        (profile?.education.length ?? 0) === 0 &&
        !profile?.jobTitle.trim()
    );

    const shouldShowSuggestions = !isLoading && !careerPathPrompt;

    const suggestionsForEmptyProfile = [
        "Help me build my professional profile",
        "Where should I start?",
        "What can you do for me?",
    ];

    const suggestionsForFilledProfile = [
        `Create a career path to become a ${profile?.targetJobTitle || "Senior Product Manager"}`,
        `How do I transition from ${profile?.jobTitle || "my role"} to ${profile?.targetJobTitle || "a leadership role"}?`,
        "What skills should I develop next?",
        "Help me prepare for interviews",
        "Review my career progress",
    ];

    const suggestions = isProfileEffectivelyEmpty ? suggestionsForEmptyProfile : suggestionsForFilledProfile;

    return (
        <div className="flex flex-col h-full bg-gray-50">
            <div className="px-4 sm:px-6 lg:px-8 pt-8">
                <PageHeader 
                    title="Career Coach"
                    description="Your personal guide for career development."
                    actions={
                        <button
                            onClick={handleNewChat}
                            className="text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                            + New Chat
                        </button>
                    }
                />
            </div>
            <div ref={scrollContainerRef} className="flex-grow overflow-y-auto">
                <div className="pb-4">
                    <div className="space-y-6 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        {messages.map((msg, index) => (
                            <div key={msg.id} className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                                {msg.role === 'model' && <ModelIcon />}
                                {msg.role === 'user' && <div className="order-2 w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 ring-4 ring-white"><UserIcon /></div>}
                                {msg.role === 'system' ? (
                                    <div className="w-full flex justify-center">
                                        <span className="bg-slate-100 text-slate-600 text-xs px-3 py-1 rounded-full">{msg.content}</span>
                                    </div>
                                ) : (
                                    <div className={`max-w-xl p-4 rounded-xl shadow-sm ${msg.role === 'user' ? 'bg-primary text-white rounded-br-none' : msg.role === 'model' ? 'bg-white text-slate-800 rounded-bl-none' : 'bg-yellow-100 text-yellow-800 w-full text-center'}`}>
                                        {msg.role === 'model' && index === lastModelMessageIndex && !isLoading && !msg.disableAnimation ? (
                                            <AnimatedModelMessage content={msg.content} />
                                        ) : (
                                            <SimpleMarkdown text={msg.content} />
                                        )}
                                        {msg.action && <div className="mt-2">{msg.action}</div>}
                                    </div>
                                )}
                            </div>
                        ))}

                        {renderCareerPathPrompt()}
                        
                        {isLoading && (
                            <div className="flex items-start gap-4">
                                <ModelIcon />
                                <div className="max-w-xl p-4 rounded-xl bg-white text-slate-800 border border-slate-100">
                                    <TextShimmer className='text-sm font-medium [--base-color:theme(colors.slate.500)] [--base-gradient-color:theme(colors.slate.900)]' duration={1.5}>
                                        {agentStatus || "Keju is thinking..."}
                                    </TextShimmer>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} style={{ height: 1 }} />
                    </div>
                </div>
            </div>
            <div className="bg-white/80 backdrop-blur-md border-t border-slate-200 mt-auto sticky bottom-0">
                <div className="max-w-4xl mx-auto px-4 pt-3 pb-4">
                    {isGeneratingPath && (
                        <div className="text-sm text-slate-600 flex items-center justify-center mb-2 animate-fade-in">
                            <LoadingSpinnerIcon className="h-4 w-4 mr-2" />
                            <span>Generating your career path in the background...</span>
                        </div>
                    )}
                    
                    {shouldShowSuggestions && (
                        <div className="mb-3 animate-fade-in">
                            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
                                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider whitespace-nowrap flex-shrink-0">
                                    Try
                                </span>
                                <div className="flex gap-2">
                                    {suggestions.map((suggestion, i) => (
                                        <PromptSuggestion 
                                            key={i} 
                                            size="sm" 
                                            onClick={() => handleSuggestionClick(suggestion)}
                                            className="whitespace-nowrap flex-shrink-0"
                                        >
                                            {suggestion}
                                        </PromptSuggestion>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="flex items-end gap-3">
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
                            className="flex-grow p-3 border border-slate-300 rounded-xl resize-none focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition bg-white"
                            rows={1}
                            disabled={isLoading}
                        />
                        <button 
                            type="submit" 
                            disabled={isLoading || !userInput.trim()} 
                            className="px-5 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                        >
                            Send
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CareerCoachPage;
