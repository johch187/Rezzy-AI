import React from 'react';

const Button: React.FC<{ onClick?: () => void; children: React.ReactNode; variant?: 'primary' | 'secondary' | 'danger'; className?: string }> = ({ onClick, children, variant = 'secondary', className }) => {
  const baseClasses = "px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200";
  let variantClasses = '';
  switch (variant) {
    case 'primary':
      variantClasses = 'text-white bg-brand-blue hover:bg-blue-700 focus:ring-brand-blue';
      break;
    case 'danger':
      variantClasses = 'text-red-700 bg-red-100 hover:bg-red-200 focus:ring-red-500';
      break;
    default: // secondary
      variantClasses = 'text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 focus:ring-brand-blue';
      break;
  }
  return (
    <button onClick={onClick} className={`${baseClasses} ${variantClasses} ${className}`}>
      {children}
    </button>
  );
};

export default Button;
