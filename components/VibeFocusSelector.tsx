import React, { useContext } from 'react';
import { ProfileContext } from '../App';
import type { ProfileData } from '../types';

const VibeFocusSelector: React.FC = () => {
    const profileContext = useContext(ProfileContext);

    if (!profileContext) return null;

    const { profile, setProfile } = profileContext;
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl">
            <div className="border-b border-gray-200 pb-6">
                <h2 className="text-2xl font-bold text-neutral">Target Role</h2>
                <p className="mt-1 text-gray-500">Define your career goals to help the AI tailor your documents.</p>
            </div>
            <div className="mt-6">
                <div className="space-y-4">
                    <div>
                        <label htmlFor="targetJobTitle" className="block text-sm font-medium text-gray-700">
                            Target Job Title
                        </label>
                        <input
                            type="text"
                            id="targetJobTitle"
                            name="targetJobTitle"
                            value={profile.targetJobTitle}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                            placeholder="Financial Analyst, Executive Assistant"
                        />
                    </div>
                    <div>
                        <label htmlFor="experienceLevel" className="block text-sm font-medium text-gray-700">
                            Seniority
                        </label>
                        <select
                            id="experienceLevel"
                            name="experienceLevel"
                            value={profile.experienceLevel}
                            onChange={handleInputChange}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 bg-gray-50 shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                        >
                            <option value="internship">Internship</option>
                            <option value="entry">Entry-Level</option>
                            <option value="mid">Mid-Level</option>
                            <option value="senior">Senior</option>
                            <option value="executive">Executive</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
                            Industry
                        </label>
                        <input
                            type="text"
                            id="industry"
                            name="industry"
                            value={profile.industry}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                            placeholder="Technology, Finance, Healthcare"
                        />
                    </div>
                     <div>
                        <label htmlFor="companyKeywords" className="block text-sm font-medium text-gray-700">
                            Company Keywords
                        </label>
                        <input
                            type="text"
                            id="companyKeywords"
                            name="companyKeywords"
                            value={profile.companyKeywords}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                            placeholder="'Client-focused', 'Risk-averse'"
                        />
                         <p className="mt-2 text-xs text-gray-500">Keywords about the company, its products, or culture.</p>
                    </div>
                     <div>
                        <label htmlFor="keySkillsToHighlight" className="block text-sm font-medium text-gray-700">
                            Key Skills to Highlight
                        </label>
                        <textarea
                            id="keySkillsToHighlight"
                            name="keySkillsToHighlight"
                            rows={3}
                            value={profile.keySkillsToHighlight}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                            placeholder="'Financial Modeling, Excel, SQL', 'Scheduling, Event Planning, MS Office'"
                        />
                         <p className="mt-2 text-xs text-gray-500">List the most important skills for this role.</p>
                    </div>
                    <div>
                        <label htmlFor="vibe" className="block text-sm font-medium text-gray-700">
                            Writing Style & Focus
                        </label>
                        <textarea
                            id="vibe"
                            name="vibe"
                            rows={3}
                            value={profile.vibe}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                            placeholder="'Analytical with a focus on accuracy', 'Personable, organized, and proactive.'"
                        />
                         <p className="mt-2 text-xs text-gray-500">Describe the tone and key specializations you want the AI to write with. This is your guide for the AI's voice.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default React.memo(VibeFocusSelector);