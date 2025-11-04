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

const initialProfile: ProfileData = {
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
};

export const ProfileContext = createContext<{
  profile: ProfileData;
  setProfile: React.Dispatch<React.SetStateAction<ProfileData>>;
  saveProfile: (profileToSave: ProfileData) => boolean;
  lastSavedProfile: ProfileData;
  tokens: number;
  setTokens: React.Dispatch<React.SetStateAction<number>>;
  isFetchingUrl: boolean;
  setIsFetchingUrl: React.Dispatch<React.SetStateAction<boolean>>;
  documentHistory: DocumentHistoryItem[];
  addDocumentToHistory: (doc: Omit<DocumentHistoryItem, 'id' | 'generatedAt'>) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  careerPath: CareerPath | null;
  setCareerPath: (path: CareerPath | null) => void;
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
  const [profile, setProfile] = useState<ProfileData>(() => {
    try {
      const savedProfile = localStorage.getItem('userProfile');
      return savedProfile ? JSON.parse(savedProfile) : initialProfile;
    } catch (error) {
      console.error("Failed to parse profile from localStorage", error);
      return initialProfile;
    }
  });

  const [lastSavedProfile, setLastSavedProfile] = useState<ProfileData>(profile);
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
  const [careerPath, setCareerPath] = useState<CareerPath | null>(() => {
    try {
      const savedPath = localStorage.getItem('careerPath');
      return savedPath ? JSON.parse(savedPath) : null;
    } catch (error) {
      console.error("Failed to parse career path from localStorage", error);
      return null;
    }
  });
  const [isParsing, setIsParsing] = useState(false);
  const [parsingError, setParsingError] = useState<string | null>(null);


  // Function to explicitly save profile (and update lastSavedProfile)
  const saveProfile = useCallback((profileToSave: ProfileData) => {
    try {
        localStorage.setItem('userProfile', JSON.stringify(profileToSave));
        setLastSavedProfile(profileToSave); // Mark this as the last officially saved state
        console.log("Profile saved to localStorage.");
        return true; // Indicate success
    } catch (error) {
        console.error("Failed to save profile to localStorage", error);
        return false; // Indicate failure
    }
  }, []);

  const addDocumentToHistory = useCallback((doc: Omit<DocumentHistoryItem, 'id' | 'generatedAt'>) => {
    setDocumentHistory(prevHistory => {
        const newDoc: DocumentHistoryItem = {
            ...doc,
            id: crypto.randomUUID(),
            generatedAt: new Date().toISOString(),
        };
        // Add to the beginning of the array and keep the last 20 items
        const updatedHistory = [newDoc, ...prevHistory].slice(0, 20);
        try {
            localStorage.setItem('documentHistory', JSON.stringify(updatedHistory));
        } catch (error) {
            console.error("Failed to save document history to localStorage", error);
        }
        return updatedHistory;
    });
  }, []);
  
  const saveCareerPath = useCallback((newPath: CareerPath | null) => {
    try {
        if (newPath) {
            localStorage.setItem('careerPath', JSON.stringify(newPath));
        } else {
            localStorage.removeItem('careerPath');
        }
        setCareerPath(newPath); // Update state
    } catch (error) {
        console.error("Failed to save career path to localStorage", error);
    }
  }, []);

  const parseResumeInBackground = useCallback((file: File) => {
    if (!file) return;

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
    
    // Non-blocking async call
    (async () => {
        try {
            const parsedData = await importAndParseResume(file);
            
            const blankProfileContent: Partial<ProfileData> = {
                fullName: '', jobTitle: '', email: '', phone: '', website: '', location: '',
                linkedin: '', github: '', summary: '', education: [], experience: [],
                projects: [], technicalSkills: [], softSkills: [], tools: [],
                languages: [], certifications: [], interests: [], customSections: [],
                additionalInformation: '', industry: '', experienceLevel: 'entry', vibe: ''
            };

            setProfile(currentProfile => {
                const newProfile = { ...currentProfile, ...blankProfileContent, ...parsedData };
                saveProfile(newProfile); // Explicitly save after successful parse.
                return newProfile;
            });
            
        } catch (err: any) {
            setParsingError(err.message || "An unexpected error occurred during parsing.");
        } finally {
            setIsParsing(false);
        }
    })();
  }, [saveProfile]);


  // Autosave effect (debounced)
  useEffect(() => {
    const handler = setTimeout(() => {
      // Only autosave if the current profile is different from the last explicitly saved profile
      if (JSON.stringify(profile) !== JSON.stringify(lastSavedProfile)) {
          saveProfile(profile);
      }
    }, AUTOSAVE_INTERVAL);

    return () => {
      clearTimeout(handler);
    };
  }, [profile, lastSavedProfile, saveProfile]); // Dependencies on profile and lastSavedProfile

  const contextValue = useMemo(() => ({ 
      profile, setProfile, saveProfile, lastSavedProfile, tokens, setTokens, 
      isFetchingUrl, setIsFetchingUrl, isSidebarOpen, setIsSidebarOpen, 
      documentHistory, addDocumentToHistory, careerPath, setCareerPath: saveCareerPath,
      isParsing,
      parsingError,
      parseResumeInBackground,
      clearParsingError: () => setParsingError(null)
   }), [
      profile, setProfile, saveProfile, lastSavedProfile, tokens, setTokens, 
      isFetchingUrl, setIsFetchingUrl, isSidebarOpen, setIsSidebarOpen, 
      documentHistory, addDocumentToHistory, careerPath, saveCareerPath,
      isParsing, parsingError, parseResumeInBackground
    ]);

  return (
    <ProfileContext.Provider value={contextValue}>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </ProfileContext.Provider>
  );
};

export default App;