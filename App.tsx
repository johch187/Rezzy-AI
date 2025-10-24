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
import type { ProfileData } from './types';
import Header from './components/Header';
import Footer from './components/Footer';

const initialProfile: ProfileData = {
  fullName: 'Alex Doe',
  jobTitle: 'Software Engineer',
  email: 'alex.doe@example.com',
  phone: '(555) 123-4567',
  website: 'alexdoe.dev',
  location: 'San Francisco, CA',
  linkedin: 'linkedin.com/in/alexdoe',
  github: 'github.com/alexdoe',
  summary: 'A highly motivated Software Engineer with experience in building and maintaining web applications using modern technologies like React and Node.js. Proven ability to collaborate effectively in team environments to deliver high-quality software solutions.',
  education: [
    { id: 'edu1', institution: 'State University', degree: 'B.S.', fieldOfStudy: 'Computer Science', startDate: '2018', endDate: '2022', gpa: '3.8/4.0', relevantCoursework: 'Data Structures, Algorithms, Web Development', awardsHonors: 'Dean\'s List (2020-2022)' }
  ],
  experience: [
    { id: 'exp1', company: 'Tech Solutions Inc.', title: 'Software Engineer', location: 'Remote', startDate: '2022', endDate: 'Present', achievements: [
      { id: 'ach1', text: 'Developed and maintained web applications using React and Node.js.'},
      { id: 'ach2', text: 'Collaborated with cross-functional teams to deliver high-quality software.'},
      { id: 'ach3', text: 'Optimized application performance, resulting in a 20% reduction in load times.'},
    ]}
  ],
  projects: [
    // Fix: Add startDate and endDate properties to match the Project interface
    { id: 'proj1', name: 'Personal Portfolio Website', description: 'Designed and built a responsive portfolio website to showcase my projects and skills.', url: 'alexdoe.dev', technologiesUsed: 'React, TypeScript, Tailwind CSS', startDate: '2023', endDate: 'Present' }
  ],
  technicalSkills: [{ id: 'ts1', name: 'React' }, { id: 'ts2', name: 'TypeScript' }, { id: 'ts3', name: 'Node.js' }],
  softSkills: [{ id: 'ss1', name: 'Team Collaboration' }, { id: 'ss2', name: 'Problem Solving' }, { id: 'ss3', name: 'Agile Methodologies' }],
  tools: [{ id: 'tool1', name: 'Git & GitHub' }, { id: 'tool2', name: 'Docker' }, { id: 'tool3', name: 'JIRA' }],
  languages: [{ id: 'lang1', name: 'English', proficiency: 'native' }, { id: 'lang2', name: 'Spanish', proficiency: 'conversational' }],
  certifications: [{id: 'cert1', name: 'AWS Certified Cloud Practitioner'}],
  interests: [{id: 'int1', name: 'Open Source Contribution'}, {id: 'int2', name: 'Creative Coding'}],
  customSections: [],
  additionalInformation: 'Passionate about open-source and building accessible user interfaces.',
  industry: 'Technology',
  experienceLevel: 'mid',
  vibe: 'Professional, results-oriented, and collaborative.',
  selectedResumeTemplate: 'modern',
  selectedCoverLetterTemplate: 'professional',
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

  const contextValue = useMemo(() => ({ profile, setProfile, saveProfile, lastSavedProfile, tokens, setTokens, isFetchingUrl, setIsFetchingUrl }), [profile, setProfile, saveProfile, lastSavedProfile, tokens, setTokens, isFetchingUrl, setIsFetchingUrl]);

  return (
    <ProfileContext.Provider value={contextValue}>
      <HashRouter>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/generate" element={<GeneratePage />} />
              <Route path="/generate/results" element={<GenerationResultPage />} />
              <Route path="/subscription" element={<SubscriptionPage />} />
              <Route path="/account" element={<ManageSubscriptionPage />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
              <Route path="/terms" element={<TermsOfServicePage />} />
              <Route path="/gdpr" element={<GDPRPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </HashRouter>
    </ProfileContext.Provider>
  );
};

export default App;