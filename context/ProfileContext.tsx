import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { ProfileData, DocumentGeneration, BackgroundTask, ApplicationAnalysisResult, ParsedCoverLetter, CareerChatSummary } from '../types';
import { importAndParseResume } from '../services/parserService';

const createNewProfile = (name: string): ProfileData => {
  const newId = crypto.randomUUID();
  return {
    id: newId,
    name: name,
    fullName: '',
    jobTitle: '',
    email: '',
    phone: '',
    website: '',
    location: '',
    linkedin: '',
    github: '',
    summary: '',
    education: [],
    experience: [],
    projects: [],
    technicalSkills: [],
    softSkills: [],
    tools: [],
    languages: [],
    certifications: [],
    interests: [],
    customSections: [],
    additionalInformation: '',
    industry: '',
    experienceLevel: 'entry',
    vibe: '',
    selectedResumeTemplate: 'classic',
    selectedCoverLetterTemplate: 'professional',
    targetJobTitle: '',
    companyName: '',
    companyKeywords: '',
    keySkillsToHighlight: '',
    careerPath: null,
  };
};

export const ProfileContext = createContext<{
  profile: ProfileData | null;
  setProfile: React.Dispatch<React.SetStateAction<ProfileData | null>>;
  saveProfile: () => boolean;
  lastSavedProfile: ProfileData | null;
  tokens: number;
  setTokens: React.Dispatch<React.SetStateAction<number>>;
  isFetchingUrl: boolean;
  setIsFetchingUrl: React.Dispatch<React.SetStateAction<boolean>>;
  documentHistory: DocumentGeneration[];
  addDocumentToHistory: (generation: { jobTitle: string; companyName: string; resumeContent: string | null; coverLetterContent: string | null; analysisResult: ApplicationAnalysisResult | null; parsedResume: Partial<ProfileData> | null; parsedCoverLetter: ParsedCoverLetter | null; }) => void;
  careerChatHistory: CareerChatSummary[];
  addCareerChatSummary: (summary: CareerChatSummary) => void;
  isParsing: boolean;
  parsingError: string | null;
  parseResumeInBackground: (file: File) => void;
  clearParsingError: () => void;
  backgroundTasks: BackgroundTask[];
  startBackgroundTask: (taskInfo: Omit<BackgroundTask, 'id' | 'status' | 'result' | 'viewed' | 'createdAt'>) => string;
  updateBackgroundTask: (taskId: string, updates: Partial<Omit<BackgroundTask, 'id'>>) => void;
  markTaskAsViewed: (taskId: string) => void;
  clearAllNotifications: () => void;
} | null>(null);

const AUTOSAVE_INTERVAL = 120 * 1000; // 2 minutes

