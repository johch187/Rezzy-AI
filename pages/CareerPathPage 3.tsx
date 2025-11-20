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

const CareerPathPage: React.FC = () => {
    const profileContext = useContext(ProfileContext);
    const careerPath = profileContext?.profile?.careerPath;

    const renderNoPath = () => (
        <Container>
            <PageHeader title="Your Career Path" />
            <div className="text-center py-20 max-w-2xl mx-auto">
                <div className="flex items-center justify-center h-20 w-20 rounded-full bg-secondary/10 mx-auto mb-6">
                    <CareerCoachIcon />
                </div>
                <h2 className="text-2xl font-bold text-neutral mt-6">Plan Your Professional Journey</h2>
                <p className="text-gray-600 mt-4">
                    No career path has been generated for this profile yet. Head over to the <Link to="/career-coach" className="text-primary font-semibold hover:underline">AI Career Coach</Link> and ask for a plan!
                </p>
                <p className="text-gray-500 mt-2 text-sm">
                    Try asking: "How do I become a Senior Product Manager?" or "What are the steps to get a job in finance?"
                </p>
            </div>
        </Container>
    );
    
    if (!careerPath) {
        return (
             <div className="bg-base-200 pt-8 sm:pt-16 animate-fade-in flex-grow">
                {renderNoPath()}
            </div>
        );
    }

    const timelineData = careerPath.path.map((milestone) => ({
        title: milestone.milestoneTitle,
        content: (
            <div className="w-full">
                <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">{milestone.timeframe}</p>
                <p className="mt-2 text-slate-700">{milestone.milestoneDescription}</p>

                <div className="mt-6 space-y-4">
                    {milestone.actionItems.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                            <CategoryIcon category={item.category} />
                            <div>
                                <p className="font-semibold text-slate-800">{item.title}</p>
                                <p className="text-slate-600 text-sm">{item.description}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {milestone.recommendedVideos && milestone.recommendedVideos.length > 0 && (
                    <div className="mt-8">
                        <h4 className="text-lg font-bold text-neutral mb-4">Recommended Learning</h4>
                        <VideoCarousel videos={milestone.recommendedVideos} />
                    </div>
                )}
            </div>
        )
    }));

    const header = (
        <div className="bg-slate-50 border-b border-slate-200">
            <div className="max-w-7xl mx-auto pt-10 md:pt-20 px-4 md:px-8 lg:px-10">
                <PageHeader
                    title="Your Career Path"
                    subtitle={<>A personalized roadmap from <span className="font-semibold text-secondary">{careerPath.currentRole}</span> to becoming a <span className="font-semibold text-secondary">{careerPath.targetRole}</span>.</>}
                    className="!mb-0"
                />
            </div>
            <TimelineOverview milestones={careerPath.path.map(p => ({ title: p.milestoneTitle }))} />
        </div>
    );

    return (
        <div className="animate-fade-in flex-grow bg-white">
            <Timeline data={timelineData} header={header} />
        </div>
    );
};

export default CareerPathPage;