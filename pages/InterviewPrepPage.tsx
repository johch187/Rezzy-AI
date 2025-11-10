import React, { useState, useContext, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ProfileContext } from '../App';
import {
    shapeInterviewStoryViaServer,
    generateInterviewQuestionsViaServer,
    generateCoffeeChatBriefViaServer,
} from '../services/aiGateway';
import { LoadingSpinnerIcon, XCircleIcon } from '../components/Icons';
import { SimpleMarkdown } from '../components/SimpleMarkdown';

type Tool = 'story' | 'rapport' | 'questions';

const InterviewPrepPage: React.FC = () => {
    const profileContext = useContext(ProfileContext);
    const { profile, tokens, setTokens, backgroundTasks, startBackgroundTask, updateBackgroundTask } = profileContext!;
    const location = useLocation();
    const navState = location.state as { result: { content: string | string[]; tool: Tool } } | null;

    const [activeTool, setActiveTool] = useState<Tool>('story');
    const [inputs, setInputs] = useState({ story: '', rapport: '', questions: '' });
    const [results, setResults] = useState({ story: '', rapport: '', questions: [] as string[] });
    const [error, setError] = useState<string | null>(null);

    const isGenerating = backgroundTasks.some(t => t.type === 'interview-prep' && t.status === 'running');

    useEffect(() => {
        if (navState?.result) {
            const { content, tool } = navState.result;
            setActiveTool(tool);
            // @ts-ignore
            setResults(prev => ({ ...prev, [tool]: content }));
        }
    }, [navState]);

    const handleGenerate = () => {
        if (!inputs[activeTool].trim()) {
            setError(`Please provide input for the ${activeTool} tool.`);
            return;
        }
        if (tokens < 1) {
            setError("You don't have enough tokens for this.");
            return;
        }

        setError(null);
        setResults(prev => ({ ...prev, [activeTool]: activeTool === 'questions' ? [] : '' }));
        setTokens(prev => prev - 1);
        
        const taskId = startBackgroundTask({
            type: 'interview-prep',
            description: `Interview Prep: ${toolConfig[activeTool].title}`,
        });

        (async () => {
            try {
                let result: string | string[];
                switch (activeTool) {
                    case 'story':
                        result = await shapeInterviewStoryViaServer(inputs.story);
                        break;
                    case 'rapport':
                        result = await generateCoffeeChatBriefViaServer(profile, inputs.rapport);
                        break;
                    case 'questions':
                        result = await generateInterviewQuestionsViaServer(inputs.questions);
                        break;
                }
                setResults(prev => ({ ...prev, [activeTool]: result }));
                updateBackgroundTask(taskId, { status: 'completed', result: { content: result, tool: activeTool } });
            } catch (e: any) {
                setTokens(prev => prev + 1); // Refund token
                const errorMessage = e.message || "An unexpected error occurred.";
                setError(errorMessage);
                updateBackgroundTask(taskId, { status: 'error', result: { message: errorMessage } });
            }
        })();
    };
    
    const toolConfig = {
        story: { title: "Shape Interview Story", placeholder: "Brain-dump a story about a project or challenge...", button: "Shape My Story", cost: 1 },
        rapport: { title: "Build Rapport with Interviewer", placeholder: "Paste your interviewer's LinkedIn bio or any info you have...", button: "Generate Rapport Builders", cost: 1 },
        questions: { title: "Generate Practice Questions", placeholder: "Paste the job description here...", button: "Generate Questions", cost: 1 },
    };

    const renderTool = () => {
        const config = toolConfig[activeTool];
        return (
            <div className="space-y-4">
                <textarea
                    rows={12}
                    className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-primary focus:border-primary transition bg-gray-50"
                    placeholder={config.placeholder}
                    value={inputs[activeTool]}
                    onChange={(e) => setInputs(prev => ({...prev, [activeTool]: e.target.value}))}
                    disabled={isGenerating}
                />
                <div className="pt-2 flex flex-col sm:flex-row justify-end items-center gap-4">
                    <p className="text-sm text-gray-600">This will cost <span className="font-bold">{config.cost} Token</span>.</p>
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || !inputs[activeTool].trim()}
                        className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg shadow-md text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {isGenerating ? <><LoadingSpinnerIcon className="h-5 w-5 mr-3" />Generating...</> : config.button}
                    </button>
                </div>
            </div>
        );
    }
    
    const renderResult = () => {
        if (isGenerating) {
            return (
                <div className="text-center p-8">
                    <LoadingSpinnerIcon className="h-12 w-12 text-primary mx-auto" />
                    <h3 className="text-xl font-bold text-slate-800 mt-4">Generating...</h3>
                </div>
            );
        }

        if (activeTool === 'story' && results.story) return <SimpleMarkdown text={results.story} />;
        if (activeTool === 'rapport' && results.rapport) return <SimpleMarkdown text={results.rapport} />;
        if (activeTool === 'questions' && results.questions.length > 0) {
            return (
                <ul className="space-y-3 list-decimal list-inside">
                    {results.questions.map((q, i) => <li key={i}>{q}</li>)}
                </ul>
            );
        }
        
        return <p className="text-slate-500 text-center py-8">Your results will appear here.</p>;
    }

    return (
        <div className="bg-base-200 py-16 sm:py-24 animate-fade-in flex-grow">
            <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold tracking-tight text-neutral sm:text-5xl">Interview Prep Center</h1>
                    <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
                        Walk into any interview with confidence. Use our AI tools to structure your stories, prepare questions, and build rapport.
                    </p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
                        <div className="mb-6">
                            <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200" role="tablist">
                                {(Object.keys(toolConfig) as Tool[]).map(tool => (
                                    <button
                                        key={tool}
                                        onClick={() => setActiveTool(tool)}
                                        className={`w-full py-2 px-2 text-center rounded-md text-sm font-semibold transition-all duration-300 ${activeTool === tool ? 'bg-white shadow text-primary' : 'text-gray-600 hover:bg-gray-200'}`}
                                        role="tab"
                                        aria-selected={activeTool === tool}
                                    >
                                        {toolConfig[tool].title}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {renderTool()}
                    </div>
                    
                    <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 min-h-[30rem]">
                        {error && !isGenerating && (
                            <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md relative flex justify-between items-center shadow-sm" role="alert">
                                <p>{error}</p>
                                <button onClick={() => setError(null)} className="p-1" aria-label="Close"><XCircleIcon /></button>
                            </div>
                        )}
                        {renderResult()}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default InterviewPrepPage;
