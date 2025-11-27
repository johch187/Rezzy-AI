import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import GeneratePage from './pages/GeneratePage';
import GenerationResultPage from './pages/GenerationResultPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import GDPRPage from './pages/GDPRPage';
import CookiePolicyPage from './pages/CookiePolicyPage';
import SubscriptionPage from './pages/SubscriptionPage';
import ManageSubscriptionPage from './pages/ManageSubscriptionPage';
import LoginPage from './pages/LoginPage';
import Header from './components/Header';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import HowItWorksPage from './pages/HowItWorksPage';
import Sidebar from './components/Sidebar';
import CoffeeChatPrepperPage from './pages/CoffeeChatPrepperPage';
import CoffeeChatResultPage from './pages/CoffeeChatResultPage';
import CareerCoachPage from './pages/CareerCoachPage';
import CareerPathPage from './pages/CareerPathPage';
import InterviewPrepPage from './pages/InterviewPrepPage';
import GeneratedDocumentsPage from './pages/GeneratedDocumentsPage';
import ToastNotification from './components/ToastNotification';
import ApplicationAnalysisPage from './pages/ApplicationAnalysisPage';
import MentorMatcherPage from './pages/MentorMatcherPage';
import OnboardingPage from './pages/OnboardingPage';
import { ProfileProvider, ProfileContext } from './context/ProfileContext';
import { supabase, isSupabaseEnabled } from './services/supabaseClient';
import { sendAnalyticsEvent } from './services/analyticsService';

// Re-export context for other components to use
export { ProfileContext };

const AppContent: React.FC = () => {
    const location = useLocation();
    const [authStatus, setAuthStatus] = useState<'loading' | 'authed' | 'unauth'>(isSupabaseEnabled ? 'loading' : 'authed');
    
    // Define pages that should display the Public Layout (Header + Footer, No Sidebar)
    const publicPaths = [
        '/', 
        '/how-it-works', 
        '/subscription', 
        '/privacy', 
        '/terms', 
        '/gdpr',
        '/cookies'
    ];
    
    // Fullscreen pages (no header, no footer, no sidebar)
    const fullscreenPaths = ['/login', '/onboarding'];
    
    const isPublicPage = publicPaths.includes(location.pathname);
    const isFullscreenPage = fullscreenPaths.includes(location.pathname);

    useEffect(() => {
        if (!isSupabaseEnabled || !supabase) {
            setAuthStatus('authed');
            return;
        }
        supabase.auth.getSession().then(({ data }) => {
            setAuthStatus(data.session ? 'authed' : 'unauth');
        });
        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setAuthStatus(session ? 'authed' : 'unauth');
        });
        return () => listener?.subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (authStatus === 'authed') {
            sendAnalyticsEvent('page_view', { path: location.pathname });
        }
    }, [authStatus, location.pathname]);

    const mainRoutes = (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/builder" element={<HomePage />} />
            <Route path="/generate" element={<GeneratePage />} />
            <Route path="/generated-documents" element={<GeneratedDocumentsPage />} />
            <Route path="/generate/results" element={<GenerationResultPage />} />
            <Route path="/subscription" element={<SubscriptionPage />} />
            <Route path="/account" element={<ManageSubscriptionPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsOfServicePage />} />
            <Route path="/gdpr" element={<GDPRPage />} />
            <Route path="/cookies" element={<CookiePolicyPage />} />
            <Route path="/coffee-chats" element={<CoffeeChatPrepperPage />} />
            <Route path="/coffee-chats/result" element={<CoffeeChatResultPage />} />
            <Route path="/career-coach" element={<CareerCoachPage />} />
            <Route path="/career-path" element={<CareerPathPage />} />
            <Route path="/interview-prep" element={<InterviewPrepPage />} />
            <Route path="/application-analysis" element={<ApplicationAnalysisPage />} />
            <Route path="/mentor-matcher" element={<MentorMatcherPage />} />
        </Routes>
    );

    // Fullscreen pages (login, onboarding) - no layout wrappers
    if (isFullscreenPage) {
        return mainRoutes;
    }

    // Protected routes - check auth
    if (!isPublicPage) {
        if (authStatus === 'loading') {
            return (
                <div className="flex items-center justify-center min-h-screen bg-gray-50">
                    <div className="text-gray-400 animate-pulse">Loading...</div>
                </div>
            );
        }
        if (authStatus === 'unauth') {
            return <Navigate to="/login" replace state={{ from: location.pathname }} />;
        }
    }

    // App Layout (Sidebar) - for authenticated routes
    if (!isPublicPage) {
        return (
            <div className="flex flex-col md:flex-row bg-gray-50 h-screen w-full">
                <Sidebar />
                <div className="flex flex-col flex-1 overflow-y-auto scrollbar-thin">
                    <main className="flex-grow flex flex-col w-full">
                        {mainRoutes}
                    </main>
                </div>
            </div>
        );
    }

    // Public Layout (Header + Footer) - for marketing pages
    return (
        <div className="flex flex-col bg-white min-h-screen">
            <Header />
            <main className="flex-grow flex flex-col">
                {mainRoutes}
            </main>
            <Footer />
        </div>
    );
};

const App: React.FC = () => {
  const [toast, setToast] = useState<{ message: string; id: string } | null>(null);

  const showToast = (message: string) => {
      setToast({ message, id: crypto.randomUUID() });
      setTimeout(() => setToast(null), 5000);
  };

  return (
    <ProfileProvider onToast={showToast}>
      <BrowserRouter>
        <ToastNotification toast={toast} onDismiss={() => setToast(null)} />
        <AppContent />
      </BrowserRouter>
    </ProfileProvider>
  );
};

export default App;
