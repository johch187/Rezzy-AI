import React, { useState, createContext, useMemo, useEffect, useCallback, useContext } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import GeneratePage from './pages/GeneratePage';
import GenerationResultPage from './pages/GenerationResultPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import GDPRPage from './pages/GDPRPage';
import SubscriptionPage from './pages/SubscriptionPage';
import ManageSubscriptionPage from './pages/ManageSubscriptionPage';
import LoginPage from './pages/LoginPage';
import type { ProfileData, DocumentGeneration, CareerPath, BackgroundTask, ApplicationAnalysisResult, ParsedCoverLetter, CareerChatSummary } from './types';
import { importAndParseResume } from './services/parserService';
import Header from './components/Header';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import Sidebar from './components/Sidebar';
import CoffeeChatPrepperPage from './pages/CoffeeChatPrepperPage';
import CoffeeChatResultPage from './pages/CoffeeChatResultPage';
import CareerCoachPage from './pages/CareerCoachPage';
import CareerPathPage from './pages/CareerPathPage';
import InterviewPrepPage from './pages/InterviewPrepPage';
import GeneratedDocumentsPage from './pages/GeneratedDocumentsPage';
import ToastNotification from './components/ToastNotification';
import { HamburgerIcon } from './components/Icons';

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
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
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

const AppContent: React.FC = () => {
    const location = useLocation();
    const isAppPage = !['/', '/login'].includes(location.pathname);
    const { isSidebarCollapsed, setIsSidebarOpen } = useContext(ProfileContext)!;

    const showFooter = location.pathname === '/' || location.pathname === '/account';
    const showHeader = location.pathname === '/';

    return (
        <div className="relative min-h-screen">
            {isAppPage && <Sidebar />}
            {isAppPage && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="fixed top-4 left-4 z-30 p-2 rounded-full bg-white/80 backdrop-blur-md text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue lg:hidden"
                aria-label="Open navigation menu"
              >
                <HamburgerIcon />
              </button>
            )}
            <div className={`flex flex-col bg-slate-100 transition-all duration-300 ease-out 
                ${isAppPage ? (isSidebarCollapsed ? 'lg:ml-20 min-h-screen' : 'lg:ml-64 min-h-screen') : 'min-h-screen'}`}>
                {showHeader && <Header />}
                <main className={`flex-grow flex flex-col ${showHeader ? 'min-h-[calc(100vh-65px)]' : 'min-h-screen'}`}>
                    <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/builder" element={<HomePage />} />
                        <Route path="/generate" element={<GeneratePage />} />
                        <Route path="/generated-documents" element={<GeneratedDocumentsPage />} />
                        <Route path="/generate/results" element={<GenerationResultPage />} />
                        <Route path="/subscription" element={<SubscriptionPage />} />
                        <Route path="/account" element={<ManageSubscriptionPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/privacy" element={<PrivacyPolicyPage />} />
                        <Route path="/terms" element={<TermsOfServicePage />} />
                        <Route path="/gdpr" element={<GDPRPage />} />
                        <Route path="/coffee-chats" element={<CoffeeChatPrepperPage />} />
                        <Route path="/coffee-chats/result" element={<CoffeeChatResultPage />} />
                        <Route path="/career-coach" element={<CareerCoachPage />} />
                        <Route path="/career-path" element={<CareerPathPage />} />
                        <Route path="/interview-prep" element={<InterviewPrepPage />} />
                    </Routes>
                </main>
                {showFooter && <Footer />}
            </div>
        </div>
    );
};

const App: React.FC = () => {
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
            // Fresh start if no data is found
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
        
        // Simple migration: if the first item has a 'type' property, it's the old format.
        // In that case, we clear the history to avoid runtime errors with the new structure.
        if (Array.isArray(savedHistory) && savedHistory.length > 0 && savedHistory[0].hasOwnProperty('type')) {
            console.log("Old document history format detected. Clearing for upgrade.");
            localStorage.removeItem('documentHistory');
            return [];
        }

        return Array.isArray(savedHistory) ? savedHistory : [];
    } catch (error) {
        console.error("Failed to parse document history from localStorage", error);
        localStorage.removeItem('documentHistory'); // Clear corrupted data
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parsingError, setParsingError] = useState<string | null>(null);

  const [backgroundTasks, setBackgroundTasks] = useState<BackgroundTask[]>(() => {
    try {
        const saved = localStorage.getItem('backgroundTasks');
        // Filter out any tasks that are still 'running' when the app loads, as they are orphaned.
        const tasks = saved ? JSON.parse(saved) : [];
        return tasks.filter((t: BackgroundTask) => t.status !== 'running');
    } catch {
        return [];
    }
  });
  const [toast, setToast] = useState<{ message: string; id: string } | null>(null);

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
        const updatedHistory = [newGeneration, ...prevHistory].slice(0, 20); // keep up to 20 generations
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
        const updatedHistory = [summary, ...prevHistory].slice(0, 20); // Keep up to 20 summaries
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
                    // Preserve key settings from the current profile
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
    setToast({ message: `${taskInfo.description} is now generating...`, id: crypto.randomUUID() });
    setTimeout(() => setToast(null), 5000); // Auto-dismiss toast
    return taskId;
  }, []);

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
      isFetchingUrl, setIsFetchingUrl, isSidebarOpen, setIsSidebarOpen, 
      isSidebarCollapsed, setIsSidebarCollapsed,
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
      isFetchingUrl, setIsFetchingUrl, isSidebarOpen, setIsSidebarOpen, 
      isSidebarCollapsed, setIsSidebarCollapsed,
      documentHistory, addDocumentToHistory,
      careerChatHistory, addCareerChatSummary,
      isParsing, parsingError, parseResumeInBackground,
      backgroundTasks, startBackgroundTask, updateBackgroundTask, markTaskAsViewed, clearAllNotifications
    ]);

  if (!profile) {
    // Render a loading state or a skeleton screen while the profile is being initialized
    return <div className="flex items-center justify-center min-h-screen bg-base-200">Loading Profile...</div>;
  }

  return (
    <ProfileContext.Provider value={contextValue}>
      <HashRouter>
        <ToastNotification toast={toast} onDismiss={() => setToast(null)} />
        <AppContent />
      </HashRouter>
    </ProfileContext.Provider>
  );
};

export default App;