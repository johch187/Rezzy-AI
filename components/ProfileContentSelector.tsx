import React, { useState } from 'react';
import type { ProfileData, IncludedProfileSelections } from '../types';
import { ArrowIcon } from './Icons';

interface ProfileContentSelectorProps {
  profile: ProfileData;
  selections: IncludedProfileSelections;
  onSelectionChange: React.Dispatch<React.SetStateAction<IncludedProfileSelections>>;
}

const CheckboxItem: React.FC<{
  label: React.ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  subItem?: boolean;
}> = ({ label, checked, onChange, subItem }) => (
  <div className={`relative flex items-start py-1 ${subItem ? 'pl-6' : ''}`}>
    <div className="flex h-6 items-center">
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
      />
    </div>
    <div className="ml-3 text-sm leading-6">
      <label className="font-medium text-gray-800 cursor-pointer select-none">
        {label}
      </label>
    </div>
  </div>
);

const Section: React.FC<{ title: string; children: React.ReactNode; hasContent: boolean }> = ({ title, children, hasContent }) => {
  if (!hasContent) return null;
  return (
    <div className="pt-4 border-t border-gray-200 first-of-type:border-t-0 first-of-type:pt-0">
      <h4 className="text-sm font-semibold text-gray-600 mb-1">{title}</h4>
      <div className="space-y-0">
        {children}
      </div>
    </div>
  );
};

