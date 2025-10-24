import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import type { ProfileData, Education, Experience, Project, Skill, Language, Certification, Interest, CustomSection, CustomSectionItem } from '../types';
import { importAndParseResume } from '../services/geminiService';
import { ProfileContext } from '../App';
import AccordionItem from './AccordionItem';
import { TrashIcon, XCircleIcon, QuestionMarkCircleIcon } from './Icons';


type AccordionSection = 'personal' | 'summary' | 'education' | 'experience' | 'projects' | 'technicalSkills' | 'softSkills' | 'tools' | 'languages' | 'certifications' | 'interests' | 'custom' | 'additional' | null;

type ProfileFormErrors = {
  fullName?: string;
  email?: string;
  website?: string;
  linkedin?: string;
  github?: string;
};

const validateProfile = (profile: ProfileData): ProfileFormErrors => {
  const errors: ProfileFormErrors = {};
  if (!profile.fullName.trim()) errors.fullName = "Full name is required.";
  
  // Stricter email validation regex
  const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (!profile.email.trim()) {
    errors.email = "Email is required.";
  } else if (!emailRegex.test(profile.email)) {
    errors.email = "Invalid email address. Please enter a valid email format.";
  }
  
  const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
  if (profile.website && !urlRegex.test(profile.website)) errors.website = "Invalid URL format.";
  if (profile.linkedin && !/^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/.test(profile.linkedin)) errors.linkedin = "Invalid LinkedIn URL.";
  if (profile.github && !/^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9_-]+\/?$/.test(profile.github)) errors.github = "Invalid GitHub URL.";
  return errors;
};

// --- Helper & Icon Components ---

const TooltipLabel: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => (
    <span className="inline-flex items-center">
        {children}
        <span className="relative group/tooltip cursor-help">
            <QuestionMarkCircleIcon />
            <span className="absolute bottom-full left-0 mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-300 pointer-events-none z-50 text-center">
            {text}
            <svg className="absolute text-gray-800 h-2 w-4 left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255" ><polygon className="fill-current" points="0,0 127.5,127.5 255,0"/></svg>
            </span>
        </span>
    </span>
);

const ParsingModal: React.FC = () => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
    <div className="bg-white rounded-lg p-8 flex flex-col items-center shadow-2xl">
      <svg className="animate-spin h-12 w-12 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <h3 className="text-xl font-semibold text-neutral">Parsing Your Resume..</h3>
      <p className="text-gray-500 mt-2">Extracting your info. This might take a moment.</p>
    </div>
  </div>
);

const ErrorMessage: React.FC<{ message?: string; id: string }> = ({ message, id }) => {
    if (!message) return null;
    return <p id={id} className="text-red-500 text-xs mt-1">{message}</p>;
};

const baseInputStyles = "w-full p-2 border rounded focus:ring-1 transition-colors duration-200";
const errorInputStyles = "border-red-500 focus:border-red-500 focus:ring-red-500";
const validInputStyles = "border-gray-400 focus:border-primary focus:ring-primary";

// --- Memoized Section Components for Performance ---

