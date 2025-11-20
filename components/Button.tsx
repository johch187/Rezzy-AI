import React from 'react';
import { Link } from 'react-router-dom';
import { LoadingSpinnerIcon } from './Icons';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

// FIX: Refactored props to create a discriminated union for type safety.
// This ensures that when `as="link"`, only valid anchor props are allowed,
// and when `as="button"`, only valid button props are allowed, resolving the type error.
type BaseProps = {
    children: React.ReactNode;
    variant?: ButtonVariant;
    size?: ButtonSize;
    leftIcon?: React.ReactNode;
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
        isLoading = false,
        fullWidth = false,
        className = '',
    } = props;

    const baseClasses = "inline-flex items-center justify-center font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm";

    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
    };

    const variantClasses = {
        primary: 'text-white bg-primary hover:bg-blue-700 focus:ring-primary',
        secondary: 'text-white bg-slate-800 hover:bg-slate-900 focus:ring-slate-800',
        danger: 'text-red-600 bg-red-100 hover:bg-red-200 focus:ring-red-500',
        outline: 'text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 focus:ring-primary',
    };

    const combinedClasses = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${fullWidth ? 'w-full' : ''} ${className}`;

    const content = (
        <>
            {isLoading && <LoadingSpinnerIcon className="h-5 w-5 mr-2" />}
            {!isLoading && leftIcon && <span className="mr-2 -ml-1 h-5 w-5 flex items-center">{leftIcon}</span>}
            {children}
        </>
    );

    if (props.as === 'link') {
        // Destructure to get `to` and the rest of the link props.
        // Alias already-destructured props with an underscore to avoid redeclaration.
        const {
            as: _as,
            to,
            children: _children,
            variant: _variant,
            size: _size,
            leftIcon: _leftIcon,
            isLoading: _isLoading,
            fullWidth: _fullWidth,
            className: _className,
            ...linkProps
        } = props;
        return (
            <Link to={to} {...linkProps} className={combinedClasses}>
                {content}
            </Link>
        );
    }

    // It's a button. Destructure to get `disabled` and other button-specific props.
    // Alias already-destructured props with an underscore.
    const {
        as: _as,
        children: _children,
        variant: _variant,
        size: _size,
        leftIcon: _leftIcon,
        isLoading: _isLoading,
        fullWidth: _fullWidth,
        className: _className,
        disabled,
        ...buttonProps
    } = props as ButtonAsButtonProps;
    return (
        <button {...buttonProps} className={combinedClasses} disabled={disabled || isLoading}>
            {content}
        </button>
    );
};

export default Button;