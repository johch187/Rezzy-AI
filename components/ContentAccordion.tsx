import React, { useState } from 'react';
import { ArrowIcon } from './Icons';

const ContentAccordion: React.FC<{ title: string, children: React.ReactNode, initiallyOpen?: boolean }> = ({ title, children, initiallyOpen = false }) => {
    const [isOpen, setIsOpen] = useState(initiallyOpen);
    const [isOverflowVisible, setIsOverflowVisible] = useState(initiallyOpen);

    const handleToggle = () => {
        if (isOpen) {
            // Start closing: ensure overflow is hidden for transition
            setIsOverflowVisible(false);
        }
        setIsOpen(!isOpen);
    };

    const handleTransitionEnd = () => {
        // After transition finishes, if it's open, make overflow visible
        if (isOpen) {
            setIsOverflowVisible(true);
        }
    };
    
    const contentContainerClasses = `
        transition-all duration-300 ease-in-out 
        ${isOpen ? 'max-h-[1500px] pb-5' : 'max-h-0'}
        ${isOverflowVisible ? 'overflow-visible' : 'overflow-hidden'}
    `;

    return (
        <div className="border-t border-gray-200 last:border-b-0">
            <button
                className="flex items-center justify-between w-full py-5 font-medium text-left text-gray-600 hover:text-gray-900 focus:outline-none"
                onClick={handleToggle}
            >
                <span className="text-lg font-semibold">{title}</span>
                <ArrowIcon collapsed={!isOpen} />
            </button>
            <div 
                className={contentContainerClasses}
                onTransitionEnd={handleTransitionEnd}
            >
                {children}
            </div>
        </div>
    );
};

export default ContentAccordion;