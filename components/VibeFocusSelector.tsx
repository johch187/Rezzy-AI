import React, { useContext } from 'react';
import { ProfileContext } from '../App';
import Card from './Card';

const VibeFocusSelector: React.FC = () => {
  const profileContext = useContext(ProfileContext);
  if (!profileContext) return null;

  const { profile, setProfile } = profileContext;
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const inputClasses = "w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-150";
  const labelClasses = "block text-sm font-medium text-gray-700 mb-1.5";
  const helperClasses = "mt-1.5 text-xs text-gray-500";

  return (
    <Card>
      {/* Header */}
      <div className="pb-5 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">Target Role</h2>
        <p className="mt-1 text-sm text-gray-500">
          Define your goals to personalize AI-generated documents.
        </p>
      </div>

      {/* Form */}
      <div className="mt-5 space-y-4">
        <div>
          <label htmlFor="targetJobTitle" className={labelClasses}>
            Job Title
          </label>
          <input
            type="text"
            id="targetJobTitle"
            name="targetJobTitle"
            value={profile.targetJobTitle}
            onChange={handleInputChange}
            className={inputClasses}
            placeholder="e.g. Product Manager, Software Engineer"
          />
        </div>

        <div>
          <label htmlFor="companyName" className={labelClasses}>
            Company
          </label>
          <input
            type="text"
            id="companyName"
            name="companyName"
            value={profile.companyName}
            onChange={handleInputChange}
            className={inputClasses}
            placeholder="e.g. Google, Stripe"
          />
        </div>

        <div>
          <label htmlFor="experienceLevel" className={labelClasses}>
            Experience Level
          </label>
          <select
            id="experienceLevel"
            name="experienceLevel"
            value={profile.experienceLevel}
            onChange={handleInputChange}
            className={inputClasses}
          >
            <option value="internship">Internship</option>
            <option value="entry">Entry-Level</option>
            <option value="mid">Mid-Level</option>
            <option value="senior">Senior</option>
            <option value="executive">Executive</option>
          </select>
        </div>

        <div>
          <label htmlFor="industry" className={labelClasses}>
            Industry
          </label>
          <input
            type="text"
            id="industry"
            name="industry"
            value={profile.industry}
            onChange={handleInputChange}
            className={inputClasses}
            placeholder="e.g. Technology, Finance"
          />
        </div>

        <div>
          <label htmlFor="companyKeywords" className={labelClasses}>
            Company Keywords
          </label>
          <input
            type="text"
            id="companyKeywords"
            name="companyKeywords"
            value={profile.companyKeywords}
            onChange={handleInputChange}
            className={inputClasses}
            placeholder="e.g. innovative, customer-focused"
          />
          <p className={helperClasses}>Keywords about company culture or values</p>
        </div>

        <div>
          <label htmlFor="keySkillsToHighlight" className={labelClasses}>
            Key Skills
          </label>
          <textarea
            id="keySkillsToHighlight"
            name="keySkillsToHighlight"
            rows={2}
            value={profile.keySkillsToHighlight}
            onChange={handleInputChange}
            className={`${inputClasses} resize-none`}
            placeholder="e.g. Python, Data Analysis, Leadership"
          />
          <p className={helperClasses}>Skills most relevant to your target role</p>
        </div>

        <div>
          <label htmlFor="vibe" className={labelClasses}>
            Writing Style
          </label>
          <textarea
            id="vibe"
            name="vibe"
            rows={2}
            value={profile.vibe}
            onChange={handleInputChange}
            className={`${inputClasses} resize-none`}
            placeholder="e.g. Professional yet personable, results-driven"
          />
          <p className={helperClasses}>Describe the tone for your documents</p>
        </div>
      </div>
    </Card>
  );
};

export default React.memo(VibeFocusSelector);
