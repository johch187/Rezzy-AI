import React from 'react';

export const ErrorMessage: React.FC<{ message?: string; id: string }> = ({ message, id }) => {
    if (!message) return null;
    return <p id={id} className="text-red-500 text-xs mt-1">{message}</p>;
};

export const baseInputStyles = "block w-full text-sm p-2.5 border rounded-md focus:ring-1 focus:ring-primary transition-colors duration-200 shadow-sm placeholder-gray-400";
export const errorInputStyles = "border-red-400 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-500";
export const validInputStyles = "border-gray-300 bg-gray-50 text-gray-900 focus:border-primary";