import React, { useContext } from 'react';
import { ProfileContext } from '../../App';
import type { Education } from '../../types';
import { TrashIcon } from '../Icons';
import Tooltip from '../Tooltip';
import { baseInputStyles, validInputStyles } from './common';

export const EducationSection = React.memo(() => {
    const { profile, setProfile } = useContext(ProfileContext)!;

    const handleChange = (id: string, field: keyof Education, value: string) => {
        setProfile(prev => ({
            ...prev,
            education: prev.education.map(edu => edu.id === id ? { ...edu, [field]: value } : edu)
        }));
    };

    const addEducation = () => {
        setProfile(prev => ({
            ...prev,
            education: [
                ...prev.education,
                { id: crypto.randomUUID(), institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', gpa: '', relevantCoursework: '', awardsHonors: '' }
            ]
        }));
    };

    const removeEducation = (id: string) => {
        setProfile(prev => ({
            ...prev,
            education: prev.education.filter(edu => edu.id !== id)
        }));
    };
    
    return (
        <div className="space-y-6">
            {profile.education.map((edu) => (
                <div key={edu.id} className="p-4 border border-gray-200 rounded-lg relative group/item bg-white">
                    <button onClick={() => removeEducation(edu.id)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity p-1" aria-label={`Remove education at ${edu.institution}`}>
                        <TrashIcon />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-xs font-medium text-gray-600 mb-1"><Tooltip text="Name of the university, college, or bootcamp.">Institution</Tooltip></label><input value={edu.institution} onChange={e => handleChange(edu.id, 'institution', e.target.value)} className={`${baseInputStyles} ${validInputStyles}`} placeholder="State University" /></div>
                        <div><label className="block text-xs font-medium text-gray-600 mb-1"><Tooltip text="e.g., 'Bachelor of Science', 'M.S.', 'Ph.D.'">Degree</Tooltip></label><input value={edu.degree} onChange={e => handleChange(edu.id, 'degree', e.target.value)} className={`${baseInputStyles} ${validInputStyles}`} placeholder="B.S. or Bachelor of Arts" /></div>
                        <div><label className="block text-xs font-medium text-gray-600 mb-1"><Tooltip text="e.g., 'Computer Science', 'Business Administration'">Field of Study</Tooltip></label><input value={edu.fieldOfStudy} onChange={e => handleChange(edu.id, 'fieldOfStudy', e.target.value)} className={`${baseInputStyles} ${validInputStyles}`} placeholder="Computer Science, Finance" /></div>
                        <div><label className="block text-xs font-medium text-gray-600 mb-1"><Tooltip text="Enter your Grade Point Average. e.g., '3.8/4.0'">GPA</Tooltip></label><input value={edu.gpa} onChange={e => handleChange(edu.id, 'gpa', e.target.value)} className={`${baseInputStyles} ${validInputStyles}`} placeholder="3.8/4.0" /></div>
                        <div><label className="block text-xs font-medium text-gray-600 mb-1"><Tooltip text="Year you started. e.g., '2018'">Start Date</Tooltip></label><input value={edu.startDate} onChange={e => handleChange(edu.id, 'startDate', e.target.value)} placeholder="YYYY" className={`${baseInputStyles} ${validInputStyles}`} /></div>
                        <div><label className="block text-xs font-medium text-gray-600 mb-1"><Tooltip text="Year you graduated or 'Present'. e.g., '2022'">End Date</Tooltip></label><input value={edu.endDate} onChange={e => handleChange(edu.id, 'endDate', e.target.value)} placeholder="YYYY or Present" className={`${baseInputStyles} ${validInputStyles}`} /></div>
                        <div className="md:col-span-2"><label className="block text-xs font-medium text-gray-600 mb-1"><Tooltip text="List key courses relevant to your target roles.">Relevant Coursework</Tooltip></label><textarea value={edu.relevantCoursework} onChange={e => handleChange(edu.id, 'relevantCoursework', e.target.value)} rows={2} className={`${baseInputStyles} ${validInputStyles}`} placeholder="Data Structures, Corporate Finance, Project Management" /></div>
                        <div className="md:col-span-2"><label className="block text-xs font-medium text-gray-600 mb-1"><Tooltip text="List any academic awards, scholarships, or honors.">Awards & Honors</Tooltip></label><textarea value={edu.awardsHonors} onChange={e => handleChange(edu.id, 'awardsHonors', e.target.value)} rows={2} className={`${baseInputStyles} ${validInputStyles}`} placeholder="Dean's List (2020-2022)" /></div>
                    </div>
                </div>
            ))}
            <button onClick={addEducation} className="w-full mt-2 text-center px-4 py-2 border border-dashed border-gray-400 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                + Add Education
            </button>
        </div>
    );
});