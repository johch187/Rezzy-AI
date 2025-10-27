import React, { useContext } from 'react';
import { ProfileContext } from '../../App';
import { baseInputStyles, validInputStyles } from './common';

export const AdditionalInfoSection = React.memo(() => {
    const { profile, setProfile } = useContext(ProfileContext)!;
     const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };
    return (
        <textarea name="additionalInformation" value={profile.additionalInformation} onChange={handleChange} rows={3} className={`${baseInputStyles} ${validInputStyles}`} placeholder="Certified Financial Planner (CFP). Or: Proficient in QuickBooks and Salesforce." />
    );
});
