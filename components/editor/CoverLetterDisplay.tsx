import React from 'react';
import type { ParsedCoverLetter } from '../../types';
import { FormInput, FormTextarea } from './common';

interface CoverLetterDisplayProps {
    formData: ParsedCoverLetter;
    isEditing: boolean;
    setFormData: React.Dispatch<React.SetStateAction<ParsedCoverLetter | null | undefined>>;
    recordUndoState: () => void;
}

export const CoverLetterDisplay: React.FC<CoverLetterDisplayProps> = ({
    formData, isEditing, setFormData, recordUndoState
}) => {
    const handleFieldChange = (field: keyof ParsedCoverLetter, value: string) => {
        recordUndoState();
        setFormData(prev => {
            if (!prev) return prev;
            return { ...prev, [field]: value };
        });
    };
    
    return (
        <div className="prose max-w-none text-gray-800">
            {/* Sender Info */}
            <div className="mb-6 text-right">
                <FormInput isEditing={isEditing} value={formData.senderName} onChange={v => handleFieldChange('senderName', v)} className="font-bold text-lg w-full" placeholder="Your Name" />
                <FormTextarea isEditing={isEditing} value={formData.senderAddress} onChange={v => handleFieldChange('senderAddress', v)} rows={2} className="text-sm w-full" placeholder="Your Address"/>
                <FormInput isEditing={isEditing} value={formData.senderContact} onChange={v => handleFieldChange('senderContact', v)} className="text-sm w-full" placeholder="Email | Phone"/>
            </div>

            {/* Date */}
            <div className="mb-6">
                <FormInput isEditing={isEditing} value={formData.date} onChange={v => handleFieldChange('date', v)} placeholder="Date" className="w-full" />
            </div>

            {/* Recipient Info */}
            <div className="mb-6">
                <FormInput isEditing={isEditing} value={formData.recipientName} onChange={v => handleFieldChange('recipientName', v)} className="font-bold w-full" placeholder="Recipient Name" />
                <FormInput isEditing={isEditing} value={formData.recipientTitle} onChange={v => handleFieldChange('recipientTitle', v)} placeholder="Recipient Title" className="w-full" />
                <FormInput isEditing={isEditing} value={formData.companyName} onChange={v => handleFieldChange('companyName', v)} placeholder="Company Name" className="w-full" />
                <FormTextarea isEditing={isEditing} value={formData.companyAddress} onChange={v => handleFieldChange('companyAddress', v)} rows={2} className="text-sm w-full" placeholder="Company Address" />
            </div>

            {/* Salutation */}
            <div className="mb-4">
                <FormInput isEditing={isEditing} value={formData.salutation} onChange={v => handleFieldChange('salutation', v)} className="font-bold w-full" placeholder="Dear Hiring Manager," />
            </div>

            {/* Body */}
            <FormTextarea isEditing={isEditing} value={formData.body} onChange={v => handleFieldChange('body', v)} rows={12} placeholder="Cover letter body..." className="w-full" />

            {/* Closing & Signature */}
            <div className="mt-6">
                <FormInput isEditing={isEditing} value={formData.closing} onChange={v => handleFieldChange('closing', v)} placeholder="Sincerely," className="w-full" />
                <FormInput isEditing={isEditing} value={formData.signature} onChange={v => handleFieldChange('signature', v)} className="mt-4 font-bold w-full" placeholder="Your Name"/>
            </div>
        </div>
    );
};