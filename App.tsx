import React, { useState, createContext, useMemo, useEffect, useCallback } from 'react';
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
import type { ProfileData, DocumentHistoryItem, CareerPath } from './types';
import { importAndParseResume } from './services/parserService';
import Header from './components/Header';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import Sidebar from './components/Sidebar';
import CoffeeChatPrepperPage from './pages/CoffeeChatPrepperPage';
import CoffeeChatResultPage from './pages/CoffeeChatResultPage';
import CareerCoachPage from './pages/CareerCoachPage';
import CareerPathPage from './pages/CareerPathPage';

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
    companyKeywords: '',
    keySkillsToHighlight: '',
    careerPath: null,
  };
};

export const ProfileContext = createContext<{
  profile: ProfileData | null;
  setProfile: React.Dispatch<React.SetStateAction<ProfileData>>;
  saveProfile: () => boolean;
  lastSavedProfile: ProfileData | null;
  profiles: Record<string, ProfileData>;
  activeProfileId: string | null;
  switchProfile: (id: string) => void;
  addProfile: (name: string) => void;
  deleteProfile: (id: string) => void;
  renameProfile: (id: string, newName: string) => void;
  tokens: number;
  setTokens: React.Dispatch<React.SetStateAction<number>>;
  isFetchingUrl: boolean;
  setIsFetchingUrl: React.Dispatch<React.SetStateAction<boolean>>;
  documentHistory: DocumentHistoryItem[];
  addDocumentToHistory: (doc: Omit<DocumentHistoryItem, 'id' | 'generatedAt'>) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isParsing: boolean;
  parsingError: string | null;
  parseResumeInBackground: (file: File) => void;
  clearParsingError: () => void;
} | null>(null);

const AUTOSAVE_INTERVAL = 120 * 1000; // 2 minutes

const AppContent: React.FC = () => {
    const location = useLocation();
    const isAppPage = !['/', '/login'].includes(location.pathname);

    return (
        <>
            {isAppPage && <Sidebar />}
            <div className="min-h-screen bg-base-200 flex flex-col">
                <Header />
                <main className="flex-grow">
                    <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/builder" element={<HomePage />} />
                        <Route path="/generate" element={<GeneratePage />} />
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
                    </Routes>
                </main>
                <Footer />
            </div>
        </>
    );
};

