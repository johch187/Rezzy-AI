import React, { useState, useContext, useCallback, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ProfileContext } from '../App';
import { generateTailoredDocuments } from '../services/actions/documentActions';
import { fetchJobDescriptionFromUrl } from '../services/scrapingService';
import { parseGeneratedCoverLetter, parseGeneratedResume } from '../services/parserService';
import type { GenerationOptions, ProfileData, IncludedProfileSelections, ParsedCoverLetter, ApplicationAnalysisResult } from '../types';
import { templates } from '../components/TemplateSelector';
import { readFileContent } from '../utils';
import { ThinkingIcon, XCircleIcon, LoadingSpinnerIcon } from '../components/Icons';
import ContentAccordion from '../components/ContentAccordion';
import TemplateSelector from '../components/TemplateSelector';
import ProfileContentSelector from '../components/ProfileContentSelector';
import Tooltip from '../components/Tooltip';
import Card from '../components/Card';

const TextAreaSkeleton: React.FC = () => (
  <div className="mt-1 block w-full rounded-md border border-gray-200 bg-white p-3 space-y-3 animate-pulse" style={{ minHeight: '340px' }}>
    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
    <div className="h-4 bg-gray-200 rounded w-full"></div>
    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
    <div className="h-4 bg-gray-200 rounded w-full"></div>
    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
  </div>
);

