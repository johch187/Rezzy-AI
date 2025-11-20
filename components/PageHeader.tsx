import React from 'react';

interface PageHeaderProps {
    title: string;
    subtitle?: React.ReactNode;
    className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, className = '' }) => {
    return (
        <div className={`text-center mb-12 ${className}`}>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">{title}</h1>
            {subtitle && (
                <p className="mt-4 max-w-3xl mx-auto text-lg text-slate-600">
                    {subtitle}
                </p>
            )}
        </div>
    );
};

export default PageHeader;