const App: React.FC = () => {
  const [profiles, setProfiles] = useState<Record<string, ProfileData>>({});
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [lastSavedProfiles, setLastSavedProfiles] = useState<Record<string, ProfileData>>({});
  
  useEffect(() => {
    try {
        let loadedProfiles: Record<string, ProfileData> | null = null;
        let loadedActiveId: string | null = null;

        const savedProfilesJSON = localStorage.getItem('userProfiles');
        if (savedProfilesJSON) {
            loadedProfiles = JSON.parse(savedProfilesJSON);
            const savedActiveId = localStorage.getItem('activeProfileId');
            if (savedActiveId && loadedProfiles && loadedProfiles[savedActiveId]) {
                loadedActiveId = savedActiveId;
            }
        } else {
            // Attempt to migrate from old single-profile format
            const oldProfileJSON = localStorage.getItem('userProfile');
            if (oldProfileJSON) {
                const parsedOldProfile = JSON.parse(oldProfileJSON);
                const newId = crypto.randomUUID();
                const migratedProfile: ProfileData = {
                    ...createNewProfile("Default Profile"),
                    ...parsedOldProfile,
                    id: newId,
                    name: "Default Profile",
                };
                loadedProfiles = { [newId]: migratedProfile };
                loadedActiveId = newId;
                localStorage.removeItem('userProfile'); // Clean up old key
            }
        }

        if (loadedProfiles && Object.keys(loadedProfiles).length > 0) {
            setProfiles(loadedProfiles);
            setLastSavedProfiles(loadedProfiles);
            // If activeId is invalid, pick the first available one
            setActiveProfileId(loadedActiveId || Object.keys(loadedProfiles)[0]);
        } else {
            // Fresh start if no data is found
            const firstProfile = createNewProfile("My First Profile");
            setProfiles({ [firstProfile.id]: firstProfile });
            setActiveProfileId(firstProfile.id);
            setLastSavedProfiles({ [firstProfile.id]: firstProfile });
        }
    } catch (error) {
        console.error("Failed to initialize profiles from localStorage, starting fresh.", error);
        const firstProfile = createNewProfile("My First Profile");
        setProfiles({ [firstProfile.id]: firstProfile });
        setActiveProfileId(firstProfile.id);
    }
  }, []);

  const activeProfile = useMemo(() => {
    if (!activeProfileId || !profiles[activeProfileId]) {
      return null;
    }
    return profiles[activeProfileId];
  }, [activeProfileId, profiles]);

  const [tokens, setTokens] = useState(65);
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [documentHistory, setDocumentHistory] = useState<DocumentHistoryItem[]>(() => {
    try {
      const savedHistory = localStorage.getItem('documentHistory');
      return savedHistory ? JSON.parse(savedHistory) : [];
    } catch (error) {
      console.error("Failed to parse document history from localStorage", error);
      return [];
    }
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parsingError, setParsingError] = useState<string | null>(null);

  const saveProfiles = useCallback(() => {
    try {
        localStorage.setItem('userProfiles', JSON.stringify(profiles));
        if (activeProfileId) {
            localStorage.setItem('activeProfileId', activeProfileId);
        }
        setLastSavedProfiles(profiles);
        console.log("Profiles saved to localStorage.");
        return true;
    } catch (error) {
        console.error("Failed to save profiles to localStorage", error);
        return false;
    }
  }, [profiles, activeProfileId]);

  const updateActiveProfile = useCallback((updater: React.SetStateAction<ProfileData>) => {
    if (!activeProfileId) return;

    setProfiles(prevProfiles => {
      const currentActiveProfile = prevProfiles[activeProfileId];
      if (!currentActiveProfile) return prevProfiles;

      const newActiveProfile = typeof updater === 'function'
        ? updater(currentActiveProfile)
        : updater;

      return {
        ...prevProfiles,
        [activeProfileId]: newActiveProfile,
      };
    });
  }, [activeProfileId]);
  
  const switchProfile = useCallback((id: string) => {
    if (profiles[id]) {
        setActiveProfileId(id);
    }
  }, [profiles]);

  const addProfile = useCallback((name: string) => {
    const newProfile = createNewProfile(name);
    setProfiles(prev => ({...prev, [newProfile.id]: newProfile}));
    setActiveProfileId(newProfile.id);
  }, []);
  
  const deleteProfile = useCallback((id: string) => {
    setProfiles(prev => {
        const newProfiles = {...prev};
        delete newProfiles[id];
        return newProfiles;
    });
    if (activeProfileId === id) {
        const remainingIds = Object.keys(profiles).filter(pId => pId !== id);
        setActiveProfileId(remainingIds.length > 0 ? remainingIds[0] : null);
    }
  }, [activeProfileId, profiles]);

  const renameProfile = useCallback((id: string, newName: string) => {
    setProfiles(prev => {
        if (!prev[id]) return prev;
        const updatedProfile = { ...prev[id], name: newName };
        return { ...prev, [id]: updatedProfile };
    });
  }, []);

  const addDocumentToHistory = useCallback((doc: Omit<DocumentHistoryItem, 'id' | 'generatedAt'>) => {
    setDocumentHistory(prevHistory => {
        const newDoc: DocumentHistoryItem = {
            ...doc,
            id: crypto.randomUUID(),
            generatedAt: new Date().toISOString(),
        };
        const updatedHistory = [newDoc, ...prevHistory].slice(0, 20);
        try {
            localStorage.setItem('documentHistory', JSON.stringify(updatedHistory));
        } catch (error) {
            console.error("Failed to save document history to localStorage", error);
        }
        return updatedHistory;
    });
  }, []);
  
  const parseResumeInBackground = useCallback((file: File) => {
    if (!file || !activeProfileId) return;

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
            
            updateActiveProfile(currentProfile => {
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
  }, [activeProfileId, updateActiveProfile]);


  // Autosave effect
  useEffect(() => {
    const handler = setTimeout(() => {
      if (JSON.stringify(profiles) !== JSON.stringify(lastSavedProfiles)) {
          saveProfiles();
      }
    }, AUTOSAVE_INTERVAL);

    return () => {
      clearTimeout(handler);
    };
  }, [profiles, lastSavedProfiles, saveProfiles]);

  const contextValue = useMemo(() => ({ 
      profile: activeProfile, 
      setProfile: updateActiveProfile as React.Dispatch<React.SetStateAction<ProfileData>>,
      saveProfile: saveProfiles, 
      lastSavedProfile: activeProfileId ? lastSavedProfiles[activeProfileId] : null,
      profiles,
      activeProfileId,
      switchProfile,
      addProfile,
      deleteProfile,
      renameProfile,
      tokens, setTokens, 
      isFetchingUrl, setIsFetchingUrl, isSidebarOpen, setIsSidebarOpen, 
      documentHistory, addDocumentToHistory,
      isParsing,
      parsingError,
      parseResumeInBackground,
      clearParsingError: () => setParsingError(null)
   }), [
      activeProfile, updateActiveProfile, saveProfiles, lastSavedProfiles, profiles, activeProfileId, switchProfile, addProfile, deleteProfile, renameProfile,
      tokens, setTokens, 
      isFetchingUrl, setIsFetchingUrl, isSidebarOpen, setIsSidebarOpen, 
      documentHistory, addDocumentToHistory,
      isParsing, parsingError, parseResumeInBackground
    ]);

  if (!activeProfile) {
    // Render a loading state or a skeleton screen while the profile is being initialized
    return <div className="flex items-center justify-center min-h-screen bg-base-200">Loading Profile...</div>;
  }

  return (
    <ProfileContext.Provider value={contextValue}>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </ProfileContext.Provider>
  );
};

export default App;