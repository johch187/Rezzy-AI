import React, { useState, useEffect, useRef, useContext } from 'react';
import { importAndParseResume } from '../services/parserService';
import { ProfileContext } from '../App';
import AccordionItem from './AccordionItem';
import { XCircleIcon, LoadingSpinnerIcon, UploadIcon } from './Icons';
import type { ProfileData } from '../types';

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

  if (!profileContext) {
    return <div>Loading profile editor...</div>;
  }

  const { profile, setProfile, saveProfile, lastSavedProfile } = profileContext;

  const [openSections, setOpenSections] = useState<Set<AccordionSection>>(() => new Set(['personal'])); 
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [isAutofilling, setIsAutofilling] = useState(false);
  const [parsingError, setParsingError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDirty = JSON.stringify(profile) !== JSON.stringify(lastSavedProfile);

  useEffect(() => {
    if (parsingError) {
        const timer = setTimeout(() => setParsingError(null), 10000);
        return () => clearTimeout(timer);
    }
  }, [parsingError]);

  const handleSave = () => {
    if (saveProfile(profile)) {
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParsingError(null);
    setIsAutofilling(true);
    e.target.value = ''; // Clear the input so the same file can be re-uploaded if needed

    const MAX_FILE_SIZE_MB = 2;
    const ALLOWED_MIME_TYPES = ['application/pdf', 'text/plain', 'text/markdown'];
    const ALLOWED_EXTENSIONS = ['.pdf', '.txt', '.md'];

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setParsingError(`File too large: Please upload a file smaller than ${MAX_FILE_SIZE_MB}MB.`);
      setIsAutofilling(false);
      return;
    }

    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    if (!ALLOWED_MIME_TYPES.includes(file.type) && !ALLOWED_EXTENSIONS.includes(fileExtension)) {
      setParsingError(`Unsupported file type: '${fileExtension}'. Please upload a PDF, TXT, or MD file.`);
      setIsAutofilling(false);
      return;
    }

    try {
        const parsedData = await importAndParseResume(file);
        
        const blankProfileContent: Partial<ProfileData> = {
            fullName: '', jobTitle: '', email: '', phone: '', website: '', location: '',
            linkedin: '', github: '', summary: '', education: [], experience: [],
            projects: [], technicalSkills: [], softSkills: [], tools: [],
            languages: [], certifications: [], interests: [], customSections: [],
            additionalInformation: '', industry: '', experienceLevel: 'entry', vibe: ''
        };

        const newProfile = { ...profile, ...blankProfileContent, ...parsedData };
        setProfile(newProfile);
        saveProfile(newProfile);

        setOpenSections(prevOpenSections => {
            const newOpenSections = new Set(prevOpenSections);
            newOpenSections.add('personal');
            if (parsedData.summary?.trim()) newOpenSections.add('summary');
            if (parsedData.experience?.length) newOpenSections.add('experience');
            if (parsedData.education?.length) newOpenSections.add('education');
            if (parsedData.projects?.length) newOpenSections.add('projects');
            if (parsedData.technicalSkills?.length) newOpenSections.add('technicalSkills');
            if (parsedData.softSkills?.length) newOpenSections.add('softSkills');
            if (parsedData.tools?.length) newOpenSections.add('tools');
            if (parsedData.languages?.length) newOpenSections.add('languages');
            if (parsedData.certifications?.length) newOpenSections.add('certifications');
            if (parsedData.interests?.length) newOpenSections.add('interests');
            return newOpenSections;
        });

    } catch (err: any) {
        setParsingError(err.message || "An unexpected error occurred during parsing.");
    } finally {
        setIsAutofilling(false);
    }
  };

  return (
    <>
    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-200">
      <div className="border-b border-gray-200 pb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h2 className="text-2xl font-bold text-neutral">Your Professional Profile</h2>
            <p className="mt-1 text-gray-500">This is the core information the AI will use to build your applications.</p>
          </div>
          <div className="text-right flex-shrink-0">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.txt,.md"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isAutofilling}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-md text-white bg-secondary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isAutofilling ? (
                <>
                  <LoadingSpinnerIcon className="h-5 w-5 mr-2" />
                  Parsing Resume...
                </>
              ) : (
                <>
                  <UploadIcon />
                  Import from Resume
                </>
              )}
            </button>
            <p className="mt-2 text-xs text-gray-500">.pdf, .txt, or .md accepted</p>
          </div>
        </div>
        
        {parsingError && (
          <div className="mt-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md relative flex justify-between items-center shadow-md" role="alert">
            <div>
              <p className="font-bold">File Upload Error</p>
              <p>{parsingError}</p>
            </div>
            <button onClick={() => setParsingError(null)} className="p-1 rounded-full hover:bg-red-200 transition-colors" aria-label="Close file error">
              <XCircleIcon className="h-6 w-6" />
            </button>
          </div>
        )}
      </div>

      <div className="mt-6">
        <div className="space-y-2">
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
              <SimpleListSection
                section="technicalSkills" 
                title="Technical Skill" 
                placeholder="Python, SQL, Financial Modeling" 
              />
            </AccordionItem>

            <AccordionItem sectionId="softSkills" title="Soft Skills" isOpen={openSections.has('softSkills')} setIsOpen={() => handleToggle('softSkills')}>
              <SimpleListSection
                section="softSkills" 
                title="Soft Skill" 
                placeholder="Team Collaboration" 
              />
            </AccordionItem>

            <AccordionItem sectionId="tools" title="Tools & Technologies" isOpen={openSections.has('tools')} setIsOpen={() => handleToggle('tools')}>
              <SimpleListSection
                section="tools" 
                title="Tool/Technology" 
                placeholder="Git, Bloomberg Terminal, Salesforce" 
              />
            </AccordionItem>

            <AccordionItem sectionId="languages" title="Languages" isOpen={openSections.has('languages')} setIsOpen={() => handleToggle('languages')}>
              <LanguagesSection />
            </AccordionItem>

             <AccordionItem sectionId="certifications" title="Certifications" isOpen={openSections.has('certifications')} setIsOpen={() => handleToggle('certifications')}>
              <SimpleListSection
                section="certifications" 
                title="Certification" 
                placeholder="CFA Level II, AWS Certified" 
              />
            </AccordionItem>
            
             <AccordionItem sectionId="interests" title="Interests" isOpen={openSections.has('interests')} setIsOpen={() => handleToggle('interests')}>
              <SimpleListSection
                section="interests" 
                title="Interest" 
                placeholder="Market Analysis, Volunteer Tutoring" 
              />
            </AccordionItem>

            <AccordionItem sectionId="custom" title="Custom Sections" isOpen={openSections.has('custom')} setIsOpen={() => handleToggle('custom')}>
              <CustomSections />
            </AccordionItem>

            <AccordionItem sectionId="additional" title="Additional Information" isOpen={openSections.has('additional')} setIsOpen={() => handleToggle('additional')}>
              <AdditionalInfoSection />
            </AccordionItem>
          </div>
      </div>
    </div>

    {isDirty && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm p-4 border-t border-gray-200 shadow-lg z-40 animate-slide-in-up">
            <div className="mx-auto flex justify-end items-center px-4 sm:px-6 lg:px-8">
                <p className="text-gray-600 mr-4 hidden sm:block">You have unsaved changes.</p>
                <button
                    onClick={handleSave}
                    className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-lg shadow-md text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                    Save Changes
                </button>
            </div>
        </div>
    )}

    {showSaveConfirmation && (
        <div className="fixed bottom-6 right-6 bg-green-500 text-white py-2 px-4 rounded-lg shadow-lg z-50 animate-fade-in" role="status">
            Profile Saved!
        </div>
    )}
    </>
  );
};

export default ProfileForm;
