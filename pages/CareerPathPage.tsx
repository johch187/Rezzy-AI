import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ProfileContext } from '../App';
import { CareerCoachIcon } from '../components/Icons';
import Container from '../components/Container';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import VideoCarousel from '../components/VerticalVideoCarousel';

// Learning resource icons
const BookIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
);

const TrendingIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
);

const YouTubeIcon = () => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
);

const CheckCircleIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

// Category icons with proper styling
const categoryIcons: Record<string, React.ReactNode> = {
    Academics: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
        </svg>
    ),
    Internships: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
    ),
    Projects: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
    ),
    Skills: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
    ),
    Networking: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
    Career: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
    ),
    Certifications: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
    ),
    Extracurriculars: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
    ),
};

const CareerPathPage: React.FC = () => {
    const profileContext = useContext(ProfileContext);
    const careerPath = profileContext?.profile?.careerPath;

    const renderNoPath = () => (
        <Container>
            <PageHeader title="Your Career Path" />
            <div className="text-center py-16 max-w-md mx-auto">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6 text-gray-400">
                    <CareerCoachIcon className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Plan Your Professional Journey</h2>
                <p className="text-gray-500 mt-3 text-sm leading-relaxed">
                    No career path has been generated for this profile yet. Head over to the{' '}
                    <Link to="/career-coach" className="text-primary font-medium hover:underline">Career Coach</Link>{' '}
                    and ask for a plan!
                </p>
                <p className="text-gray-400 mt-2 text-xs">
                    Try asking: "How do I become a Senior Product Manager?" or "Create a career path to Software Architect"
                </p>
                <div className="mt-6">
                    <Button as="link" to="/career-coach" variant="primary">
                        Go to Career Coach
                    </Button>
                </div>
            </div>
        </Container>
    );
    
    if (!careerPath || !careerPath.path || careerPath.path.length === 0) {
        return (
            <div className="flex-grow bg-gray-50 min-h-screen">
                {renderNoPath()}
            </div>
        );
    }

    return (
        <div className="flex-grow bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <Container>
                    <div className="py-8">
                        <h1 className="text-2xl font-semibold text-gray-900">Your Career Path</h1>
                        <p className="text-gray-500 mt-1">
                            From <span className="font-medium text-gray-700">{careerPath.currentRole}</span> to{' '}
                            <span className="font-medium text-primary">{careerPath.targetRole}</span>
                        </p>
                    </div>
                </Container>
            </div>

            {/* Overview Timeline */}
            <div className="bg-white border-b border-gray-200 py-8 overflow-x-auto">
                <Container>
                    <h2 className="text-lg font-semibold text-gray-900 mb-6 text-center">Career Path Overview</h2>
                    <div className="flex items-center justify-center min-w-max px-4">
                        {careerPath.path.map((milestone, index) => (
                            <React.Fragment key={index}>
                                <div className="flex flex-col items-center text-center w-40">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm border-2 border-primary/20">
                                        {index + 1}
                                    </div>
                                    <p className="mt-3 text-sm font-medium text-gray-900 leading-tight">
                                        {milestone.milestoneTitle || `Phase ${index + 1}`}
                                    </p>
                                </div>
                                {index < careerPath.path.length - 1 && (
                                    <div className="w-20 h-0.5 bg-gray-200 mx-2 flex-shrink-0" />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </Container>
            </div>

            {/* Milestones */}
            <Container>
                <div className="py-8 space-y-8">
                    {careerPath.path.map((milestone, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
                        >
                            {/* Milestone Header */}
                            <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-sm flex-shrink-0 mt-0.5">
                                    {index + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-primary uppercase tracking-wider mb-1">
                                        {milestone.timeframe || `Phase ${index + 1}`}
                                    </p>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {milestone.milestoneTitle || `Career Milestone ${index + 1}`}
                                    </h3>
                                    {milestone.milestoneDescription && (
                                        <p className="text-gray-600 text-sm mt-2 leading-relaxed">
                                            {milestone.milestoneDescription}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                {/* Action Items */}
                                {milestone.actionItems && milestone.actionItems.length > 0 && (
                                    <div className="mb-6">
                                        <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <CheckCircleIcon />
                                            Action Items
                                        </h4>
                                        <div className="grid gap-3 sm:grid-cols-2">
                    {milestone.actionItems.map((item, itemIndex) => (
                                                <div
                                                    key={itemIndex}
                                                    className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100"
                                                >
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                                                        {categoryIcons[item.category] || categoryIcons.Career}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-gray-900 text-sm">
                                                            {item.title || 'Action Item'}
                                                        </p>
                                                        {item.description && (
                                                            <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                                                                {item.description}
                                                            </p>
                                                        )}
                                                        <span className="inline-block mt-2 text-xs font-medium text-primary/80 bg-primary/5 px-2 py-0.5 rounded">
                                                            {item.category || 'General'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Learning Topics */}
                                {milestone.learningTopics && milestone.learningTopics.length > 0 && (
                            <div>
                                        <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <BookIcon />
                                            Recommended Learning Topics
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {milestone.learningTopics.map((topic, topicIndex) => (
                                                <a
                                                    key={topicIndex}
                                                    href={`https://www.google.com/search?q=${encodeURIComponent(topic + ' course tutorial')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors"
                                                >
                                                    <TrendingIcon />
                                                    {topic}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* YouTube Videos */}
                                {milestone.recommendedVideos && milestone.recommendedVideos.length > 0 && (
                                    <div className="mt-6">
                                        <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <YouTubeIcon />
                                            Recommended Videos
                                        </h4>
                                        <VideoCarousel videos={milestone.recommendedVideos} />
                                    </div>
                                )}

                                {/* Empty state for action items */}
                                {(!milestone.actionItems || milestone.actionItems.length === 0) && 
                                 (!milestone.learningTopics || milestone.learningTopics.length === 0) && (
                                    <p className="text-gray-400 text-sm text-center py-4">
                                        No specific action items for this milestone yet.
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Regenerate CTA */}
                <div className="pb-8 text-center">
                    <p className="text-gray-500 text-sm mb-4">Want to refine your career path?</p>
                    <Button as="link" to="/career-coach" variant="secondary">
                        Update with Career Coach
                    </Button>
                    </div>
            </Container>
        </div>
    );
};

export default CareerPathPage;
