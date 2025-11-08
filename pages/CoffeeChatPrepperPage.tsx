import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ProfileContext } from '../App';
import { generateCoffeeChatBrief, generateReachOutMessage } from '../services/generationService';
import { LoadingSpinnerIcon, XCircleIcon } from '../components/Icons';

const CoffeeChatPrepperPage: React.FC = () => {
    const profileContext = useContext(ProfileContext);
    const location = useLocation();

    const { initialMode, initialCounterpartInfo } = (location.state as {
        initialMode?: 'prep' | 'reach_out';
        initialCounterpartInfo?: string;
    }) || {};

    const [generationMode, setGenerationMode] = useState<'prep' | 'reach_out'>(initialMode || 'prep');
    const [counterpartInfo, setCounterpartInfo] = useState(initialCounterpartInfo || '');
    const [error, setError] = useState<string | null>(null);

    if (!profileContext) return <div>Loading...</div>;
    const { profile, tokens, setTokens, backgroundTasks, startBackgroundTask, updateBackgroundTask } = profileContext;

    const isGenerating = backgroundTasks.some(t => t.type === 'coffee-chat' && t.status === 'running');

    const handleGenerate = () => {
        if (!counterpartInfo.trim()) {
            setError("Please provide some information about the person you're meeting.");
            return;
        }
        if (tokens < 1) {
            setError("You don't have enough tokens for this. Please purchase more.");
            return;
        }

        setError(null);
        setTokens(prev => prev - 1);

        const taskId = startBackgroundTask({
            type: 'coffee-chat',
            description: generationMode === 'prep' ? 'Coffee chat brief' : 'Reach out message',
        });

        (async () => {
            try {
                const result = generationMode === 'prep'
                    ? await generateCoffeeChatBrief(profile, counterpartInfo)
                    : await generateReachOutMessage(profile, counterpartInfo);

                const finalResultPayload = { 
                    content: result,
                    generationMode: generationMode,
                    counterpartInfo: counterpartInfo,
                };
                updateBackgroundTask(taskId, { status: 'completed', result: finalResultPayload });
            } catch (e: any) {
                setTokens(prev => prev + 1); // Refund token
                updateBackgroundTask(taskId, { status: 'error', result: { message: e.message || "An unexpected error occurred." } });
            }
        })();
    };
    
    const placeholderText = generationMode === 'prep'
        ? "e.g., Sarah Chen - Product Manager at Innovate Inc. Previously at Acme Corp. Studied Computer Science at State University. Passionate about user-centric design and mentoring..."
        : "e.g., John Doe - Senior Engineer at Google. Alumnus of my university. Found his profile on LinkedIn, interested in his work on AI projects.";
        
    const buttonText = generationMode === 'prep' ? 'Generate Brief' : 'Generate Message';

    return (
        <div className="bg-base-200 py-16 sm:py-24 animate-fade-in">
            <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                <div className="text-center mb-12">
                    <div className="flex justify-center mb-6">
                        <div className="flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 mx-auto">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V7a2 2 0 012-2h4M5 8h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H21" />
                            </svg>
                        </div>
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-neutral sm:text-5xl">Coffee Chats</h1>
                    <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
                        Ace your professional networking. Provide details about a person you want to connect with—like their bio, notes, or a LinkedIn profile—and our AI coach will generate a tailored outreach message or a personalized brief to ensure you make a great impression.
                    </p>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
                    <div className="mb-6">
                        <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200" role="radiogroup">
                            <button
                                onClick={() => setGenerationMode('prep')}
                                className={`w-1/2 py-2 px-4 rounded-md text-sm font-semibold transition-all duration-300 ${generationMode === 'prep' ? 'bg-white shadow text-primary' : 'text-gray-600 hover:bg-gray-200'}`}
                                aria-pressed={generationMode === 'prep'}
                                role="radio"
                                aria-checked={generationMode === 'prep'}
                            >
                                Coffee Chat Prep
                            </button>
                            <button
                                onClick={() => setGenerationMode('reach_out')}
                                className={`w-1/2 py-2 px-4 rounded-md text-sm font-semibold transition-all duration-300 ${generationMode === 'reach_out' ? 'bg-white shadow text-primary' : 'text-gray-600 hover:bg-gray-200'}`}
                                aria-pressed={generationMode === 'reach_out'}
                                role="radio"
                                aria-checked={generationMode === 'reach_out'}
                            >
                                Reach Out Message
                            </button>
                        </div>
                    </div>

                    <label htmlFor="counterpart-info" className="block text-lg font-semibold text-gray-800">
                        Who are you connecting with?
                    </label>
                    <p className="text-gray-500 mt-1 mb-4 text-sm">
                        Paste any information you have: their bio, LinkedIn profile text, your notes, etc. The more detail, the better!
                    </p>
                    <textarea
                        id="counterpart-info"
                        rows={12}
                        className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-primary focus:border-primary transition bg-gray-50"
                        placeholder={placeholderText}
                        value={counterpartInfo}
                        onChange={(e) => setCounterpartInfo(e.target.value)}
                        disabled={isGenerating}
                    />
                    <div className="mt-6 flex flex-col sm:flex-row justify-end items-center gap-4">
                        <p className="text-sm text-gray-600">This will cost <span className="font-bold">1 Token</span>.</p>
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || !counterpartInfo.trim()}
                            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg shadow-md text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isGenerating ? (
                                <>
                                    <LoadingSpinnerIcon className="h-5 w-5 mr-3" />
                                    Generating...
                                </>
                            ) : (
                                buttonText
                            )}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mt-8 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md relative flex justify-between items-center shadow-md" role="alert">
                        <div>
                            <p className="font-bold">An error occurred</p>
                            <p>{error}</p>
                            {error.includes("tokens") && <Link to="/subscription" className="underline font-semibold">Purchase More Tokens</Link>}
                        </div>
                        <button onClick={() => setError(null)} className="p-1 rounded-full hover:bg-red-200 transition-colors" aria-label="Close">
                            <XCircleIcon className="h-6 w-6" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CoffeeChatPrepperPage;