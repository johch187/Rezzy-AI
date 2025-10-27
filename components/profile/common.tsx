import React from 'react';
import { QuestionMarkCircleIcon } from '../Icons';

export const TooltipLabel: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => (
    <span className="inline-flex items-center">
        {children}
        <span className="relative group/tooltip cursor-help">
            <QuestionMarkCircleIcon />
            <span className="absolute bottom-full left-0 mb-2 w-max max-w-xs p-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-300 pointer-events-none z-50 text-center">
            {text}
            <svg className="absolute text-gray-800 h-2 w-4 left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255" ><polygon className="fill-current" points="0,0 127.5,127.5 255,0"/></svg>
            </span>
        </span>
    </span>
);

export const ErrorMessage: React.FC<{ message?: string; id: string }> = ({ message, id }) => {
    if (!message) return null;
    return <p id={id} className="text-red-500 text-xs mt-1">{message}</p>;
};

export const baseInputStyles = "block w-full text-sm p-2.5 border rounded-md focus:ring-1 focus:ring-primary transition-colors duration-200 shadow-sm placeholder-gray-400";
export const errorInputStyles = "border-red-400 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-500";
export const validInputStyles = "border-gray-300 bg-gray-50 text-gray-900 focus:border-primary";
