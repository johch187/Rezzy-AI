import React, { useState, createContext, useMemo, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import GeneratePage from './pages/GeneratePage';
import GenerationResultPage from './pages/GenerationResultPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import GDPRPage from './pages/GDPRPage';
import SubscriptionPage from './pages/SubscriptionPage';
import ManageSubscriptionPage from './pages/ManageSubscriptionPage';
import LoginPage from './pages/LoginPage';
import type { ProfileData, DocumentHistoryItem } from './types';
import Header from './components/Header';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import Sidebar from './components/Sidebar';
import CoffeeChatPrepperPage from './pages/CoffeeChatPrepperPage';

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
} | null>(null);

const AUTOSAVE_INTERVAL = 120 * 1000; // 2 minutes

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

  const contextValue = useMemo(() => ({ profile, setProfile, saveProfile, lastSavedProfile, tokens, setTokens, isFetchingUrl, setIsFetchingUrl, isSidebarOpen, setIsSidebarOpen, documentHistory, addDocumentToHistory }), [profile, setProfile, saveProfile, lastSavedProfile, tokens, setTokens, isFetchingUrl, setIsFetchingUrl, isSidebarOpen, setIsSidebarOpen, documentHistory, addDocumentToHistory]);

  return (
    <ProfileContext.Provider value={contextValue}>
      <HashRouter>
        <Sidebar />
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
              <Route path="/coffee-chat-prepper" element={<CoffeeChatPrepperPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </HashRouter>
    </ProfileContext.Provider>
  );
};

export default App;