const PersonalInfoSection = React.memo(() => {
    const { profile, setProfile } = useContext(ProfileContext)!;
    const [errors, setErrors] = useState<ProfileFormErrors>({});
    
    // Local state for first and last name to manage them separately in the UI
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

    // Effect to split fullName from context into local state when it changes
    useEffect(() => {
        const nameParts = profile.fullName.trim().split(' ');
        const first = nameParts[0] || '';
        const last = nameParts.slice(1).join(' ');
        setFirstName(first);
        setLastName(last);
    }, [profile.fullName]);

    // Handler to update local state and then join back into fullName for the context
    const handleNameChange = (newFirstName: string, newLastName: string) => {
        setFirstName(newFirstName);
        setLastName(newLastName);
        const newFullName = `${newFirstName} ${newLastName}`.trim();
        setProfile(prev => ({ ...prev, fullName: newFullName }));
    };
    
    useEffect(() => {
        setErrors(validateProfile(profile));
    }, [profile.fullName, profile.email, profile.website, profile.linkedin, profile.github]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <input name="firstName" value={firstName} onChange={(e) => handleNameChange(e.target.value, lastName)} className={`${baseInputStyles} ${errors.fullName ? errorInputStyles : validInputStyles}`} />
                <ErrorMessage message={errors.fullName} id="fullName-error" />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <input name="lastName" value={lastName} onChange={(e) => handleNameChange(firstName, e.target.value)} className={`${baseInputStyles} ${validInputStyles}`} />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input name="email" value={profile.email} onChange={handleChange} className={`${baseInputStyles} ${errors.email ? errorInputStyles : validInputStyles}`} />
                <ErrorMessage message={errors.email} id="email-error" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700"><TooltipLabel text="Link to your personal website or online portfolio. e.g., 'yourname.dev'">Website/Portfolio</TooltipLabel></label>
                <input name="website" value={profile.website} onChange={handleChange} className={`${baseInputStyles} ${errors.website ? errorInputStyles : validInputStyles}`} />
                <ErrorMessage message={errors.website} id="website-error" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700"><TooltipLabel text="Your professional contact number. e.g., (555) 123-4567">Phone</TooltipLabel></label>
                <input name="phone" value={profile.phone} onChange={handleChange} className={`${baseInputStyles} ${validInputStyles}`} />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700"><TooltipLabel text="Full URL to your LinkedIn profile. e.g., 'linkedin.com/in/yourname'">LinkedIn</TooltipLabel></label>
                <input name="linkedin" value={profile.linkedin} onChange={handleChange} className={`${baseInputStyles} ${errors.linkedin ? errorInputStyles : validInputStyles}`} />
                <ErrorMessage message={errors.linkedin} id="linkedin-error" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700"><TooltipLabel text="Your city and state. e.g., 'San Francisco, CA'">Location</TooltipLabel></label>
                <input name="location" value={profile.location} onChange={handleChange} className={`${baseInputStyles} ${validInputStyles}`} placeholder="e.g., San Francisco, CA" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700"><TooltipLabel text="Full URL to your GitHub profile. e.g., 'github.com/yourusername'">GitHub</TooltipLabel></label>
                <input name="github" value={profile.github} onChange={handleChange} className={`${baseInputStyles} ${errors.github ? errorInputStyles : validInputStyles}`} />
                <ErrorMessage message={errors.github} id="github-error" />
            </div>
        </div>
    );
});

const SummarySection = React.memo(() => {
    const { profile, setProfile } = useContext(ProfileContext)!;
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setProfile(prev => ({ ...prev, summary: e.target.value }));
    };
    return (
        <textarea name="summary" value={profile.summary} onChange={handleChange} rows={4} className={`${baseInputStyles} ${validInputStyles}`} placeholder="A brief, powerful summary of your career, skills, and goals." />
    );
});


