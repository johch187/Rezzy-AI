import React, { useState } from 'react';
import type { YouTubeVideo } from '../types';
import { ChevronUpIcon, ChevronDownIcon } from './Icons';

const VerticalVideoCarousel: React.FC<{ videos: YouTubeVideo[] }> = ({ videos }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!videos || videos.length === 0) return null;

    const currentVideo = videos[currentIndex];

    const goToPrevious = () => setCurrentIndex(prev => (prev === 0 ? videos.length - 1 : prev - 1));
    const goToNext = () => setCurrentIndex(prev => (prev === videos.length - 1 ? 0 : prev + 1));

    return (
        <div className="w-full max-w-sm bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
            <a href={`https://www.youtube.com/watch?v=${currentVideo.videoId}`} target="_blank" rel="noopener noreferrer">
                <img 
                    src={`https://img.youtube.com/vi/${currentVideo.videoId}/hqdefault.jpg`} 
                    alt={currentVideo.title} 
                    className="w-full h-48 object-cover"
                />
            </a>
            <div className="p-4">
                <h4 className="font-bold text-neutral truncate" title={currentVideo.title}>{currentVideo.title}</h4>
                <p className="text-sm text-slate-500 mt-1">{currentVideo.channel}</p>
                <p className="text-sm text-slate-600 mt-2 text-ellipsis overflow-hidden h-10">{currentVideo.description}</p>
            </div>
            {videos.length > 1 && (
                 <div className="flex justify-between items-center p-2 bg-slate-50 border-t border-slate-200">
                    <button onClick={goToPrevious} className="p-2 rounded-full hover:bg-slate-200 text-slate-600">
                        <ChevronUpIcon />
                    </button>
                    <span className="text-sm font-medium text-slate-600">{currentIndex + 1} of {videos.length}</span>
                    <button onClick={goToNext} className="p-2 rounded-full hover:bg-slate-200 text-slate-600">
                        <ChevronDownIcon />
                    </button>
                </div>
            )}
        </div>
    );
};

export default VerticalVideoCarousel;