import React from 'react';

export const FormInput: React.FC<{ value?: string; onChange: (v: string) => void; isEditing: boolean; className?: string; placeholder?: string }> = 
({ value = '', onChange, isEditing, className = '', placeholder = '' }) => (
    isEditing ? 
    <input value={value} onChange={e => onChange(e.target.value)} className={`w-full p-1 border rounded bg-blue-50 border-blue-300 shadow-inner focus:ring-1 focus:ring-primary transition-colors duration-200 ${className}`} placeholder={placeholder} /> :
    <span className={className}>{value}</span>
);

export const FormTextarea: React.FC<{ value?: string; onChange: (v: string) => void; isEditing: boolean; className?: string; placeholder?: string, rows?: number }> = 
({ value = '', onChange, isEditing, className = '', placeholder = '', rows = 4 }) => (
    isEditing ? 
    <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows} className={`w-full p-2 border rounded bg-blue-50 border-blue-300 shadow-inner focus:ring-1 focus:ring-primary transition-colors duration-200 ${className}`} placeholder={placeholder} /> :
    <p className={`whitespace-pre-wrap ${className}`}>{value}</p>
);