const EducationSection = React.memo(() => {
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
                <div key={edu.id} className="p-4 border rounded-lg relative group/item bg-gray-50/50">
                    <button onClick={() => removeEducation(edu.id)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity p-1" aria-label={`Remove education at ${edu.institution}`}>
                        <TrashIcon />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-xs font-medium text-gray-600"><TooltipLabel text="Name of the university, college, or bootcamp.">Institution</TooltipLabel></label><input value={edu.institution} onChange={e => handleChange(edu.id, 'institution', e.target.value)} className={`${baseInputStyles} ${validInputStyles}`} /></div>
                        <div><label className="block text-xs font-medium text-gray-600"><TooltipLabel text="e.g., 'Bachelor of Science', 'M.S.', 'Ph.D.'">Degree</TooltipLabel></label><input value={edu.degree} onChange={e => handleChange(edu.id, 'degree', e.target.value)} className={`${baseInputStyles} ${validInputStyles}`} /></div>
                        <div><label className="block text-xs font-medium text-gray-600"><TooltipLabel text="e.g., 'Computer Science', 'Business Administration'">Field of Study</TooltipLabel></label><input value={edu.fieldOfStudy} onChange={e => handleChange(edu.id, 'fieldOfStudy', e.target.value)} className={`${baseInputStyles} ${validInputStyles}`} /></div>
                        <div><label className="block text-xs font-medium text-gray-600"><TooltipLabel text="Enter your Grade Point Average. e.g., '3.8/4.0'">GPA</TooltipLabel></label><input value={edu.gpa} onChange={e => handleChange(edu.id, 'gpa', e.target.value)} className={`${baseInputStyles} ${validInputStyles}`} /></div>
                        <div><label className="block text-xs font-medium text-gray-600"><TooltipLabel text="Year you started. e.g., '2018'">Start Date</TooltipLabel></label><input value={edu.startDate} onChange={e => handleChange(edu.id, 'startDate', e.target.value)} placeholder="YYYY" className={`${baseInputStyles} ${validInputStyles}`} /></div>
                        <div><label className="block text-xs font-medium text-gray-600"><TooltipLabel text="Year you graduated or 'Present'. e.g., '2022'">End Date</TooltipLabel></label><input value={edu.endDate} onChange={e => handleChange(edu.id, 'endDate', e.target.value)} placeholder="YYYY or Present" className={`${baseInputStyles} ${validInputStyles}`} /></div>
                        <div className="md:col-span-2"><label className="block text-xs font-medium text-gray-600"><TooltipLabel text="List key courses relevant to your target roles.">Relevant Coursework</TooltipLabel></label><textarea value={edu.relevantCoursework} onChange={e => handleChange(edu.id, 'relevantCoursework', e.target.value)} rows={2} className={`${baseInputStyles} ${validInputStyles}`} /></div>
                        <div className="md:col-span-2"><label className="block text-xs font-medium text-gray-600"><TooltipLabel text="List any academic awards, scholarships, or honors.">Awards & Honors</TooltipLabel></label><textarea value={edu.awardsHonors} onChange={e => handleChange(edu.id, 'awardsHonors', e.target.value)} rows={2} className={`${baseInputStyles} ${validInputStyles}`} /></div>
                    </div>
                </div>
            ))}
            <button onClick={addEducation} className="w-full mt-2 text-center px-4 py-2 border border-dashed border-gray-400 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                + Add Education
            </button>
        </div>
    );
});


