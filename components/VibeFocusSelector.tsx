import React, { useContext } from 'react';
import { ProfileContext } from '../App';
import type { ProfileData } from '../types';
import Card from './Card';

const VibeFocusSelector: React.FC = () => {
    const profileContext = useContext(ProfileContext);

    if (!profileContext) return null;

    const { profile, setProfile } = profileContext;
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    return (
        <Card>
            <div className="border-b border-gray-200 pb-4 sm:pb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-neutral">Target Role</h2>
                <p className="mt-1 text-sm sm:text-base text-gray-500">Define your career goals to help the AI tailor your documents.</p>
            </div>
            <div className="mt-4 sm:mt-6">
                <div className="space-y-3 sm:space-y-4">
                    <div>
                        <label htmlFor="targetJobTitle" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                            Target Job Title
                        </label>
                        <input
                            type="text"
                            id="targetJobTitle"
                            name="targetJobTitle"
                            value={profile.targetJobTitle}
                            onChange={handleInputChange}
                            className="block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary text-sm px-3 py-2"
                            placeholder="Financial Analyst, Executive Assistant"
                        />
                    </div>
                    <div>
                        <label htmlFor="companyName" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                            Company Name
                        </label>
                        <input
                            type="text"
                            id="companyName"
                            name="companyName"
                            value={profile.companyName}
                            onChange={handleInputChange}
                            className="block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary text-sm px-3 py-2"
                            placeholder="e.g., Google, Goldman Sachs"
                        />
                    </div>
                    <div>
                        <label htmlFor="experienceLevel" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                            Seniority
                        </label>
                        <select
                            id="experienceLevel"
                            name="experienceLevel"
                            value={profile.experienceLevel}
                            onChange={handleInputChange}
                            className="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 bg-gray-50 shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary rounded-md"
                        >
                            <option value="internship">Internship</option>
                            <option value="entry">Entry-Level</option>
                            <option value="mid">Mid-Level</option>
                            <option value="senior">Senior</option>
                            <option value="executive">Executive</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="industry" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                            Industry
                        </label>
                        <input
                            type="text"
                            id="industry"
                            name="industry"
                            value={profile.industry}
                            onChange={handleInputChange}
                            className="block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary text-sm px-3 py-2"
                            placeholder="Technology, Finance, Healthcare"
                        />
                    </div>
                     <div>
                        <label htmlFor="companyKeywords" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                            Company Keywords
                        </label>
                        <input
                            type="text"
                            id="companyKeywords"
                            name="companyKeywords"
                            value={profile.companyKeywords}
                            onChange={handleInputChange}
                            className="block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary text-sm px-3 py-2"
                            placeholder="'Client-focused', 'Risk-averse'"
                        />
                         <p className="mt-1.5 text-xs text-gray-500">Keywords about the company, its products, or culture.</p>
                    </div>
                     <div>
                        <label htmlFor="keySkillsToHighlight" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                            Key Skills to Highlight
                        </label>
                        <textarea
                            id="keySkillsToHighlight"
                            name="keySkillsToHighlight"
                            rows={3}
                            value={profile.keySkillsToHighlight}
                            onChange={handleInputChange}
                            className="block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary text-sm px-3 py-2 resize-y"
                            placeholder="'Financial Modeling, Excel, SQL', 'Scheduling, Event Planning, MS Office'"
                        />
                         <p className="mt-1.5 text-xs text-gray-500">List the most important skills for this role.</p>
                    </div>
                    <div>
                        <label htmlFor="vibe" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                            Writing Style & Focus
                        </label>
                        <textarea
                            id="vibe"
                            name="vibe"
                            rows={3}
                            value={profile.vibe}
                            onChange={handleInputChange}
                            className="block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary text-sm px-3 py-2 resize-y"
                            placeholder="'Analytical with a focus on accuracy', 'Personable, organized, and proactive.'"
                        />
                         <p className="mt-1.5 text-xs text-gray-500">Describe the tone and key specializations you want the AI to write with. This is your guide for the AI's voice.</p>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default React.memo(VibeFocusSelector);
