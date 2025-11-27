import React, { useState, useRef, useContext } from 'react';
import { ProfileContext } from '../App';
import AccordionItem from './AccordionItem';
import { XCircleIcon, UploadIcon, CheckIcon } from './Icons';
import Button from './Button';
import Card from './Card';

import { PersonalInfoSection } from './profile/PersonalInfoSection';
import { SummarySection } from './profile/SummarySection';
import { EducationSection } from './profile/EducationSection';
import { ExperienceSection } from './profile/ExperienceSection';
import { ProjectSection } from './profile/ProjectSection';
import { SimpleListSection } from './profile/SimpleListSection';
import { LanguagesSection } from './profile/LanguagesSection';
import { CustomSections } from './profile/CustomSections';
import { AdditionalInfoSection } from './profile/AdditionalInfoSection';

type AccordionSection = 'personal' | 'summary' | 'education' | 'experience' | 'projects' | 'technicalSkills' | 'softSkills' | 'tools' | 'languages' | 'certifications' | 'interests' | 'custom' | 'additional' | null;

const ProfileForm: React.FC = () => {
  const profileContext = useContext(ProfileContext);

  if (!profileContext || !profileContext.profile) {
    return (
      <Card>
        <div className="flex items-center justify-center py-12">
          <div className="animate-pulse text-gray-400">Loading profile...</div>
        </div>
      </Card>
    );
  }

  const { profile, setProfile, saveProfile, lastSavedProfile, isParsing, parsingError, parseResumeInBackground, clearParsingError } = profileContext;

  const [openSections, setOpenSections] = useState<Set<AccordionSection>>(() => new Set(['personal'])); 
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDirty = profile && lastSavedProfile ? JSON.stringify(profile) !== JSON.stringify(lastSavedProfile) : false;

  const handleSave = () => {
    if (saveProfile()) {
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    parseResumeInBackground(file);
  };

  return (
    <>
      <Card padding="lg">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Professional Profile</h2>
            <p className="mt-1 text-sm text-gray-500">
              The AI uses this to create personalized applications.
            </p>
          </div>
          
          <div className="flex-shrink-0">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.txt,.md"
              disabled={isParsing}
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              isLoading={isParsing}
              variant="outline"
              leftIcon={<UploadIcon className="w-4 h-4" />}
            >
              {isParsing ? 'Parsing...' : 'Import Resume'}
            </Button>
            <p className="mt-1.5 text-xs text-gray-400 text-right">PDF, TXT, or MD</p>
          </div>
        </div>
        
        {/* Error State */}
        {parsingError && (
          <div className="mt-4 flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-lg">
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">Upload Error</p>
              <p className="text-sm text-red-600 mt-0.5">{parsingError}</p>
            </div>
            <button 
              onClick={clearParsingError} 
              className="p-1 rounded-md text-red-400 hover:text-red-600 hover:bg-red-100 transition-colors"
            >
              <XCircleIcon className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Accordion Sections */}
        <div className="mt-6 space-y-1">
          <AccordionItem sectionId="personal" title="Personal Info" isOpen={openSections.has('personal')} setIsOpen={() => handleToggle('personal')}>
            <PersonalInfoSection />
          </AccordionItem>

          <AccordionItem sectionId="summary" title="Professional Summary" isOpen={openSections.has('summary')} setIsOpen={() => handleToggle('summary')}>
            <SummarySection />
          </AccordionItem>
          
          <AccordionItem sectionId="experience" title="Work Experience" isOpen={openSections.has('experience')} setIsOpen={() => handleToggle('experience')}>
            <ExperienceSection />
          </AccordionItem>
          
          <AccordionItem sectionId="education" title="Education" isOpen={openSections.has('education')} setIsOpen={() => handleToggle('education')}>
            <EducationSection />
          </AccordionItem>

          <AccordionItem sectionId="projects" title="Projects" isOpen={openSections.has('projects')} setIsOpen={() => handleToggle('projects')}>
            <ProjectSection />
          </AccordionItem>
          
          <AccordionItem sectionId="technicalSkills" title="Technical Skills" isOpen={openSections.has('technicalSkills')} setIsOpen={() => handleToggle('technicalSkills')}>
            <SimpleListSection section="technicalSkills" title="Technical Skill" placeholder="e.g. Python, SQL" />
          </AccordionItem>

          <AccordionItem sectionId="softSkills" title="Soft Skills" isOpen={openSections.has('softSkills')} setIsOpen={() => handleToggle('softSkills')}>
            <SimpleListSection section="softSkills" title="Soft Skill" placeholder="e.g. Communication" />
          </AccordionItem>

          <AccordionItem sectionId="tools" title="Tools & Technologies" isOpen={openSections.has('tools')} setIsOpen={() => handleToggle('tools')}>
            <SimpleListSection section="tools" title="Tool" placeholder="e.g. Git, Figma" />
          </AccordionItem>

          <AccordionItem sectionId="languages" title="Languages" isOpen={openSections.has('languages')} setIsOpen={() => handleToggle('languages')}>
            <LanguagesSection />
          </AccordionItem>

          <AccordionItem sectionId="certifications" title="Certifications" isOpen={openSections.has('certifications')} setIsOpen={() => handleToggle('certifications')}>
            <SimpleListSection section="certifications" title="Certification" placeholder="e.g. AWS Certified" />
          </AccordionItem>
          
          <AccordionItem sectionId="interests" title="Interests" isOpen={openSections.has('interests')} setIsOpen={() => handleToggle('interests')}>
            <SimpleListSection section="interests" title="Interest" placeholder="e.g. Machine Learning" />
          </AccordionItem>

          <AccordionItem sectionId="custom" title="Custom Sections" isOpen={openSections.has('custom')} setIsOpen={() => handleToggle('custom')}>
            <CustomSections />
          </AccordionItem>

          <AccordionItem sectionId="additional" title="Additional Information" isOpen={openSections.has('additional')} setIsOpen={() => handleToggle('additional')}>
            <AdditionalInfoSection />
          </AccordionItem>
        </div>
      </Card>

      {/* Save Bar */}
      {isDirty && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 shadow-lg z-40 animate-fade-up">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-end items-center gap-4">
            <span className="text-sm text-gray-500 hidden sm:block">Unsaved changes</span>
            <Button variant="primary" onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      )}

      {/* Save Confirmation */}
      {showSaveConfirmation && (
        <div className="fixed bottom-6 right-6 flex items-center gap-2 bg-gray-900 text-white py-2.5 px-4 rounded-lg shadow-lg z-50 animate-fade-in">
          <CheckIcon className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Profile saved</span>
        </div>
      )}
    </>
  );
};

export default ProfileForm;
