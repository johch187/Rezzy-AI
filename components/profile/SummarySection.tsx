import React, { useContext } from 'react';
import { ProfileContext } from '../../App';
import { baseInputStyles, validInputStyles } from './common';

export const SummarySection = React.memo(() => {
    const { profile, setProfile } = useContext(ProfileContext)!;
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setProfile(prev => ({ ...prev, summary: e.target.value }));
    };
    return (
        <textarea name="summary" value={profile.summary} onChange={handleChange} rows={4} className={`${baseInputStyles} ${validInputStyles}`} placeholder="Results-driven Financial Analyst with 5+ years of experience in data analysis and financial modeling. Or: Organized Administrative Assistant skilled in office management and executive support." />
    );
});
