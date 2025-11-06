import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ProfileContext } from '../App';
import type { ActionItem, YouTubeVideo } from '../types';
import { CareerCoachIcon } from '../components/Icons';
import { getYouTubeRecommendations } from '../services/generationService';

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
    const careerPath = profileContext?.profile?.careerPath;
    const [activeMilestone, setActiveMilestone] = useState<number | null>(null);
    const milestoneRefs = useRef<(HTMLDivElement | null)[]>([]);
    
    const [videos, setVideos] = useState<YouTubeVideo[]>([]);
    const [isLoadingVideos, setIsLoadingVideos] = useState(true);
    const [videoError, setVideoError] = useState<string | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (careerPath?.targetRole) {
            setIsLoadingVideos(true);
            setVideoError(null);
            getYouTubeRecommendations(careerPath.targetRole)
                .then(recommendedVideos => {
                    setVideos(recommendedVideos);
                })
                .catch(err => {
                    console.error("Failed to fetch video recommendations:", err);
                    setVideoError("Sorry, we couldn't fetch video recommendations at this time.");
                })
                .finally(() => {
                    setIsLoadingVideos(false);
                });
        } else {
            setIsLoadingVideos(false);
        }
    }, [careerPath]);

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

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = scrollContainerRef.current.clientWidth * 0.9;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const VideoCarouselSkeleton: React.FC = () => (
        <div className="animate-pulse">
            <h2 className="text-2xl font-bold text-neutral mb-4">Recommended Videos</h2>
            <div className="flex space-x-6">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex-shrink-0 w-80">
                        <div className="bg-slate-200 h-40 rounded-lg"></div>
                        <div className="mt-2 h-4 bg-slate-200 rounded w-5/6"></div>
                        <div className="mt-1 h-3 bg-slate-200 rounded w-1/2"></div>
                    </div>
                ))}
            </div>
        </div>
    );

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
             <div className="bg-base-200 py-16 sm:py-24 animate-fade-in">
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
        <div className="bg-base-200 py-16 sm:py-24 animate-fade-in">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-extrabold tracking-tight text-neutral sm:text-5xl">Your Career Path</h1>
                    <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
                        A personalized roadmap from <span className="font-semibold text-secondary">{careerPath.currentRole}</span> to becoming a <span className="font-semibold text-secondary">{careerPath.targetRole}</span>.
                    </p>
                </div>

                <div className="mb-16">
                    {isLoadingVideos ? (
                        <VideoCarouselSkeleton />
                    ) : videoError ? (
                        <div className="text-center p-4 bg-red-100 text-red-700 rounded-lg">{videoError}</div>
                    ) : videos.length > 0 && (
                        <div>
                            <h2 className="text-2xl font-bold text-neutral mb-4">Recommended Videos to Get Started</h2>
                             <div className="relative group">
                                <div ref={scrollContainerRef} className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth py-4 space-x-6">
                                    {videos.map((video, index) => (
                                        <a 
                                            key={index} 
                                            href={`https://www.youtube.com/watch?v=${video.videoId}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="snap-start flex-shrink-0 w-80 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden transform transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl"
                                        >
                                            <img 
                                                src={`https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`} 
                                                alt={video.title} 
                                                className="w-full h-40 object-cover"
                                            />
                                            <div className="p-4">
                                                <h4 className="font-bold text-neutral truncate" title={video.title}>{video.title}</h4>
                                                <p className="text-sm text-slate-500 mt-1">{video.channel}</p>
                                                <p className="text-sm text-slate-600 mt-2 text-ellipsis overflow-hidden h-10">{video.description}</p>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                                <button onClick={() => scroll('left')} className="absolute top-1/2 -translate-y-1/2 left-0 -ml-6 w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md border border-slate-200 text-slate-600 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                </button>
                                <button onClick={() => scroll('right')} className="absolute top-1/2 -translate-y-1/2 right-0 -mr-6 w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md border border-slate-200 text-slate-600 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                </button>
                            </div>
                        </div>
                    )}
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
                            
                            {careerPath.path.map((milestone, index) => (
                                <div id={`milestone-${index}`} ref={el => { milestoneRefs.current[index] = el; }} key={index} className="relative pb-16">
                                    {/* Circle positioned over the timeline bar */}
                                    <div className="absolute top-0 left-5 md:left-1/2 -translate-x-1/2 z-10 flex-shrink-0">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary border-4 border-base-200">
                                            <span className="text-white font-bold">{index + 1}</span>
                                        </div>
                                    </div>

                                    {/* Content Card Layout */}
                                    <div className={`md:flex ${index % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>
                                        <div className="md:w-1/2">
                                            {/* This div acts as a spacer on one side */}
                                        </div>
                                        <div className="md:w-1/2">
                                            <div className={`ml-12 md:ml-0 ${index % 2 !== 0 ? 'md:pr-8' : 'md:pl-8'}`}>
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
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default CareerPathPage;