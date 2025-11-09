import React, { useState, useEffect, useContext, useRef, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProfileContext } from '../App';
import { createCareerCoachSession } from '../services/careerCoachService';
import { generateCareerPath, getVideosForMilestone } from '../services/generationService';
import { LoadingSpinnerIcon, UserIcon } from '../components/Icons';
import type { Chat, GenerateContentResponse, Part, FunctionCall } from '@google/genai';
import type { YouTubeVideo } from '../types';
import { SimpleMarkdown } from '../components/SimpleMarkdown';

const CareerCoachPage: React.FC = () => {
    const profileContext = useContext(ProfileContext);
    const navigate = useNavigate();
    const [messages, setMessages] = useState<{ role: 'user' | 'model' | 'system'; content: string; id: string; action?: React.ReactNode }[]>([]);
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

    if (!profileContext) return <div>Loading...</div>
    const { profile, setProfile, documentHistory, careerChatHistory, addCareerChatSummary, backgroundTasks, startBackgroundTask, updateBackgroundTask } = profileContext;

    const isGeneratingPath = backgroundTasks.some(t => t.type === 'career-path' && t.status === 'running');

    useEffect(() => {
        if (profile) {
            chatSession.current = createCareerCoachSession(profile, documentHistory);
            
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
                }]);
            } else {
                const initialMessage = `Hi! I'm your Keju AI Career Coach. I've reviewed your profile and I'm ready to help you navigate your career.\n\nYou can ask me anything, such as:\n* "How can I improve my resume for a Project Manager role?"\n* "Help me prepare for a coffee chat with a senior engineer at Google."\n* "What are the steps I should take to become an an investment banker?"\n\nWhat's on your mind today?`;
                 setMessages([{
                    role: 'model',
                    content: initialMessage,
                    id: crypto.randomUUID()
                }]);
            }
        }
    }, [profile, documentHistory, navigate]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, careerPathPrompt, isLoading]);

    const handleFunctionCall = async (functionCalls: FunctionCall[]): Promise<void> => {
        if (!functionCalls || functionCalls.length === 0 || !profile) {
            setIsLoading(false);
            return;
        }
    
        const functionResponses: Part[] = [];
        const postSendActions: (() => void)[] = [];
        let shouldNavigate = false;
    
        for (const call of functionCalls) {
            let functionExecutionResult: any;
    
            switch (call.name) {
                case 'updateProfessionalSummary': {
                    const { newSummary } = call.args;
                    functionExecutionResult = { result: "The user's professional summary was successfully updated." };
                    postSendActions.push(() => {
                        setProfile(prev => prev ? ({ ...prev, summary: newSummary as string }) : null);
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
        
        postSendActions.forEach(action => action());
    
        if (chatSession.current && functionResponses.length > 0) {
            const stream = await chatSession.current.sendMessageStream({ message: functionResponses });
            
            let fullText = "";
            const modelMessageId = crypto.randomUUID();
            setMessages(prev => [...prev, { role: 'model', content: '', id: modelMessageId }]);
            let functionCallInFollowUp = false;

            for await (const chunk of stream) {
                if (chunk.text) {
                    fullText += chunk.text;
                    setMessages(prev => prev.map(m => m.id === modelMessageId ? { ...m, content: fullText } : m));
                }
                if (chunk.functionCalls && chunk.functionCalls.length > 0) {
                    functionCallInFollowUp = true;
                    await handleFunctionCall(chunk.functionCalls);
                    break;
                }
            }

            if (!functionCallInFollowUp) {
                setIsLoading(false);
            }
        } else {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading || !chatSession.current) return;

        const newUserMessage = { role: 'user' as const, content: userInput, id: crypto.randomUUID() };
        setMessages(prev => [...prev, newUserMessage]);
        const currentInput = userInput;
        setUserInput('');
        setIsLoading(true);
        setCareerPathPrompt(null);

        try {
            const stream = await chatSession.current.sendMessageStream({ message: currentInput });
            
            let fullText = "";
            const modelMessageId = crypto.randomUUID();
            setMessages(prev => [...prev, { role: 'model', content: '', id: modelMessageId }]);
            
            const responseChunks: GenerateContentResponse[] = [];
            for await (const chunk of stream) {
                responseChunks.push(chunk);
                if (chunk.text) {
                    fullText += chunk.text;
                    setMessages(prev => prev.map(m => m.id === modelMessageId ? { ...m, content: fullText } : m));
                }
            }

            // After a full user-model interaction, add a summary to career chat history
            addCareerChatSummary({
                id: crypto.randomUUID(),
                title: currentInput.substring(0, 50) + (currentInput.length > 50 ? '...' : ''), // Take first 50 chars as title
                timestamp: new Date().toISOString(),
            });

            const aggregatedFunctionCalls = responseChunks.flatMap(chunk => chunk.functionCalls || []);

            if (aggregatedFunctionCalls.length > 0) {
                await handleFunctionCall(aggregatedFunctionCalls);
            } else {
                setIsLoading(false);
            }

        } catch (error) {
            console.error("Error chatting with coach:", error);
            const errorMessage = { role: 'system' as const, content: 'Sorry, I encountered an error. Please try again.', id: crypto.randomUUID() };
            setMessages(prev => [...prev, errorMessage]);
            setIsLoading(false);
        }
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

                // Pre-fetch videos for each milestone
                const pathWithVideos = await Promise.all(
                    newPath.path.map(async (milestone) => {
                        try {
                            const videos = await getVideosForMilestone(newPath.targetRole, milestone);
                            
                            // Verify videos exist to prevent broken links
                            const verificationPromises = videos.map(video => 
                                fetch(`https://www.youtube.com/oembed?url=http://www.youtube.com/watch?v=${video.videoId}&format=json`)
                                    .then(response => ({ video, exists: response.ok }))
                            );
                            
                            const verificationResults = await Promise.allSettled(verificationPromises);
    
                            const validVideos = verificationResults
                                .filter((result): result is PromiseFulfilledResult<{ video: YouTubeVideo; exists: boolean; }> => result.status === 'fulfilled' && result.value.exists)
                                .map(result => result.value.video);

                            return { ...milestone, recommendedVideos: validVideos };
                        } catch (videoError) {
                            console.error(`Failed to fetch videos for milestone: ${milestone.milestoneTitle}`, videoError);
                            return { ...milestone, recommendedVideos: [] }; // Return milestone with empty array on error
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
            {/* Logo removed as per user request */}
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

    return (
        <div className="flex flex-col flex-grow bg-base-200">
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
                                
                                <div className={`max-w-xl p-4 rounded-xl ${msg.role === 'user' ? 'bg-brand-blue text-white rounded-br-none shadow-sm' : msg.role === 'model' ? 'text-slate-800' : 'bg-yellow-100 text-yellow-800 w-full text-center'}`}>
                                    <SimpleMarkdown text={msg.content} />
                                    {msg.action && <div className="mt-2">{msg.action}</div>}
                                </div>
                            </div>
                        ))}

                        {renderCareerPathPrompt()}
                        
                        {isLoading && messages.length > 0 && messages[messages.length-1].role !== 'user' && (
                            <div className="flex items-start gap-4">
                                <ModelIcon />
                                <div className="max-w-xl p-4 rounded-xl text-slate-800 flex items-center">
                                    <LoadingSpinnerIcon className="h-5 w-5 mr-3" />
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
                            rows={1}
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