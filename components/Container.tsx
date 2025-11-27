import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'default' | 'narrow' | 'wide';
}

const Container: React.FC<ContainerProps> = ({ 
  children, 
  className = '',
  size = 'default',
}) => {
  const sizeClasses = {
    narrow: 'max-w-3xl',
    default: 'max-w-5xl',
    wide: 'max-w-7xl',
  };

  return (
    <div className={`${sizeClasses[size]} mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
      {children}
    </div>
  );
};

export default Container;
