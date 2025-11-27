import React from 'react';
import { Link } from 'react-router-dom';
import { LoadingSpinnerIcon } from './Icons';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

type BaseProps = {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
  fullWidth?: boolean;
  className?: string;
};

type ButtonAsButtonProps = BaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> & {
    as?: 'button';
    to?: never;
  };

type ButtonAsLinkProps = BaseProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps | 'href'> & {
    as: 'link';
    to: string;
  };

type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps;

const Button: React.FC<ButtonProps> = (props) => {
  const {
    children,
    variant = 'outline',
    size = 'md',
    leftIcon,
    rightIcon,
    isLoading = false,
    fullWidth = false,
    className = '',
  } = props;

  const baseClasses = `
    inline-flex items-center justify-center gap-2
    font-medium rounded-lg
    transition-all duration-150 ease-out
    focus:outline-none focus:ring-2 focus:ring-offset-1
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-base',
  };

  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary-600 focus:ring-primary/40',
    secondary: 'bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-900/40',
    outline: 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 focus:ring-gray-200',
    ghost: 'text-gray-600 bg-transparent hover:bg-gray-100 focus:ring-gray-200',
    danger: 'text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 focus:ring-red-200',
  };

  const combinedClasses = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const content = (
    <>
      {isLoading && <LoadingSpinnerIcon className="h-4 w-4 animate-spin" />}
      {!isLoading && leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
    </>
  );

  if (props.as === 'link') {
    const { as: _, to, children: __, variant: ___, size: ____, leftIcon: _____, rightIcon: ______, isLoading: _______, fullWidth: ________, className: _________, ...linkProps } = props;
    return (
      <Link to={to} {...linkProps} className={combinedClasses}>
        {content}
      </Link>
    );
  }

  const { as: _, children: __, variant: ___, size: ____, leftIcon: _____, rightIcon: ______, isLoading: _______, fullWidth: ________, className: _________, disabled, ...buttonProps } = props as ButtonAsButtonProps;
  
  return (
    <button {...buttonProps} className={combinedClasses} disabled={disabled || isLoading}>
      {content}
    </button>
  );
};

export default Button;
