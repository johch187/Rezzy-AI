import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ProfileContext } from '../App';
import type { ProfileData, GeneratedContent, ParsedCoverLetter, ApplicationAnalysisResult } from '../types';
import EditableDocument from '../components/EditableDocument';
import { XCircleIcon } from '../components/Icons';
import ApplicationAnalysisWidget from '../components/ApplicationAnalysisWidget';
import { isParsedCoverLetter, isParsedResume } from '../utils';
import Container from '../components/Container';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import { TubelightNavbar, NavItem } from '../components/ui/tubelight-navbar';
import { FileText, Mail } from 'lucide-react';

const GenerationResultPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const profileContext = useContext(ProfileContext);

    if (!location.state?.generatedContent) {
        return (
            <Container className="text-center">
                <Card className="max-w-lg mx-auto">
                    <h1 className="text-2xl font-bold text-neutral">Oops! Something went wrong.</h1>
                    <p className="mt-4 text-gray-600">
                        The generation data was not found. This can happen if you refresh the page or navigate here directly.
                        Please start a new generation from the builder page.
                    </p>
                    <Button
                        onClick={() => navigate('/generate')}
                        variant="primary"
                        size="lg"
                        className="mt-6"
                    >
                        Start New Generation
                    </Button>
                </Card>
            </Container>
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

    const navItems: NavItem[] = [
        { name: 'resume', displayName: 'Resume', icon: FileText },
        { name: 'coverLetter', displayName: 'Cover Letter', icon: Mail },
    ];

    return (
        <Container>
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
                <PageHeader
                    title="Your Generation Results"
                    subtitle="Review your application's fit, then edit and download your tailored documents."
                    className="animate-slide-in-up"
                />
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <main className="lg:col-span-2 space-y-8">
                        {hasResume && hasCoverLetter && (
                            <TubelightNavbar
                                items={navItems}
                                activeTab={activeView!}
                                onTabChange={(view) => setActiveView(view as 'resume' | 'coverLetter')}
                                layoutId="generation-result-nav"
                            />
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
        </Container>
    );
};

export default GenerationResultPage;