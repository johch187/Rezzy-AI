import React, { useState, useContext, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ProfileContext } from '../App';
import { ApplicationAnalysisResult } from '../types';
import { analyzeApplicationFit } from '../services/actions/analysisActions';
import { readFileContent } from '../utils';
import { LoadingSpinnerIcon, XCircleIcon, UploadIcon, SparklesIcon } from '../components/Icons';
import { profileToMarkdown } from '../components/editor/markdownConverter';
import { SimpleMarkdown } from '../components/SimpleMarkdown';
import Container from '../components/Container';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';

const ResultCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <Card>
        <h3 className="text-xl font-bold text-slate-800 border-b border-slate-200 pb-3 mb-4">{title}</h3>
        <div className="prose prose-slate max-w-none">{children}</div>
    </Card>
);

const ApplicationAnalysisPage: React.FC = () => {
    const profileContext = useContext(ProfileContext);
    const { profile, tokens, setTokens, backgroundTasks, startBackgroundTask, updateBackgroundTask } = profileContext!;
    const location = useLocation();
    const initialResult = location.state?.result as ApplicationAnalysisResult | null;

    const [resumeText, setResumeText] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<ApplicationAnalysisResult | null>(initialResult || null);

    const isGenerating = backgroundTasks.some(t => t.type === 'application-analysis' && t.status === 'running');

    useEffect(() => {
        if (initialResult) {
            setResult(initialResult);
        }
    }, [initialResult]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const content = await readFileContent(file);
            setResumeText(content);
        } catch (err: any) {
            setError(err.message);
        }
        e.target.value = ''; // Reset file input
    };

    const handleAutofillFromProfile = useCallback(() => {
        if (profile) {
            // A sensible default order for sections when generating markdown from the profile
            const defaultOrder = ['summary', 'experience', 'education', 'projects', 'skills', 'certifications', 'languages'];
            const markdownResume = profileToMarkdown(profile, profile.sectionOrder || defaultOrder);
            setResumeText(markdownResume);
        }
    }, [profile]);

    const handleAnalyze = useCallback(() => {
        if (!resumeText.trim() || !jobDescription.trim()) {
            setError("Please provide both your resume and the job description.");
            return;
        }
        if (tokens < 2) {
            setError("You need at least 2 tokens for this analysis.");
            return;
        }

        setError(null);
        setResult(null);
        setTokens(prev => prev - 2);

        const taskId = startBackgroundTask({
            type: 'application-analysis',
            description: 'Application Fit Analysis',
        });

        (async () => {
            try {
                const analysisResult = await analyzeApplicationFit(resumeText, jobDescription);
                setResult(analysisResult); // Show result immediately on this page
                updateBackgroundTask(taskId, { status: 'completed', result: analysisResult });
            } catch (e: any) {
                setTokens(prev => prev + 2); // Refund tokens
                updateBackgroundTask(taskId, { status: 'error', result: { message: e.message || "An unexpected error occurred during analysis." } });
                setError(e.message || "An unexpected error occurred during analysis.");
            }
        })();
    }, [resumeText, jobDescription, tokens, setTokens, startBackgroundTask, updateBackgroundTask]);

    return (
        <div className="bg-base-200 py-16 sm:py-24 animate-fade-in">
            <Container className="py-0">
                <PageHeader 
                    title="Application Strength Analysis"
                    subtitle="Compare your resume against a job description to see your fit percentage, identify skill gaps, and get tips to improve your application."
                />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card className="space-y-6">
                        <div>
                            <label className="block text-lg font-semibold text-gray-800">Your Resume</label>
                            <p className="text-gray-500 mt-1 mb-4 text-sm">
                                Autofill from your active profile, paste resume text, or upload a file.
                            </p>
                             <div className="flex space-x-2 mb-2">
                                <Button onClick={handleAutofillFromProfile} leftIcon={<SparklesIcon />}>
                                    Autofill from Profile
                                </Button>
                                <Button onClick={() => document.getElementById('resume-upload')?.click()} leftIcon={<UploadIcon />} type="button">
                                    Upload File
                                </Button>
                            </div>
                            <label htmlFor="resume-upload" className="sr-only">Upload resume file</label>
                            <input type="file" id="resume-upload" className="hidden" onChange={handleFileChange} accept=".pdf,.txt,.md" />
                            <textarea
                                rows={15}
                                className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-primary focus:border-primary transition bg-gray-50"
                                placeholder="Paste your full resume text here..."
                                value={resumeText}
                                onChange={(e) => setResumeText(e.target.value)}
                                disabled={isGenerating}
                            />
                        </div>
                         <div>
                            <label className="block text-lg font-semibold text-gray-800">Job Description</label>
                            <p className="text-gray-500 mt-1 mb-4 text-sm">
                                Paste the full job description you are targeting.
                            </p>
                            <textarea
                                rows={15}
                                className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-primary focus:border-primary transition bg-gray-50"
                                placeholder="Paste the job description here..."
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                disabled={isGenerating}
                            />
                        </div>
                        <div className="pt-4 flex flex-col sm:flex-row justify-end items-center gap-4">
                            <p className="text-sm text-gray-600">This analysis costs <span className="font-bold">2 Tokens</span>.</p>
                            <Button
                                onClick={handleAnalyze}
                                disabled={!resumeText.trim() || !jobDescription.trim()}
                                isLoading={isGenerating}
                                variant="primary"
                                size="lg"
                            >
                                {isGenerating ? 'Analyzing...' : 'Analyze My Fit'}
                            </Button>
                        </div>
                    </Card>
                    
                    <div className="space-y-8">
                         {error && !isGenerating && (
                            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md relative flex justify-between items-center shadow-md" role="alert">
                                <div>
                                    <p className="font-bold">An error occurred</p>
                                    <p>{error}</p>
                                </div>
                                <button onClick={() => setError(null)} className="p-1 rounded-full hover:bg-red-200 transition-colors" aria-label="Close">
                                    <XCircleIcon className="h-6 w-6" />
                                </button>
                            </div>
                        )}
                        {isGenerating && (
                            <Card className="text-center">
                                <LoadingSpinnerIcon className="h-12 w-12 text-primary mx-auto" />
                                <h3 className="text-xl font-bold text-slate-800 mt-4">Analyzing your documents...</h3>
                                <p className="text-slate-600 mt-2">This may take a moment.</p>
                            </Card>
                        )}
                        {result && !isGenerating &&(
                            <div className="space-y-8 animate-fade-in">
                                <ResultCard title="Fit Score">
                                    <div className="text-center">
                                        <p className="text-7xl font-extrabold text-primary">{result.fitScore}%</p>
                                        <p className="text-lg text-slate-600 font-semibold mt-2">Match</p>
                                    </div>
                                </ResultCard>
                                <ResultCard title="Gap Analysis"><SimpleMarkdown text={result.gapAnalysis} /></ResultCard>
                                <ResultCard title="Keyword Optimization"><SimpleMarkdown text={result.keywordOptimization} /></ResultCard>
                                <ResultCard title="Impact Enhancer"><SimpleMarkdown text={result.impactEnhancer} /></ResultCard>
                            </div>
                        )}
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default ApplicationAnalysisPage;
