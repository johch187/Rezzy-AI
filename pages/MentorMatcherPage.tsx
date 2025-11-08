import React, { useState, useContext, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ProfileContext } from '../App';
import { MentorMatch } from '../types';
import { findMentorMatch } from '../services/generationService';
import { readFileContent } from '../utils';
import { LoadingSpinnerIcon, XCircleIcon, UploadIcon } from '../components/Icons';

const MentorMatcherPage: React.FC = () => {
    const profileContext = useContext(ProfileContext);
    const { tokens, setTokens, backgroundTasks, startBackgroundTask, updateBackgroundTask } = profileContext!;
    const location = useLocation();
    const initialResult = location.state?.result as MentorMatch[] | null;

    const [thesisTopic, setThesisTopic] = useState('');
    const [facultyList, setFacultyList] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<MentorMatch[] | null>(initialResult || null);

    const isGenerating = backgroundTasks.some(t => t.type === 'mentor-match' && t.status === 'running');

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
            setFacultyList(content);
        } catch (err: any) {
            setError(err.message);
        }
        e.target.value = ''; // Reset file input
    };
    
    const handleAnalyze = useCallback(() => {
        if (!thesisTopic.trim() || !facultyList.trim()) {
            setError("Please provide both your thesis topic and the list of faculty.");
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
            type: 'mentor-match',
            description: 'Mentor Matcher Analysis',
        });

        (async () => {
            try {
                const analysisResult = await findMentorMatch(thesisTopic, facultyList);
                setResult(analysisResult);
                updateBackgroundTask(taskId, { status: 'completed', result: analysisResult });
            } catch (e: any) {
                setTokens(prev => prev + 2); // Refund tokens
                const errorMessage = e.message || "An unexpected error occurred during analysis.";
                setError(errorMessage);
                updateBackgroundTask(taskId, { status: 'error', result: { message: errorMessage } });
            }
        })();
    }, [thesisTopic, facultyList, tokens, setTokens, startBackgroundTask, updateBackgroundTask]);
    
    return (
        <div className="bg-base-200 py-16 sm:py-24 animate-fade-in">
            <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                 <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold tracking-tight text-neutral sm:text-5xl">Mentor Matcher</h1>
                    <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
                        Find the perfect first reader for your thesis. Provide your research topic and a list of faculty, and our AI will find the best fit.
                    </p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 space-y-6">
                        <div>
                            <label className="block text-lg font-semibold text-gray-800">Your Thesis Topic</label>
                            <p className="text-gray-500 mt-1 mb-4 text-sm">
                                Provide your thesis title, abstract, or a brief description of your research.
                            </p>
                            <textarea
                                rows={8}
                                className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-primary focus:border-primary transition bg-gray-50"
                                placeholder="e.g., The Impact of Cognitive Biases on Financial Decision-Making in Volatile Markets..."
                                value={thesisTopic}
                                onChange={(e) => setThesisTopic(e.target.value)}
                                disabled={isGenerating}
                            />
                        </div>
                        <div>
                             <label className="block text-lg font-semibold text-gray-800">Potential Mentors</label>
                            <p className="text-gray-500 mt-1 mb-4 text-sm">
                                Paste the list of faculty members and their bios, or upload a file.
                            </p>
                            <button onClick={() => document.getElementById('faculty-upload')?.click()} className="mb-2 inline-flex items-center justify-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50">
                                <UploadIcon /> Upload File
                            </button>
                            <input type="file" id="faculty-upload" className="hidden" onChange={handleFileChange} accept=".pdf,.txt,.md" />
                            <textarea
                                rows={15}
                                className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-primary focus:border-primary transition bg-gray-50"
                                placeholder="e.g., Dr. Ada Lovelace - Professor of Cognitive Science, research focuses on computational models of memory..."
                                value={facultyList}
                                onChange={(e) => setFacultyList(e.target.value)}
                                disabled={isGenerating}
                            />
                        </div>
                        <div className="pt-4 flex flex-col sm:flex-row justify-end items-center gap-4">
                            <p className="text-sm text-gray-600">This analysis costs <span className="font-bold">2 Tokens</span>.</p>
                            <button
                                onClick={handleAnalyze}
                                disabled={isGenerating || !thesisTopic.trim() || !facultyList.trim()}
                                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg shadow-md text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {isGenerating ? <><LoadingSpinnerIcon className="h-5 w-5 mr-3" />Finding Matches...</> : 'Find Best Matches'}
                            </button>
                        </div>
                    </div>
                    <div className="sticky top-24">
                        {error && !isGenerating && (
                            <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md relative flex justify-between items-center shadow-md" role="alert">
                                <p>{error}</p>
                                <button onClick={() => setError(null)} className="p-1" aria-label="Close"><XCircleIcon /></button>
                            </div>
                        )}
                        {isGenerating ? (
                             <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 text-center">
                                <LoadingSpinnerIcon className="h-12 w-12 text-primary mx-auto" />
                                <h3 className="text-xl font-bold text-slate-800 mt-4">Analyzing your inputs...</h3>
                            </div>
                        ) : result ? (
                            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 space-y-6 animate-fade-in">
                                <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-200 pb-4">Top Mentor Matches</h2>
                                {result.map((match, index) => (
                                    <div key={index} className="pt-4 border-t border-slate-100 first:border-t-0 first:pt-0">
                                        <div className="flex justify-between items-baseline">
                                            <h3 className="text-xl font-semibold text-primary">{index + 1}. {match.name}</h3>
                                            <span className="text-lg font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">{match.score}% Match</span>
                                        </div>
                                        <p className="mt-2 text-slate-600">{match.reasoning}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 text-center">
                                <p className="text-slate-500">Your ranked matches will appear here.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MentorMatcherPage;