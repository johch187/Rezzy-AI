import React from 'react';
import { QuestionMarkCircleIcon } from './Icons';

const Tooltip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => (
    <span className="inline-flex items-center">
        {children}
        <span className="relative group/tooltip cursor-help ml-1">
            <QuestionMarkCircleIcon />
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-800 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-300 pointer-events-none z-50 text-left">
                {text}
                <svg className="absolute text-slate-800 h-2 w-4 left-1/2 -translate-x-1/2 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon className="fill-current" points="0,0 127.5,127.5 255,0"/></svg>
            </span>
        </span>
    </span>
);

export default Tooltip;
