import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ProfileContext } from '../App';
import type { ActionItem } from '../types';
import { CareerCoachIcon } from '../components/Icons';

const CategoryIcon: React.FC<{ category: ActionItem['category'] }> = ({ category }) => {
    const iconMap: { [key in ActionItem['category']]: React.ReactElement } = {
        Academics: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-5.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-5.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222 4 2.222V20" /></svg>,
        Internships: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
        Projects: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
        Skills: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M12 6a2 2 0 100-4 2 2 0 000 4zm0 7a2 2 0 100-4 2 2 0 000 4zm0 7a2 2 0 100-4 2 2 0 000 4z" /></svg>,
        Networking: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
        Career: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
        Extracurriculars: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21v-2a6 6 0 00-12 0v2" /></svg>,
        Certifications: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>,
    };
    return <div className="p-1.5 bg-primary/10 text-primary rounded-full">{iconMap[category] || iconMap['Career']}</div>;
};

const CareerPathPage: React.FC = () => {
    const profileContext = useContext(ProfileContext);
    const { careerPath } = profileContext!;

    const renderContent = () => {
        if (!careerPath) {
            return (
                <div className="text-center py-20 max-w-2xl mx-auto">
                     <div className="flex items-center justify-center h-20 w-20 rounded-full bg-secondary/10 mx-auto mb-6">
                        <CareerCoachIcon />
                     </div>
                    <h2 className="text-2xl font-bold text-neutral mt-6">Plan Your Professional Journey</h2>
                    <p className="text-gray-600 mt-4">
                        No career path has been generated yet. Head over to the <Link to="/career-coach" className="text-primary font-semibold hover:underline">AI Career Coach</Link> and ask for a plan!
                    </p>
                     <p className="text-gray-500 mt-2 text-sm">
                        Try asking: "How do I become a Senior Product Manager?" or "What are the steps to get a job in finance?"
                    </p>
                </div>
            );
        }

        return (
             <div className="max-w-4xl mx-auto">
                <div className="relative">
                    {/* The vertical line */}
                    <div className="hidden md:block absolute top-0 left-1/2 -ml-px w-0.5 h-full bg-gray-200" aria-hidden="true"></div>
                    
                    {careerPath.path.map((milestone, index) => (
                        <div key={index} className="relative md:flex md:items-start md:space-x-8 mb-16">
                            {/* Mobile timeline line */}
                            <div className="md:hidden absolute top-5 left-5 w-px h-full bg-gray-200"></div>

                            {/* Dot on the timeline */}
                            <div className="relative z-10 flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-primary border-4 border-white md:mx-auto">
                                <span className="text-white font-bold">{index + 1}</span>
                            </div>

                            {/* Content Card */}
                            <div className="w-full md:w-1/2 bg-white p-6 rounded-xl shadow-lg border border-gray-200 mt-6 md:mt-0">
                                <p className="text-sm font-semibold text-primary uppercase tracking-wider">{milestone.timeframe}</p>
                                <h3 className="text-2xl font-bold text-neutral mt-1">{milestone.milestoneTitle}</h3>
                                <p className="mt-2 text-gray-700">{milestone.milestoneDescription}</p>
                                
                                <div className="mt-6 space-y-4">
                                    {milestone.actionItems.map((item, itemIndex) => (
                                        <div key={itemIndex} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                                            <CategoryIcon category={item.category} />
                                            <div>
                                                <p className="font-semibold text-gray-800">{item.title}</p>
                                                <p className="text-gray-600 text-sm">{item.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="bg-base-200 py-16 sm:py-24 animate-fade-in">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-extrabold tracking-tight text-neutral sm:text-5xl">Your Career Path</h1>
                    {careerPath && (
                        <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
                            A personalized roadmap from <span className="font-semibold text-secondary">{careerPath.currentRole}</span> to becoming a <span className="font-semibold text-secondary">{careerPath.targetRole}</span>.
                        </p>
                    )}
                </div>
                {renderContent()}
            </div>
        </div>
    );
};

export default CareerPathPage;