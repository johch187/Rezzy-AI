import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BriefDisplay from '../components/BriefDisplay';
import MessageDisplay from '../components/MessageDisplay';
import Container from '../components/Container';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import { TubelightNavbar, NavItem } from '../components/ui/tubelight-navbar';
import { Coffee, Send } from 'lucide-react';

const CoffeeChatResultPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const { content, generationMode, counterpartInfo } = (location.state as { 
        content: string; 
        generationMode: 'prep' | 'reach_out';
        counterpartInfo: string;
    }) || {};

    if (!content) {
        return (
            <Container className="text-center">
                <Card className="max-w-lg mx-auto">
                    <h1 className="text-2xl font-bold text-neutral">Oops! Something went wrong.</h1>
                    <p className="mt-4 text-gray-600">
                        The generated content was not found. This can happen if you refresh the page or navigate here directly.
                        Please start a new generation from the prepper page.
                    </p>
                    <Button onClick={() => navigate('/coffee-chats')} variant="primary" size="lg" className="mt-6">
                        Prepare Another
                    </Button>
                </Card>
            </Container>
        );
    }
    
    const handleModeChange = (newMode: 'prep' | 'reach_out') => {
        // This function is for the top selector to switch modes
        if (newMode !== generationMode) {
            navigate('/coffee-chats', {
                state: {
                    initialMode: newMode,
                    initialCounterpartInfo: counterpartInfo,
                }
            });
        }
    };
    
    const handleStartOver = () => {
        // This function is for the bottom button to start over in the same mode
        navigate('/coffee-chats', {
            state: {
                initialMode: generationMode,
                initialCounterpartInfo: counterpartInfo,
            }
        });
    };

    const isPrepMode = generationMode === 'prep';
    const title = isPrepMode ? 'Your Generated Brief' : 'Your Generated Message';
    const description = isPrepMode
        ? "Here is the personalized brief to help you prepare for your conversation. Good luck!"
        : "Here is the personalized message to help you land your next coffee chat. Copy and paste it into LinkedIn or an email.";
    const buttonText = isPrepMode ? 'Prepare Another Brief' : 'Create Another Message';

    const navItems: NavItem[] = [
        { name: 'prep', displayName: 'Coffee Chat Prep', icon: Coffee },
        { name: 'reach_out', displayName: 'Reach Out Message', icon: Send },
    ];


    return (
        <div className="bg-base-200 py-16 sm:py-24 animate-fade-in flex-grow">
            <Container className="max-w-4xl py-0">
                 <PageHeader title={title} subtitle={description} />

                <TubelightNavbar
                    items={navItems}
                    activeTab={generationMode}
                    onTabChange={(mode) => handleModeChange(mode as 'prep' | 'reach_out')}
                    layoutId="coffee-chat-result-nav"
                    className="max-w-md mx-auto"
                />

                <Card className="p-8 sm:p-10 animate-fade-in">
                    {isPrepMode ? (
                        <BriefDisplay content={content} />
                    ) : (
                        <MessageDisplay content={content} />
                    )}
                </Card>

                <div className="mt-12 text-center">
                    <Button onClick={handleStartOver} variant="secondary" size="lg">
                        {buttonText}
                    </Button>
                </div>
            </Container>
        </div>
    );
};

export default CoffeeChatResultPage;