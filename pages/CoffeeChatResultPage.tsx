import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BriefDisplay from '../components/BriefDisplay';
import MessageDisplay from '../components/MessageDisplay';

const CoffeeChatResultPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const { content, generationMode, counterpartInfo } = (location.state as { 
        content: string; 
        generationMode: 'prep' | 'reach_out';
        counterpartInfo: string;
    }) || {};

    if (!content) {
        return (
            <div className="mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 animate-fade-in text-center">
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 max-w-lg mx-auto">
                    <h1 className="text-2xl font-bold text-neutral">Oops! Something went wrong.</h1>
                    <p className="mt-4 text-gray-600">
                        The generated content was not found. This can happen if you refresh the page or navigate here directly.
                        Please start a new generation from the prepper page.
                    </p>
                    <button
                        onClick={() => navigate('/coffee-chats')}
                        className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-md text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                        Prepare Another
                    </button>
                </div>
            </div>
        );
    }
    
    const handleModeChange = (newMode: 'prep' | 'reach_out') => {
        // This function is for the top selector to switch modes
        if (newMode !== generationMode) {
            navigate('/coffee-chats', {
                state: {
                    initialMode: newMode,
                    initialCounterpartInfo: counterpartInfo,
                }
            });
        }
    };
    
    const handleStartOver = () => {
        // This function is for the bottom button to start over in the same mode
        navigate('/coffee-chats', {
            state: {
                initialMode: generationMode,
                initialCounterpartInfo: counterpartInfo,
            }
        });
    };

    const isPrepMode = generationMode === 'prep';
    const title = isPrepMode ? 'Your Generated Brief' : 'Your Generated Message';
    const description = isPrepMode
        ? "Here is the personalized brief to help you prepare for your conversation. Good luck!"
        : "Here is the personalized message to help you land your next coffee chat. Copy and paste it into LinkedIn or an email.";
    const buttonText = isPrepMode ? 'Prepare Another Brief' : 'Create Another Message';

    return (
        <div className="bg-base-200 py-16 sm:py-24 animate-fade-in flex-grow">
            <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                 <div className="text-center mb-12 animate-slide-in-up">
                    <h1 className="text-4xl font-extrabold text-neutral tracking-tight sm:text-5xl">{title}</h1>
                    <p className="mt-4 max-w-3xl mx-auto text-xl text-gray-600">
                        {description}
                    </p>
                </div>

                <div className="mb-8 max-w-md mx-auto">
                    <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200" role="radiogroup">
                        <button
                            onClick={() => handleModeChange('prep')}
                            className={`w-1/2 py-2 px-4 rounded-md text-sm font-semibold transition-all duration-300 ${generationMode === 'prep' ? 'bg-white shadow text-primary' : 'text-gray-600 hover:bg-gray-200'}`}
                            aria-pressed={generationMode === 'prep'}
                            role="radio"
                            aria-checked={generationMode === 'prep'}
                        >
                            Coffee Chat Prep
                        </button>
                        <button
                            onClick={() => handleModeChange('reach_out')}
                            className={`w-1/2 py-2 px-4 rounded-md text-sm font-semibold transition-all duration-300 ${generationMode === 'reach_out' ? 'bg-white shadow text-primary' : 'text-gray-600 hover:bg-gray-200'}`}
                            aria-pressed={generationMode === 'reach_out'}
                            role="radio"
                            aria-checked={generationMode === 'reach_out'}
                        >
                            Reach Out Message
                        </button>
                    </div>
                </div>

                <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-gray-200 animate-fade-in">
                    {isPrepMode ? (
                        <BriefDisplay content={content} />
                    ) : (
                        <MessageDisplay content={content} />
                    )}
                </div>

                <div className="mt-12 text-center">
                    <button
                        onClick={handleStartOver}
                        className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg shadow-md text-white bg-secondary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
                    >
                        {buttonText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CoffeeChatResultPage;