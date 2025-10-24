import React, { useContext, useState } from 'react';
import { ProfileContext } from '../App';
import type { ProfileData } from '../types';
import { ArrowIcon } from './Icons';

const VibeFocusSelector: React.FC = () => {
    const profileContext = useContext(ProfileContext);
    const [isCollapsed, setIsCollapsed] = useState(false);

    if (!profileContext) return null;

    const { profile, setProfile } = profileContext;
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsCollapsed(!isCollapsed)}>
                <h2 className="text-2xl font-bold text-neutral">Career Goals</h2>
                <button className="p-2 rounded-full hover:bg-gray-100" aria-label={isCollapsed ? 'Expand career goals' : 'Collapse career goals'}>
                    <ArrowIcon collapsed={isCollapsed} />
                </button>
            </div>
            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[1000px] opacity-100 mt-4'}`}>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
                            Target Industry
                        </label>
                        <input
                            type="text"
                            id="industry"
                            name="industry"
                            value={profile.industry}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                            placeholder="e.g., Tech, Finance, Healthcare"
                        />
                    </div>
                    <div>
                        <label htmlFor="experienceLevel" className="block text-sm font-medium text-gray-700">
                            Experience Level
                        </label>
                        <select
                            id="experienceLevel"
                            name="experienceLevel"
                            value={profile.experienceLevel}
                            onChange={handleInputChange}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                        >
                            <option value="internship">Internship</option>
                            <option value="entry">Entry-Level</option>
                            <option value="mid">Mid-Level</option>
                            <option value="senior">Senior</option>
                            <option value="executive">Executive</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="vibe" className="block text-sm font-medium text-gray-700">
                            Desired Focus or Specialization
                        </label>
                        <textarea
                            id="vibe"
                            name="vibe"
                            rows={3}
                            value={profile.vibe}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                            placeholder="e.g., 'Full-stack development with a focus on user experience' or 'Corporate finance and M&A'"
                        />
                         <p className="mt-2 text-xs text-gray-500">Describe the tone and key specializations you want to convey. This will guide the AI's writing style.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default React.memo(VibeFocusSelector);
