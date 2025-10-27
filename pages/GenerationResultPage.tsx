import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { ProfileContext } from '../App';
import { generateTailoredDocuments } from '../services/generationService';
import { parseGeneratedCoverLetter } from '../services/geminiService';
import { parseGeneratedResume } from '../services/resumeParserService';
import type { ProfileData, GenerationOptions, GeneratedContent, ParsedCoverLetter } from '../types';
import EditableDocument from '../components/EditableDocument';
import { ThinkingIcon, XCircleIcon, CheckIcon, SpinnerIcon, PendingIcon } from '../components/Icons';

// --- Type Guards ---
function isParsedCoverLetter(content: any): content is ParsedCoverLetter {
  return content && typeof content === 'object' && 'recipientName' in content && 'salutation' in content;
}

function isParsedResume(content: any): content is Partial<ProfileData> {
  return content && typeof content === 'object' && ('experience' in content || 'education' in content);
}

const STEPS = [
  { text: "Analyzing your profile...", duration: 1500 },
  { text: "Deconstructing job description...", duration: 2000 },
  { text: "Identifying key skills...", duration: 1500 },
  { text: "Crafting tailored resume sections...", duration: 3000 },
  { text: "Writing compelling cover letter...", duration: 3000 },
  { text: "Structuring resume content...", duration: 1500 },
  { text: "Finalizing documents...", duration: 1000 },
];
const THINKING_STEPS = [
    { text: "Initiating deep analysis...", duration: 3000 },
    { text: "Cross-referencing profile with job needs...", duration: 5000 },
    { text: "Formulating advanced strategic narrative...", duration: 6000 },
    { text: "Constructing highly-detailed resume arguments...", duration: 8000 },
    { text: "Composing a nuanced and persuasive cover letter...", duration: 8000 },
    { text: "Structuring resume for review...", duration: 3000 },
    { text: "Performing final quality assurance checks...", duration: 4000 },
];