const ExperienceSection = React.memo(() => {
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
                <div key={exp.id} className="p-4 border rounded-lg relative group/item bg-gray-50/50">
                    <button onClick={() => removeExperience(exp.id)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity p-1" aria-label={`Remove experience at ${exp.company}`}>
                        <TrashIcon />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-xs font-medium text-gray-600"><TooltipLabel text="The name of the company.">Company</TooltipLabel></label><input value={exp.company} onChange={e => handleChange(exp.id, 'company', e.target.value)} className={`${baseInputStyles} ${validInputStyles}`} /></div>
                        <div><label className="block text-xs font-medium text-gray-600"><TooltipLabel text="Your job title for this role.">Title</TooltipLabel></label><input value={exp.title} onChange={e => handleChange(exp.id, 'title', e.target.value)} className={`${baseInputStyles} ${validInputStyles}`} /></div>
                        <div><label className="block text-xs font-medium text-gray-600"><TooltipLabel text="e.g., 'Remote' or 'City, CA'">Location</TooltipLabel></label><input value={exp.location} onChange={e => handleChange(exp.id, 'location', e.target.value)} className={`${baseInputStyles} ${validInputStyles}`} /></div>
                        <div></div>
                        <div><label className="block text-xs font-medium text-gray-600"><TooltipLabel text="Start date of employment. e.g., 'MM/YYYY' or 'YYYY'">Start Date</TooltipLabel></label><input value={exp.startDate} onChange={e => handleChange(exp.id, 'startDate', e.target.value)} placeholder="YYYY or MM/YYYY" className={`${baseInputStyles} ${validInputStyles}`} /></div>
                        <div><label className="block text-xs font-medium text-gray-600"><TooltipLabel text="End date of employment. e.g., 'MM/YYYY' or 'Present'">End Date</TooltipLabel></label><input value={exp.endDate} onChange={e => handleChange(exp.id, 'endDate', e.target.value)} placeholder="YYYY or Present" className={`${baseInputStyles} ${validInputStyles}`} /></div>
                    </div>
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700"><TooltipLabel text="List your accomplishments with strong action verbs and quantifiable results where possible.">Achievements / Responsibilities</TooltipLabel></label>
                        <div className="space-y-2 mt-1">
                            {exp.achievements.map(ach => (
                                <div key={ach.id} className="flex items-center space-x-2">
                                    <textarea value={ach.text} onChange={e => handleAchievementChange(exp.id, ach.id, e.target.value)} rows={2} className={`${baseInputStyles} ${validInputStyles}`} placeholder="e.g., Increased sales by 20% in Q3" />
                                    <button onClick={() => removeAchievement(exp.id, ach.id)} className="text-gray-400 hover:text-red-500 p-1 flex-shrink-0" aria-label="Remove achievement">
                                        <XCircleIcon />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => addAchievement(exp.id)} className="w-full mt-2 text-center px-4 py-1 border border-dashed border-gray-300 text-xs font-medium rounded-md text-gray-600 bg-white hover:bg-gray-50">
                            + Add Achievement
                        </button>
                    </div>
                </div>
            ))}
            <button onClick={addExperience} className="w-full mt-2 text-center px-4 py-2 border border-dashed border-gray-400 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                + Add Experience
            </button>
        </div>
    );
});

const ProjectSection = React.memo(() => {
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
                <div key={proj.id} className="p-4 border rounded-lg relative group/item bg-gray-50/50">
                    <button onClick={() => removeProject(proj.id)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity p-1" aria-label={`Remove project ${proj.name}`}>
                        <TrashIcon />
                    </button>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-xs font-medium text-gray-600"><TooltipLabel text="The official name of your project.">Project Name</TooltipLabel></label><input value={proj.name} onChange={e => handleChange(proj.id, 'name', e.target.value)} className={`${baseInputStyles} ${validInputStyles}`} /></div>
                        <div><label className="block text-xs font-medium text-gray-600"><TooltipLabel text="Link to the live project or its repository (e.g., GitHub).">Project URL</TooltipLabel></label><input value={proj.url} onChange={e => handleChange(proj.id, 'url', e.target.value)} className={`${baseInputStyles} ${validInputStyles}`} /></div>
                        <div><label className="block text-xs font-medium text-gray-600"><TooltipLabel text="Year the project started. e.g., '2023'">Start Date</TooltipLabel></label><input value={proj.startDate} onChange={e => handleChange(proj.id, 'startDate', e.target.value)} placeholder="YYYY" className={`${baseInputStyles} ${validInputStyles}`} /></div>
                        <div><label className="block text-xs font-medium text-gray-600"><TooltipLabel text="Year the project ended or 'Present'.">End Date</TooltipLabel></label><input value={proj.endDate} onChange={e => handleChange(proj.id, 'endDate', e.target.value)} placeholder="YYYY or Present" className={`${baseInputStyles} ${validInputStyles}`} /></div>
                        <div className="md:col-span-2"><label className="block text-xs font-medium text-gray-600"><TooltipLabel text="Comma-separated list of key technologies. e.g., 'React, Node.js, PostgreSQL'">Technologies Used</TooltipLabel></label><input value={proj.technologiesUsed} onChange={e => handleChange(proj.id, 'technologiesUsed', e.target.value)} placeholder="e.g., React, Node.js, PostgreSQL" className={`${baseInputStyles} ${validInputStyles}`} /></div>
                        <div className="md:col-span-2"><label className="block text-xs font-medium text-gray-600"><TooltipLabel text="Briefly describe the project's purpose and your role.">Description</TooltipLabel></label><textarea value={proj.description} onChange={e => handleChange(proj.id, 'description', e.target.value)} rows={3} className={`${baseInputStyles} ${validInputStyles}`} /></div>
                    </div>
                </div>
            ))}
             <button onClick={addProject} className="w-full mt-2 text-center px-4 py-2 border border-dashed border-gray-400 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                + Add Project
            </button>
        </div>
    );
});


