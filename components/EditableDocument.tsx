import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import type { ProfileData, Experience, Education, Project, ParsedCoverLetter, Skill } from '../types';
import { TrashIcon, XCircleIcon, DownloadIcon, EditIcon, SaveIcon, CheckIcon, GoogleDocsIcon, SubscriptionCheckIcon } from './Icons';

// --- UTILITY & HELPER COMPONENTS ---

// --- Type Guards ---
function isParsedCoverLetter(content: any): content is ParsedCoverLetter {
  return content && typeof content === 'object' && 'recipientName' in content && 'salutation' in content;
}

function isParsedResume(content: any): content is Partial<ProfileData> {
  return content && typeof content === 'object' && ('experience' in content || 'education' in content);
}

// --- Markdown Converters ---
const coverLetterToMarkdown = (data: ParsedCoverLetter): string => {
    if (!data) return '';
    let md = '';
    if (data.senderName) md += `${data.senderName}\n`;
    if (data.senderAddress) md += `${data.senderAddress}\n`;
    if (data.senderContact) md += `${data.senderContact}\n\n`;
    if (data.date) md += `${data.date}\n\n`;
    if (data.recipientName) md += `${data.recipientName}\n`;
    if (data.recipientTitle) md += `${data.recipientTitle}\n`;
    if (data.companyName) md += `${data.companyName}\n`;
    if (data.companyAddress) md += `${data.companyAddress}\n\n`;
    if (data.salutation) md += `${data.salutation}\n\n`;
    if (data.body) md += `${data.body}\n\n`;
    if (data.closing) md += `${data.closing}\n`;
    if (data.signature) md += `${data.signature}\n`;
    return md.trim();
};

const profileToMarkdown = (data: Partial<ProfileData>, order: string[]): string => {
    if (!data) return '';
    let md = '';

    // Header is always first and not part of the reorderable sections
    if (data.fullName) md += `# ${data.fullName}\n`;
    const contactInfo = [data.phone, data.email, data.website, data.location].filter(Boolean);
    if (contactInfo.length > 0) md += `${contactInfo.join(' | ')}\n\n`;

    const renderSection = (key: string): string => {
        let sectionMd = '';
        switch (key) {
            case 'summary':
                if (data.summary) sectionMd += `## Summary\n${data.summary}\n\n`;
                break;
            case 'experience':
                if (data.experience && data.experience.length > 0) {
                    sectionMd += '## Experience\n';
                    data.experience.forEach(exp => {
                        sectionMd += `**${exp.title}** | ${exp.company} | ${exp.location || ''}\n`;
                        if (exp.startDate || exp.endDate) sectionMd += `*${exp.startDate} - ${exp.endDate}*\n\n`;
                        (exp.achievements || []).forEach(ach => {
                            sectionMd += `- ${ach.text}\n`;
                        });
                        sectionMd += '\n';
                    });
                }
                break;
            case 'education':
                if (data.education && data.education.length > 0) {
                    sectionMd += '## Education\n';
                    data.education.forEach(edu => {
                        sectionMd += `**${edu.degree || ''}, ${edu.fieldOfStudy || ''}** | ${edu.institution || ''}\n`;
                        if (edu.startDate || edu.endDate) sectionMd += `*${edu.startDate} - ${edu.endDate}*\n\n`;
                    });
                }
                break;
            case 'skills':
                const allSkills = [
                    ...(data.technicalSkills || []),
                    ...(data.softSkills || []),
                    ...(data.tools || [])
                ];
                if (allSkills.length > 0) {
                    sectionMd += '## Skills\n';
                    sectionMd += allSkills.map(s => s.name).join(', ') + '\n\n';
                }
                break;
            case 'projects':
                if (data.projects && data.projects.length > 0) {
                    sectionMd += '## Projects\n';
                    data.projects.forEach(proj => {
                        sectionMd += `**${proj.name}**\n`;
                        if (proj.description) sectionMd += `${proj.description}\n`;
                        if (proj.technologiesUsed) sectionMd += `*Technologies: ${proj.technologiesUsed}*\n`;
                        sectionMd += '\n';
                    });
                }
                break;
        }
        return sectionMd;
    };

    order.forEach(key => {
        md += renderSection(key);
    });

    return md.trim();
};

const formatContentForDisplay = (text: string) => {
    return text.split('\n\n').map(paragraph => 
        `<p class="mb-4">${paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>')}</p>`
    ).join('');
};

// --- RESUME FORM & DISPLAY SUB-COMPONENTS ---