const GenerationProgressIndicator: React.FC<{ currentStep: number; thinkingMode: boolean }> = ({ currentStep, thinkingMode }) => {
    const steps = thinkingMode ? THINKING_STEPS : STEPS;
    const title = thinkingMode ? "AI is Thinking Deeply..." : "AI is Generating...";
    const totalSteps = steps.length;

    return (
        <div 
            className="bg-white p-8 rounded-2xl shadow-lg animate-fade-in" 
            role="progressbar" 
            aria-live="polite"
            aria-valuemin={0}
            aria-valuemax={totalSteps}
            aria-valuenow={currentStep}
            aria-valuetext={`Step ${currentStep} of ${totalSteps}: ${steps[currentStep-1]?.text || 'Initializing'}`}
        >
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
    const profileContext = useContext(ProfileContext);
    const { tokens, setTokens } = profileContext!;

    const { profile, options, jobDescription } = location.state as {
        profile: ProfileData;
        options: GenerationOptions;
        jobDescription: string;
    };

    const [isLoading, setIsLoading] = useState(true);
    const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
    const [parsedResume, setParsedResume] = useState<Partial<ProfileData> | null>(null);
    const [parsedCoverLetter, setParsedCoverLetter] = useState<ParsedCoverLetter | null>(null);
    const [generationError, setGenerationError] = useState<string | null>(null);
    const [currentProgressStep, setCurrentProgressStep] = useState(0);

    const progressTimeoutRef = useRef<number | null>(null);

    useEffect(() => {
        if (!profileContext || !profile || !options || !jobDescription) {
            setGenerationError("Missing data for generation. Please go back and try again.");
            setIsLoading(false);
            return;
        }

        const fetchAndParse = async () => {
            setIsLoading(true);
            setGenerationError(null);
            setGeneratedContent(null);
            setParsedResume(null);
            setParsedCoverLetter(null);

            try {
                // Step 1: Generate documents
                const result = await generateTailoredDocuments(profile, options);
                setGeneratedContent(result);

                // Step 2: Parse resume if it exists
                if (result.resume) {
                    try {
                        const parsed = await parseGeneratedResume(result.resume);
                        setParsedResume(parsed);
                    } catch (parsingError: any) {
                        console.warn("Could not parse the generated resume into a form. Displaying as raw text.", parsingError);
                    }
                }

                // Step 3: Parse cover letter if it exists
                if (result.coverLetter) {
                    try {
                        const parsedCL = await parseGeneratedCoverLetter(result.coverLetter);
                        setParsedCoverLetter(parsedCL);
                    } catch (parsingError: any) {
                        console.warn("Could not parse the generated cover letter into a form. Displaying as raw text.", parsingError);
                    }
                }

            } catch (e: any) {
                setGenerationError(e.message || 'An unexpected error occurred. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchAndParse();
    }, [profileContext, profile, options, jobDescription]);

    useEffect(() => {
        // This effect manages the progress bar animation based on the `isLoading` state.
        
        // Cleanup function to be returned. It will clear any pending timeout.
        const cleanup = () => {
            if (progressTimeoutRef.current) {
                clearTimeout(progressTimeoutRef.current);
                progressTimeoutRef.current = null;
            }
        };

        if (isLoading) {
            const steps = options.thinkingMode ? THINKING_STEPS : STEPS;
            let stepIndex = 0;

            const advanceStep = () => {
                // If we've gone through all the steps, just stop.
                if (stepIndex >= steps.length) {
                    return;
                }
                
                // Set the current step for the UI to display.
                setCurrentProgressStep(stepIndex);
                
                // Set a timeout to advance to the next step after the current step's duration.
                const duration = steps[stepIndex].duration;
                progressTimeoutRef.current = window.setTimeout(() => {
                    stepIndex++;
                    advanceStep();
                }, duration);
            };

            advanceStep(); // Start the animation.
        } else {
            // If loading has finished, make sure the progress bar shows 100% completion.
            cleanup();
            const steps = options.thinkingMode ? THINKING_STEPS : STEPS;
            setCurrentProgressStep(steps.length);
        }

        return cleanup; // Return the cleanup function.
    }, [isLoading, options.thinkingMode]);


    const handleSaveResume = useCallback((newContent: string, newStructuredData: Partial<ProfileData> | ParsedCoverLetter | null) => {
        setGeneratedContent(prev => prev ? { ...prev, resume: newContent } : null);
        if (newStructuredData && isParsedResume(newStructuredData)) {
            setParsedResume(newStructuredData);
        }
    }, []);

    const handleSaveCoverLetter = useCallback((newContent: string, newStructuredData: Partial<ProfileData> | ParsedCoverLetter | null) => {
        setGeneratedContent(prev => prev ? { ...prev, coverLetter: newContent } : null);
        if (newStructuredData && isParsedCoverLetter(newStructuredData)) {
            setParsedCoverLetter(newStructuredData);
        }
    }, []);
    
    // Determine layout based on the number of generated documents
    const hasResume = !isLoading && generatedContent?.resume && generatedContent.resume !== 'null';
    const hasCoverLetter = !isLoading && generatedContent?.coverLetter && generatedContent.coverLetter !== 'null';
    const documentCount = (hasResume ? 1 : 0) + (hasCoverLetter ? 1 : 0);

    const containerClasses = documentCount === 1
      ? "flex justify-center" // Center when only one document
      : "grid grid-cols-1 lg:grid-cols-2 gap-8";

    // When there's only one document, we constrain its width to look good.
    const itemWrapperClasses = documentCount === 1 ? "w-full max-w-3xl" : "";

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
                <div>
                    <div className="text-center mb-12 animate-slide-in-up">
                        <h1 className="text-4xl font-extrabold text-neutral tracking-tight">Your Generated Documents</h1>
                        <p className="mt-4 max-w-3xl mx-auto text-lg text-gray-600">
                            Here are the generated document(s). Feel free to edit the text or the order of items and save when you are satisfied.
                        </p>
                    </div>

                    <div className={`w-full ${containerClasses} animate-slide-in-up`}>
                        {hasResume && (
                            <div className={`space-y-4 ${itemWrapperClasses}`}>
                                <h2 className="text-3xl font-bold text-neutral">Generated Resume</h2>
                                <EditableDocument
                                    documentType="resume"
                                    initialContent={generatedContent.resume!}
                                    onSave={handleSaveResume}
                                    structuredContent={parsedResume}
                                    tokens={tokens}
                                    setTokens={setTokens}
                                />
                            </div>
                        )}
                        {hasCoverLetter && (
                            <div className={`space-y-4 ${itemWrapperClasses}`}>
                                <h2 className="text-3xl font-bold text-neutral">Generated Cover Letter</h2>
                                <EditableDocument
                                    documentType="cover-letter"
                                    initialContent={generatedContent.coverLetter!}
                                    onSave={handleSaveCoverLetter}
                                    structuredContent={parsedCoverLetter}
                                    tokens={tokens}
                                    setTokens={setTokens}
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default GenerationResultPage;