const AdditionalInfoSection = React.memo(() => {
    const { profile, setProfile } = useContext(ProfileContext)!;
     const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };
    return (
        <textarea name="additionalInformation" value={profile.additionalInformation} onChange={handleChange} rows={3} className={`${baseInputStyles} ${validInputStyles}`} placeholder="Anything else you'd like the AI to know?" />
    );
});

type SimpleListSectionKeys = 'technicalSkills' | 'softSkills' | 'tools' | 'certifications' | 'interests';
type SimpleListItem = Skill | Certification | Interest;

const SimpleListItemForm = React.memo(({
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
            <button onClick={handleAdd} className="w-full mt-2 text-center px-4 py-2 border border-dashed border-gray-400 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                + Add {title}
            </button>
        </div>
    );
});

const LanguagesSection = React.memo(() => {
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
                        placeholder="e.g., Spanish"
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
            <button onClick={addLanguage} className="w-full mt-2 text-center px-4 py-2 border border-dashed border-gray-400 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                + Add Language
            </button>
        </div>
    );
});

const CustomSections = React.memo(() => {
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
                <div key={cs.id} className="p-4 border rounded-lg relative group/item bg-gray-50/50">
                    <button onClick={() => removeSection(cs.id)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity p-1" aria-label={`Remove custom section ${cs.title}`}>
                        <TrashIcon />
                    </button>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Section Title</label>
                        <input value={cs.title} onChange={e => handleSectionTitleChange(cs.id, e.target.value)} className={`${baseInputStyles} ${validInputStyles} font-semibold`} placeholder="e.g., Publications, Volunteer Work" />
                    </div>
                    <div className="mt-4 space-y-2">
                        {cs.items.map(item => (
                            <div key={item.id} className="flex items-center space-x-2">
                                <textarea value={item.text} onChange={e => handleItemChange(cs.id, item.id, e.target.value)} rows={2} className={`${baseInputStyles} ${validInputStyles}`} />
                                <button onClick={() => removeItem(cs.id, item.id)} className="text-gray-400 hover:text-red-500 p-1 flex-shrink-0" aria-label="Remove item"><XCircleIcon /></button>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => addItem(cs.id)} className="w-full mt-2 text-center px-4 py-1 border border-dashed border-gray-300 text-xs font-medium rounded-md text-gray-600 bg-white hover:bg-gray-50">
                        + Add Item
                    </button>
                </div>
            ))}
            <button onClick={addSection} className="w-full mt-2 text-center px-4 py-2 border border-dashed border-gray-400 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                + Add Custom Section
            </button>
        </div>
    );
});


// --- Main ProfileForm Component ---

