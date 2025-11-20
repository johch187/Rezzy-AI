import React, { useRef } from 'react';
import type { YouTubeVideo } from '../types';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';

const VideoCarousel: React.FC<{ videos: YouTubeVideo[] }> = ({ videos }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    if (!videos || videos.length === 0) {
        return (
            <div className="text-center py-8 text-sm text-slate-500 bg-slate-50 rounded-lg">
                No relevant learning videos found for this milestone.
            </div>
        );
    }
    
    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = scrollContainerRef.current.clientWidth * 0.9;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    return (
        <div className="relative group">
             <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
            <div
                ref={scrollContainerRef}
                className="flex overflow-x-auto space-x-4 py-2 scroll-smooth scrollbar-hide snap-x snap-mandatory -mx-2 px-2"
            >
                {videos.map((video, index) => (
                    <div key={index} className="snap-start flex-shrink-0 w-64">
                        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden h-full flex flex-col transition-transform duration-300 hover:-translate-y-1">
                            <a href={`https://www.youtube.com/watch?v=${video.videoId}`} target="_blank" rel="noopener noreferrer" className="block relative">
                                <img
                                    src={`https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`}
                                    alt={video.title}
                                    className="w-full h-36 object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                    <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path></svg>
                                </div>
                            </a>
                            <div className="p-3 flex flex-col flex-grow">
                                <h4 className="font-bold text-sm text-neutral h-10" title={video.title}>{video.title}</h4>
                                <p className="text-xs text-slate-500 mt-1">{video.channel}</p>
                                <p className="text-xs text-slate-600 mt-2 flex-grow">{video.description}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {videos.length > 2 && (
                <>
                    <button
                        onClick={() => scroll('left')}
                        className="absolute top-1/2 -left-3 -translate-y-1/2 bg-white rounded-full p-1.5 shadow-md border border-slate-200 text-slate-600 hover:bg-slate-100 opacity-0 group-hover:opacity-100 disabled:opacity-0 transition-opacity z-10"
                        aria-label="Scroll left"
                    >
                        <ChevronLeftIcon className="h-5 w-5"/>
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        className="absolute top-1/2 -right-3 -translate-y-1/2 bg-white rounded-full p-1.5 shadow-md border border-slate-200 text-slate-600 hover:bg-slate-100 opacity-0 group-hover:opacity-100 disabled:opacity-0 transition-opacity z-10"
                        aria-label="Scroll right"
                    >
                        <ChevronRightIcon className="h-5 w-5"/>
                    </button>
                </>
            )}
        </div>
    );
};

export default VideoCarousel;