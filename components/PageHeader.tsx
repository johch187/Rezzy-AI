import React from 'react';

export interface PageHeaderProps {
  title: string;
  description?: string;
  subtitle?: string | React.ReactNode; // Alias for description
  actions?: React.ReactNode;
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  description, 
  subtitle,
  actions,
  className = ''
}) => {
  // Use subtitle as fallback for description
  const displayDescription = description || subtitle;
  
  return (
    <div className={`mb-6 sm:mb-8 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">{title}</h1>
          {displayDescription && (
            <p className="mt-1 text-sm text-gray-500">{displayDescription}</p>
          )}
        </div>
        {actions && <div className="flex-shrink-0">{actions}</div>}
      </div>
    </div>
  );
};

export default PageHeader;