const ProfileForm: React.FC = () => {
  const profileContext = useContext(ProfileContext);

  if (!profileContext) {
    return <div>Loading profile editor...</div>;
  }

  const { profile, setProfile, saveProfile, lastSavedProfile } = profileContext;

  const [openSections, setOpenSections] = useState<Set<AccordionSection>>(() => new Set(['personal'])); 
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parsingError, setParsingError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDirty = JSON.stringify(profile) !== JSON.stringify(lastSavedProfile);

  useEffect(() => {
    if (parsingError) {
        const timer = setTimeout(() => setParsingError(null), 10000);
        return () => clearTimeout(timer);
    }
  }, [parsingError]);

  const handleSave = () => {
    if (saveProfile(profile)) {
      setShowSaveConfirmation(true);
      setTimeout(() => setShowSaveConfirmation(false), 3000);
    }
  };

  const handleToggle = (section: AccordionSection) => {
    setOpenSections(prev => {
      const newSet = new Set(prev);
      newSet.has(section) ? newSet.delete(section) : newSet.add(section);
      return newSet;
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParsingError(null);
    setIsParsing(true);
    e.target.value = '';

    const MAX_FILE_SIZE_MB = 2;
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setParsingError(`File too large: Please upload a file smaller than ${MAX_FILE_SIZE_MB}MB.`);
      setIsParsing(false);
      return;
    }

    try {
        const parsedData = await importAndParseResume(file);
        
        const blankProfileContent: Partial<ProfileData> = {
            fullName: '', jobTitle: '', email: '', phone: '', website: '', location: '',
            linkedin: '', github: '', summary: '', education: [], experience: [],
            projects: [], technicalSkills: [], softSkills: [], tools: [],
            languages: [], certifications: [], interests: [], customSections: [],
            additionalInformation: '', industry: '', experienceLevel: 'entry', vibe: ''
        };

        const newProfile = { ...profile, ...blankProfileContent, ...parsedData };
        setProfile(newProfile);
        saveProfile(newProfile);

        // Intelligently expand sections that were populated by the resume import.
        setOpenSections(prevOpenSections => {
            const newOpenSections = new Set(prevOpenSections);
            newOpenSections.add('personal'); // Always show personal info

            if (parsedData.summary?.trim()) newOpenSections.add('summary');
            if (parsedData.experience?.length) newOpenSections.add('experience');
            if (parsedData.education?.length) newOpenSections.add('education');
            if (parsedData.projects?.length) newOpenSections.add('projects');
            if (parsedData.technicalSkills?.length) newOpenSections.add('technicalSkills');
            if (parsedData.softSkills?.length) newOpenSections.add('softSkills');
            if (parsedData.tools?.length) newOpenSections.add('tools');
            if (parsedData.languages?.length) newOpenSections.add('languages');
            if (parsedData.certifications?.length) newOpenSections.add('certifications');
            if (parsedData.interests?.length) newOpenSections.add('interests');
            
            return newOpenSections;
        });

    } catch (err: any) {
        setParsingError(err.message || "An unexpected error occurred during parsing.");
    } finally {
        setIsParsing(false);
    }
  };


  return (
    <>
    {isParsing && <ParsingModal />}
    <div className="bg-white p-6 rounded-2xl shadow-lg">
      <div className="border-b pb-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-neutral">Your Profile</h2>
          </div>
          <div className="text-right">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.txt,.md"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isParsing}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-accent hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Autofill from Resume
            </button>
            <p className="mt-2 text-xs text-gray-500">Accepted formats: .pdf, .txt, .md</p>
          </div>
        </div>
        
        {parsingError && (
          <div className="mt-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md relative flex justify-between items-center shadow-md" role="alert">
            <div>
              <p className="font-bold">File Upload Error</p>
              <p>{parsingError}</p>
            </div>
            <button onClick={() => setParsingError(null)} className="p-1 rounded-full hover:bg-red-200 transition-colors" aria-label="Close file error">
              <XCircleIcon className="h-6 w-6" />
            </button>
          </div>
        )}
      </div>

      <div className="mt-6">
        <div className="space-y-2">
            <AccordionItem sectionId="personal" title="Personal Info" isOpen={openSections.has('personal')} setIsOpen={() => handleToggle('personal')}>
              <PersonalInfoSection />
            </AccordionItem>

            <AccordionItem sectionId="summary" title="Professional Summary" isOpen={openSections.has('summary')} setIsOpen={() => handleToggle('summary')}>
              <SummarySection />
            </AccordionItem>
            
            <AccordionItem sectionId="experience" title="Experience" isOpen={openSections.has('experience')} setIsOpen={() => handleToggle('experience')}>
                <ExperienceSection />
            </AccordionItem>
            
            <AccordionItem sectionId="education" title="Education" isOpen={openSections.has('education')} setIsOpen={() => handleToggle('education')}>
              <EducationSection />
            </AccordionItem>

            <AccordionItem sectionId="projects" title="Projects" isOpen={openSections.has('projects')} setIsOpen={() => handleToggle('projects')}>
              <ProjectSection />
            </AccordionItem>
            
            <AccordionItem sectionId="technicalSkills" title="Technical Skills" isOpen={openSections.has('technicalSkills')} setIsOpen={() => handleToggle('technicalSkills')}>
              <SimpleListItemForm 
                section="technicalSkills" 
                title="Technical Skill" 
                placeholder="e.g., Python, JavaScript, SQL" 
              />
            </AccordionItem>

            <AccordionItem sectionId="softSkills" title="Soft Skills" isOpen={openSections.has('softSkills')} setIsOpen={() => handleToggle('softSkills')}>
              <SimpleListItemForm 
                section="softSkills" 
                title="Soft Skill" 
                placeholder="e.g., Communication, Leadership" 
              />
            </AccordionItem>

            <AccordionItem sectionId="tools" title="Tools & Technologies" isOpen={openSections.has('tools')} setIsOpen={() => handleToggle('tools')}>
              <SimpleListItemForm 
                section="tools" 
                title="Tool/Technology" 
                placeholder="e.g., Git, Docker, JIRA" 
              />
            </AccordionItem>

            <AccordionItem sectionId="languages" title="Languages" isOpen={openSections.has('languages')} setIsOpen={() => handleToggle('languages')}>
              <LanguagesSection />
            </AccordionItem>

             <AccordionItem sectionId="certifications" title="Certifications" isOpen={openSections.has('certifications')} setIsOpen={() => handleToggle('certifications')}>
              <SimpleListItemForm 
                section="certifications" 
                title="Certification" 
                placeholder="e.g., AWS Certified Cloud Practitioner" 
              />
            </AccordionItem>
            
             <AccordionItem sectionId="interests" title="Interests" isOpen={openSections.has('interests')} setIsOpen={() => handleToggle('interests')}>
              <SimpleListItemForm 
                section="interests" 
                title="Interest" 
                placeholder="e.g., Open Source Contribution" 
              />
            </AccordionItem>

            <AccordionItem sectionId="custom" title="Custom Sections" isOpen={openSections.has('custom')} setIsOpen={() => handleToggle('custom')}>
              <CustomSections />
            </AccordionItem>

            <AccordionItem sectionId="additional" title="Additional Information" isOpen={openSections.has('additional')} setIsOpen={() => handleToggle('additional')}>
              <AdditionalInfoSection />
            </AccordionItem>
          </div>
      </div>
    </div>

    {isDirty && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm p-4 border-t border-gray-200 shadow-lg z-40 animate-slide-in-up">
            <div className="container mx-auto flex justify-end items-center px-4 sm:px-6 lg:px-8">
                <p className="text-gray-600 mr-4 hidden sm:block">You have unsaved changes.</p>
                <button
                    onClick={handleSave}
                    className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                    Save Changes
                </button>
            </div>
        </div>
    )}

    {showSaveConfirmation && (
        <div className="fixed bottom-6 right-6 bg-green-500 text-white py-2 px-4 rounded-lg shadow-lg z-50 animate-fade-in" role="status">
            Profile Saved!
        </div>
    )}
    </>
  );
};

export default ProfileForm;