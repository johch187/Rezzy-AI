import React, { useId } from 'react';

export const FormInput: React.FC<{ value?: string; onChange: (v: string) => void; isEditing: boolean; className?: string; placeholder?: string; name?: string }> = 
({ value = '', onChange, isEditing, className = '', placeholder = '', name }) => {
    const autoId = useId();
    const inputId = name || autoId;
    return isEditing ? 
        <input 
            id={inputId}
            name={inputId}
            value={value} 
            onChange={e => onChange(e.target.value)} 
            className={`p-1 border rounded bg-blue-50 border-blue-200 shadow-inner focus:ring-1 focus:ring-primary transition-colors duration-200 ${className}`} 
            placeholder={placeholder}
            aria-label={placeholder || name}
        /> :
        <span className={className}>{value}</span>;
};

export const FormTextarea: React.FC<{ value?: string; onChange: (v: string) => void; isEditing: boolean; className?: string; placeholder?: string; rows?: number; name?: string }> = 
({ value = '', onChange, isEditing, className = '', placeholder = '', rows = 4, name }) => {
    const autoId = useId();
    const inputId = name || autoId;
    return isEditing ? 
        <textarea 
            id={inputId}
            name={inputId}
            value={value} 
            onChange={e => onChange(e.target.value)} 
            rows={rows} 
            className={`p-2 border rounded bg-blue-50 border-blue-200 shadow-inner focus:ring-1 focus:ring-primary transition-colors duration-200 ${className}`} 
            placeholder={placeholder}
            aria-label={placeholder || name}
        /> :
        <p className={`whitespace-pre-wrap ${className}`}>{value}</p>;
};