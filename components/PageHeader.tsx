import React from 'react';

export interface PageHeaderProps {
  title: string;
  description?: string;
  subtitle?: string | React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  centered?: boolean;
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  description, 
  subtitle,
  actions,
  className = '',
  centered = false,
}) => {
  const displayDescription = description || subtitle;
  
  return (
    <div className={`mb-8 ${className}`}>
      <div className={`flex flex-col ${centered ? 'items-center text-center' : 'sm:flex-row sm:items-center sm:justify-between'} gap-4`}>
        <div className={centered ? 'max-w-2xl' : ''}>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">{title}</h1>
          {displayDescription && (
            <p className="mt-2 text-sm text-gray-500 leading-relaxed">{displayDescription}</p>
          )}
        </div>
        {actions && <div className="flex-shrink-0">{actions}</div>}
      </div>
    </div>
  );
};

export default PageHeader;
