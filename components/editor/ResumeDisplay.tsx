import React, { memo } from 'react';
import type { ProfileData, Experience, Education, Project } from '../../types';
import { TrashIcon, XCircleIcon } from '../Icons';
import { FormInput, FormTextarea } from './common';

const ResumeSection: React.FC<{title: string, isEditing: boolean, onRemove: () => void, children: React.ReactNode}> = ({title, isEditing, onRemove, children}) => (
    <div className="mt-6">
        <div className="flex items-center justify-between border-b-2 border-gray-200 pb-1 mb-3">
            <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
            {isEditing && (
                 <button onClick={onRemove} className="text-gray-400 hover:text-red-500 transition-opacity p-1" aria-label={`Remove ${title} section`}>
                    <TrashIcon />
                </button>
            )}
        </div>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

const ResumeSummaryDisplay = memo<{
    summary?: string;
    isEditing: boolean;
    onSummaryChange: (value: string) => void;
    onRemove: () => void;
}>(({ summary, isEditing, onSummaryChange, onRemove }) => {
    if (!summary) return null;
    return (
        <ResumeSection title="Summary" isEditing={isEditing} onRemove={onRemove}>
            <FormTextarea value={summary} onChange={onSummaryChange} isEditing={isEditing} className="w-full"/>
        </ResumeSection>
    );
});

const ResumeExperienceDisplay = memo<{
    experience: Experience[];
    isEditing: boolean;
    onFieldChange: (index: number, field: keyof Experience, value: any) => void;
    onAchievementChange: (expIndex: number, achIndex: number, value: string) => void;
    onRemoveSection: () => void;
    onRemoveExperience: (id: string) => void;
    onRemoveAchievement: (expId: string, achId: string) => void;
}>(({ experience, isEditing, onFieldChange, onAchievementChange, onRemoveSection, onRemoveExperience, onRemoveAchievement }) => {
    if (!experience || experience.length === 0) return null;
    return (
        <ResumeSection title="Experience" isEditing={isEditing} onRemove={onRemoveSection}>
            {experience.map((exp, i) => (
                <div key={exp.id} className="relative group/item">
                    {isEditing && (
                        <button onClick={() => onRemoveExperience(exp.id)} className="absolute top-2 -right-8 text-gray-400 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity p-1" aria-label={`Remove experience at ${exp.company}`}>
                            <TrashIcon />
                        </button>
                    )}
                    <header className="flex justify-between items-start gap-4">
                        <div className="flex-grow">
                             <FormInput value={exp.title} onChange={v => onFieldChange(i, 'title', v)} isEditing={isEditing} className="font-bold text-lg w-full" placeholder="Job Title" />
                             <FormInput value={exp.company} onChange={v => onFieldChange(i, 'company', v)} isEditing={isEditing} className="text-md w-full" placeholder="Company Name" />
                        </div>
                        <div className="text-right flex-shrink-0">
                            <div className="text-sm text-gray-600 italic">
                                <FormInput 
                                    value={exp.startDate} 
                                    onChange={v => onFieldChange(i, 'startDate', v)} 
                                    isEditing={isEditing}
                                    className="w-24 inline-block text-right"
                                    placeholder="Start Date" />
                                <span className="mx-1"> - </span>
                                <FormInput 
                                    value={exp.endDate} 
                                    onChange={v => onFieldChange(i, 'endDate', v)} 
                                    isEditing={isEditing} 
                                    className="w-24 inline-block text-right"
                                    placeholder="End Date" />
                            </div>
                             <FormInput value={exp.location} onChange={v => onFieldChange(i, 'location', v)} isEditing={isEditing} className="text-sm text-gray-500 text-right" placeholder="Location" />
                        </div>
                    </header>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        {exp.achievements?.map((ach, j) => (
                          <li key={ach.id}>
                            <div className="flex items-center space-x-2">
                                <FormTextarea value={ach.text} onChange={v => onAchievementChange(i, j, v)} isEditing={isEditing} rows={2} className="w-full"/>
                                {isEditing && (
                                    <button onClick={() => onRemoveAchievement(exp.id, ach.id)} className="text-gray-400 hover:text-red-500 p-1 flex-shrink-0" aria-label="Remove achievement">
                                        <XCircleIcon />
                                    </button>
                                )}
                            </div>
                          </li>
                        ))}
                    </ul>
                </div>
            ))}
        </ResumeSection>
    );
});

const ResumeEducationDisplay = memo<{
    education: Education[];
    isEditing: boolean;
    onFieldChange: (index: number, field: keyof Education, value: any) => void;
    onRemoveSection: () => void;
    onRemoveItem: (id: string) => void;
}>(({ education, isEditing, onFieldChange, onRemoveSection, onRemoveItem }) => {
    if (!education || education.length === 0) return null;
    return (
        <ResumeSection title="Education" isEditing={isEditing} onRemove={onRemoveSection}>
             {education.map((edu, i) => (
                <div key={edu.id} className="relative group/item">
                    {isEditing && (
                        <button onClick={() => onRemoveItem(edu.id)} className="absolute top-2 -right-8 text-gray-400 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity p-1" aria-label={`Remove education at ${edu.institution}`}>
                            <TrashIcon />
                        </button>
                    )}
                    <header className="flex justify-between items-start gap-4">
                        <div className="flex-grow">
                             <div className="font-bold text-lg flex flex-wrap items-baseline gap-x-1">
                                <FormInput 
                                    value={edu.degree}
                                    onChange={v => onFieldChange(i, 'degree', v)} 
                                    isEditing={isEditing}
                                    className="font-bold text-lg"
                                    placeholder="Degree"
                                />
                                {(isEditing || (edu.degree && edu.fieldOfStudy)) && <span className="text-gray-800 font-normal">,</span>}
                                <FormInput 
                                    value={edu.fieldOfStudy}
                                    onChange={v => onFieldChange(i, 'fieldOfStudy', v)}
                                    isEditing={isEditing}
                                    className="font-bold text-lg"
                                    placeholder="Field of Study"
                                />
                             </div>
                            <FormInput 
                                value={edu.institution} 
                                onChange={v => onFieldChange(i, 'institution', v)} 
                                isEditing={isEditing}
                                className="text-md w-full"
                                placeholder="Institution"
                            />
                        </div>
                        <div className="text-right flex-shrink-0">
                            <div className="text-sm text-gray-600 italic">
                                <FormInput 
                                    value={edu.startDate} 
                                    onChange={v => onFieldChange(i, 'startDate', v)} 
                                    isEditing={isEditing}
                                    className="w-24 inline-block text-right"
                                    placeholder="Start Date" />
                                <span className="mx-1"> - </span>
                                <FormInput 
                                    value={edu.endDate} 
                                    onChange={v => onFieldChange(i, 'endDate', v)} 
                                    isEditing={isEditing} 
                                    className="w-24 inline-block text-right"
                                    placeholder="End Date" />
                            </div>
                        </div>
                    </header>
                </div>
             ))}
        </ResumeSection>
    );
});

const ResumeProjectsDisplay = memo<{
    projects: Project[];
    isEditing: boolean;
    onFieldChange: (index: number, field: keyof Project, value: any) => void;
    onRemoveSection: () => void;
    onRemoveItem: (id: string) => void;
}>(({ projects, isEditing, onFieldChange, onRemoveSection, onRemoveItem }) => {
    if (!projects || projects.length === 0) return null;
    return (
        <ResumeSection title="Projects" isEditing={isEditing} onRemove={onRemoveSection}>
            {projects.map((proj, i) => (
                <div key={proj.id} className="relative group/item">
                     {isEditing && (
                        <button onClick={() => onRemoveItem(proj.id)} className="absolute top-2 -right-8 text-gray-400 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity p-1" aria-label={`Remove project ${proj.name}`}>
                            <TrashIcon />
                        </button>
                    )}
                    <FormInput value={proj.name} onChange={v => onFieldChange(i, 'name', v)} isEditing={isEditing} className="font-bold text-gray-900 w-full"/>
                    <FormTextarea value={proj.description} onChange={v => onFieldChange(i, 'description', v)} isEditing={isEditing} rows={2} className="w-full"/>
                    <FormInput value={proj.technologiesUsed} onChange={v => onFieldChange(i, 'technologiesUsed', v)} isEditing={isEditing} className="text-sm italic text-gray-600 w-full"/>
                </div>
            ))}
        </ResumeSection>
    );
});


const ResumeSkillsDisplay = memo<{
    skills: { name: string, type: 'technical' | 'soft' | 'tool'}[];
    isEditing: boolean;
    onRemove: () => void;
}>(({ skills, isEditing, onRemove }) => {
    if (skills.length === 0) return null;
    return (
        <ResumeSection title="Skills" isEditing={isEditing} onRemove={onRemove}>
            <p>{skills.map(s => s.name).join(', ')}</p>
        </ResumeSection>
    );
});


interface ResumeDisplayProps {
    formData: Partial<ProfileData>;
    sectionOrder: string[];
    isEditing: boolean;
    setFormData: React.Dispatch<React.SetStateAction<Partial<ProfileData> | null | undefined>>;
    setSectionOrder: React.Dispatch<React.SetStateAction<string[]>>;
    recordUndoState: () => void;
}

export const ResumeDisplay: React.FC<ResumeDisplayProps> = ({
    formData, sectionOrder, isEditing, setFormData, setSectionOrder, recordUndoState
}) => {
    const dragItem = React.useRef<number | null>(null);
    const dragOverItem = React.useRef<number | null>(null);

    const handleFieldChange = (section: keyof ProfileData, index: number, field: string, value: any) => {
        recordUndoState();
        setFormData(prev => {
            if (!prev) return null;
            const sectionData = prev[section];
            if (!Array.isArray(sectionData)) return prev;

            const newSection = sectionData.map((item, i) => {
                if (i !== index) return item;
                if (typeof item === 'object' && item !== null) return { ...item, [field]: value };
                return item;
            });
            return { ...prev, [section]: newSection };
        });
    };
    
    const handleAchievementChange = (expIndex: number, achIndex: number, value: string) => {
        recordUndoState();
        setFormData(prev => {
             if (!prev || !prev.experience) return null;
             const newExperience = prev.experience.map((exp, eIndex) => {
                 if (eIndex !== expIndex) return exp;
                 const newAchievements = (exp.achievements || []).map((ach, aIndex) => (aIndex !== achIndex) ? ach : { ...ach, text: value });
                 return { ...exp, achievements: newAchievements };
             });
             return { ...prev, experience: newExperience };
        });
    };
    
    const removeSection = (sectionKey: string) => {
        recordUndoState();
        setSectionOrder(prev => prev.filter(key => key !== sectionKey));
    };

    const removeItem = (sectionKey: 'experience' | 'education' | 'projects', itemId: string) => {
        recordUndoState();
        setFormData(prev => {
            if (!prev) return null;
            const oldSection = prev[sectionKey];
            if (!Array.isArray(oldSection)) return prev;
            // @ts-ignore
            const newSection = oldSection.filter(item => item.id !== itemId);
            return { ...prev, [sectionKey]: newSection };
        });
    };

    const removeAchievement = (expId: string, achId: string) => {
        recordUndoState();
        setFormData(prev => {
            if (!prev || !prev.experience) return null;
            const newExperience = prev.experience.map(exp => {
                if (exp.id !== expId) return exp;
                const newAchievements = (exp.achievements || []).filter(ach => ach.id !== achId);
                return { ...exp, achievements: newAchievements };
            });
            return { ...prev, experience: newExperience };
        });
    };
    
    const handleDragStart = (e: React.DragEvent, position: number) => {
        dragItem.current = position;
        e.currentTarget.classList.add('dragging');
    };
    
    const handleDragEnter = (e: React.DragEvent, position: number) => {
        dragOverItem.current = position;
        e.currentTarget.classList.add('drag-indicator');
    };

    const handleDrop = (e: React.DragEvent) => {
        if (dragItem.current === null || dragOverItem.current === null) return;
        
        recordUndoState();
        const newSectionOrder = [...sectionOrder];
        const dragItemContent = newSectionOrder.splice(dragItem.current, 1)[0];
        newSectionOrder.splice(dragOverItem.current, 0, dragItemContent);
        
        setSectionOrder(newSectionOrder);

        dragItem.current = null;
        dragOverItem.current = null;
        e.currentTarget.classList.remove('drag-indicator');
    };


    const combinedSkills = [
        ...(formData.technicalSkills || []).map(s => ({ id: s.id, name: s.name, type: 'technical' as const })),
        ...(formData.softSkills || []).map(s => ({ id: s.id, name: s.name, type: 'soft' as const })),
        ...(formData.tools || []).map(s => ({ id: s.id, name: s.name, type: 'tool' as const })),
    ];
    
    const sectionComponents: { [key: string]: React.ReactNode } = {
        summary: <ResumeSummaryDisplay summary={formData.summary} isEditing={isEditing} onSummaryChange={v => { recordUndoState(); setFormData(p => p ? {...p, summary: v} : null); }} onRemove={() => removeSection('summary')} />,
        experience: <ResumeExperienceDisplay experience={formData.experience || []} isEditing={isEditing} onFieldChange={(i, f, v) => handleFieldChange('experience', i, f, v)} onAchievementChange={handleAchievementChange} onRemoveSection={() => removeSection('experience')} onRemoveExperience={(id) => removeItem('experience', id)} onRemoveAchievement={removeAchievement} />,
        education: <ResumeEducationDisplay education={formData.education || []} isEditing={isEditing} onFieldChange={(i, f, v) => handleFieldChange('education', i, f, v)} onRemoveSection={() => removeSection('education')} onRemoveItem={(id) => removeItem('education', id)} />,
        projects: <ResumeProjectsDisplay projects={formData.projects || []} isEditing={isEditing} onFieldChange={(i, f, v) => handleFieldChange('projects', i, f, v)} onRemoveSection={() => removeSection('projects')} onRemoveItem={(id) => removeItem('projects', id)} />,
        skills: <ResumeSkillsDisplay skills={combinedSkills} isEditing={isEditing} onRemove={() => removeSection('skills')} />,
    };

    return (
        <div className="prose max-w-none">
            <style>{`.drag-indicator { border-top: 2px dashed #3b82f6; } .dragging { opacity: 0.5; }`}</style>
            <div className="text-center">
                <FormInput value={formData.fullName} onChange={v => { recordUndoState(); setFormData(p => p ? {...p, fullName: v} : null); }} isEditing={isEditing} className="text-3xl font-bold w-full" placeholder="Full Name" />
                <div className="flex justify-center flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 mt-2">
                    <FormInput value={formData.phone} onChange={v => { recordUndoState(); setFormData(p => p ? {...p, phone: v} : null); }} isEditing={isEditing} placeholder="Phone"/>
                    <FormInput value={formData.email} onChange={v => { recordUndoState(); setFormData(p => p ? {...p, email: v} : null); }} isEditing={isEditing} placeholder="Email"/>
                    <FormInput value={formData.website} onChange={v => { recordUndoState(); setFormData(p => p ? {...p, website: v} : null); }} isEditing={isEditing} placeholder="Website"/>
                    <FormInput value={formData.location} onChange={v => { recordUndoState(); setFormData(p => p ? {...p, location: v} : null); }} isEditing={isEditing} placeholder="Location"/>
                </div>
            </div>
            {sectionOrder.map((sectionKey, index) => (
                <div
                    key={sectionKey}
                    className={`relative ${isEditing ? 'pl-8 py-2' : ''}`}
                    draggable={isEditing}
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragEnter={(e) => handleDragEnter(e, index)}
                    onDragLeave={(e) => e.currentTarget.classList.remove('drag-indicator')}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(e)}
                    onDragEnd={(e) => e.currentTarget.classList.remove('dragging')}
                >
                    {isEditing && (
                        <div className="absolute top-1/2 left-0 -translate-y-1/2 cursor-move text-gray-400 hover:text-gray-700 p-1" title="Drag to reorder">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </div>
                    )}
                    {sectionComponents[sectionKey]}
                </div>
            ))}
        </div>
    );
};