const GeneratePage: React.FC = () => {
  const profileContext = useContext(ProfileContext);
  const location = useLocation();

  const { profile, tokens, setTokens, isFetchingUrl, setIsFetchingUrl, addDocumentToHistory, backgroundTasks, startBackgroundTask, updateBackgroundTask } = profileContext!;
  
  const { jobDescription: initialJobDescription } = (location.state as { jobDescription?: string }) || {};

  const [options, setOptions] = useState<Omit<GenerationOptions, 'jobDescription'>>({
    generateResume: true,
    generateCoverLetter: true,
    resumeLength: '1 page max',
    coverLetterLength: 'medium',
    includeSummary: true,
    tone: 'persuasive',
    technicality: 50,
    thinkingMode: false,
    uploadedResume: null,
    uploadedCoverLetter: null,
  });
  
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);

  const [jobUrl, setJobUrl] = useState('');
  const [jobDescription, setJobDescription] = useState(initialJobDescription || '');
  const [error, setError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  
  const [includedProfileSelections, setIncludedProfileSelections] = useState<IncludedProfileSelections>({
    summary: true,
    additionalInformation: true,
    educationIds: new Set(),
    experienceIds: new Set(),
    projectIds: new Set(),
    technicalSkillIds: new Set(),
    softSkillIds: new Set(),
    toolIds: new Set(),
    languageIds: new Set(),
    certificationIds: new Set(),
    interestIds: new Set(),
    customSectionIds: new Set(),
    customSectionItemIds: {},
  });

  const resumeInputRef = useRef<HTMLInputElement>(null);
  const coverLetterInputRef = useRef<HTMLInputElement>(null);

  const isGenerating = backgroundTasks.some(t => t.type === 'document-generation' && t.status === 'running');
  
  useEffect(() => {
    if (!profile) return;
    const allSelections: IncludedProfileSelections = {
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
      customSectionItemIds: profile.customSections.reduce((acc, section) => {
        acc[section.id] = new Set(section.items.map(item => item.id));
        return acc;
      }, {} as { [sectionId: string]: Set<string> }),
    };
    setIncludedProfileSelections(allSelections);
  }, [profile]);


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
  }, [jobUrl, setIsFetchingUrl]);

  const handleGenerate = useCallback(() => {
    if (!profileContext?.profile || !jobDescription) {
      setError('Please provide a job description.');
      return;
    }
    
    const baseDocsCost = (options.generateResume ? 1 : 0) + (options.generateCoverLetter ? 1 : 0);
    const thinkingModeCost = options.thinkingMode && baseDocsCost > 0 ? 10 : 0;
    const analysisCost = (jobDescription.trim() && (options.generateResume || options.uploadedResume)) ? 2 : 0;
    const generationCost = baseDocsCost + thinkingModeCost + analysisCost;

    if (tokens < generationCost) {
        setError('You do not have enough tokens to generate these documents.');
        return;
    }
    
    setError(null);
    setTokens(prev => prev - generationCost);
    
    const taskId = startBackgroundTask({
      type: 'document-generation',
      description: `Documents for ${profile.targetJobTitle || 'Untitled Role'}`,
    });

    (async () => {
      try {
          const { profile } = profileContext;
          const filteredProfile: ProfileData = {
            ...profile,
            summary: includedProfileSelections.summary ? profile.summary : '',
            additionalInformation: includedProfileSelections.additionalInformation ? profile.additionalInformation : '',
            education: profile.education.filter(e => includedProfileSelections.educationIds.has(e.id)),
            experience: profile.experience.filter(e => includedProfileSelections.experienceIds.has(e.id)),
            projects: profile.projects.filter(p => includedProfileSelections.projectIds.has(p.id)),
            technicalSkills: profile.technicalSkills.filter(s => includedProfileSelections.technicalSkillIds.has(s.id)),
            softSkills: profile.softSkills.filter(s => includedProfileSelections.softSkillIds.has(s.id)),
            tools: profile.tools.filter(t => includedProfileSelections.toolIds.has(t.id)),
            languages: profile.languages.filter(l => includedProfileSelections.languageIds.has(l.id)),
            certifications: profile.certifications.filter(c => includedProfileSelections.certificationIds.has(c.id)),
            interests: profile.interests.filter(i => includedProfileSelections.interestIds.has(i.id)),
            customSections: profile.customSections
              .map(cs => ({
                ...cs,
                items: cs.items.filter(item => includedProfileSelections.customSectionItemIds[cs.id]?.has(item.id)),
              }))
              .filter(cs => cs.items.length > 0),
          };

          const generationOptions = { ...options, jobDescription };
          const result = await generateTailoredDocuments(filteredProfile, generationOptions);
          
          if (!result.documents.resume && !result.documents.coverLetter) {
              throw new Error("The AI was unable to generate documents based on the provided information. This can sometimes happen with very complex job descriptions or if the input is too short. Please try again with a more detailed job description.");
          }
          
          let parsedResume: Partial<ProfileData> | null = null;
          let parsedCoverLetter: ParsedCoverLetter | null = null;

          if (result.documents.resume) {
              try {
                  parsedResume = await parseGeneratedResume(result.documents.resume);
              } catch (e) {
                  console.warn("Failed to parse generated resume into form. Falling back to raw text.", e);
              }
          }
          if (result.documents.coverLetter) {
              try {
                  parsedCoverLetter = await parseGeneratedCoverLetter(result.documents.coverLetter);
              } catch (e) {
                  console.warn("Failed to parse generated cover letter into form. Falling back to raw text.", e);
              }
          }

          if (result.documents.resume || result.documents.coverLetter) {
            addDocumentToHistory({
              jobTitle: profile.targetJobTitle || 'Untitled Role',
              companyName: profile.companyName || '',
              resumeContent: result.documents.resume,
              coverLetterContent: result.documents.coverLetter,
              analysisResult: result.analysis,
              parsedResume,
              parsedCoverLetter,
            });
          }
          
          const finalResultPayload = { 
              generatedContent: result.documents,
              analysisResult: result.analysis,
              parsedResume,
              parsedCoverLetter,
          };
          updateBackgroundTask(taskId, { status: 'completed', result: finalResultPayload });

      } catch (e: any) {
          setTokens(prev => prev + generationCost); // Refund tokens on failure
          updateBackgroundTask(taskId, { status: 'error', result: { message: e.message || 'An unexpected generation error occurred.' } });
      }
    })();
  }, [profileContext, jobDescription, options, includedProfileSelections, tokens, setTokens, addDocumentToHistory, startBackgroundTask, updateBackgroundTask]);

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
      <LoadingSpinnerIcon className="-ml-1 mr-3 h-5 w-5" />
      <span>Fetching...</span>
    </>
  ) : (
    <span>Fetch</span>
  );
  
  const baseDocsCost = (options.generateResume ? 1 : 0) + (options.generateCoverLetter ? 1 : 0);
  const thinkingModeCost = options.thinkingMode && baseDocsCost > 0 ? 10 : 0;
  const analysisCost = (jobDescription.trim() && (options.generateResume || options.uploadedResume)) ? 2 : 0;
  const generationCost = baseDocsCost + thinkingModeCost + analysisCost;
  
  const hasEnoughTokens = tokens >= generationCost;
  const canGenerate = jobDescription && hasEnoughTokens && baseDocsCost > 0 && !isGenerating;

  let buttonContent;
    if (isGenerating) {
        buttonContent = (
            <div className="flex items-center justify-center">
                <LoadingSpinnerIcon className="h-6 w-6 mr-3" />
                <span className="text-lg font-bold">Generating...</span>
            </div>
        );
  } else if (baseDocsCost === 0) {
      buttonContent = (
          <div className="text-center">
              <span className="block text-base font-bold">Select a Document</span>
              <span className="block text-xs font-medium text-blue-200 mt-1">Check a box to generate.</span>
          </div>
      );
  } else if (!hasEnoughTokens) {
      buttonContent = (
          <div className="text-center">
              <span className="block text-base font-bold">Insufficient Tokens</span>
              <Link to="/subscription" className="block text-xs font-medium text-white underline mt-1">Purchase More</Link>
          </div>
      );
  } else {
      buttonContent = (
          <div className="text-center">
              <span className="block text-lg font-bold">Generate Document{baseDocsCost > 1 ? 's' : ''}</span>
              <span className="block text-sm font-medium text-blue-200 mt-1">
                {generationCost} Token{generationCost > 1 ? 's' : ''} Cost
                {analysisCost > 0 && " (incl. Fit Analysis)"}
              </span>
          </div>
      );
  }

  const generateButton = (
    <button 
        onClick={handleGenerate} 
        disabled={!canGenerate} 
        className="w-full inline-flex justify-center items-center rounded-lg border border-transparent bg-primary py-4 px-6 text-white shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none transition-all transform hover:-translate-y-1 disabled:hover:translate-y-0"
    >
      {buttonContent}
    </button>
  );

  return (
    <>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            
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
            <main className="lg:col-span-2 space-y-8">
                <Card>
                    <div>
                        <h1 className="text-3xl font-bold text-neutral">Tailor Your Application</h1>
                        <p className="text-gray-500 mt-2">Start by providing the job details. The AI will use this information to customize your documents.</p>
                    </div>

                    <div className="mt-6">
                        <label htmlFor="job-url" className="block text-sm font-medium text-gray-700">
                            Job Posting URL (Optional)
                        </label>
                        <div className="mt-1 flex rounded-md shadow-sm">
                            <input type="url" id="job-url" className="block w-full flex-1 rounded-none rounded-l-md border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm disabled:bg-gray-100" placeholder="https://..." value={jobUrl} onChange={(e) => setJobUrl(e.target.value)} disabled={isFetchingUrl} />
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
                            <textarea id="job-description" rows={15} className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm" placeholder="Paste the full job description here..." value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} />
                        )}
                    </div>
                </Card>

                <Card>
                    <ContentAccordion title="Inspiration Documents (Optional)" initiallyOpen={true}>
                    <p className="text-sm text-gray-600 mb-4">
                        Provide your previous documents to help the AI match your unique style, tone, and formatting. This is highly recommended for best results.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <input type="file" accept=".txt,.md,.pdf" ref={resumeInputRef} onChange={(e) => handleFileChange(e, 'resume')} className="hidden" />
                                {resumeFile ? (
                                    <div className="flex items-center justify-between rounded-md border border-gray-300 bg-gray-50 pl-3 pr-2 py-2 text-sm">
                                        <span className="font-medium text-gray-700 truncate">{resumeFile.name}</span>
                                        <button onClick={() => clearFile('resume')} className="ml-2 text-gray-400 hover:text-gray-600"><XCircleIcon /></button>
                                    </div>
                                ) : (
                                    <div onClick={() => resumeInputRef.current?.click()} className="flex h-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300 px-6 py-4 text-center cursor-pointer hover:border-primary">
                                        <div>
                                            <svg className="mx-auto h-12 w-12 text-gray-300" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                                <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12A2.25 2.25 0 0120.25 20.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" />
                                            </svg>
                                            <div className="mt-4 flex justify-center text-sm leading-6 text-gray-600">
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
                                    <div onClick={() => coverLetterInputRef.current?.click()} className="flex h-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300 px-6 py-4 text-center cursor-pointer hover:border-primary">
                                        <div>
                                            <svg className="mx-auto h-12 w-12 text-gray-300" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                                <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12A2.25 2.25 0 0120.25 20.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" />
                                            </svg>
                                            <div className="mt-4 flex justify-center text-sm leading-6 text-gray-600">
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

                    <ContentAccordion title="Templates" initiallyOpen={false}>
                        <p className="text-sm text-gray-600 mb-4">
                            Select the templates you'd like to use for your generated documents. Double-click any template to see a larger preview.
                        </p>
                        <TemplateSelector />
                    </ContentAccordion>

                    <ContentAccordion title="Style & Tone" initiallyOpen={false}>
                        <div className="space-y-6">
                            <div>
                            <label htmlFor="tone-selector" className="block text-sm font-medium text-gray-700">
                                <Tooltip text="Select the overall tone for your documents. 'Formal' is traditional and corporate. 'Friendly' is approachable and modern. 'Persuasive' is confident and action-oriented.">
                                    Application Tone
                                </Tooltip>
                            </label>
                            <select 
                                id="tone-selector" 
                                value={options.tone} 
                                onChange={(e) => setOptions(o => ({...o, tone: e.target.value as any}))} 
                                className="mt-2 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm"
                            >
                                <option value="formal">Formal</option>
                                <option value="friendly">Friendly</option>
                                <option value="persuasive">Persuasive</option>
                            </select>
                            </div>
                            <div>
                            <label htmlFor="technicality-slider" className="block text-sm font-medium text-gray-700">
                                <Tooltip text="Controls the technicality of the language, ranging from jargon-filled to general. Use 'General' for non-technical roles and 'Technical' for expert audiences.">
                                    Language Style
                                </Tooltip>
                            </label>
                            <div className="flex items-center space-x-4 mt-2">
                                <span className="text-xs text-gray-500">General</span>
                                <input id="technicality-slider" type="range" min="0" max="100" value={options.technicality} onChange={(e) => setOptions(o => ({...o, technicality: Number(e.target.value)}))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary" />
                                <span className="text-xs text-gray-500">Technical</span>
                            </div>
                            </div>
                        </div>
                    </ContentAccordion>
                    
                    <ContentAccordion title="Advanced Generation Settings" initiallyOpen={false}>
                        <div className="flex items-center justify-between bg-purple-50 p-3 rounded-lg border border-purple-200">
                            <div className="pr-4">
                                <label htmlFor="thinking-mode" className="block text-sm font-medium text-gray-700">
                                    <Tooltip
                                    text="Activates enhanced reasoning (Thinking Budget). Ideal for complex tasks, enabling the model to think extensively before generating. Produces higher-quality, more nuanced documents, but takes noticeably longer."
                                    >
                                    <div className="flex items-center text-gray-800 font-medium">
                                        <ThinkingIcon />
                                        Thinking Mode
                                    </div>
                                    </Tooltip>
                                </label>
                                <p id="thinking-mode-description" className="text-xs text-gray-600">Ideal for senior roles or competitive applications where quality is paramount.</p>
                            </div>
                            <div className="flex-shrink-0 flex items-center space-x-3">
                                <span className="text-sm font-bold text-purple-700 bg-purple-200 px-2.5 py-1 rounded-full">
                                    +10 Tokens
                                </span>
                                <label htmlFor="thinking-mode" className="inline-flex relative items-center cursor-pointer">
                                <input type="checkbox" id="thinking-mode" className="sr-only peer" checked={options.thinkingMode} onChange={(e) => setOptions(o => ({ ...o, thinkingMode: e.target.checked }))} aria-describedby="thinking-mode-description" />
                                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-offset-2 peer-focus:ring-offset-purple-50 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                </label>
                            </div>
                        </div>
                    </ContentAccordion>
                </Card>
                <div className="mt-6 lg:hidden">
                {generateButton}
                </div>
            </main>
            
            <aside className="lg:col-span-1 sticky top-24 space-y-8">
                <div className="w-full hidden lg:block">
                    {generateButton}
                </div>

                <Card>
                    <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                        <h2 className="text-xl font-bold text-neutral">Generation Options</h2>
                    </div>
                    
                    <div className="py-4 space-y-6">
                        <div>
                            <div className="flex items-center">
                                <input id="resume" type="checkbox" checked={options.generateResume} onChange={(e) => setOptions(o => ({...o, generateResume: e.target.checked}))} className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary" />
                                <label htmlFor="resume" className="ml-3 block text-base font-semibold text-gray-900">
                                    Create Resume
                                </label>
                            </div>
                            <div className={`pl-8 mt-4 space-y-4 transition-opacity ${!options.generateResume ? 'opacity-50' : 'opacity-100'}`}>
                                <div className="relative flex items-start">
                                    <div className="flex h-6 items-center">
                                        <input id="summary" type="checkbox" checked={options.includeSummary} onChange={(e) => setOptions(o => ({...o, includeSummary: e.target.checked}))} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary disabled:cursor-not-allowed" disabled={!options.generateResume} />
                                    </div>
                                    <div className="ml-3 text-sm leading-6">
                                        <label htmlFor="summary" className={`font-medium text-gray-900 ${!options.generateResume ? 'cursor-not-allowed' : ''}`}>Include Professional Summary</label>
                                        <p className="text-gray-500">Add a brief, impactful summary at the top of your resume.</p>
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="resume-length" className={`block text-sm font-medium text-gray-700 mb-2 ${!options.generateResume ? 'cursor-not-allowed' : ''}`}>Maximum Resume Length</label>
                                    <select id="resume-length" value={options.resumeLength} onChange={(e) => setOptions(o => ({...o, resumeLength: e.target.value as any}))} className="block w-full max-w-xs rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed" disabled={!options.generateResume}>
                                        <option value="1 page max">1 Page Max</option>
                                        <option value="2 pages max">2 Pages Max</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-200">
                            <div className="flex items-center">
                                <input id="coverLetter" type="checkbox" checked={options.generateCoverLetter} onChange={(e) => setOptions(o => ({...o, generateCoverLetter: e.target.checked}))} className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary" />
                                <label htmlFor="coverLetter" className="ml-3 block text-base font-semibold text-gray-900">
                                    Create Cover Letter
                                </label>
                            </div>
                            <div className={`pl-8 mt-4 space-y-4 transition-opacity ${!options.generateCoverLetter ? 'opacity-50' : 'opacity-100'}`}>
                                <div>
                                    <label htmlFor="cover-letter-length" className={`block text-sm font-medium text-gray-700 mb-2 ${!options.generateCoverLetter ? 'cursor-not-allowed' : ''}`}>Cover Letter Length</label>
                                    <select id="cover-letter-length" value={options.coverLetterLength} onChange={(e) => setOptions(o => ({...o, coverLetterLength: e.target.value as any}))} className="block w-full max-w-xs rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed" disabled={!options.generateCoverLetter}>
                                        <option value="short">Short (~3 paragraphs)</option>
                                        <option value="medium">Medium (4-5 paragraphs)</option>
                                        <option value="long">Long (5+ paragraphs)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
                <ProfileContentSelector
                profile={profile}
                selections={includedProfileSelections}
                onSelectionChange={setIncludedProfileSelections}
                />
            </aside>
            </div>
        </div>
    </>
  );
};

export default GeneratePage;
