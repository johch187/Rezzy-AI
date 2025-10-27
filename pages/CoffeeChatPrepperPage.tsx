import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ProfileContext } from '../App';
import { generateCoffeeChatBrief } from '../services/generationService';
import { LoadingSpinnerIcon, XCircleIcon } from '../components/Icons';

const CoffeeChatPrepperPage: React.FC = () => {
    const profileContext = useContext(ProfileContext);
    const navigate = useNavigate();
    const [counterpartInfo, setCounterpartInfo] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!profileContext) return <div>Loading...</div>;
    const { profile, tokens, setTokens } = profileContext;

    const handleGenerate = async () => {
        if (!counterpartInfo.trim()) {
            setError("Please provide some information about the person you're meeting.");
            return;
        }
        if (tokens < 1) {
            setError("You don't have enough tokens for this. Please purchase more.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const result = await generateCoffeeChatBrief(profile, counterpartInfo);
            setTokens(prev => prev - 1);
            navigate('/coffee-chat-prepper/result', { 
                state: { 
                    brief: result,
                    counterpartInfo: counterpartInfo,
                } 
            });
        } catch (e: any) {
            setError(e.message || "An unexpected error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-base-200 py-16 sm:py-24 animate-fade-in">
            <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                <div className="text-center mb-12">
                    <div className="flex justify-center mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V7a2 2 0 012-2h4M5 8h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H21" />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-neutral sm:text-5xl">Coffee Chat Prepper</h1>
                    <p className="mt-6 text-lg text-gray-600">
                        Nail your next networking chat. Paste in notes, a bio, or a LinkedIn URL, and our AI coach will create a personalized brief to help you shine.
                    </p>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
                    <label htmlFor="counterpart-info" className="block text-lg font-semibold text-gray-800">
                        Who are you meeting?
                    </label>
                    <p className="text-gray-500 mt-1 mb-4 text-sm">
                        Paste any information you have: their bio, job description, LinkedIn profile text, your notes, etc. The more detail, the better!
                    </p>
                    <textarea
                        id="counterpart-info"
                        rows={12}
                        className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition"
                        placeholder="e.g., Sarah Chen - Product Manager at Innovate Inc. Previously at Acme Corp. Studied Computer Science at State University. Passionate about user-centric design and mentoring..."
                        value={counterpartInfo}
                        onChange={(e) => setCounterpartInfo(e.target.value)}
                        disabled={isLoading}
                    />
                    <div className="mt-6 flex flex-col sm:flex-row justify-end items-center gap-4">
                        <p className="text-sm text-gray-600">This will cost <span className="font-bold">1 Token</span>.</p>
                        <button
                            onClick={handleGenerate}
                            disabled={isLoading || !counterpartInfo.trim()}
                            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <LoadingSpinnerIcon className="h-5 w-5 mr-3" />
                                    Generating Brief...
                                </>
                            ) : (
                                "Generate Brief"
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