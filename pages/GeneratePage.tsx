import React, { useState, useContext, useCallback, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ProfileContext } from '../App';
import { fetchJobDescriptionFromUrl } from '../services/geminiService';
import type { GenerationOptions, ProfileData, IncludedProfileSelections } from '../types';
import { templates } from '../components/TemplateSelector';
import { readFileContent } from '../utils';
import ProfileContentSelector from '../components/ProfileContentSelector'; // New component

const ThinkingIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM5 9a1 1 0 011-1h1.757l.38-1.517a1 1 0 011.956-.011L11 8h2a1 1 0 110 2h-1.243l-.38 1.517a1 1 0 01-1.956.011L9 10H7a1 1 0 01-1-1V9z" clipRule="evenodd" />
    </svg>
);

const ArrowIcon: React.FC<{ collapsed: boolean }> = ({ collapsed }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-gray-500 transition-transform duration-300 ${!collapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
);

const XCircleIcon: React.FC<{ className?: string }> = ({ className = "h-5 w-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
);

const QuestionMarkCircleIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 inline-block text-gray-400 align-middle" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const TooltipLabel: React.FC<{ htmlFor: string; text: string; children: React.ReactNode }> = ({ htmlFor, text, children }) => (
  <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 relative group cursor-help">
    {children}
    <QuestionMarkCircleIcon />
    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 bg-gray-800 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 text-center">
      {text}
      <svg className="absolute text-gray-800 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon className="fill-current" points="0,0 127.5,127.5 255,0"/></svg>
    </span>
  </label>
);

const TextAreaSkeleton: React.FC = () => (
  <div className="mt-1 block w-full rounded-md border border-gray-200 bg-white p-3 space-y-3 animate-pulse" style={{ minHeight: '340px' }}>
    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
    <div className="h-4 bg-gray-200 rounded w-full"></div>
    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
    <div className="h-4 bg-gray-200 rounded w-full"></div>
    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
  </div>
);

const ContentAccordion: React.FC<{ title: string, children: React.ReactNode, initiallyOpen?: boolean }> = ({ title, children, initiallyOpen = false }) => {
    const [isOpen, setIsOpen] = useState(initiallyOpen);
    return (
        <div className="border-t border-gray-200 last:border-b-0">
            <button
                className="flex items-center justify-between w-full py-5 font-medium text-left text-gray-600 hover:text-gray-900 focus:outline-none"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="text-lg font-semibold">{title}</span>
                <ArrowIcon collapsed={!isOpen} />
            </button>
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[1500px] pb-5' : 'max-h-0'}`}>
                {children}
            </div>
        </div>
    );
};

const initializeIncludedSelections = (profile: ProfileData): IncludedProfileSelections => {
  const customSectionItemIds: { [sectionId: string]: Set<string> } = {};
  profile.customSections.forEach(cs => {
    customSectionItemIds[cs.id] = new Set(cs.items.map(item => item.id));
  });

  return {
    summary: !!profile.summary,
    additionalInformation: !!profile.additionalInformation,
    educationIds: new Set(profile.education.map(e => e.id)),
    experienceIds: new Set(profile.experience.map(e => e.id)),
    projectIds: new Set(profile.projects.map(p => p.id)),
    technicalSkillIds: new Set(profile.technicalSkills.map(s => s.id)),
    softSkillIds: new Set(profile.softSkills.map(s => s.id)),
    toolIds: new Set(profile.tools.map(t => t.id)),
    languageIds: new Set(profile.languages.map(l => l.id)),
    certificationIds: new Set(profile.certifications.map(c => c.id)),
    interestIds: new Set(profile.interests.map(i => i.id)),
    customSectionIds: new Set(profile.customSections.map(cs => cs.id)),
    customSectionItemIds: customSectionItemIds,
  };
};


const GeneratePage: React.FC = () => {
  const profileContext = useContext(ProfileContext);
  const navigate = useNavigate();

  const { profile } = profileContext!;

  const [options, setOptions] = useState<Omit<GenerationOptions, 'jobDescription' | 'includedProfileSelections'>>({
    generateResume: true,
    generateCoverLetter: true,
    resumeLength: '1 page max',
    includeSummary: true,
    includeCoverLetterSkills: false,
    tone: 50,
    technicality: 50,
    focus: '',
    thinkingMode: false,
    uploadedResume: null,
    uploadedCoverLetter: null,
  });
  
  const [includedProfileSelections, setIncludedProfileSelections] = useState<IncludedProfileSelections>(() => initializeIncludedSelections(profile));

  useEffect(() => {
    setIncludedProfileSelections(initializeIncludedSelections(profile));
  }, [profile]);


  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);

  const [jobUrl, setJobUrl] = useState('');
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isConfigCollapsed, setIsConfigCollapsed] = useState(false);
  const [isGenerationOptionsCollapsed, setIsGenerationOptionsCollapsed] = useState(false);

  const resumeInputRef = useRef<HTMLInputElement>(null);
  const coverLetterInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 20000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (fileError) {
      const timer = setTimeout(() => setFileError(null), 10000);
      return () => clearTimeout(timer);
    }
  }, [fileError]);


  const handleFetchUrl = useCallback(async () => {
    if (!jobUrl) return;
    setIsFetchingUrl(true);
    setError(null);
    try {
      const description = await fetchJobDescriptionFromUrl(jobUrl);
      setJobDescription(description);
    } catch (e: any) {
      setError(e.message || "An unknown error occurred while fetching the URL. Please paste the description manually.");
    } finally {
      setIsFetchingUrl(false);
    }
  }, [jobUrl]);

  const handleGenerate = useCallback(() => {
    if (!profileContext?.profile || !jobDescription) {
      setError('Please provide a job description.');
      return;
    }
    setError(null);
    
    navigate('/generate/results', { 
        state: { 
            profile: profileContext.profile, 
            options: { ...options, jobDescription, includedProfileSelections }, 
            jobDescription 
        } 
    });
  }, [profileContext, jobDescription, options, includedProfileSelections, navigate]);

  const clearFile = (type: 'resume' | 'coverLetter') => {
    if (type === 'resume') {
      setResumeFile(null);
      setOptions(o => ({ ...o, uploadedResume: null }));
    } else {
      setCoverLetterFile(null);
      setOptions(o => ({ ...o, uploadedCoverLetter: null }));
    }
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'resume' | 'coverLetter') => {
    const file = e.target.files?.[0];
    if (!file) {
      setFileError(null);
      return;
    }

    setFileError(null);
    e.target.value = '';

    const MAX_FILE_SIZE_MB = 2;
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setFileError(`File is too large. Please upload a file smaller than ${MAX_FILE_SIZE_MB}MB.`);
      clearFile(type);
      return;
    }
    
    const allowedTypes = ['application/pdf', 'text/plain', 'text/markdown'];
    if (!allowedTypes.includes(file.type)) {
      setFileError(`Unsupported file type: .${file.name.split('.').pop()}. Please use .pdf, .txt, or .md.`);
      clearFile(type);
      return;
    }

    try {
        const content = await readFileContent(file);
        if (type === 'resume') {
            setResumeFile(file);
            setOptions(o => ({ ...o, uploadedResume: content }));
        } else {
            setCoverLetterFile(file);
            setOptions(o => ({ ...o, uploadedCoverLetter: content }));
        }
    } catch (err: any) {
        setFileError(err.message || 'An unexpected error occurred while reading the file. Please try again.');
        clearFile(type);
    }
  };
  
  const selectedResumeTpl = templates.resume.find(t => t.id === profile.selectedResumeTemplate);
  const selectedCoverLetterTpl = templates.coverLetter.find(t => t.id === profile.selectedCoverLetterTemplate);

  const fetchButtonContent = isFetchingUrl ? (
    <>
      <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span>Fetching...</span>
    </>
  ) : (
    <span>Fetch</span>
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        
        {error && (
          <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md relative flex justify-between items-center shadow-md" role="alert">
            <div>
              <p className="font-bold">An error occurred</p>
              <p>{error}</p>
            </div>
            <button onClick={() => setError(null)} className="p-1 rounded-full hover:bg-red-200 transition-colors" aria-label="Close">
              <XCircleIcon className="h-6 w-6" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <main className="lg:col-span-2">
             <div className="bg-white p-8 rounded-2xl shadow-lg">
                <div className="flex justify-between items-start cursor-pointer" onClick={() => setIsConfigCollapsed(!isConfigCollapsed)}>
                    <div>
                        <h1 className="text-3xl font-bold text-neutral">Tailor Your Application</h1>
                        <p className="text-gray-500 mt-2">Start by providing the job details. The AI will use this information to customize your documents.</p>
                    </div>
                     <button className="p-2 rounded-full hover:bg-gray-100 flex-shrink-0 ml-4" aria-label={isConfigCollapsed ? 'Expand configuration' : 'Collapse configuration'}>
                        <ArrowIcon collapsed={isConfigCollapsed} />
                    </button>
                </div>

                <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isConfigCollapsed ? 'max-h-0 opacity-0' : 'max-h-[3000px] opacity-100 mt-6'}`}>
                    <div>
                      <label htmlFor="job-url" className="block text-sm font-medium text-gray-700">
                        Job Posting URL (Optional)
                      </label>
                      <div className="mt-1 flex rounded-md shadow-sm">
                        <input type="url" id="job-url" className="block w-full flex-1 rounded-none rounded-l-md border-gray-300 focus:border-primary focus:ring-primary sm:text-sm disabled:bg-gray-100" placeholder="https://..." value={jobUrl} onChange={(e) => setJobUrl(e.target.value)} disabled={isFetchingUrl} />
                        <button type="button" onClick={handleFetchUrl} disabled={isFetchingUrl || !jobUrl} className="relative -ml-px inline-flex items-center space-x-2 rounded-r-md border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed">
                          {fetchButtonContent}
                        </button>
                      </div>
                    </div>

                    <div className="mt-4">
                      <label htmlFor="job-description" className="block text-sm font-medium text-gray-700">
                        Job Description
                      </label>
                      {isFetchingUrl ? <TextAreaSkeleton /> : (
                        <textarea id="job-description" rows={15} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" placeholder="Paste the full job description here..." value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} />
                      )}
                    </div>

                    <ContentAccordion title="Inspiration Documents (Optional)" initiallyOpen={true}>
                      <p className="text-sm text-gray-600 mb-4">
                        Provide your previous documents to help the AI match your unique style, tone, and formatting. This is highly recommended for best results.
                      </p>
                       <div className="space-y-3">
                            <div>
                                <input type="file" accept=".txt,.md,.pdf" ref={resumeInputRef} onChange={(e) => handleFileChange(e, 'resume')} className="hidden" />
                                {resumeFile ? (
                                    <div className="flex items-center justify-between rounded-md border border-gray-300 bg-gray-50 pl-3 pr-2 py-2 text-sm">
                                        <span className="font-medium text-gray-700 truncate">{resumeFile.name}</span>
                                        <button onClick={() => clearFile('resume')} className="ml-2 text-gray-400 hover:text-gray-600"><XCircleIcon /></button>
                                    </div>
                                ) : (
                                    <div onClick={() => resumeInputRef.current?.click()} className="mt-1 flex justify-center rounded-lg border-2 border-dashed border-gray-300 px-6 py-10 text-center cursor-pointer hover:border-primary">
                                        <div>
                                            <svg className="mx-auto h-12 w-12 text-gray-300" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                                <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12A2.25 2.25 0 0120.25 20.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" />
                                            </svg>
                                            <div className="mt-4 flex text-sm leading-6 text-gray-600">
                                                <span className="font-semibold text-primary">Upload a resume</span>
                                            </div>
                                            <p className="text-xs leading-5 text-gray-600">.txt, .md, .pdf up to 2MB</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                                <div>
                                <input type="file" accept=".txt,.md,.pdf" ref={coverLetterInputRef} onChange={(e) => handleFileChange(e, 'coverLetter')} className="hidden" />
                                {coverLetterFile ? (
                                        <div className="flex items-center justify-between rounded-md border border-gray-300 bg-gray-50 pl-3 pr-2 py-2 text-sm">
                                        <span className="font-medium text-gray-700 truncate">{coverLetterFile.name}</span>
                                        <button onClick={() => clearFile('coverLetter')} className="ml-2 text-gray-400 hover:text-gray-600"><XCircleIcon /></button>
                                    </div>
                                ) : (
                                    <div onClick={() => coverLetterInputRef.current?.click()} className="mt-1 flex justify-center rounded-lg border-2 border-dashed border-gray-300 px-6 py-10 text-center cursor-pointer hover:border-primary">
                                        <div>
                                            <svg className="mx-auto h-12 w-12 text-gray-300" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                                <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12A2.25 2.25 0 0120.25 20.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" />
                                            </svg>
                                            <div className="mt-4 flex text-sm leading-6 text-gray-600">
                                                <span className="font-semibold text-primary">Upload a cover letter</span>
                                            </div>
                                            <p className="text-xs leading-5 text-gray-600">.txt, .md, .pdf up to 2MB</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        {fileError && (
                          <div className="mt-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md relative flex justify-between items-center shadow-md" role="alert">
                            <div>
                              <p className="font-bold">File Error</p>
                              <p>{fileError}</p>
                            </div>
                            <button onClick={() => setFileError(null)} className="p-1 rounded-full hover:bg-red-200 transition-colors" aria-label="Close file error">
                              <XCircleIcon className="h-6 w-6" />
                            </button>
                          </div>
                        )}
                    </ContentAccordion>

                    {options.generateResume && (
                      <ContentAccordion title="Resume Customization" initiallyOpen={true}>
                          <div className="space-y-6">
                              <div className="relative flex items-start">
                                  <div className="flex h-6 items-center">
                                      <input id="summary" type="checkbox" checked={options.includeSummary} onChange={(e) => setOptions(o => ({...o, includeSummary: e.target.checked}))} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                                  </div>
                                  <div className="ml-3 text-sm leading-6">
                                      <label htmlFor="summary" className="font-medium text-gray-900">Include Professional Summary</label>
                                      <p className="text-gray-500">Add a brief, impactful summary at the top of your resume.</p>
                                  </div>
                              </div>
                              <div>
                                  <label htmlFor="resume-length" className="block text-sm font-medium text-gray-700 mb-2">Maximum Resume Length</label>
                                  <select id="resume-length" value={options.resumeLength} onChange={(e) => setOptions(o => ({...o, resumeLength: e.target.value as any}))} className="block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm">
                                      <option value="1 page max">1 Page Max</option>
                                      <option value="2 pages max">2 Pages Max</option>
                                  </select>
                              </div>
                          </div>
                      </ContentAccordion>
                    )}
                    
                    {options.generateCoverLetter && (
                      <ContentAccordion title="Cover Letter Customization" initiallyOpen={true}>
                          <div className="relative flex items-start">
                              <div className="flex h-6 items-center">
                                  <input id="cover-letter-skills" type="checkbox" checked={options.includeCoverLetterSkills} onChange={(e) => setOptions(o => ({...o, includeCoverLetterSkills: e.target.checked}))} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                              </div>
                              <div className="ml-3 text-sm leading-6">
                                  <label htmlFor="cover-letter-skills" className="font-medium text-gray-900">Include Key Skills Section</label>
                                  <p className="text-gray-500">Adds a bulleted list of your most relevant skills to the cover letter.</p>
                                  </div>
                              </div>
                      </ContentAccordion>
                    )}


                    <ContentAccordion title="Style & Tone" initiallyOpen={true}>
                         <div className="space-y-6">
                            <div>
                              <TooltipLabel htmlFor="tone-slider" text="Controls the personality of the generated content, ranging from formal to personal. Formal is ideal for corporate roles, while personal suits creative fields or startups.">
                                Application Tone
                              </TooltipLabel>
                              <div className="flex items-center space-x-4 mt-2">
                                <span className="text-xs text-gray-500">Formal</span>
                                <input id="tone-slider" type="range" min="0" max="100" value={options.tone} onChange={(e) => setOptions(o => ({...o, tone: Number(e.target.value)}))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary" />
                                <span className="text-xs text-gray-500">Personal</span>
                              </div>
                            </div>
                             <div>
                              <TooltipLabel htmlFor="technicality-slider" text="Controls the technicality of the language, ranging from jargon-filled to general. Use 'Technical' for expert audiences and 'General' for non-technical roles.">
                                Language Style
                              </TooltipLabel>
                              <div className="flex items-center space-x-4 mt-2">
                                <span className="text-xs text-gray-500">Technical</span>
                                <input id="technicality-slider" type="range" min="0" max="100" value={options.technicality} onChange={(e) => setOptions(o => ({...o, technicality: Number(e.target.value)}))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary" />
                                <span className="text-xs text-gray-500">General</span>
                              </div>
                            </div>
                            <div>
                              <TooltipLabel htmlFor="focus" text="Specify keywords or key phrases you want the AI to strongly emphasize and highlight throughout your resume and cover letter.">
                                Personalization Focus (Keywords to Emphasize)
                              </TooltipLabel>
                              <textarea id="focus" value={options.focus} onChange={(e) => setOptions(o => ({...o, focus: e.target.value}))} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" placeholder="e.g., 'customer success, SaaS sales, account management' or 'React, Node.js, AWS, Agile methodologies'" />
                            </div>
                        </div>
                    </ContentAccordion>
                    
                    <ContentAccordion title="Advanced Generation Settings" initiallyOpen={true}>
                        <div className="flex items-center justify-between bg-purple-50 p-3 rounded-lg border border-purple-200">
                            <div className="pr-4">
                                <TooltipLabel
                                htmlFor="thinking-mode"
                                text="Activates a more advanced AI model (gemini-2.5-pro) that excels at complex reasoning. This produces higher-quality, more nuanced documents but will take noticeably longer to generate."
                                >
                                <div className="flex items-center text-gray-800 font-medium">
                                    <ThinkingIcon />
                                    Thinking Mode
                                </div>
                                </TooltipLabel>
                                <p id="thinking-mode-description" className="text-xs text-gray-600">Ideal for senior roles or competitive applications where quality is paramount.</p>
                            </div>
                            <div className="flex-shrink-0">
                                <label htmlFor="thinking-mode" className="inline-flex relative items-center cursor-pointer">
                                <input type="checkbox" id="thinking-mode" className="sr-only peer" checked={options.thinkingMode} onChange={(e) => setOptions(o => ({ ...o, thinkingMode: e.target.checked }))} aria-describedby="thinking-mode-description" />
                                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-offset-2 peer-focus:ring-offset-purple-50 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                </label>
                            </div>
                        </div>
                    </ContentAccordion>
                </div>
            </div>
            
          </main>
          
          <aside className="lg:col-span-1 sticky top-24 space-y-6">
            <div className="w-full">
                <button onClick={handleGenerate} disabled={!jobDescription} className="w-full inline-flex justify-center items-center rounded-md border border-transparent bg-primary py-3 px-8 text-base font-medium text-white shadow-sm hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all transform hover:scale-105">
                {'Generate Documents'}
                </button>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsGenerationOptionsCollapsed(!isGenerationOptionsCollapsed)}>
                    <h2 className="text-xl font-bold text-neutral border-b pb-4 mb-0 flex-grow">Generation Options</h2>
                    <button className="p-2 rounded-full hover:bg-gray-100 flex-shrink-0 ml-4" aria-label={isGenerationOptionsCollapsed ? 'Expand generation options' : 'Collapse generation options'}>
                        <ArrowIcon collapsed={isGenerationOptionsCollapsed} />
                    </button>
                </div>
                
                <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isGenerationOptionsCollapsed ? 'max-h-0 opacity-0' : 'max-h-[2000px] opacity-100 mt-4'}`}>
                    <div className="py-4 space-y-4">
                        <div className="flex items-center">
                            <input id="resume" type="checkbox" checked={options.generateResume} onChange={(e) => setOptions(o => ({...o, generateResume: e.target.checked}))} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                            <label htmlFor="resume" className="ml-3 block text-sm font-medium text-gray-900">Create Resume</label>
                        </div>

                        <div className="flex items-center pt-2 border-t border-gray-100">
                            <input id="coverLetter" type="checkbox" checked={options.generateCoverLetter} onChange={(e) => setOptions(o => ({...o, generateCoverLetter: e.target.checked}))} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                            <label htmlFor="coverLetter" className="ml-3 block text-sm font-medium text-gray-900">Create Cover Letter</label>
                        </div>

                        {(options.generateResume || options.generateCoverLetter) && (
                            <div className="pt-4 border-t border-gray-100">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Selected Templates</label>
                                <p className="text-xs text-gray-500 mb-2">Templates can be changed on the <Link to="/" className="text-primary hover:underline font-medium">homepage</Link>.</p>
                                <div className="grid grid-cols-2 gap-4">
                                    {options.generateResume && selectedResumeTpl && (
                                        <div>
                                            <div className="block w-full rounded border-2 border-gray-300 shadow-sm">
                                                <img src={selectedResumeTpl.imageUrl.replace('200x280', '80x112')} alt={selectedResumeTpl.name} className="w-full h-auto" />
                                            </div>
                                        </div>
                                    )}
                                    {options.generateCoverLetter && selectedCoverLetterTpl && (
                                    <div>
                                            <div className="block w-full rounded border-2 border-gray-300 shadow-sm">
                                                <img src={selectedCoverLetterTpl.imageUrl.replace('200x280', '80x112')} alt={selectedCoverLetterTpl.name} className="w-full h-auto" />
                                            </div>
                                    </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <ProfileContentSelector 
                        profile={profile}
                        includedSelections={includedProfileSelections}
                        setIncludedSelections={setIncludedProfileSelections}
                    />

                </div>
            </div>
          </aside>
        </div>
    </div>
  );
};

export default GeneratePage;
