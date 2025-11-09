import React, { useState, useEffect, useContext } from 'react';
import { ProfileContext } from '../../App';
import type { ProfileData } from '../../types';
import Tooltip from '../Tooltip';
import { ErrorMessage, baseInputStyles, errorInputStyles, validInputStyles } from './common';

type ProfileFormErrors = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  website?: string;
  linkedin?: string;
  github?: string;
};

const validateProfile = (profile: ProfileData): ProfileFormErrors => {
  const errors: ProfileFormErrors = {};
  
  const nameParts = profile.fullName.trim().split(/\s+/);
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ');
  
  if (!firstName) errors.firstName = "First name is required.";
  if (!lastName) errors.lastName = "Last name is required.";
  if (!profile.phone.trim()) errors.phone = "Phone is required.";
  
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

export const PersonalInfoSection = React.memo(() => {
    const { profile, setProfile } = useContext(ProfileContext)!;
    const [errors, setErrors] = useState<ProfileFormErrors>({});
    
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

    useEffect(() => {
        // This effect synchronizes local state with the global profile.fullName,
        // but only when fullName is changed from an external source (like resume parsing).
        // It avoids a feedback loop from its own updates.
        const currentCombined = `${firstName} ${lastName}`.trim();
        if (profile.fullName.trim() !== currentCombined) {
            const nameParts = profile.fullName.trim().split(/\s+/);
            const first = nameParts[0] || '';
            const last = nameParts.slice(1).join(' ');
            setFirstName(first);
            setLastName(last);
        }
    }, [profile.fullName, firstName, lastName]);

    const handleFirstNameChange = (value: string) => {
        setFirstName(value);
        const newFullName = `${value} ${lastName}`.trim();
        setProfile(prev => ({ ...prev, fullName: newFullName }));
    };
    
    const handleLastNameChange = (value: string) => {
        setLastName(value);
        const newFullName = `${firstName} ${value}`.trim();
        setProfile(prev => ({ ...prev, fullName: newFullName }));
    };
    
    useEffect(() => {
        setErrors(validateProfile(profile));
    }, [profile.fullName, profile.email, profile.phone, profile.website, profile.linkedin, profile.github]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input name="firstName" value={firstName} onChange={(e) => handleFirstNameChange(e.target.value)} className={`${baseInputStyles} ${errors.firstName ? errorInputStyles : validInputStyles}`} placeholder="Jordan" />
                <ErrorMessage message={errors.firstName} id="firstName-error" />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input name="lastName" value={lastName} onChange={(e) => handleLastNameChange(e.target.value)} className={`${baseInputStyles} ${errors.lastName ? errorInputStyles : validInputStyles}`} placeholder="Lee" />
                <ErrorMessage message={errors.lastName} id="lastName-error" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input name="email" value={profile.email} onChange={handleChange} className={`${baseInputStyles} ${errors.email ? errorInputStyles : validInputStyles}`} placeholder="jordan.lee@example.com" />
                <ErrorMessage message={errors.email} id="email-error" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Tooltip text="Link to your personal website or online portfolio. e.g., 'yourname.dev'">Website/Portfolio</Tooltip>
                </label>
                <input name="website" value={profile.website} onChange={handleChange} className={`${baseInputStyles} ${errors.website ? errorInputStyles : validInputStyles}`} placeholder="yourportfolio.com" />
                <ErrorMessage message={errors.website} id="website-error" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Tooltip text="Your professional contact number. e.g., (555) 123-4567">Phone</Tooltip>
                </label>
                <input name="phone" value={profile.phone} onChange={handleChange} className={`${baseInputStyles} ${errors.phone ? errorInputStyles : validInputStyles}`} placeholder="(555) 123-4567" />
                <ErrorMessage message={errors.phone} id="phone-error" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Tooltip text="Full URL to your LinkedIn profile. e.g., 'linkedin.com/in/yourname'">LinkedIn</Tooltip>
                </label>
                <input name="linkedin" value={profile.linkedin} onChange={handleChange} className={`${baseInputStyles} ${errors.linkedin ? errorInputStyles : validInputStyles}`} placeholder="linkedin.com/in/yourprofile" />
                <ErrorMessage message={errors.linkedin} id="linkedin-error" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Tooltip text="Your city and state. e.g., 'San Francisco, CA'">Location</Tooltip>
                </label>
                <input name="location" value={profile.location} onChange={handleChange} className={`${baseInputStyles} ${validInputStyles}`} placeholder="New York, NY" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Tooltip text="Full URL to your GitHub profile. e.g., 'github.com/yourusername'">GitHub</Tooltip>
                </label>
                <input name="github" value={profile.github} onChange={handleChange} className={`${baseInputStyles} ${errors.github ? errorInputStyles : validInputStyles}`} placeholder="github.com/yourusername" />
                <ErrorMessage message={errors.github} id="github-error" />
            </div>
        </div>
    );
});