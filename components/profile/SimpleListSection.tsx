import React, { useContext, useCallback } from 'react';
import { ProfileContext } from '../../App';
import type { Skill, Certification, Interest } from '../../types';
import { TrashIcon } from '../Icons';
import { baseInputStyles, validInputStyles } from './common';

type SimpleListSectionKeys = 'technicalSkills' | 'softSkills' | 'tools' | 'certifications' | 'interests';
type SimpleListItem = Skill | Certification | Interest;

export const SimpleListSection = React.memo(({
  section, title, placeholder,
}: {
  section: SimpleListSectionKeys;
  title: string;
  placeholder: string;
}) => {
    const { profile, setProfile } = useContext(ProfileContext)!;
    const items = profile[section];

    const handleNameChange = useCallback((id: string, newName: string) => {
        setProfile(prev => {
            const newItems = (prev[section] as SimpleListItem[]).map(item =>
                item.id === id ? { ...item, name: newName } : item
            );
            return { ...prev, [section]: newItems };
        });
    }, [section, setProfile]);

    const handleRemove = useCallback((id: string) => {
        setProfile(prev => ({
            ...prev,
            [section]: (prev[section] as SimpleListItem[]).filter(item => item.id !== id)
        }));
    }, [section, setProfile]);
    
    const handleAdd = useCallback(() => {
        setProfile(prev => ({
            ...prev,
            [section]: [...(prev[section] as SimpleListItem[]), { id: crypto.randomUUID(), name: '' }]
        }));
    }, [section, setProfile]);

    return (
        <div className="space-y-3">
            {items.map((item) => (
                <div key={item.id} className="flex items-center space-x-2 group/item">
                    <input
                        value={item.name}
                        onChange={e => handleNameChange(item.id, e.target.value)}
                        placeholder={placeholder}
                        className={`${baseInputStyles} ${validInputStyles}`}
                    />
                    <button onClick={() => handleRemove(item.id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity p-1" aria-label={`Remove ${placeholder} item`}>
                        <TrashIcon />
                    </button>
                </div>
            ))}
            <button onClick={handleAdd} className="w-full mt-2 text-center px-4 py-2 border border-dashed border-gray-400 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                + Add {title}
            </button>
        </div>
    );
});