export const ProfileProvider: React.FC<{ children: React.ReactNode; onToast: (msg: string) => void }> = ({ children, onToast }) => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [lastSavedProfile, setLastSavedProfile] = useState<ProfileData | null>(null);
  
  useEffect(() => {
    try {
        const savedProfileJSON = localStorage.getItem('userProfile');
        if (savedProfileJSON) {
            const loadedProfile = JSON.parse(savedProfileJSON);
            setProfile(loadedProfile);
            setLastSavedProfile(loadedProfile);
        } else {
            const firstProfile = createNewProfile("My First Profile");
            setProfile(firstProfile);
            setLastSavedProfile(firstProfile);
        }
    } catch (error) {
        console.error("Failed to load profile from localStorage, starting fresh.", error);
        const firstProfile = createNewProfile("My First Profile");
        setProfile(firstProfile);
    }
  }, []);

  const [tokens, setTokens] = useState(65);
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [documentHistory, setDocumentHistory] = useState<DocumentGeneration[]>(() => {
    try {
        const savedHistoryJSON = localStorage.getItem('documentHistory');
        if (!savedHistoryJSON) return [];
        
        const savedHistory = JSON.parse(savedHistoryJSON);
        
        if (Array.isArray(savedHistory) && savedHistory.length > 0 && savedHistory[0].hasOwnProperty('type')) {
            localStorage.removeItem('documentHistory');
            return [];
        }

        return Array.isArray(savedHistory) ? savedHistory : [];
    } catch (error) {
        console.error("Failed to parse document history from localStorage", error);
        localStorage.removeItem('documentHistory');
        return [];
    }
  });
  const [careerChatHistory, setCareerChatHistory] = useState<CareerChatSummary[]>(() => {
    try {
        const savedHistoryJSON = localStorage.getItem('careerChatHistory');
        return savedHistoryJSON ? JSON.parse(savedHistoryJSON) : [];
    } catch (error) {
        console.error("Failed to parse career chat history from localStorage", error);
        localStorage.removeItem('careerChatHistory');
        return [];
    }
  });
  const [isParsing, setIsParsing] = useState(false);
  const [parsingError, setParsingError] = useState<string | null>(null);

  const [backgroundTasks, setBackgroundTasks] = useState<BackgroundTask[]>(() => {
    try {
        const saved = localStorage.getItem('backgroundTasks');
        const tasks = saved ? JSON.parse(saved) : [];
        return tasks.filter((t: BackgroundTask) => t.status !== 'running');
    } catch {
        return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('backgroundTasks', JSON.stringify(backgroundTasks));
  }, [backgroundTasks]);

  const saveProfile = useCallback(() => {
    if (!profile) return false;
    try {
        localStorage.setItem('userProfile', JSON.stringify(profile));
        setLastSavedProfile(profile);
        console.log("Profile saved to localStorage.");
        return true;
    } catch (error) {
        console.error("Failed to save profile to localStorage", error);
        return false;
    }
  }, [profile]);

  const addDocumentToHistory = useCallback((generation: { jobTitle: string; companyName: string; resumeContent: string | null; coverLetterContent: string | null; analysisResult: ApplicationAnalysisResult | null; parsedResume: Partial<ProfileData> | null; parsedCoverLetter: ParsedCoverLetter | null; }) => {
    setDocumentHistory(prevHistory => {
        const newGeneration: DocumentGeneration = {
            ...generation,
            id: crypto.randomUUID(),
            generatedAt: new Date().toISOString(),
        };
        const updatedHistory = [newGeneration, ...prevHistory].slice(0, 20);
        try {
            localStorage.setItem('documentHistory', JSON.stringify(updatedHistory));
        } catch (error) {
            console.error("Failed to save document history to localStorage", error);
        }
        return updatedHistory;
    });
  }, []);
  
  const addCareerChatSummary = useCallback((summary: CareerChatSummary) => {
    setCareerChatHistory(prevHistory => {
        const updatedHistory = [summary, ...prevHistory].slice(0, 20);
        try {
            localStorage.setItem('careerChatHistory', JSON.stringify(updatedHistory));
        } catch (error) {
            console.error("Failed to save career chat history to localStorage", error);
        }
        return updatedHistory;
    });
  }, []);

  const parseResumeInBackground = useCallback((file: File) => {
    if (!file || !profile) return;

    setIsParsing(true);
    setParsingError(null);

    const MAX_FILE_SIZE_MB = 2;
    const ALLOWED_MIME_TYPES = ['application/pdf', 'text/plain', 'text/markdown'];
    const ALLOWED_EXTENSIONS = ['.pdf', '.txt', '.md'];

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setParsingError(`File too large: Please upload a file smaller than ${MAX_FILE_SIZE_MB}MB.`);
      setIsParsing(false);
      return;
    }

    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    if (!ALLOWED_MIME_TYPES.includes(file.type) && !ALLOWED_EXTENSIONS.includes(fileExtension)) {
      setParsingError(`Unsupported file type: '${fileExtension}'. Please upload a PDF, TXT, or MD file.`);
      setIsParsing(false);
      return;
    }
    
    (async () => {
        try {
            const parsedData = await importAndParseResume(file);
            
            setProfile(currentProfile => {
                if (!currentProfile) return null;
                const newProfileData: Partial<ProfileData> = {
                    ...parsedData,
                    name: currentProfile.name,
                    id: currentProfile.id,
                    selectedResumeTemplate: currentProfile.selectedResumeTemplate,
                    selectedCoverLetterTemplate: currentProfile.selectedCoverLetterTemplate,
                };
                return { ...createNewProfile(currentProfile.name), ...newProfileData, id: currentProfile.id };
            });
            
        } catch (err: any) {
            setParsingError(err.message || "An unexpected error occurred during parsing.");
        } finally {
            setIsParsing(false);
        }
    })();
  }, [profile]);

  const startBackgroundTask = useCallback((taskInfo: Omit<BackgroundTask, 'id' | 'status' | 'result' | 'viewed' | 'createdAt'>): string => {
    const taskId = crypto.randomUUID();
    const newTask: BackgroundTask = {
        ...taskInfo,
        id: taskId,
        status: 'running',
        result: null,
        viewed: false,
        createdAt: new Date().toISOString(),
    };
    setBackgroundTasks(prev => [newTask, ...prev]);
    onToast(`${taskInfo.description} is now generating...`);
    return taskId;
  }, [onToast]);

  const updateBackgroundTask = useCallback((taskId: string, updates: Partial<Omit<BackgroundTask, 'id'>>) => {
      setBackgroundTasks(prev => prev.map(task => 
          task.id === taskId ? { ...task, ...updates } : task
      ));
  }, []);

  const markTaskAsViewed = useCallback((taskId: string) => {
      setBackgroundTasks(prev => prev.map(task => 
          task.id === taskId ? { ...task, viewed: true } : task
      ));
  }, []);

  const clearAllNotifications = useCallback(() => {
      setBackgroundTasks(prev => prev.map(task => ({ ...task, viewed: true })).filter(task => task.status === 'running'));
  }, []);

  // Autosave effect
  useEffect(() => {
    const handler = setTimeout(() => {
      if (profile && JSON.stringify(profile) !== JSON.stringify(lastSavedProfile)) {
          saveProfile();
      }
    }, AUTOSAVE_INTERVAL);

    return () => {
      clearTimeout(handler);
    };
  }, [profile, lastSavedProfile, saveProfile]);

  const contextValue = useMemo(() => ({ 
      profile, 
      setProfile,
      saveProfile, 
      lastSavedProfile,
      tokens, setTokens, 
      isFetchingUrl, setIsFetchingUrl,
      documentHistory, addDocumentToHistory,
      careerChatHistory, addCareerChatSummary,
      isParsing,
      parsingError,
      parseResumeInBackground,
      clearParsingError: () => setParsingError(null),
      backgroundTasks,
      startBackgroundTask,
      updateBackgroundTask,
      markTaskAsViewed,
      clearAllNotifications,
   }), [
      profile, setProfile, saveProfile, lastSavedProfile,
      tokens, setTokens, 
      isFetchingUrl, setIsFetchingUrl,
      documentHistory, addDocumentToHistory,
      careerChatHistory, addCareerChatSummary,
      isParsing, parsingError, parseResumeInBackground,
      backgroundTasks, startBackgroundTask, updateBackgroundTask, markTaskAsViewed, clearAllNotifications
    ]);

  if (!profile) {
    return <div className="flex items-center justify-center min-h-screen bg-base-200">Loading Profile...</div>;
  }

  return <ProfileContext.Provider value={contextValue}>{children}</ProfileContext.Provider>;
}
