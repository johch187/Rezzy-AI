import React, { useState, useContext, useCallback, useEffect } from 'react';
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
                    rows={12}
                    className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-primary focus:border-primary transition bg-gray-50"
                    placeholder={config.placeholder}
                    value={inputs[activeTool]}
                    onChange={(e) => setInputs(prev => ({...prev, [activeTool]: e.target.value}))}
                    disabled={isGenerating}
                />
                <div className="pt-2 flex flex-col sm:flex-row justify-end items-center gap-4">
                    <p className="text-sm text-gray-600">This will cost <span className="font-bold">{config.cost} Token</span>.</p>
                    <Button
                        onClick={handleGenerate}
                        disabled={!inputs[activeTool].trim()}
                        isLoading={isGenerating}
                        variant="primary"
                        size="lg"
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
            <Container className="py-0">
                <PageHeader 
                    title="Interview Prep Center"
                    subtitle="Walk into any interview with confidence. Use our AI tools to structure your stories, prepare questions, and build rapport."
                />
                
                <TubelightNavbar
                    items={navItems}
                    activeTab={activeTool}
                    onTabChange={(tool) => setActiveTool(tool as Tool)}
                    layoutId="interview-prep-nav"
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <Card>
                        {renderTool()}
                    </Card>
                    
                    <Card className="min-h-[30rem]">
                        {error && !isGenerating && (
                            <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md relative flex justify-between items-center shadow-sm" role="alert">
                                <p>{error}</p>
                                <button onClick={() => setError(null)} className="p-1" aria-label="Close"><XCircleIcon /></button>
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
