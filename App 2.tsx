import React, { useState, createContext, useMemo, useEffect, useCallback, useContext } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
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
import { supabase, isSupabaseEnabled } from './services/supabaseClient';
import { fetchWorkspaceViaServer, persistWorkspaceViaServer } from './services/aiGateway';
import { createNewProfile, DEFAULT_TOKEN_BALANCE } from './workspaceDefaults';
import type { TodoRow } from './types/supabase';

export const ProfileContext = createContext<{
  profile: ProfileData | null;
  setProfile: React.Dispatch<React.SetStateAction<ProfileData | null>>;
  saveProfile: () => Promise<boolean>;
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
  currentUser: User | null;
  authReady: boolean;
  isSupabaseEnabled: boolean;
  isSyncingProfile: boolean;
  signOut: () => Promise<void>;
} | null>(null);

const AUTOSAVE_INTERVAL = 120 * 1000; // 2 minutes

type PersistedWorkspace = {
  profile: ProfileData | null;
  documentHistory: DocumentGeneration[];
  careerChatHistory: CareerChatSummary[];
  tokens: number;
};

type TodoRecord = TodoRow;

const TodosPage: React.FC = () => {
  const [todos, setTodos] = useState<TodoRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [newTodo, setNewTodo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const getTodos = async () => {
      try {
        const { data, error } = await supabase.from('todos').select('*');
        if (!isMounted) return;
        if (error) {
          throw error;
        }
        setTodos(data ?? []);
      } catch (err: any) {
        if (!isMounted) return;
        console.error('Failed to fetch todos from Supabase', err);
        setError(err.message ?? 'Failed to fetch todos.');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void getTodos();

    const channel = supabase
      .channel('public:todos')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'todos' },
        (payload) => {
          setTodos((current) => {
            if (!payload.eventType) return current;
            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
              const next = payload.new as TodoRecord;
              if (!next?.id) return current;
              const exists = current.some(todo => todo.id === next.id);
              return exists
                ? current.map(todo => (todo.id === next.id ? next : todo))
                : [next, ...current];
            }
            if (payload.eventType === 'DELETE') {
              const previous = payload.old as TodoRecord;
              if (!previous?.id) return current;
              return current.filter(todo => todo.id !== previous.id);
            }
            return current;
          });
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      channel.unsubscribe();
    };
  }, []);

  if (!isSupabaseEnabled) {
    return (
      <div className="p-6">
        <p className="mb-2 font-medium">Supabase integration is disabled.</p>
        <p>
          Copy <code>.env.example</code> to <code>.env</code>, add your Supabase keys, and restart the dev server.
        </p>
      </div>
    );
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) return;
    const task = newTodo.trim();
    if (!task) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const { error: insertError } = await supabase.from('todos').insert({ task });
      if (insertError) {
        throw insertError;
      }
      setNewTodo('');
    } catch (err: any) {
      console.error('Failed to insert todo', err);
      setError(err.message ?? 'Failed to add todo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Todos</h1>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={newTodo}
          onChange={(event) => setNewTodo(event.target.value)}
          placeholder="Add a new task"
          className="flex-1 rounded border border-slate-300 px-3 py-2"
          disabled={isSubmitting}
        />
        <button
          type="submit"
          disabled={isSubmitting || !newTodo.trim()}
          className="rounded bg-brand-blue px-4 py-2 text-white disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Add'}
        </button>
      </form>
      {loading && <p>Loading todos...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && (
        <ul className="space-y-2">
          {todos.length === 0 ? (
            <li>No todos found.</li>
          ) : (
            todos.map((todo) => (
              <li
                key={todo.id}
                className="flex items-center justify-between rounded border border-slate-200 px-3 py-2"
              >
                <span>{todo.task ?? 'Untitled task'}</span>
                <span className="text-sm text-slate-500">
                  {todo.is_complete ? 'Complete' : 'Pending'}
                </span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

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
                        <Route path="/todos" element={<TodosPage />} />
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
  const [tokens, setTokens] = useState(DEFAULT_TOKEN_BALANCE);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(!isSupabaseEnabled);
  const [isSyncingProfile, setIsSyncingProfile] = useState(false);
  const [hasLoadedLocalProfile, setHasLoadedLocalProfile] = useState(false);

  const loadProfileFromLocalStorage = useCallback(() => {
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
        setLastSavedProfile(firstProfile);
    }
  }, []);

  useEffect(() => {
    if (currentUser) return;
    if (hasLoadedLocalProfile) return;
    if (isSupabaseEnabled && !authReady) return;
    loadProfileFromLocalStorage();
    setHasLoadedLocalProfile(true);
  }, [authReady, currentUser, hasLoadedLocalProfile, loadProfileFromLocalStorage]);

  useEffect(() => {
    if (!isSupabaseEnabled || !supabase) {
        setAuthReady(true);
        return;
    }

    let isMounted = true;

    const initSession = async () => {
        try {
            const { data } = await supabase.auth.getSession();
            if (!isMounted) return;
            setCurrentUser(data.session?.user ?? null);
        } catch (error) {
            console.error("Failed to initialize Supabase auth session", error);
        } finally {
            if (isMounted) {
                setAuthReady(true);
            }
        }
    };

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
        setCurrentUser(session?.user ?? null);
    });

    initSession();

    return () => {
        isMounted = false;
        subscription?.subscription.unsubscribe();
    };
  }, []);
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

  useEffect(() => {
    if (!currentUser) return;

    let cancelled = false;
    setIsSyncingProfile(true);

    (async () => {
        try {
            const workspace = await fetchWorkspaceViaServer();
            if (cancelled) return;

            const storedProfile: ProfileData =
                workspace.profile ?? createNewProfile(currentUser.user_metadata?.full_name || currentUser.email || 'My First Profile');

            setProfile(storedProfile);
            setLastSavedProfile(storedProfile);

            const storedHistory = Array.isArray(workspace.documentHistory) ? workspace.documentHistory : [];
            setDocumentHistory(storedHistory);
            localStorage.setItem('documentHistory', JSON.stringify(storedHistory));

            const storedChatHistory = Array.isArray(workspace.careerChatHistory) ? workspace.careerChatHistory : [];
            setCareerChatHistory(storedChatHistory);
            localStorage.setItem('careerChatHistory', JSON.stringify(storedChatHistory));

            const storedTokens = typeof workspace.tokens === 'number' ? workspace.tokens : DEFAULT_TOKEN_BALANCE;
            setTokens(storedTokens);
        } catch (error) {
            if (!cancelled) {
                console.error('Failed to load workspace from API.', error);
            }
        } finally {
            if (!cancelled) {
                setIsSyncingProfile(false);
            }
        }
    })();

    return () => {
        cancelled = true;
    };
  }, [currentUser]);
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

  const persistUserData = useCallback(async (overrides: Partial<PersistedWorkspace> = {}) => {
    if (!currentUser) return;
    const payload = {
        id: currentUser.id,
        profile: overrides.profile ?? profile,
        document_history: overrides.documentHistory ?? documentHistory,
        career_chat_history: overrides.careerChatHistory ?? careerChatHistory,
        tokens: overrides.tokens ?? tokens,
        updated_at: new Date().toISOString(),
    };
    await persistWorkspaceViaServer({
        profile: payload.profile,
        documentHistory: payload.document_history,
        careerChatHistory: payload.career_chat_history,
        tokens: payload.tokens,
    });
  }, [currentUser, profile, documentHistory, careerChatHistory, tokens]);

  const enqueuePersist = useCallback((overrides?: Partial<PersistedWorkspace>) => {
    if (!currentUser) return;
    persistUserData(overrides).catch(err => {
        console.error("Workspace background sync failed.", err);
    });
  }, [persistUserData, currentUser]);
  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setCurrentUser(null);
    setProfile(null);
    setLastSavedProfile(null);
    setTokens(DEFAULT_TOKEN_BALANCE);

    try {
        const savedHistoryJSON = localStorage.getItem('documentHistory');
        setDocumentHistory(savedHistoryJSON ? JSON.parse(savedHistoryJSON) : []);
    } catch {
        setDocumentHistory([]);
    }

    try {
        const savedChatJSON = localStorage.getItem('careerChatHistory');
        setCareerChatHistory(savedChatJSON ? JSON.parse(savedChatJSON) : []);
    } catch {
        setCareerChatHistory([]);
    }

    setHasLoadedLocalProfile(false);
    loadProfileFromLocalStorage();
    setHasLoadedLocalProfile(true);
  }, [loadProfileFromLocalStorage]);
  const setTokensWithSync = useCallback((value: React.SetStateAction<number>) => {
    setTokens(prev => {
        const nextValue = typeof value === 'function' ? (value as (current: number) => number)(prev) : value;
        enqueuePersist({ tokens: nextValue });
        return nextValue;
    });
  }, [enqueuePersist]);

  const saveProfile = useCallback(async () => {
    if (!profile) return false;
    if (currentUser) {
        try {
            await persistUserData({ profile });
            setLastSavedProfile(profile);
            return true;
        } catch (error) {
            console.error("Failed to save profile to workspace backend", error);
            return false;
        }
    }
    try {
        localStorage.setItem('userProfile', JSON.stringify(profile));
        setLastSavedProfile(profile);
        console.log("Profile saved to localStorage.");
        return true;
    } catch (error) {
        console.error("Failed to save profile to localStorage", error);
        return false;
    }
  }, [profile, currentUser, persistUserData]);

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
        enqueuePersist({ documentHistory: updatedHistory });
        return updatedHistory;
    });
  }, [enqueuePersist]);
  
  const addCareerChatSummary = useCallback((summary: CareerChatSummary) => {
    setCareerChatHistory(prevHistory => {
        const updatedHistory = [summary, ...prevHistory].slice(0, 20); // Keep up to 20 summaries
        try {
            localStorage.setItem('careerChatHistory', JSON.stringify(updatedHistory));
        } catch (error) {
            console.error("Failed to save career chat history to localStorage", error);
        }
        enqueuePersist({ careerChatHistory: updatedHistory });
        return updatedHistory;
    });
  }, [enqueuePersist]);

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
          void saveProfile();
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
      tokens, setTokens: setTokensWithSync, 
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
      currentUser,
      authReady,
      isSupabaseEnabled,
      isSyncingProfile,
      signOut,
   }), [
      profile, setProfile, saveProfile, lastSavedProfile,
      tokens, setTokensWithSync, 
      isFetchingUrl, setIsFetchingUrl, isSidebarOpen, setIsSidebarOpen, 
      isSidebarCollapsed, setIsSidebarCollapsed,
      documentHistory, addDocumentToHistory,
      careerChatHistory, addCareerChatSummary,
      isParsing, parsingError, parseResumeInBackground,
      backgroundTasks, startBackgroundTask, updateBackgroundTask, markTaskAsViewed, clearAllNotifications,
      currentUser, authReady, isSupabaseEnabled, isSyncingProfile, signOut
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
