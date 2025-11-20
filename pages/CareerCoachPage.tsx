import React, { useState, useEffect, useContext, useRef, FormEvent, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProfileContext } from '../App';
import { createCareerAgent, AgentUICallbacks } from '../services/careerAgent';
import { generateCareerPath, getVideosForMilestone } from '../services/actions/careerActions';
import { LoadingSpinnerIcon, UserIcon } from '../components/Icons';
import { SimpleMarkdown } from '../components/SimpleMarkdown';
import PageHeader from '../components/PageHeader';
import { useAnimatedText } from '../components/ui/animated-text';
import { PromptSuggestion } from '../components/ui/prompt-suggestion';

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

const CareerCoachPage: React.FC = () => {
    const profileContext = useContext(ProfileContext);
    const navigate = useNavigate();
    const [messages, setMessages] = useState<Message[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [agentStatus, setAgentStatus] = useState<string>('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    const [careerPathPrompt, setCareerPathPrompt] = useState<{
        show: boolean;
        currentRole: string;
        targetRole: string;
        isReplacing: boolean;
    } | null>(null);

    if (!profileContext) return <div>Loading...</div>
    const { profile, setProfile, documentHistory, addCareerChatSummary, backgroundTasks, startBackgroundTask, updateBackgroundTask } = profileContext;

    // Initialize the Agent with UI callbacks
    const agent = useMemo(() => {
        const callbacks: AgentUICallbacks = {
            navigate: (path, state) => {
                // We delay navigation slightly to allow the agent to finish its thought process visually
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

    useEffect(() => {
        if (profile && messages.length === 0) {
            const isProfileEffectivelyEmpty = (
                !profile.summary.trim() &&
                profile.experience.length === 0 &&
                profile.education.length === 0 &&
                !profile.jobTitle.trim()
            );

            if (isProfileEffectivelyEmpty) {
                const initialMessage = `Hi! I'm your Keju AI Career Coach. To give you the best, most personalized advice, I need to know a bit about you.\n\nPlease start by filling out your professional profile. Once that's done, I can help you with anything from crafting the perfect resume to planning your long-term career goals.`;
                const actionButton = (
                    <button
                        onClick={() => navigate('/builder')}
                        className="mt-4 inline-flex items-center justify-center px-4 py-2 bg-white text-brand-blue font-semibold rounded-lg shadow-sm border border-brand-blue/30 hover:bg-brand-blue/10 transition-colors"
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
                const initialMessage = `Hi! I'm your Keju AI Career Coach. I've reviewed your profile and I'm ready to help you navigate your career.\n\nYou can ask me anything, such as:\n* "How can I improve my resume for a Project Manager role?"\n* "Help me prepare for a coffee chat with a senior engineer at Google."\n* "What are the steps I should take to become an an investment banker?"\n\nWhat's on your mind today?`;
                 setMessages([{
                    role: 'model',
                    content: initialMessage,
                    id: crypto.randomUUID(),
                    disableAnimation: true
                }]);
            }
        }
    }, [profile, navigate, messages.length]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, careerPathPrompt, isLoading, agentStatus]);

    const submitMessage = async (message: string) => {
        const currentInput = message.trim();
        if (!currentInput || isLoading || !profile) return;

        const newUserMessage: Message = { role: 'user', content: currentInput, id: crypto.randomUUID() };
        setMessages(prev => [...prev, newUserMessage]);
        setUserInput('');
        setIsLoading(true);
        setAgentStatus('Thinking...');
        setCareerPathPrompt(null);

        try {
            // The Agent handles the full loop: Thinking -> Tools -> Response
            const responseText = await agent.chat(
                currentInput, 
                { profile }, // Pass current profile as context
                (status) => setAgentStatus(status) // Update UI with agent status (e.g. "Executing action...")
            );
            
            setMessages(prev => [...prev, { role: 'model', content: responseText, id: crypto.randomUUID() }]);

            addCareerChatSummary({
                id: crypto.randomUUID(),
                title: currentInput.substring(0, 50) + (currentInput.length > 50 ? '...' : ''),
                timestamp: new Date().toISOString(),
            });

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
            content: `Great! I've started creating your personalized career path to become a ${targetRole}. This will run in the background and I'll notify you when it's ready. Feel free to ask other questions while you wait!`,
            id: crypto.randomUUID(),
        }]);

        const taskId = startBackgroundTask({
            type: 'career-path',
            description: `Career Path to ${targetRole}`
        });

        (async () => {
            try {
                const newPath = await generateCareerPath(profile, currentRole, targetRole);

                const pathWithVideos = await Promise.all(
                    newPath.path.map(async (milestone) => {
                        try {
                            const videos = await getVideosForMilestone(newPath.targetRole, milestone);
                            return { ...milestone, recommendedVideos: videos };
                        } catch (videoError) {
                            console.error(`Failed to fetch videos for milestone: ${milestone.milestoneTitle}`, videoError);
                            return { ...milestone, recommendedVideos: [] };
                        }
                    })
                );

                const finalPathWithVideos = { ...newPath, path: pathWithVideos };

                setProfile(prev => prev ? ({...prev, careerPath: finalPathWithVideos}) : null);
                updateBackgroundTask(taskId, { status: 'completed', result: { success: true } });

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
        // We just send a message as if the user typed it, the agent will handle the polite response.
        submitMessage("I'd rather not create a career path right now. Thanks though!");
    };
    
    const renderCareerPathPrompt = () => {
        if (!careerPathPrompt?.show) return null;

        const promptText = careerPathPrompt.isReplacing
            ? `I see you have an existing career plan. I can generate a new one to help you become a ${careerPathPrompt.targetRole}. This will replace your current path.`
            : `I can generate a step-by-step career path to help you become a ${careerPathPrompt.targetRole}. Would you like me to create one for you?`;

        return (
             <div className="flex items-start gap-4">
                <ModelIcon />
                <div className="max-w-xl w-full p-4 rounded-xl shadow-sm bg-indigo-50 text-slate-800 border border-indigo-200">
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
    
    const lastModelMessageIndex = messages.map(m => m.role).lastIndexOf('model');

    const isProfileEffectivelyEmpty = (
        !profile?.summary.trim() &&
        (profile?.experience.length ?? 0) === 0 &&
        (profile?.education.length ?? 0) === 0 &&
        !profile?.jobTitle.trim()
    );

    const shouldShowSuggestions = messages.length <= 1 && !isLoading && !careerPathPrompt;

    const suggestionsForEmptyProfile = [
        "Help me build my professional profile.",
        "Where should I start?",
        "What can you do for me?",
    ];

    const suggestionsForFilledProfile = [
        `Help me create a career path to become a ${profile?.targetJobTitle || "Product Manager"}`,
        `Show me the steps to transition from ${profile?.jobTitle || "my current role"} to ${profile?.targetJobTitle || "a Senior Role"}`,
        `How can I improve my resume for a ${profile?.targetJobTitle || "new"} role?`,
        "Help me prepare for a coffee chat.",
    ];

    const suggestions = isProfileEffectivelyEmpty ? suggestionsForEmptyProfile : suggestionsForFilledProfile;

    return (
        <div className="flex flex-col h-full bg-base-200">
            <PageHeader 
                title="AI Career Coach"
                subtitle="Your personal guide for career development."
                className="pt-8 !mb-8"
            />
            <div className="flex-grow overflow-y-auto">
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
                                <div className="max-w-xl p-4 rounded-xl bg-white text-slate-800 flex items-center space-x-3">
                                    <LoadingSpinnerIcon className="h-5 w-5" />
                                    <span className="text-sm text-slate-500 animate-pulse">{agentStatus || "Thinking..."}</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>
            </div>
            <div className="bg-white/80 backdrop-blur-md border-t border-slate-200 mt-auto sticky bottom-0">
                <div className="max-w-4xl mx-auto p-4">
                     {shouldShowSuggestions && (
                        <div className="w-full mb-4 animate-fade-in">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center mb-3">Suggested Actions</p>
                            <div className="flex flex-wrap gap-2 justify-center">
                                {suggestions.map((suggestion, i) => (
                                    <PromptSuggestion key={i} size="sm" onClick={() => handleSuggestionClick(suggestion)}>
                                        {suggestion}
                                    </PromptSuggestion>
                                ))}
                            </div>
                        </div>
                    )}
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
                            className="flex-grow p-3 border border-slate-300 rounded-lg resize-y max-h-40 focus:ring-2 focus:ring-primary focus:outline-none transition"
                            rows={1}
                            disabled={isLoading}
                        />
                        <button type="submit" disabled={isLoading || !userInput.trim()} className="px-6 py-3 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors self-end">
                            Send
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CareerCoachPage;