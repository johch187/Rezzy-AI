import React, { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ProfileContext } from '../App';
import { generateCoffeeChatBrief, generateReachOutMessage } from '../services/actions/networkingActions';
import { XCircleIcon } from '../components/Icons';
import Container from '../components/Container';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import { TubelightNavbar, NavItem } from '../components/ui/tubelight-navbar';
import { Coffee, Send } from 'lucide-react';

const CoffeeChatPrepperPage: React.FC = () => {
    const profileContext = useContext(ProfileContext);
    const location = useLocation();

    const { initialMode, initialCounterpartInfo } = (location.state as {
        initialMode?: 'prep' | 'reach_out';
        initialCounterpartInfo?: string;
    }) || {};

    const [generationMode, setGenerationMode] = useState<'prep' | 'reach_out'>(initialMode || 'prep');
    const [counterpartInfo, setCounterpartInfo] = useState(initialCounterpartInfo || '');
    const [error, setError] = useState<string | null>(null);

    if (!profileContext) return <div>Loading...</div>;
    const { profile, tokens, setTokens, backgroundTasks, startBackgroundTask, updateBackgroundTask } = profileContext;

    const isGenerating = backgroundTasks.some(t => t.type === 'coffee-chat' && t.status === 'running');

    const handleGenerate = () => {
        if (!counterpartInfo.trim()) {
            setError("Please provide some information about the person you're meeting.");
            return;
        }
        if (tokens < 1) {
            setError("You don't have enough tokens for this. Please purchase more.");
            return;
        }

        setError(null);
        setTokens(prev => prev - 1);

        const taskId = startBackgroundTask({
            type: 'coffee-chat',
            description: generationMode === 'prep' ? 'Coffee chat brief' : 'Reach out message',
        });

        (async () => {
            try {
                const result = generationMode === 'prep'
                    ? await generateCoffeeChatBrief(profile, counterpartInfo)
                    : await generateReachOutMessage(profile, counterpartInfo);

                const finalResultPayload = { 
                    content: result,
                    generationMode: generationMode,
                    counterpartInfo: counterpartInfo,
                };
                updateBackgroundTask(taskId, { status: 'completed', result: finalResultPayload });
            } catch (e: any) {
                setTokens(prev => prev + 1);
                updateBackgroundTask(taskId, { status: 'error', result: { message: e.message || "An unexpected error occurred." } });
            }
        })();
    };
    
    const placeholderText = generationMode === 'prep'
        ? "e.g., Sarah Chen - Product Manager at Innovate Inc. Previously at Acme Corp. Studied Computer Science at State University. Passionate about user-centric design and mentoring..."
        : "e.g., John Doe - Senior Engineer at Google. Alumnus of my university. Found his profile on LinkedIn, interested in his work on AI projects.";
        
    const buttonText = generationMode === 'prep' ? 'Generate Brief' : 'Generate Message';

    const navItems: NavItem[] = [
        { name: 'prep', displayName: 'Coffee Chat Prep', icon: Coffee },
        { name: 'reach_out', displayName: 'Reach Out Message', icon: Send },
    ];

    return (
        <div className="flex-grow bg-gray-50">
            <Container size="narrow">
                <PageHeader 
                    title="Coffee Chats"
                    subtitle="Prepare for networking conversations or craft personalized outreach messages."
                    centered
                />
                
                <TubelightNavbar
                    items={navItems}
                    activeTab={generationMode}
                    onTabChange={(mode) => setGenerationMode(mode as 'prep' | 'reach_out')}
                    layoutId="coffee-chat-nav"
                />

                <Card className="mt-6">
                    <label htmlFor="counterpart-info" className="block text-base font-medium text-gray-900">
                        Who are you connecting with?
                    </label>
                    <p className="text-sm text-gray-500 mt-1 mb-4">
                        Paste their bio, LinkedIn profile, or your notes. The more detail, the better!
                    </p>
                    <textarea
                        id="counterpart-info"
                        rows={8}
                        className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition bg-white text-sm"
                        placeholder={placeholderText}
                        value={counterpartInfo}
                        onChange={(e) => setCounterpartInfo(e.target.value)}
                        disabled={isGenerating}
                    />
                    <div className="mt-4 flex flex-col sm:flex-row justify-end items-center gap-4">
                        <p className="text-sm text-gray-500">Cost: <span className="font-medium text-gray-700">1 Token</span></p>
                        <Button
                            onClick={handleGenerate}
                            disabled={!counterpartInfo.trim()}
                            isLoading={isGenerating}
                            variant="primary"
                        >
                            {isGenerating ? 'Generating...' : buttonText}
                        </Button>
                    </div>
                </Card>

                {error && (
                    <div className="mt-4 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm flex justify-between items-start">
                        <div>
                            <p className="font-medium">Error</p>
                            <p className="mt-1">{error}</p>
                            {error.includes("tokens") && (
                                <Link to="/subscription" className="underline font-medium mt-2 inline-block">
                                    Purchase More Tokens
                                </Link>
                            )}
                        </div>
                        <button onClick={() => setError(null)} className="p-1 hover:bg-red-100 rounded" aria-label="Close">
                            <XCircleIcon className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </Container>
        </div>
    );
};

export default CoffeeChatPrepperPage;
