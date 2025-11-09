import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ProfileContext } from '../App';
import { CareerCoachIcon } from '../components/Icons';
import VerticalVideoCarousel from '../components/VerticalVideoCarousel';
import CategoryIcon from '../components/CategoryIcon';

const CareerPathPage: React.FC = () => {
    const profileContext = useContext(ProfileContext);
    const careerPath = profileContext?.profile?.careerPath;
    const [activeMilestone, setActiveMilestone] = useState<number | null>(null);
    const milestoneRefs = useRef<(HTMLDivElement | null)[]>([]);
    
    useEffect(() => {
        if (!careerPath) return;

        milestoneRefs.current = milestoneRefs.current.slice(0, careerPath.path.length);

        const handleScroll = () => {
            const scrollPosition = window.scrollY + 120; // Offset for sticky header and some padding
            let currentActiveIndex: number | null = null;
            
            milestoneRefs.current.forEach((ref, index) => {
                if (ref && ref.offsetTop <= scrollPosition) {
                    currentActiveIndex = index;
                }
            });
            setActiveMilestone(currentActiveIndex);
        };
        
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Initial check

        return () => window.removeEventListener('scroll', handleScroll);
    }, [careerPath]);

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, index: number) => {
        e.preventDefault();
        milestoneRefs.current[index]?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
    };

    const renderNoPath = () => (
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
    );
    
    if (!careerPath) {
        return (
             <div className="bg-base-200 pt-16 sm:pt-24 animate-fade-in flex-grow">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                     <div className="text-center mb-16">
                        <h1 className="text-4xl font-extrabold tracking-tight text-neutral sm:text-5xl">Your Career Path</h1>
                    </div>
                    {renderNoPath()}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-base-200 pt-16 sm:pt-24 animate-fade-in flex-grow">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-extrabold tracking-tight text-neutral sm:text-5xl">Your Career Path</h1>
                    <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
                        A personalized roadmap from <span className="font-semibold text-secondary">{careerPath.currentRole}</span> to becoming a <span className="font-semibold text-secondary">{careerPath.targetRole}</span>.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-12">
                    {/* Left Nav */}
                    <aside className="hidden lg:block lg:col-span-1">
                        <div className="sticky top-28">
                            <h3 className="text-lg font-bold text-neutral mb-4">Path Overview</h3>
                            <nav>
                                <ul className="space-y-2">
                                    {careerPath.path.map((milestone, index) => (
                                        <li key={index}>
                                            <a href={`#milestone-${index}`} onClick={(e) => handleNavClick(e, index)} className={`flex items-center p-3 rounded-lg transition-all duration-200 group ${activeMilestone === index ? 'bg-primary text-white shadow-md' : 'hover:bg-gray-100'}`}>
                                                <div className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full border-2 ${activeMilestone === index ? 'border-white bg-white text-primary' : 'border-primary text-primary group-hover:bg-primary group-hover:text-white'}`}>
                                                    <span className="font-bold text-sm">{index + 1}</span>
                                                </div>
                                                <div className="ml-4">
                                                    <p className={`font-semibold text-sm ${activeMilestone === index ? 'text-white' : 'text-neutral'}`}>{milestone.milestoneTitle}</p>
                                                    <p className={`text-xs ${activeMilestone === index ? 'text-blue-200' : 'text-gray-500'}`}>{milestone.timeframe}</p>
                                                </div>
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                        </div>
                    </aside>

                    {/* Right Timeline */}
                    <main className="lg:col-span-3">
                        <div className="relative">
                            <div className="absolute top-0 left-5 md:left-1/2 -ml-px w-0.5 h-full bg-slate-200" aria-hidden="true"></div>
                            
                            {careerPath.path.map((milestone, index) => {
                                const videos = milestone.recommendedVideos;

                                const videoCarouselComponent = (
                                    <div className="w-full max-w-sm">
                                        <h4 className="text-lg font-bold text-neutral mb-4">Recommended Learning</h4>
                                        {videos && videos.length > 0 ? (
                                            <VerticalVideoCarousel videos={videos} />
                                        ) : (
                                            <div className="p-4 text-center text-slate-500 bg-white rounded-xl shadow-lg border border-slate-200">No relevant videos found for this step.</div>
                                        )}
                                    </div>
                                );
                                
                                const milestoneCardComponent = (
                                    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 transition-shadow hover:shadow-2xl">
                                        <p className="text-sm font-semibold text-primary uppercase tracking-wider">{milestone.timeframe}</p>
                                        <h3 className="text-2xl font-bold text-neutral mt-1">{milestone.milestoneTitle}</h3>
                                        <p className="mt-2 text-slate-700">{milestone.milestoneDescription}</p>
                                        
                                        <div className="mt-6 space-y-4">
                                            {milestone.actionItems.map((item, itemIndex) => (
                                                <div key={itemIndex} className="flex items-start gap-4 p-4 bg-slate-50/70 rounded-lg border border-slate-100">
                                                    <CategoryIcon category={item.category} />
                                                    <div>
                                                        <p className="font-semibold text-slate-800">{item.title}</p>
                                                        <p className="text-slate-600 text-sm">{item.description}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );

                                return (
                                    <div id={`milestone-${index}`} ref={el => { milestoneRefs.current[index] = el; }} key={index} className="relative pb-16">
                                        {/* Circle positioned over the timeline bar */}
                                        <div className="absolute top-0 left-5 md:left-1/2 -translate-x-1/2 z-10 flex-shrink-0">
                                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary border-4 border-base-200">
                                                <span className="text-white font-bold">{index + 1}</span>
                                            </div>
                                        </div>

                                        {/* Content Card Layout */}
                                        <div className={`md:grid md:grid-cols-2 md:gap-12 md:items-start`}>
                                            {/* Column 1 */}
                                            <div className={`${index % 2 === 0 ? 'ml-12 md:ml-0 md:pr-6' : 'md:order-2 ml-12 md:ml-0 md:pl-6'}`}>
                                                {milestoneCardComponent}
                                            </div>
                                            
                                            {/* Column 2 (Video Carousel) */}
                                            <div className={`${index % 2 === 0 ? 'mt-8 md:mt-0 ml-12 md:ml-0 md:pl-6' : 'md:order-1 mt-8 md:mt-0 ml-12 md:ml-0 md:pr-6'}`}>
                                                {videoCarouselComponent}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default CareerPathPage;