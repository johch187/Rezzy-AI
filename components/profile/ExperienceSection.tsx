import React, { useContext } from 'react';
import { ProfileContext } from '../../App';
import type { Experience } from '../../types';
import { TrashIcon, XCircleIcon } from '../Icons';
import { TooltipLabel, baseInputStyles, validInputStyles } from './common';

export const ExperienceSection = React.memo(() => {
    const { profile, setProfile } = useContext(ProfileContext)!;

    const handleChange = (expId: string, field: keyof Omit<Experience, 'id' | 'achievements'>, value: string) => {
        setProfile(prev => ({
            ...prev,
            experience: prev.experience.map(exp => exp.id === expId ? { ...exp, [field]: value } : exp)
        }));
    };
    
    const handleAchievementChange = (expId: string, achId: string, value: string) => {
        setProfile(prev => ({
            ...prev,
            experience: prev.experience.map(exp => {
                if (exp.id === expId) {
                    return { ...exp, achievements: exp.achievements.map(ach => ach.id === achId ? { ...ach, text: value } : ach) };
                }
                return exp;
            })
        }));
    };

    const addAchievement = (expId: string) => {
        setProfile(prev => ({
            ...prev,
            experience: prev.experience.map(exp => exp.id === expId ? { ...exp, achievements: [...exp.achievements, { id: crypto.randomUUID(), text: '' }] } : exp)
        }));
    };

    const removeAchievement = (expId: string, achId: string) => {
        setProfile(prev => ({
            ...prev,
            experience: prev.experience.map(exp => exp.id === expId ? { ...exp, achievements: exp.achievements.filter(ach => ach.id !== achId) } : exp)
        }));
    };
    
    const addExperience = () => {
        setProfile(prev => ({
            ...prev,
            experience: [...prev.experience, { id: crypto.randomUUID(), company: '', title: '', location: '', startDate: '', endDate: '', achievements: [{ id: crypto.randomUUID(), text: '' }] }]
        }));
    };

    const removeExperience = (expId: string) => {
        setProfile(prev => ({
            ...prev,
            experience: prev.experience.filter(exp => exp.id !== expId)
        }));
    };

    return (
         <div className="space-y-6">
            {profile.experience.map((exp) => (
                <div key={exp.id} className="p-4 border border-gray-200 rounded-lg relative group/item bg-white">
                    <button onClick={() => removeExperience(exp.id)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity p-1" aria-label={`Remove experience at ${exp.company}`}>
                        <TrashIcon />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-xs font-medium text-gray-600 mb-1"><TooltipLabel text="The name of the company.">Company</TooltipLabel></label><input value={exp.company} onChange={e => handleChange(exp.id, 'company', e.target.value)} className={`${baseInputStyles} ${validInputStyles}`} placeholder="Innovate Inc. or Sterling Bank" /></div>
                        <div><label className="block text-xs font-medium text-gray-600 mb-1"><TooltipLabel text="Your job title for this role.">Title</TooltipLabel></label><input value={exp.title} onChange={e => handleChange(exp.id, 'title', e.target.value)} className={`${baseInputStyles} ${validInputStyles}`} placeholder="Software Engineer or Office Manager" /></div>
                        <div><label className="block text-xs font-medium text-gray-600 mb-1"><TooltipLabel text="e.g., 'Remote' or 'City, CA'">Location</TooltipLabel></label><input value={exp.location} onChange={e => handleChange(exp.id, 'location', e.target.value)} className={`${baseInputStyles} ${validInputStyles}`} placeholder="Remote" /></div>
                        <div></div>
                        <div><label className="block text-xs font-medium text-gray-600 mb-1"><TooltipLabel text="Start date of employment. e.g., 'MM/YYYY' or 'YYYY'">Start Date</TooltipLabel></label><input value={exp.startDate} onChange={e => handleChange(exp.id, 'startDate', e.target.value)} placeholder="YYYY or MM/YYYY" className={`${baseInputStyles} ${validInputStyles}`} /></div>
                        <div><label className="block text-xs font-medium text-gray-600 mb-1"><TooltipLabel text="End date of employment. e.g., 'MM/YYYY' or 'Present'">End Date</TooltipLabel></label><input value={exp.endDate} onChange={e => handleChange(exp.id, 'endDate', e.target.value)} placeholder="YYYY or Present" className={`${baseInputStyles} ${validInputStyles}`} /></div>
                    </div>
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1"><TooltipLabel text="List your accomplishments with strong action verbs and quantifiable results where possible.">Achievements / Responsibilities</TooltipLabel></label>
                        <div className="space-y-2 mt-1">
                            {exp.achievements.map(ach => (
                                <div key={ach.id} className="flex items-center space-x-2">
                                    <textarea value={ach.text} onChange={e => handleAchievementChange(exp.id, ach.id, e.target.value)} rows={2} className={`${baseInputStyles} ${validInputStyles}`} placeholder="Use the STAR method (Situation, Task, Action, Result) to describe your accomplishments." />
                                    <button onClick={() => removeAchievement(exp.id, ach.id)} className="text-gray-400 hover:text-red-500 p-1 flex-shrink-0" aria-label="Remove achievement">
                                        <XCircleIcon />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => addAchievement(exp.id)} className="w-full mt-2 text-center px-4 py-1 border border-dashed border-gray-300 text-xs font-medium rounded-md text-gray-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                            + Add Achievement
                        </button>
                    </div>
                </div>
            ))}
            <button onClick={addExperience} className="w-full mt-2 text-center px-4 py-2 border border-dashed border-gray-400 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                + Add Experience
            </button>
        </div>
    );
});