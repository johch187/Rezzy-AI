import React, { useContext } from 'react';
import { ProfileContext } from '../../App';
import type { Language } from '../../types';
import { TrashIcon } from '../Icons';
import { baseInputStyles, validInputStyles } from './common';

export const LanguagesSection = React.memo(() => {
    const { profile, setProfile } = useContext(ProfileContext)!;

    const handleChange = (id: string, field: keyof Omit<Language, 'id'>, value: string) => {
        setProfile(prev => ({
            ...prev,
            languages: prev.languages.map(lang => lang.id === id ? { ...lang, [field]: value } : lang)
        }));
    };

    const addLanguage = () => {
        setProfile(prev => ({
            ...prev,
            languages: [...prev.languages, { id: crypto.randomUUID(), name: '', proficiency: 'conversational' }]
        }));
    };

    const removeLanguage = (id: string) => {
        setProfile(prev => ({
            ...prev,
            languages: prev.languages.filter(lang => lang.id !== id)
        }));
    };

    return (
        <div className="space-y-3">
            {profile.languages.map(lang => (
                <div key={lang.id} className="flex items-center space-x-2 group/item">
                    <input
                        value={lang.name}
                        onChange={e => handleChange(lang.id, 'name', e.target.value)}
                        placeholder="English"
                        className={`${baseInputStyles} ${validInputStyles}`}
                    />
                    <select
                        value={lang.proficiency}
                        onChange={e => handleChange(lang.id, 'proficiency', e.target.value)}
                        className={`${baseInputStyles} ${validInputStyles} w-48`}
                    >
                        <option value="basic">Basic</option>
                        <option value="conversational">Conversational</option>
                        <option value="fluent">Fluent</option>
                        <option value="native">Native</option>
                    </select>
                    <button onClick={() => removeLanguage(lang.id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity p-1" aria-label={`Remove language item`}>
                        <TrashIcon />
                    </button>
                </div>
            ))}
            <button onClick={addLanguage} className="w-full mt-2 text-center px-4 py-2 border border-dashed border-gray-400 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                + Add Language
            </button>
        </div>
    );
});
