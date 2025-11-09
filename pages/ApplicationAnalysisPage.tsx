import React, { useState, useContext, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ProfileContext } from '../App';
import { ApplicationAnalysisResult } from '../types';
import { analyzeApplicationFit } from '../services/generationService';
import { readFileContent } from '../utils';
import { LoadingSpinnerIcon, XCircleIcon, UploadIcon, SparklesIcon } from '../components/Icons';
import { profileToMarkdown } from '../components/editor/markdownConverter';
import { SimpleMarkdown } from '../components/SimpleMarkdown';

const ResultCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
        <h3 className="text-xl font-bold text-slate-800 border-b border-slate-200 pb-3 mb-4">{title}</h3>
        <div className="prose prose-slate max-w-none">{children}</div>
    </div>
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
            <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold tracking-tight text-neutral sm:text-5xl">Application Strength Analysis</h1>
                    <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
                        Compare your resume against a job description to see your fit percentage, identify skill gaps, and get tips to improve your application.
                    </p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 space-y-6">
                        <div>
                            <label className="block text-lg font-semibold text-gray-800">Your Resume</label>
                            <p className="text-gray-500 mt-1 mb-4 text-sm">
                                Autofill from your active profile, paste resume text, or upload a file.
                            </p>
                             <div className="flex space-x-2 mb-2">
                                <button onClick={handleAutofillFromProfile} className="inline-flex items-center justify-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50">
                                    <SparklesIcon /> Autofill from Profile
                                </button>
                                <button onClick={() => document.getElementById('resume-upload')?.click()} className="inline-flex items-center justify-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50">
                                    <UploadIcon /> Upload File
                                </button>
                            </div>
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
                            <button
                                onClick={handleAnalyze}
                                disabled={isGenerating || !resumeText.trim() || !jobDescription.trim()}
                                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg shadow-md text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {isGenerating ? <><LoadingSpinnerIcon className="h-5 w-5 mr-3" />Analyzing...</> : 'Analyze My Fit'}
                            </button>
                        </div>
                    </div>
                    
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
                            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 text-center">
                                <LoadingSpinnerIcon className="h-12 w-12 text-primary mx-auto" />
                                <h3 className="text-xl font-bold text-slate-800 mt-4">Analyzing your documents...</h3>
                                <p className="text-slate-600 mt-2">This may take a moment.</p>
                            </div>
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
            </div>
        </div>
    );
};

export default ApplicationAnalysisPage;