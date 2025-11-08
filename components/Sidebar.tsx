import React, { useContext, useEffect, useState, useRef } from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { ProfileContext } from '../App';
import { XCircleIcon, DownloadIcon, CareerCoachIcon, CareerPathIcon, InterviewPrepIcon, UserIcon, CreateDocIcon, CoffeeChatIcon } from './Icons';
import { downloadFile } from '../utils';

const SidebarToggleIcon: React.FC<{ collapsed: boolean }> = ({ collapsed }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        {collapsed ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 4.5l7.5 7.5-7.5 7.5m6-15l7.5 7.5-7.5 7.5" />
        ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
        )}
    </svg>
);


const Sidebar: React.FC = () => {
  const profileContext = useContext(ProfileContext);
  const location = useLocation();
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  if (!profileContext) return null;

  const { isSidebarOpen, setIsSidebarOpen, documentHistory, profile: activeProfile, tokens, isSidebarCollapsed, setIsSidebarCollapsed } = profileContext;

  const handleSidebarClick = (e: React.MouseEvent<HTMLElement>) => {
      if (isSidebarCollapsed) {
          setIsSidebarCollapsed(false);
      }
  };

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location, setIsSidebarOpen]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
            setProfileMenuOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDownload = (e: React.MouseEvent, content: string, name: string, type: 'resume' | 'coverLetter') => {
    e.stopPropagation();
    const sanitizedName = name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filename = `${sanitizedName}_${type}.md`;
    downloadFile(content, filename, 'text/markdown');
  };
  
  const getNavLinkClasses = (isActive: boolean, isHighlighted = false) => {
    const base = `flex items-center font-medium transition-all duration-300 ease-out`;
    const expanded = `px-4 py-3 rounded-lg gap-x-3`;
    const collapsed = `h-12 w-12 mx-auto rounded-full justify-center gap-x-0`;
    
    let stateClasses = 'text-slate-700 hover:bg-slate-100 hover:text-brand-blue';
    if (isActive) {
      stateClasses = 'bg-brand-blue/10 text-brand-blue font-semibold';
    } else if (isHighlighted) {
      stateClasses = 'bg-blue-50 text-blue-700 font-semibold hover:bg-blue-100';
    }

    return `${base} ${stateClasses} ${isSidebarCollapsed ? collapsed : expanded}`;
  };

  const textSpanClasses = `whitespace-nowrap overflow-hidden transition-all duration-200 ease-out ${isSidebarCollapsed ? 'lg:w-0 lg:opacity-0' : 'lg:w-auto lg:opacity-100'}`;
  
  const handleProfileButtonClick = () => {
    if (isSidebarCollapsed) {
      setIsSidebarCollapsed(false);
      setProfileMenuOpen(true);
    } else {
      setProfileMenuOpen(!isProfileMenuOpen);
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-40 z-40 transition-opacity duration-300 ease-out lg:hidden ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden="true"
      ></div>

      <aside
        onClick={handleSidebarClick}
        className={`fixed top-0 left-0 h-full bg-white shadow-2xl z-50 transform transition-transform lg:transition-all duration-300 ease-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:shadow-none lg:border-r lg:border-slate-200 ${isSidebarCollapsed ? 'lg:w-24 lg:cursor-pointer' : 'lg:w-72'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sidebar-title"
      >
        <div className="flex flex-col h-full">
           <div className={`flex items-center h-[65px] p-4 flex-shrink-0 transition-all duration-300 ease-out ${isSidebarCollapsed ? '' : 'justify-between'}`}>
               <Link to="/builder" className={`flex items-center overflow-hidden ${isSidebarCollapsed ? 'w-full justify-center' : 'space-x-3'}`} onClick={(e) => e.stopPropagation()}>
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-blue flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                   <path d="M10.394 2.08a1 1 0 00-.788 0l-7 4a1 1 0 00-.526.92V15a1 1 0 00.526.92l7 4a1 1 0 00.788 0l7-4a1 1 0 00.526-.92V6.994a1 1 0 00-.526-.92l-7-4zM10 18.341L3.5 14.5v-7.842L10 10.341v8zM16.5 14.5L10 18.341v-8L16.5 6.658v7.842zM10 3.659l6.5 3.714-6.5 3.715L3.5 7.373 10 3.659z" />
                 </svg>
                 <h2 id="sidebar-title" className={`text-xl font-bold text-slate-900 ${textSpanClasses}`}>Keju</h2>
               </Link>
                <button
                    onClick={(e) => { e.stopPropagation(); setIsSidebarCollapsed(true); }}
                    className={`hidden lg:block p-2 rounded-full text-slate-500 hover:bg-slate-100 transition-opacity duration-300 ${isSidebarCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                    aria-label="Collapse sidebar"
                >
                    <SidebarToggleIcon collapsed={isSidebarCollapsed} />
                </button>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 rounded-full text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue lg:hidden"
                aria-label="Close navigation menu"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="flex-grow min-h-0 overflow-y-auto">
                <nav className="p-4">
                     <ul className="space-y-2">
                        <li>
                          <NavLink
                            to="/career-coach"
                            className={({ isActive }) => getNavLinkClasses(isActive, true)}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <CareerCoachIcon />
                            <span className={textSpanClasses}>Career Coach</span>
                          </NavLink>
                        </li>
                        <li>
                          <NavLink
                            to="/career-path"
                            className={({ isActive }) => getNavLinkClasses(isActive)}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <CareerPathIcon />
                            <span className={textSpanClasses}>Career Path</span>
                          </NavLink>
                        </li>
                         <li>
                          <NavLink
                            to="/generate"
                            className={({ isActive }) => getNavLinkClasses(isActive)}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <CreateDocIcon />
                            <span className={textSpanClasses}>Tailor Application</span>
                          </NavLink>
                        </li>
                        <li>
                          <NavLink
                            to="/interview-prep"
                            className={({ isActive }) => getNavLinkClasses(isActive)}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <InterviewPrepIcon />
                            <span className={textSpanClasses}>Interview Prep</span>
                          </NavLink>
                        </li>
                         <li>
                          <NavLink
                            to="/coffee-chats"
                            className={({ isActive }) => getNavLinkClasses(isActive)}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <CoffeeChatIcon />
                            <span className={textSpanClasses}>Coffee Chats</span>
                          </NavLink>
                        </li>
                    </ul>
                </nav>
                
                <div className={`overflow-hidden transition-all duration-300 ease-out ${isSidebarCollapsed ? 'lg:max-h-0 lg:opacity-0' : 'lg:max-h-[1000px] lg:opacity-100'}`} onClick={(e) => e.stopPropagation()}>
                    <div className="p-4 border-t border-slate-200">
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
                        History
                        </h3>
                        {documentHistory && documentHistory.length > 0 ? (
                            <ul className="space-y-2">
                            {documentHistory.map(doc => (
                                <li key={doc.id} className="group flex items-center justify-between p-2 rounded-lg hover:bg-slate-100">
                                <div className="flex-grow overflow-hidden">
                                    <p className="text-sm font-medium text-slate-800 truncate" title={doc.name}>
                                    {doc.name}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                    {new Date(doc.generatedAt).toLocaleDateString()}
                                    <span className="capitalize mx-1">&bull; {doc.type}</span>
                                    </p>
                                </div>
                                <button 
                                    onClick={(e) => handleDownload(e, doc.content, doc.name, doc.type)}
                                    className="ml-2 p-1 text-slate-400 hover:text-brand-blue opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                                    aria-label={`Download ${doc.name}`}
                                    title="Download Markdown"
                                >
                                    <DownloadIcon />
                                </button>
                                </li>
                            ))}
                            </ul>
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-sm text-slate-500">
                                Generated documents will appear here.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-4 border-t border-slate-200 flex-shrink-0" ref={profileMenuRef} onClick={(e) => e.stopPropagation()}>
                <div className="relative">
                    <button onClick={handleProfileButtonClick} className={`flex items-center hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue ${isSidebarCollapsed ? 'h-12 w-12 mx-auto rounded-full justify-center' : 'w-full text-left p-2 rounded-lg gap-x-3'}`}>
                         <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 text-slate-600">
                            <UserIcon />
                        </div>
                        <span className={`font-semibold text-slate-800 truncate ${isSidebarCollapsed ? 'flex-grow-0' : 'flex-grow'} ${textSpanClasses}`}>{activeProfile?.fullName || activeProfile?.name || 'No Profile'}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-slate-500 transition-all duration-300 ${isSidebarCollapsed ? 'lg:w-0 lg:opacity-0' : 'lg:w-auto'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01" /></svg>
                    </button>
                    {isProfileMenuOpen && (
                        <div className={`absolute bottom-full mb-2 bg-white rounded-lg shadow-2xl border border-slate-200 z-10 animate-fade-in ${isSidebarCollapsed ? 'w-48 left-1/2 -translate-x-1/2' : 'w-full'}`}>
                            <div className="px-4 py-3">
                                <p className="text-xs text-slate-500 uppercase tracking-wider">Tokens</p>
                                <div className="flex items-center justify-between mt-2">
                                    <div className="flex items-center">
                                        <span className="text-lg font-bold text-slate-900">{tokens}</span>
                                    </div>
                                    <Link 
                                        to="/subscription" 
                                        onClick={() => setProfileMenuOpen(false)} 
                                        className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors" 
                                        title="Get More Tokens"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                            <div className="border-t border-slate-100"></div>
                            <div className="py-1" role="none">
                              <Link to="/builder" onClick={() => setProfileMenuOpen(false)} className="text-slate-700 block w-full text-left px-4 py-2 text-sm hover:bg-slate-100" role="menuitem">My Profile</Link>
                              <Link to="/account" onClick={() => setProfileMenuOpen(false)} className="text-slate-700 block w-full text-left px-4 py-2 text-sm hover:bg-slate-100" role="menuitem">Account Settings</Link>
                              <div className="border-t border-slate-100 my-1"></div>
                              <Link to="/" onClick={() => setProfileMenuOpen(false)} className="text-slate-700 block w-full text-left px-4 py-2 text-sm hover:bg-slate-100" role="menuitem">Logout</Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;