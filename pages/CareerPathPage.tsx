import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ProfileContext } from '../App';
import { CareerCoachIcon } from '../components/Icons';
import VideoCarousel from '../components/VerticalVideoCarousel';
import CategoryIcon from '../components/CategoryIcon';
import Container from '../components/Container';
import PageHeader from '../components/PageHeader';
import { Timeline } from '../components/ui/timeline';
import TimelineOverview from '../components/ui/timeline-overview';
import Button from '../components/Button';

const CareerPathPage: React.FC = () => {
    const profileContext = useContext(ProfileContext);
    const careerPath = profileContext?.profile?.careerPath;

    const renderNoPath = () => (
        <Container>
            <PageHeader title="Your Career Path" />
            <div className="text-center py-16 max-w-md mx-auto">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6 text-gray-400">
                    <CareerCoachIcon />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Plan Your Professional Journey</h2>
                <p className="text-gray-500 mt-3 text-sm leading-relaxed">
                    No career path has been generated for this profile yet. Head over to the{' '}
                    <Link to="/career-coach" className="text-primary font-medium hover:underline">Career Coach</Link>{' '}
                    and ask for a plan!
                </p>
                <p className="text-gray-400 mt-2 text-xs">
                    Try asking: "How do I become a Senior Product Manager?" or "What are the steps to get a job in finance?"
                </p>
                <div className="mt-6">
                    <Button as="link" to="/career-coach" variant="primary">
                        Go to Career Coach
                    </Button>
                </div>
            </div>
        </Container>
    );
    
    if (!careerPath) {
        return (
            <div className="flex-grow bg-gray-50">
                {renderNoPath()}
            </div>
        );
    }

    const timelineData = careerPath.path.map((milestone) => ({
        title: milestone.milestoneTitle,
        content: (
            <div className="w-full">
                <p className="text-xs font-medium text-primary uppercase tracking-wider mb-2">{milestone.timeframe}</p>
                <p className="text-gray-600 text-sm leading-relaxed">{milestone.milestoneDescription}</p>

                <div className="mt-5 space-y-3">
                    {milestone.actionItems.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-100">
                            <CategoryIcon category={item.category} />
                            <div>
                                <p className="font-medium text-gray-900 text-sm">{item.title}</p>
                                <p className="text-gray-500 text-xs mt-0.5">{item.description}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {milestone.recommendedVideos && milestone.recommendedVideos.length > 0 && (
                    <div className="mt-6">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Recommended Learning</h4>
                        <VideoCarousel videos={milestone.recommendedVideos} />
                    </div>
                )}
            </div>
        )
    }));

    const header = (
        <div className="bg-white border-b border-gray-100">
            <div className="max-w-5xl mx-auto pt-8 px-4 sm:px-6 lg:px-8">
                <PageHeader
                    title="Your Career Path"
                    subtitle={<>From <span className="font-medium text-gray-900">{careerPath.currentRole}</span> to <span className="font-medium text-gray-900">{careerPath.targetRole}</span></>}
                    className="!mb-0"
                />
            </div>
            <TimelineOverview milestones={careerPath.path.map(p => ({ title: p.milestoneTitle }))} />
        </div>
    );

    return (
        <div className="flex-grow bg-gray-50">
            <Timeline data={timelineData} header={header} />
        </div>
    );
};

export default CareerPathPage;
