import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ProfileContext } from '../App';
import type { ProfileData, GeneratedContent, ParsedCoverLetter, ApplicationAnalysisResult } from '../types';
import EditableDocument from '../components/EditableDocument';
import { XCircleIcon } from '../components/Icons';
import ApplicationAnalysisWidget from '../components/ApplicationAnalysisWidget';
import { isParsedCoverLetter, isParsedResume } from '../utils';

const GenerationResultPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const profileContext = useContext(ProfileContext);

    if (!location.state?.generatedContent) {
        return (
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 animate-fade-in text-center">
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 max-w-lg mx-auto">
                    <h1 className="text-2xl font-bold text-neutral">Oops! Something went wrong.</h1>
                    <p className="mt-4 text-gray-600">
                        The generation data was not found. This can happen if you refresh the page or navigate here directly.
                        Please start a new generation from the builder page.
                    </p>
                    <button
                        onClick={() => navigate('/generate')}
                        className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-md text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                        Start New Generation
                    </button>
                </div>
            </div>
        );
    }

    const { generatedContent, parsedResume: initialParsedResume, parsedCoverLetter: initialParsedCoverLetter, analysisResult } = location.state as {
        generatedContent: GeneratedContent;
        analysisResult: ApplicationAnalysisResult | null;
        parsedResume: Partial<ProfileData> | null;
        parsedCoverLetter: ParsedCoverLetter | null;
    };

    const { tokens, setTokens } = profileContext!;

    const [editableDocs, setEditableDocs] = useState<GeneratedContent>(generatedContent);
    const [parsedResume, setParsedResume] = useState<Partial<ProfileData> | null>(initialParsedResume);
    const [parsedCoverLetter, setParsedCoverLetter] = useState<ParsedCoverLetter | null>(initialParsedCoverLetter);
    const [parsingError, setParsingError] = useState<string | null>(null);
    const [activeView, setActiveView] = useState<'resume' | 'coverLetter' | null>(null);

    useEffect(() => {
        if (generatedContent.resume) {
            setActiveView('resume');
        } else if (generatedContent.coverLetter) {
            setActiveView('coverLetter');
        }
    }, [generatedContent]);
    
    useEffect(() => {
        const errorMessages: string[] = [];
        if (generatedContent.resume && !initialParsedResume) {
            errorMessages.push("We couldn't structure the generated resume for rich editing, but you can still edit the raw text and download it.");
        }
        if (generatedContent.coverLetter && !initialParsedCoverLetter) {
            errorMessages.push("We couldn't structure the generated cover letter for rich editing, but you can still edit the raw text and download it.");
        }
        if (errorMessages.length > 0) {
            setParsingError(errorMessages.join(' '));
        }
    }, [generatedContent, initialParsedResume, initialParsedCoverLetter]);

    const handleSaveResume = useCallback((newContent: string, newStructuredData: Partial<ProfileData> | ParsedCoverLetter | null) => {
        setEditableDocs(prev => ({ ...prev, resume: newContent }));
        if (newStructuredData && isParsedResume(newStructuredData)) {
            setParsedResume(newStructuredData);
        }
    }, []);

    const handleSaveCoverLetter = useCallback((newContent: string, newStructuredData: Partial<ProfileData> | ParsedCoverLetter | null) => {
        setEditableDocs(prev => ({ ...prev, coverLetter: newContent }));
        if (newStructuredData && isParsedCoverLetter(newStructuredData)) {
            setParsedCoverLetter(newStructuredData);
        }
    }, []);
    
    const hasResume = !!editableDocs.resume;
    const hasCoverLetter = !!editableDocs.coverLetter;

    return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            {parsingError && (
                <div className="mb-6 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-md relative flex justify-between items-center shadow-md" role="alert">
                    <div>
                        <p className="font-bold">Display Note</p>
                        <p>{parsingError}</p>
                    </div>
                    <button onClick={() => setParsingError(null)} className="p-1 rounded-full hover:bg-yellow-200 transition-colors" aria-label="Close error">
                        <XCircleIcon className="h-6 w-6" />
                    </button>
                </div>
            )}

            <div>
                <div className="text-center mb-12 animate-slide-in-up">
                    <h1 className="text-4xl font-extrabold text-neutral tracking-tight sm:text-5xl">Your Generation Results</h1>
                    <p className="mt-4 max-w-3xl mx-auto text-xl text-gray-600">
                        Review your application's fit, then edit and download your tailored documents.
                    </p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <main className="lg:col-span-2 space-y-8">
                        {(hasResume || hasCoverLetter) && (
                            <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200 max-w-sm mx-auto" role="tablist">
                                {hasResume && (
                                    <button
                                        onClick={() => setActiveView('resume')}
                                        className={`w-1/2 py-2 px-4 rounded-md text-sm font-semibold transition-all duration-300 ${activeView === 'resume' ? 'bg-white shadow text-primary' : 'text-gray-600 hover:bg-gray-200'}`}
                                        role="tab"
                                        aria-selected={activeView === 'resume'}
                                    >
                                        Resume
                                    </button>
                                )}
                                {hasCoverLetter && (
                                    <button
                                        onClick={() => setActiveView('coverLetter')}
                                        className={`w-1/2 py-2 px-4 rounded-md text-sm font-semibold transition-all duration-300 ${activeView === 'coverLetter' ? 'bg-white shadow text-primary' : 'text-gray-600 hover:bg-gray-200'}`}
                                        role="tab"
                                        aria-selected={activeView === 'coverLetter'}
                                    >
                                        Cover Letter
                                    </button>
                                )}
                            </div>
                        )}

                        <div className="w-full">
                            {activeView === 'resume' && hasResume && (
                                <div className="space-y-4">
                                    <EditableDocument
                                        documentType="resume"
                                        initialContent={editableDocs.resume!}
                                        onSave={handleSaveResume}
                                        structuredContent={parsedResume}
                                        tokens={tokens}
                                        setTokens={setTokens}
                                    />
                                </div>
                            )}
                            {activeView === 'coverLetter' && hasCoverLetter && (
                                <div className="space-y-4">
                                    <EditableDocument
                                        documentType="cover-letter"
                                        initialContent={editableDocs.coverLetter!}
                                        onSave={handleSaveCoverLetter}
                                        structuredContent={parsedCoverLetter}
                                        tokens={tokens}
                                        setTokens={setTokens}
                                    />
                                </div>
                            )}
                        </div>
                    </main>

                    <aside className="lg:col-span-1 sticky top-24">
                        {analysisResult && (
                            <ApplicationAnalysisWidget analysis={analysisResult} />
                        )}
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default GenerationResultPage;