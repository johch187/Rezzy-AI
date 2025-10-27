import React, { useContext } from 'react';
import { ProfileContext } from '../../App';
import type { Project } from '../../types';
import { TrashIcon } from '../Icons';
import { TooltipLabel, baseInputStyles, validInputStyles } from './common';

export const ProjectSection = React.memo(() => {
    const { profile, setProfile } = useContext(ProfileContext)!;

    const handleChange = (id: string, field: keyof Omit<Project, 'id'>, value: string) => {
        setProfile(prev => ({
            ...prev,
            projects: prev.projects.map(proj => proj.id === id ? { ...proj, [field]: value } : proj)
        }));
    };

    const addProject = () => {
        setProfile(prev => ({
            ...prev,
            projects: [...prev.projects, { id: crypto.randomUUID(), name: '', description: '', url: '', technologiesUsed: '', startDate: '', endDate: '' }]
        }));
    };

    const removeProject = (id: string) => {
        setProfile(prev => ({
            ...prev,
            projects: prev.projects.filter(proj => proj.id !== id)
        }));
    };

    return (
        <div className="space-y-6">
            {profile.projects.map(proj => (
                <div key={proj.id} className="p-4 border border-gray-200 rounded-lg relative group/item bg-white">
                    <button onClick={() => removeProject(proj.id)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity p-1" aria-label={`Remove project ${proj.name}`}>
                        <TrashIcon />
                    </button>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-xs font-medium text-gray-600 mb-1"><TooltipLabel text="The official name of your project.">Project Name</TooltipLabel></label><input value={proj.name} onChange={e => handleChange(proj.id, 'name', e.target.value)} className={`${baseInputStyles} ${validInputStyles}`} placeholder="Q3 Budget Forecast or Portfolio Website" /></div>
                        <div><label className="block text-xs font-medium text-gray-600 mb-1"><TooltipLabel text="Link to the live project or its repository (e.g., GitHub).">Project URL</TooltipLabel></label><input value={proj.url} onChange={e => handleChange(proj.id, 'url', e.target.value)} className={`${baseInputStyles} ${validInputStyles}`} placeholder="yourprojectlink.com" /></div>
                        <div><label className="block text-xs font-medium text-gray-600 mb-1"><TooltipLabel text="Year the project started. e.g., '2023'">Start Date</TooltipLabel></label><input value={proj.startDate} onChange={e => handleChange(proj.id, 'startDate', e.target.value)} placeholder="YYYY" className={`${baseInputStyles} ${validInputStyles}`} /></div>
                        <div><label className="block text-xs font-medium text-gray-600 mb-1"><TooltipLabel text="Year the project ended or 'Present'.">End Date</TooltipLabel></label><input value={proj.endDate} onChange={e => handleChange(proj.id, 'endDate', e.target.value)} placeholder="YYYY or Present" className={`${baseInputStyles} ${validInputStyles}`} /></div>
                        <div className="md:col-span-2"><label className="block text-xs font-medium text-gray-600 mb-1"><TooltipLabel text="Comma-separated list of key technologies. e.g., 'React, Node.js, PostgreSQL'">Technologies Used</TooltipLabel></label><input value={proj.technologiesUsed} onChange={e => handleChange(proj.id, 'technologiesUsed', e.target.value)} placeholder="Python, Pandas, Excel, React, MS Office Suite" className={`${baseInputStyles} ${validInputStyles}`} /></div>
                        <div className="md:col-span-2"><label className="block text-xs font-medium text-gray-600 mb-1"><TooltipLabel text="Briefly describe the project's purpose and your role.">Description</TooltipLabel></label><textarea value={proj.description} onChange={e => handleChange(proj.id, 'description', e.target.value)} rows={3} className={`${baseInputStyles} ${validInputStyles}`} placeholder="Coordinated a 50-person company offsite event." /></div>
                    </div>
                </div>
            ))}
             <button onClick={addProject} className="w-full mt-2 text-center px-4 py-2 border border-dashed border-gray-400 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                + Add Project
            </button>
        </div>
    );
});
