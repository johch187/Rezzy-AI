import React from 'react';
import type { ProfileData, IncludedProfileSelections } from '../types';
import ContentAccordion from './ContentAccordion';

interface ProfileContentSelectorProps {
    profile: ProfileData;
    includedSelections: IncludedProfileSelections;
    setIncludedSelections: React.Dispatch<React.SetStateAction<IncludedProfileSelections>>;
}

const ProfileContentSelector: React.FC<ProfileContentSelectorProps> = ({ profile, includedSelections, setIncludedSelections }) => {
    
  const handleToggleTopLevelSection = (key: 'summary' | 'additionalInformation') => {
    setIncludedSelections(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleToggleArrayItem = (sectionKey: keyof IncludedProfileSelections, itemId: string) => {
    setIncludedSelections(prev => {
      const currentSet = new Set(prev[sectionKey] as Set<string>);
      currentSet.has(itemId) ? currentSet.delete(itemId) : currentSet.add(itemId);
      return { ...prev, [sectionKey]: currentSet };
    });
  };

  const handleToggleCustomSection = (sectionId: string) => {
    setIncludedSelections(prev => {
      const currentSet = new Set(prev.customSectionIds);
      const newCustomSectionItemIds = { ...prev.customSectionItemIds };

      if (currentSet.has(sectionId)) {
        currentSet.delete(sectionId);
        delete newCustomSectionItemIds[sectionId];
      } else {
        currentSet.add(sectionId);
        const customSection = profile.customSections.find(cs => cs.id === sectionId);
        if (customSection) {
            newCustomSectionItemIds[sectionId] = new Set(customSection.items.map(item => item.id));
        }
      }
      return { ...prev, customSectionIds: currentSet, customSectionItemIds: newCustomSectionItemIds };
    });
  };

  const handleToggleCustomSectionItem = (sectionId: string, itemId: string) => {
    setIncludedSelections(prev => {
      const newCustomSectionItemIds = { ...prev.customSectionItemIds };
      const currentItemSet = new Set(newCustomSectionItemIds[sectionId]);
      currentItemSet.has(itemId) ? currentItemSet.delete(itemId) : currentItemSet.add(itemId);
      newCustomSectionItemIds[sectionId] = currentItemSet;
      return { ...prev, customSectionItemIds: newCustomSectionItemIds };
    });
  };
    
    return (
         <ContentAccordion title="Select Profile Content" initiallyOpen={true}>
            <p className="text-sm text-gray-600 mb-4">Choose which parts of your profile to include. Your contact info is always included.</p>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {/* Summary */}
                <div className="flex items-center">
                    <input type="checkbox" id="include-summary-profile" checked={includedSelections.summary} onChange={() => handleToggleTopLevelSection('summary')} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                    <label htmlFor="include-summary-profile" className="ml-3 block text-sm font-medium text-gray-900">Professional Summary</label>
                </div>

                {/* Array Sections */}
                {Object.entries({
                    education: { data: profile.education, key: 'educationIds', label: 'Education' },
                    experience: { data: profile.experience, key: 'experienceIds', label: 'Experience' },
                    projects: { data: profile.projects, key: 'projectIds', label: 'Projects' },
                    technicalSkills: { data: profile.technicalSkills, key: 'technicalSkillIds', label: 'Technical Skills' },
                    softSkills: { data: profile.softSkills, key: 'softSkillIds', label: 'Soft Skills' },
                    tools: { data: profile.tools, key: 'toolIds', label: 'Tools' },
                    languages: { data: profile.languages, key: 'languageIds', label: 'Languages' },
                    certifications: { data: profile.certifications, key: 'certificationIds', label: 'Certifications' },
                    interests: { data: profile.interests, key: 'interestIds', label: 'Interests' },
                }).map(([sectionKey, { data, key, label }]) => (
                    data.length > 0 && (
                        <div key={key} className="pl-4 border-l-2 border-gray-200">
                            <h4 className="font-semibold text-gray-800 mt-2 mb-2">{label}</h4>
                            {data.map((item: any) => (
                                <div key={item.id} className="flex items-center mb-1">
                                    <input type="checkbox" id={`include-${key}-${item.id}`} checked={(includedSelections[key as keyof IncludedProfileSelections] as Set<string>).has(item.id)} onChange={() => handleToggleArrayItem(key as keyof IncludedProfileSelections, item.id)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                                    <label htmlFor={`include-${key}-${item.id}`} className="ml-3 block text-sm text-gray-700 truncate">{item.name || `${item.degree || item.title} at ${item.institution || item.company}`}</label>
                                </div>
                            ))}
                        </div>
                    )
                ))}

                {/* Custom Sections */}
                {profile.customSections.length > 0 && (
                    <div className="pl-4 border-l-2 border-gray-200">
                        <h4 className="font-semibold text-gray-800 mt-2 mb-2">Custom Sections</h4>
                        {profile.customSections.map(cSec => (
                        <div key={cSec.id} className="mb-2 p-2 bg-gray-50 rounded-md">
                            <div className="flex items-center">
                                <input type="checkbox" id={`include-csec-${cSec.id}`} checked={includedSelections.customSectionIds.has(cSec.id)} onChange={() => handleToggleCustomSection(cSec.id)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                                <label htmlFor={`include-csec-${cSec.id}`} className="ml-3 block text-sm font-medium text-gray-900">{cSec.title || 'Untitled Section'}</label>
                            </div>
                            {includedSelections.customSectionIds.has(cSec.id) && cSec.items.length > 0 && (
                                <div className="ml-6 mt-2 space-y-1 border-l pl-3 border-gray-100">
                                    {cSec.items.map(item => (
                                    <div key={item.id} className="flex items-center">
                                        <input type="checkbox" id={`include-csec-item-${item.id}`} checked={includedSelections.customSectionItemIds[cSec.id]?.has(item.id) || false} onChange={() => handleToggleCustomSectionItem(cSec.id, item.id)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                                        <label htmlFor={`include-csec-item-${item.id}`} className="ml-3 block text-xs text-gray-600 truncate">{item.text}</label>
                                    </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        ))}
                    </div>
                )}

                {/* Additional Information */}
                <div className="flex items-center">
                    <input type="checkbox" id="include-additional-info" checked={includedSelections.additionalInformation} onChange={() => handleToggleTopLevelSection('additionalInformation')} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                    <label htmlFor={`include-additional-info`} className="ml-3 block text-sm font-medium text-gray-900">Additional Information</label>
                </div>

            </div>
        </ContentAccordion>
    );
};

export default React.memo(ProfileContentSelector);
