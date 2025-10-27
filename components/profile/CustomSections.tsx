import React, { useContext } from 'react';
import { ProfileContext } from '../../App';
import { TrashIcon, XCircleIcon } from '../Icons';
import { baseInputStyles, validInputStyles } from './common';

export const CustomSections = React.memo(() => {
    const { profile, setProfile } = useContext(ProfileContext)!;

    const handleSectionTitleChange = (id: string, title: string) => {
        setProfile(prev => ({
            ...prev,
            customSections: prev.customSections.map(cs => cs.id === id ? { ...cs, title } : cs)
        }));
    };

    const handleItemChange = (sectionId: string, itemId: string, text: string) => {
        setProfile(prev => ({
            ...prev,
            customSections: prev.customSections.map(cs => {
                if (cs.id === sectionId) {
                    return { ...cs, items: cs.items.map(item => item.id === itemId ? { ...item, text } : item) };
                }
                return cs;
            })
        }));
    };

    const addSection = () => {
        setProfile(prev => ({
            ...prev,
            customSections: [...prev.customSections, { id: crypto.randomUUID(), title: '', items: [{ id: crypto.randomUUID(), text: '' }] }]
        }));
    };

    const removeSection = (id: string) => {
        setProfile(prev => ({
            ...prev,
            customSections: prev.customSections.filter(cs => cs.id !== id)
        }));
    };

    const addItem = (sectionId: string) => {
        setProfile(prev => ({
            ...prev,
            customSections: prev.customSections.map(cs => cs.id === sectionId ? { ...cs, items: [...cs.items, { id: crypto.randomUUID(), text: '' }] } : cs)
        }));
    };

    const removeItem = (sectionId: string, itemId: string) => {
        setProfile(prev => ({
            ...prev,
            customSections: prev.customSections.map(cs => cs.id === sectionId ? { ...cs, items: cs.items.filter(item => item.id !== itemId) } : cs)
        }));
    };

    return (
        <div className="space-y-6">
            {profile.customSections.map(cs => (
                <div key={cs.id} className="p-4 border border-gray-200 rounded-lg relative group/item bg-white">
                    <button onClick={() => removeSection(cs.id)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity p-1" aria-label={`Remove custom section ${cs.title}`}>
                        <TrashIcon />
                    </button>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Section Title</label>
                        <input value={cs.title} onChange={e => handleSectionTitleChange(cs.id, e.target.value)} className={`${baseInputStyles} ${validInputStyles} font-semibold`} placeholder="Publications, Volunteer Work" />
                    </div>
                    <div className="mt-4 space-y-2">
                        {cs.items.map(item => (
                            <div key={item.id} className="flex items-center space-x-2">
                                <textarea value={item.text} onChange={e => handleItemChange(cs.id, item.id, e.target.value)} rows={2} className={`${baseInputStyles} ${validInputStyles}`} placeholder="'Contributed to open-source project X by implementing feature Y.'" />
                                <button onClick={() => removeItem(cs.id, item.id)} className="text-gray-400 hover:text-red-500 p-1 flex-shrink-0" aria-label="Remove item"><XCircleIcon /></button>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => addItem(cs.id)} className="w-full mt-2 text-center px-4 py-1 border border-dashed border-gray-300 text-xs font-medium rounded-md text-gray-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                        + Add Item
                    </button>
                </div>
            ))}
            <button onClick={addSection} className="w-full mt-2 text-center px-4 py-2 border border-dashed border-gray-400 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                + Add Custom Section
            </button>
        </div>
    );
});
