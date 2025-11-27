import React, { useState, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ProfileContext } from '../App';
import { shapeInterviewStory, generateInterviewQuestions } from '../services/actions/interviewActions';
import { generateCoffeeChatBrief } from '../services/actions/networkingActions';
import { LoadingSpinnerIcon, XCircleIcon } from '../components/Icons';
import { SimpleMarkdown } from '../components/SimpleMarkdown';
import Container from '../components/Container';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import { TubelightNavbar, NavItem } from '../components/ui/tubelight-navbar';
import { MessageSquareText, Users, HelpCircle } from 'lucide-react';

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
                        result = await shapeInterviewStory(inputs.story);
                        break;
                    case 'rapport':
                        result = await generateCoffeeChatBrief(profile, inputs.rapport);
                        break;
                    case 'questions':
                        result = await generateInterviewQuestions(inputs.questions);
                        break;
                }
                setResults(prev => ({ ...prev, [activeTool]: result }));
                updateBackgroundTask(taskId, { status: 'completed', result: { content: result, tool: activeTool } });
            } catch (e: any) {
                setTokens(prev => prev + 1);
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
    
    const navItems: NavItem[] = [
        { name: 'story', displayName: 'Story Shaper', icon: MessageSquareText },
        { name: 'rapport', displayName: 'Rapport Builder', icon: Users },
        { name: 'questions', displayName: 'Practice Questions', icon: HelpCircle },
    ];

    const renderTool = () => {
        const config = toolConfig[activeTool];
        return (
            <div className="space-y-4">
                <textarea
                    rows={10}
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition bg-white text-sm"
                    placeholder={config.placeholder}
                    value={inputs[activeTool]}
                    onChange={(e) => setInputs(prev => ({...prev, [activeTool]: e.target.value}))}
                    disabled={isGenerating}
                />
                <div className="flex flex-col sm:flex-row justify-end items-center gap-4">
                    <p className="text-sm text-gray-500">Cost: <span className="font-medium text-gray-700">{config.cost} Token</span></p>
                    <Button
                        onClick={handleGenerate}
                        disabled={!inputs[activeTool].trim()}
                        isLoading={isGenerating}
                        variant="primary"
                    >
                        {isGenerating ? 'Generating...' : config.button}
                    </Button>
                </div>
            </div>
        );
    }
    
    const renderResult = () => {
        if (isGenerating) {
            return (
                <div className="flex flex-col items-center justify-center py-12">
                    <LoadingSpinnerIcon className="h-8 w-8 text-primary" />
                    <p className="mt-3 text-sm text-gray-500">Generating...</p>
                </div>
            );
        }

        if (activeTool === 'story' && results.story) return <SimpleMarkdown text={results.story} />;
        if (activeTool === 'rapport' && results.rapport) return <SimpleMarkdown text={results.rapport} />;
        if (activeTool === 'questions' && results.questions.length > 0) {
            return (
                <ul className="space-y-3">
                    {results.questions.map((q, i) => (
                        <li key={i} className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center justify-center">{i + 1}</span>
                            <span className="text-gray-700">{q}</span>
                        </li>
                    ))}
                </ul>
            );
        }
        
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                    <MessageSquareText className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">Your results will appear here</p>
            </div>
        );
    }

    return (
        <div className="flex-grow bg-gray-50">
            <Container size="wide">
                <PageHeader 
                    title="Interview Prep Center"
                    subtitle="Structure your stories, prepare questions, and build rapport with confidence."
                />
                
                <TubelightNavbar
                    items={navItems}
                    activeTab={activeTool}
                    onTabChange={(tool) => setActiveTool(tool as Tool)}
                    layoutId="interview-prep-nav"
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                    <Card>
                        {renderTool()}
                    </Card>
                    
                    <Card className="min-h-[400px]">
                        {error && !isGenerating && (
                            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm flex justify-between items-start">
                                <p>{error}</p>
                                <button onClick={() => setError(null)} className="p-0.5 hover:bg-red-100 rounded" aria-label="Close">
                                    <XCircleIcon className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                        {renderResult()}
                    </Card>
                </div>
            </Container>
        </div>
    );
};

export default InterviewPrepPage;
