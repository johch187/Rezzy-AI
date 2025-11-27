import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '',
  padding = 'md',
  hover = false,
}) => {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-5 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  return (
    <div 
      className={`
        bg-white rounded-xl border border-gray-200/60
        ${paddingClasses[padding]}
        ${hover ? 'transition-shadow duration-200 hover:shadow-md' : 'shadow-xs'}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;