const FormInput: React.FC<{ value?: string; onChange: (v: string) => void; isEditing: boolean; className?: string; placeholder?: string }> = 
({ value = '', onChange, isEditing, className = '', placeholder = '' }) => (
    isEditing ? 
    <input value={value} onChange={e => onChange(e.target.value)} className={`w-full p-1 border rounded bg-blue-100 border-blue-300 shadow-inner focus:ring-1 focus:ring-primary transition-colors duration-200 ${className}`} placeholder={placeholder} /> :
    <span className={className}>{value}</span>
);

const FormTextarea: React.FC<{ value?: string; onChange: (v: string) => void; isEditing: boolean; className?: string; placeholder?: string, rows?: number }> = 
({ value = '', onChange, isEditing, className = '', placeholder = '', rows = 4 }) => (
    isEditing ? 
    <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows} className={`w-full p-2 border rounded bg-blue-100 border-blue-300 shadow-inner focus:ring-1 focus:ring-primary transition-colors duration-200 ${className}`} placeholder={placeholder} /> :
    <p className={`whitespace-pre-wrap ${className}`}>{value}</p>
);

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
            <FormTextarea value={summary} onChange={onSummaryChange} isEditing={isEditing}/>
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
                <div key={exp.id} className="relative group">
                    {isEditing && (
                        <button onClick={() => onRemoveExperience(exp.id)} className="absolute top-2 -right-8 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1" aria-label={`Remove experience at ${exp.company}`}>
                            <TrashIcon />
                        </button>
                    )}
                    <div className="grid grid-cols-2 gap-x-4">
                        <FormInput value={exp.title} onChange={v => onFieldChange(i, 'title', v)} isEditing={isEditing} className="font-bold text-gray-900" />
                        <div className="text-right text-sm text-gray-600 italic">
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
                        <FormInput value={exp.company} onChange={v => onFieldChange(i, 'company', v)} isEditing={isEditing} />
                        <FormInput value={exp.location} onChange={v => onFieldChange(i, 'location', v)} isEditing={isEditing} className="text-right text-sm text-gray-500" />
                    </div>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        {exp.achievements?.map((ach, j) => (
                          <li key={ach.id}>
                            <div className="flex items-center space-x-2">
                                <FormTextarea value={ach.text} onChange={v => onAchievementChange(i, j, v)} isEditing={isEditing} rows={2}/>
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
                <div key={edu.id} className="relative group">
                    {isEditing && (
                        <button onClick={() => onRemoveItem(edu.id)} className="absolute top-2 -right-8 text-gray-400 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity p-1" aria-label={`Remove education at ${edu.institution}`}>
                            <TrashIcon />
                        </button>
                    )}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                        {/* Row 1 */}
                        <FormInput 
                            value={edu.degree}
                            onChange={v => onFieldChange(i, 'degree', v)} 
                            isEditing={isEditing} 
                            className="font-bold"
                            placeholder="Degree" />
                        <div className="text-right text-sm text-gray-600 italic">
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
                        
                        {/* Row 2 */}
                        <FormInput 
                            value={edu.institution} 
                            onChange={v => onFieldChange(i, 'institution', v)} 
                            isEditing={isEditing}
                            placeholder="Institution" />
                        <FormInput
                             value={edu.fieldOfStudy}
                             onChange={v => onFieldChange(i, 'fieldOfStudy', v)}
                             isEditing={isEditing}
                             className="text-right text-sm"
                             placeholder="Field of Study" />
                    </div>
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
                <div key={proj.id} className="relative group">
                     {isEditing && (
                        <button onClick={() => onRemoveItem(proj.id)} className="absolute top-2 -right-8 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1" aria-label={`Remove project ${proj.name}`}>
                            <TrashIcon />
                        </button>
                    )}
                    <FormInput value={proj.name} onChange={v => onFieldChange(i, 'name', v)} isEditing={isEditing} className="font-bold text-gray-900"/>
                    <FormTextarea value={proj.description} onChange={v => onFieldChange(i, 'description', v)} isEditing={isEditing} rows={2}/>
                    <FormInput value={proj.technologiesUsed} onChange={v => onFieldChange(i, 'technologiesUsed', v)} isEditing={isEditing} className="text-sm italic text-gray-600"/>
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


// --- MAIN COMPONENT ---

interface EditableDocumentProps {
  documentType: 'resume' | 'cover-letter';
  initialContent: string;
  onSave: (newContent: string, newStructuredData: Partial<ProfileData> | ParsedCoverLetter | null) => void;
  structuredContent?: Partial<ProfileData> | ParsedCoverLetter | null;
  tokens: number;
  setTokens: React.Dispatch<React.SetStateAction<number>>;
}

interface HistoryState {
  formData: Partial<ProfileData> | ParsedCoverLetter | null;
  sectionOrder: string[];
}

const EditableDocument: React.FC<EditableDocumentProps> = ({ documentType, initialContent, onSave, structuredContent, tokens, setTokens }) => {
  const [editedContent, setEditedContent] = useState(initialContent);
  const [formData, setFormData] = useState<Partial<ProfileData> | ParsedCoverLetter | null | undefined>(structuredContent);
  const [sectionOrder, setSectionOrder] = useState<string[]>([]);
  const [initialSectionOrder, setInitialSectionOrder] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const recordUndoState = useCallback(() => {
    setHistory(prev => [...prev, { formData, sectionOrder }]);
  }, [formData, sectionOrder]);

  const handleUndo = () => {
    if (history.length === 0) return;
    const lastState = history[history.length - 1];
    setFormData(lastState.formData);
    setSectionOrder(lastState.sectionOrder);
    setHistory(prev => prev.slice(0, -1));
  };

  useEffect(() => {
    setEditedContent(initialContent);
    setFormData(structuredContent);
    if (isParsedResume(structuredContent)) {
        const defaultOrder: string[] = ['summary', 'experience', 'education', 'projects', 'skills'];
        const initialOrder = structuredContent.sectionOrder || defaultOrder;

        const availableSections = initialOrder.filter(key => {
            if (key === 'skills') {
                return (structuredContent.technicalSkills?.length ?? 0 > 0) ||
                       (structuredContent.softSkills?.length ?? 0 > 0) ||
                       (structuredContent.tools?.length ?? 0 > 0);
            }
            const data = structuredContent[key as keyof ProfileData];
            return Array.isArray(data) ? data.length > 0 : !!data;
        });
        setSectionOrder(availableSections);
        setInitialSectionOrder(availableSections);
    }
  }, [initialContent, structuredContent]);

  useEffect(() => {
    if (isEditing) {
        setHistory([]);
    }
  }, [isEditing]);

  const handleSave = () => {
    let newMarkdown = editedContent;
    let newFormData = formData;

    if (isParsedCoverLetter(formData)) {
        newMarkdown = coverLetterToMarkdown(formData);
    } else if (isParsedResume(formData)) {
        const dataToSave: Partial<ProfileData> = { ...formData, sectionOrder };
        newMarkdown = profileToMarkdown(dataToSave, sectionOrder);
        newFormData = dataToSave;
    }
    onSave(newMarkdown, newFormData);
    setIsEditing(false);
    setShowSaveConfirmation(true);
    setTimeout(() => setShowSaveConfirmation(false), 3000);
  };

  const handleDownloadPdf = () => {
    if (tokens < 1) {
        console.warn("Attempted to download PDF with insufficient tokens.");
        return;
    }
    setTokens(prev => prev - 1);

    const contentElement = document.getElementById(`document-content-display-${documentType}`);
    if (!contentElement) {
      console.error('Printable content not found.');
      return;
    }
  
    const printContainer = document.createElement('div');
    printContainer.id = 'print-container';
    printContainer.innerHTML = contentElement.innerHTML;
    document.body.appendChild(printContainer);
    
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        body > *:not(#print-container) { display: none !important; }
        #print-container { display: block !important; margin: 2rem; }
      }
    `;
    document.head.appendChild(style);
    
    window.print();
    
    document.body.removeChild(printContainer);
    document.head.removeChild(style);
  };
  
  const handleOpenInGoogleDocs = () => {
    let contentToCopy = '';

    if (isParsedCoverLetter(formData)) {
        contentToCopy = coverLetterToMarkdown(formData);
    } else if (isParsedResume(formData)) {
        contentToCopy = profileToMarkdown(formData, sectionOrder);
    } else {
        contentToCopy = editedContent;
    }

    // Convert basic markdown to plain text for better pasting in GDocs
    const plainTextContent = contentToCopy
        .replace(/^# (.*$)/gm, '$1')       // H1
        .replace(/^## (.*$)/gm, '$1')      // H2
        .replace(/\*\*(.*?)\*\*/g, '$1')  // Bold
        .replace(/^- /gm, '\u2022 ')      // Bullets
        .replace(/ \| /g, '\t')            // Separators to tabs
        .replace(/\n{3,}/g, '\n\n');      // Reduce multiple newlines

    navigator.clipboard.writeText(plainTextContent).then(() => {
        setIsCopied(true);
        window.open('https://docs.google.com/document/create', '_blank', 'noopener,noreferrer');
        setTimeout(() => setIsCopied(false), 3000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
  };

  const handleCancel = () => {
    setEditedContent(initialContent);
    setFormData(structuredContent);
    if (isParsedResume(structuredContent)) {
        setSectionOrder(initialSectionOrder);
    }
    setIsEditing(false);
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

  const isDirty = (structuredContent && formData)
    ? JSON.stringify(formData) !== JSON.stringify(structuredContent) || (isParsedResume(formData) && JSON.stringify(sectionOrder) !== JSON.stringify(initialSectionOrder))
    : editedContent !== initialContent;

  const renderResumeForm = () => {
    if (!formData || !isParsedResume(formData)) return null;

    const handleFieldChange = (section: keyof ProfileData, index: number, field: string, value: any) => {
        recordUndoState();
        setFormData(prev => {
            if (!prev || !isParsedResume(prev)) return null;
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
             if (!prev || !isParsedResume(prev) || !prev.experience) return null;
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
            if (!prev || !isParsedResume(prev)) return null;
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
            if (!prev || !isParsedResume(prev) || !prev.experience) return null;
            const newExperience = prev.experience.map(exp => {
                if (exp.id !== expId) return exp;
                const newAchievements = (exp.achievements || []).filter(ach => ach.id !== achId);
                return { ...exp, achievements: newAchievements };
            });
            return { ...prev, experience: newExperience };
        });
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
        <style>{`
            .drag-indicator { border-top: 2px dashed #3b82f6; }
            .dragging { opacity: 0.5; }
        `}</style>
        {/* Header */}
        <div className="text-center">
            <FormInput value={formData.fullName} onChange={v => { recordUndoState(); setFormData(p => p ? {...p, fullName: v} : null); }} isEditing={isEditing} className="text-3xl font-bold" placeholder="Full Name" />
            <div className="flex justify-center flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 mt-2">
                <FormInput value={formData.phone} onChange={v => { recordUndoState(); setFormData(p => p ? {...p, phone: v} : null); }} isEditing={isEditing} placeholder="Phone"/>
                <FormInput value={formData.email} onChange={v => { recordUndoState(); setFormData(p => p ? {...p, email: v} : null); }} isEditing={isEditing} placeholder="Email"/>
                <FormInput value={formData.website} onChange={v => { recordUndoState(); setFormData(p => p ? {...p, website: v} : null); }} isEditing={isEditing} placeholder="Website"/>
                <FormInput value={formData.location} onChange={v => { recordUndoState(); setFormData(p => p ? {...p, location: v} : null); }} isEditing={isEditing} placeholder="Location"/>
            </div>
        </div>

        {/* Draggable Sections */}
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

  const renderCoverLetterForm = () => {
    if (!formData || !isParsedCoverLetter(formData)) return null;

    const handleFieldChange = (field: keyof ParsedCoverLetter, value: string) => {
        recordUndoState();
        setFormData(prev => {
            if (!prev || !isParsedCoverLetter(prev)) return prev;
            return { ...prev, [field]: value };
        });
    };
    
    return (
        <div className="prose max-w-none text-gray-800">
            {/* Sender Info */}
            <div className="mb-6 text-right">
                <FormInput isEditing={isEditing} value={formData.senderName} onChange={v => handleFieldChange('senderName', v)} className="font-bold text-lg" placeholder="Your Name" />
                <FormTextarea isEditing={isEditing} value={formData.senderAddress} onChange={v => handleFieldChange('senderAddress', v)} rows={2} className="text-sm" placeholder="Your Address"/>
                <FormInput isEditing={isEditing} value={formData.senderContact} onChange={v => handleFieldChange('senderContact', v)} className="text-sm" placeholder="Email | Phone"/>
            </div>

            {/* Date */}
            <div className="mb-6">
                <FormInput isEditing={isEditing} value={formData.date} onChange={v => handleFieldChange('date', v)} placeholder="Date" />
            </div>

            {/* Recipient Info */}
            <div className="mb-6">
                <FormInput isEditing={isEditing} value={formData.recipientName} onChange={v => handleFieldChange('recipientName', v)} className="font-bold" placeholder="Recipient Name" />
                <FormInput isEditing={isEditing} value={formData.recipientTitle} onChange={v => handleFieldChange('recipientTitle', v)} placeholder="Recipient Title" />
                <FormInput isEditing={isEditing} value={formData.companyName} onChange={v => handleFieldChange('companyName', v)} placeholder="Company Name" />
                <FormTextarea isEditing={isEditing} value={formData.companyAddress} onChange={v => handleFieldChange('companyAddress', v)} rows={2} className="text-sm" placeholder="Company Address" />
            </div>

            {/* Salutation */}
            <div className="mb-4">
                <FormInput isEditing={isEditing} value={formData.salutation} onChange={v => handleFieldChange('salutation', v)} className="font-bold" placeholder="Dear Hiring Manager," />
            </div>

            {/* Body */}
            <FormTextarea isEditing={isEditing} value={formData.body} onChange={v => handleFieldChange('body', v)} rows={12} placeholder="Cover letter body..." />

            {/* Closing & Signature */}
            <div className="mt-6">
                <FormInput isEditing={isEditing} value={formData.closing} onChange={v => handleFieldChange('closing', v)} placeholder="Sincerely," />
                <FormInput isEditing={isEditing} value={formData.signature} onChange={v => handleFieldChange('signature', v)} className="mt-4 font-bold" placeholder="Your Name"/>
            </div>
        </div>
    );
};
  
  const hasEnoughTokensForDownload = tokens >= 1;
  
  return (
    <div className="bg-white p-8 sm:p-12 rounded-2xl shadow-lg animate-slide-in-up">
      <div id={`document-content-display-${documentType}`}>
          {isEditing ? (
              isParsedCoverLetter(formData) ? renderCoverLetterForm() :
              isParsedResume(formData) ? renderResumeForm() : (
                  <textarea
                      className="w-full h-96 p-4 border border-gray-300 rounded-md focus:ring-primary focus:border-primary font-mono text-sm resize-y"
                      value={editedContent}
                      onChange={(e) => { recordUndoState(); setEditedContent(e.target.value); }}
                      aria-label={`Edit document content`}
                  />
              )
          ) : (
              isParsedCoverLetter(formData) ? renderCoverLetterForm() :
              isParsedResume(formData) ? renderResumeForm() : (
                  <div
                      className="prose max-w-none prose-p:mb-4"
                      dangerouslySetInnerHTML={{ __html: formatContentForDisplay(initialContent) }}
                  />
              )
          )}
      </div>
          
      <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-end items-center gap-4">
               {showSaveConfirmation && (
                  <div className="flex items-center text-green-600 text-sm font-medium transition-opacity duration-300 animate-fade-in" role="status">
                      <CheckIcon /> <span className="ml-2">Saved successfully!</span>
                  </div>
              )}
              <div className="flex flex-wrap justify-end items-center gap-3">
                  {isEditing ? (
                    <>
                      <button onClick={handleUndo} disabled={history.length === 0} className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" /></svg>
                        Undo
                      </button>
                      <button onClick={handleCancel} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">Cancel</button>
                      <button onClick={handleSave} disabled={!isDirty} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400">
                        <SaveIcon className="h-5 w-5 mr-2" />
                        Save
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={handleDownloadPdf} 
                        disabled={!hasEnoughTokensForDownload}
                        className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        {hasEnoughTokensForDownload ? (
                            <>
                                <DownloadIcon className="h-5 w-5 mr-2" />
                                <span>Download PDF (1 Token)</span>
                            </>
                        ) : (
                            <div className="text-center text-xs px-1">
                                <span className="font-bold text-red-600 block">Insufficient Tokens</span>
                                <Link to="/subscription" className="text-primary underline hover:text-blue-700">Get More</Link>
                            </div>
                        )}
                      </button>
                      <button
                        onClick={handleOpenInGoogleDocs}
                        className={`inline-flex items-center justify-center px-4 py-2 border rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200 ${
                            isCopied
                            ? 'bg-green-50 border-green-300 text-green-800'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {isCopied ? (
                            <SubscriptionCheckIcon className="h-5 w-5 text-green-600" />
                        ) : (
                            <GoogleDocsIcon className="h-5 w-5" />
                        )}
                        <span className="ml-2">{isCopied ? 'Copied! Now Paste.' : 'Open in Google Docs'}</span>
                      </button>
                      <button onClick={() => setIsEditing(true)} className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                        <EditIcon className="h-5 w-5 mr-2" />
                        Edit
                      </button>
                    </>
                  )}
              </div>
          </div>
      </div>
    </div>
  );
};

export default EditableDocument;