const ProfileContentSelector: React.FC<ProfileContentSelectorProps> = ({ profile, selections, onSelectionChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleToggleSet = (key: keyof Omit<IncludedProfileSelections, 'summary' | 'additionalInformation' | 'customSectionItemIds' | 'customSectionIds'>, id: string) => {
    onSelectionChange(prev => {
      const newSet = new Set((prev[key] as Set<string>));
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return { ...prev, [key]: newSet };
    });
  };

  const handleToggleBool = (key: 'summary' | 'additionalInformation') => {
    onSelectionChange(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleToggleCustomSection = (sectionId: string) => {
    onSelectionChange(prev => {
      const newSectionIds = new Set(prev.customSectionIds);
      const newItems = { ...prev.customSectionItemIds };
      const section = profile.customSections.find(cs => cs.id === sectionId);
      if (!section) return prev;
      
      const isCurrentlySelected = newSectionIds.has(sectionId);
      if (isCurrentlySelected) {
        newSectionIds.delete(sectionId);
        newItems[sectionId] = new Set();
      } else {
        newSectionIds.add(sectionId);
        newItems[sectionId] = new Set(section.items.map(i => i.id));
      }
      return { ...prev, customSectionIds: newSectionIds, customSectionItemIds: newItems };
    });
  };
  
  const handleToggleCustomSectionItem = (sectionId: string, itemId: string) => {
    onSelectionChange(prev => {
      const newSectionIds = new Set(prev.customSectionIds);
      const newItems = { ...prev.customSectionItemIds };
      const sectionItems = new Set(newItems[sectionId] || []);
      
      if (sectionItems.has(itemId)) {
        sectionItems.delete(itemId);
      } else {
        sectionItems.add(itemId);
      }
      newItems[sectionId] = sectionItems;
      
      const section = profile.customSections.find(cs => cs.id === sectionId);
      if (section && sectionItems.size === section.items.length) {
        newSectionIds.add(sectionId);
      } else {
        newSectionIds.delete(sectionId);
      }
      return { ...prev, customSectionIds: newSectionIds, customSectionItemIds: newItems };
    });
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg">
      <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsCollapsed(!isCollapsed)}>
        <h2 className="text-xl font-bold text-neutral border-b pb-4 mb-0 flex-grow">Include in Generation</h2>
        <button className="p-2 rounded-full hover:bg-gray-100 flex-shrink-0 ml-4" aria-label={isCollapsed ? 'Expand content selector' : 'Collapse content selector'}>
          <ArrowIcon collapsed={isCollapsed} />
        </button>
      </div>

      <div className={`transition-all duration-500 ease-in-out overflow-auto ${isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[500px] opacity-100 mt-4'}`}>
        <p className="text-sm text-gray-500 mb-4">Uncheck any items you wish to exclude from this generation.</p>
        <div className="space-y-4">

          <Section title="General" hasContent={!!profile.summary || !!profile.additionalInformation}>
            {!!profile.summary && <CheckboxItem label="Professional Summary" checked={selections.summary} onChange={() => handleToggleBool('summary')} />}
            {!!profile.additionalInformation && <CheckboxItem label="Additional Information" checked={selections.additionalInformation} onChange={() => handleToggleBool('additionalInformation')} />}
          </Section>

          <Section title="Experience" hasContent={profile.experience.length > 0}>
            {profile.experience.map(item => <CheckboxItem key={item.id} label={<>{item.title} <span className="text-gray-500">at {item.company}</span></>} checked={selections.experienceIds.has(item.id)} onChange={() => handleToggleSet('experienceIds', item.id)} />)}
          </Section>

          <Section title="Education" hasContent={profile.education.length > 0}>
            {profile.education.map(item => <CheckboxItem key={item.id} label={<>{item.degree} <span className="text-gray-500">at {item.institution}</span></>} checked={selections.educationIds.has(item.id)} onChange={() => handleToggleSet('educationIds', item.id)} />)}
          </Section>

          <Section title="Projects" hasContent={profile.projects.length > 0}>
            {profile.projects.map(item => <CheckboxItem key={item.id} label={item.name} checked={selections.projectIds.has(item.id)} onChange={() => handleToggleSet('projectIds', item.id)} />)}
          </Section>

          <Section title="Technical Skills" hasContent={profile.technicalSkills.length > 0}>
            {profile.technicalSkills.map(item => <CheckboxItem key={item.id} label={item.name} checked={selections.technicalSkillIds.has(item.id)} onChange={() => handleToggleSet('technicalSkillIds', item.id)} />)}
          </Section>

          <Section title="Soft Skills" hasContent={profile.softSkills.length > 0}>
            {profile.softSkills.map(item => <CheckboxItem key={item.id} label={item.name} checked={selections.softSkillIds.has(item.id)} onChange={() => handleToggleSet('softSkillIds', item.id)} />)}
          </Section>

          <Section title="Tools & Technologies" hasContent={profile.tools.length > 0}>
            {profile.tools.map(item => <CheckboxItem key={item.id} label={item.name} checked={selections.toolIds.has(item.id)} onChange={() => handleToggleSet('toolIds', item.id)} />)}
          </Section>

          <Section title="Languages" hasContent={profile.languages.length > 0}>
            {profile.languages.map(item => <CheckboxItem key={item.id} label={`${item.name} (${item.proficiency})`} checked={selections.languageIds.has(item.id)} onChange={() => handleToggleSet('languageIds', item.id)} />)}
          </Section>

          <Section title="Certifications" hasContent={profile.certifications.length > 0}>
            {profile.certifications.map(item => <CheckboxItem key={item.id} label={item.name} checked={selections.certificationIds.has(item.id)} onChange={() => handleToggleSet('certificationIds', item.id)} />)}
          </Section>

          <Section title="Interests" hasContent={profile.interests.length > 0}>
            {profile.interests.map(item => <CheckboxItem key={item.id} label={item.name} checked={selections.interestIds.has(item.id)} onChange={() => handleToggleSet('interestIds', item.id)} />)}
          </Section>

          <Section title="Custom Sections" hasContent={profile.customSections.length > 0}>
            {profile.customSections.map(section => (
              <div key={section.id} className="py-1">
                <CheckboxItem
                  label={section.title || 'Untitled Section'}
                  checked={selections.customSectionIds.has(section.id)}
                  onChange={() => handleToggleCustomSection(section.id)}
                />
                {section.items.map(item => {
                    const labelText = item.text.length > 50 ? `${item.text.substring(0, 50)}...` : item.text;
                    return (
                        <CheckboxItem
                            key={item.id}
                            label={<span className="text-gray-600 italic">{labelText}</span>}
                            checked={selections.customSectionItemIds[section.id]?.has(item.id) ?? false}
                            onChange={() => handleToggleCustomSectionItem(section.id, item.id)}
                            subItem={true}
                        />
                    );
                })}
              </div>
            ))}
          </Section>

        </div>
      </div>
    </div>
  );
};

export default ProfileContentSelector;