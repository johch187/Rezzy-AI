import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ProfileContext } from '../App';
import { generateTailoredDocuments } from '../services/geminiService';
import type { ProfileData, GenerationOptions, GeneratedContent } from '../types';
import EditableDocument from '../components/EditableDocument'; // Changed from GeneratedDocument


const ThinkingIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM5 9a1 1 0 011-1h1.757l.38-1.517a1 1 0 011.956-.011L11 8h2a1 1 0 110 2h-1.243l-.38 1.517a1 1 0 01-1.956.011L9 10H7a1 1 0 01-1-1V9z" clipRule="evenodd" />
    </svg>
);

const XCircleIcon: React.FC<{ className?: string }> = ({ className = "h-5 w-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
);

const CheckIcon: React.FC = () => (
    <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </div>
);

const SpinnerIcon: React.FC = () => (
    <div className="h-6 w-6 rounded-full border-2 border-t-primary border-r-primary border-b-gray-200 border-l-gray-200 animate-spin" />
);

const PendingIcon: React.FC = () => (
    <div className="h-6 w-6 rounded-full border-2 border-gray-300" />
);

const STEPS = [
  { text: "Analyzing your profile...", duration: 1500 },
  { text: "Deconstructing job description...", duration: 2000 },
  { text: "Identifying key skills...", duration: 1500 },
  { text: "Crafting tailored resume sections...", duration: 3000 },
  { text: "Writing compelling cover letter...", duration: 3000 },
  { text: "Finalizing documents...", duration: 2000 },
];
const THINKING_STEPS = [
    { text: "Initiating deep analysis...", duration: 3000 },
    { text: "Cross-referencing profile with job needs...", duration: 5000 },
    { text: "Formulating advanced strategic narrative...", duration: 6000 },
    { text: "Constructing highly-detailed resume arguments...", duration: 8000 },
    { text: "Composing a nuanced and persuasive cover letter...", duration: 8000 },
    { text: "Performing final quality assurance checks...", duration: 5000 },
];

const GenerationProgressIndicator: React.FC<{ currentStep: number; thinkingMode: boolean }> = ({ currentStep, thinkingMode }) => {
    const steps = thinkingMode ? THINKING_STEPS : STEPS;
    const title = thinkingMode ? "AI is Thinking Deeply..." : "AI is Generating...";

    return (
        <div className="bg-white p-8 rounded-2xl shadow-lg animate-fade-in" role="status" aria-live="polite">
            <h2 className="text-2xl font-bold text-neutral text-center">{title}</h2>
            <p className="text-gray-500 text-center mt-2">Your documents are being crafted. This may take a moment.</p>
            <div className="mt-8 space-y-4">
                {steps.map((step, index) => {
                    const isCompleted = currentStep > index;
                    const isInProgress = currentStep === index;
                    const isPending = currentStep < index;

                    return (
                        <div key={index} className="flex items-start space-x-4 transition-opacity duration-500" style={{ opacity: isPending ? 0.4 : 1 }}>
                            <div className="flex-shrink-0 pt-1">
                                {isCompleted && <CheckIcon />}
                                {isInProgress && <SpinnerIcon />}
                                {isPending && <PendingIcon />}
                            </div>
                            <div>
                                <p className={`font-medium transition-colors ${isCompleted ? 'text-gray-700' : isInProgress ? 'text-primary' : 'text-gray-700'}`}>
                                    {step.text}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


const GenerationResultPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const profileContext = useContext(ProfileContext);

    const { profile, options, jobDescription } = location.state as {
        profile: ProfileData;
        options: GenerationOptions;
        jobDescription: string;
    };

    const [isLoading, setIsLoading] = useState(true);
    const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
    const [generationError, setGenerationError] = useState<string | null>(null);
    const [currentProgressStep, setCurrentProgressStep] = useState(-1);

    const progressTimeoutRef = useRef<number | null>(null);

    useEffect(() => {
        if (!profileContext || !profile || !options || !jobDescription) {
            setGenerationError("Missing data for generation. Please go back and try again.");
            setIsLoading(false);
            return;
        }

        const fetchDocuments = async () => {
            setIsLoading(true);
            setGenerationError(null);
            setGeneratedContent(null);

            try {
                const result = await generateTailoredDocuments(profile, options);
                setGeneratedContent(result);
            } catch (e: any) {
                setGenerationError(e.message || 'An unexpected error occurred during document generation. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDocuments();
    }, [profileContext, profile, options, jobDescription]);

    useEffect(() => {
        const cleanup = () => {
            if (progressTimeoutRef.current) {
                clearTimeout(progressTimeoutRef.current);
                progressTimeoutRef.current = null;
            }
        };

        if (isLoading) {
            const steps = options.thinkingMode ? THINKING_STEPS : STEPS;
            setCurrentProgressStep(0); // Start with the first step immediately

            const advanceStep = (stepIndex: number) => {
                if (stepIndex >= steps.length) {
                    return;
                }

                progressTimeoutRef.current = window.setTimeout(() => {
                    setCurrentProgressStep(stepIndex);
                    // Only advance if still loading. If loading became false, this chain should stop.
                    if (isLoading) {
                        advanceStep(stepIndex + 1);
                    }
                }, steps[stepIndex].duration);
            };

            // Start advancing from the second step (index 1), as index 0 is set initially
            if (steps.length > 1) {
                advanceStep(1);
            }
        } else {
            setCurrentProgressStep(-1); // Reset or indicate completion
            cleanup();
        }

        return cleanup;
    }, [isLoading, options.thinkingMode]);


    const handleGenerateNewRole = useCallback(() => {
        navigate('/generate');
    }, [navigate]);

    const handleSaveResume = useCallback((newContent: string) => {
        setGeneratedContent(prev => prev ? { ...prev, resume: newContent } : null);
    }, []);

    const handleSaveCoverLetter = useCallback((newContent: string) => {
        setGeneratedContent(prev => prev ? { ...prev, coverLetter: newContent } : null);
    }, []);

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            {generationError && (
                <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md relative flex justify-between items-center shadow-md" role="alert">
                    <div>
                        <p className="font-bold">Generation Error</p>
                        <p>{generationError}</p>
                    </div>
                    <button onClick={() => setGenerationError(null)} className="p-1 rounded-full hover:bg-red-200 transition-colors" aria-label="Close error">
                        <XCircleIcon className="h-6 w-6" />
                    </button>
                </div>
            )}

            {isLoading && (
                <GenerationProgressIndicator currentStep={currentProgressStep} thinkingMode={options.thinkingMode} />
            )}

            {!isLoading && generatedContent && (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-slide-in-up">
                        {generatedContent.resume && (
                            <EditableDocument
                                title="Generated Resume"
                                initialContent={generatedContent.resume}
                                onSave={handleSaveResume}
                            />
                        )}
                        {generatedContent.coverLetter && (
                            <EditableDocument
                                title="Generated Cover Letter"
                                initialContent={generatedContent.coverLetter}
                                onSave={handleSaveCoverLetter}
                            />
                        )}
                    </div>
                    <div className="text-center mt-8">
                        <button
                            onClick={handleGenerateNewRole}
                            className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-transform transform hover:scale-105"
                        >
                            Generate for a New Role
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GenerationResultPage;