import React, { useContext, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ProfileContext } from '../App';
import { XCircleIcon, DownloadIcon, CareerCoachIcon, CareerPathIcon } from './Icons';
import { downloadFile } from '../utils';

const CreateDocIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
);
const CoffeeChatIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V7a2 2 0 012-2h4M5 8h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H21" /></svg>
);

const Sidebar: React.FC = () => {
  const profileContext = useContext(ProfileContext);
  const location = useLocation();

  if (!profileContext) return null;

  const { isSidebarOpen, setIsSidebarOpen, documentHistory } = profileContext;

  // Close sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location, setIsSidebarOpen]);

  const handleDownload = (e: React.MouseEvent, content: string, name: string, type: 'resume' | 'coverLetter') => {
    e.stopPropagation(); // Prevent navigation or other parent events
    const sanitizedName = name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filename = `${sanitizedName}_${type}.md`;
    downloadFile(content, filename, 'text/markdown');
  };

  const navLinkClasses = "flex items-center px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-brand-blue transition-colors";
  const activeNavLinkClasses = "bg-brand-blue/10 text-brand-blue font-semibold";
  const highlightedNavLinkClasses = "bg-blue-50 text-blue-700 font-semibold hover:bg-blue-100";

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-40 z-50 transition-opacity duration-300 ease-in-out ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden="true"
      ></div>

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white w-72 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sidebar-title"
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
           <div className="flex items-center space-x-3">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-blue" viewBox="0 0 20 20" fill="currentColor">
               <path d="M10.394 2.08a1 1 0 00-.788 0l-7 4a1 1 0 00-.526.92V15a1 1 0 00.526.92l7 4a1 1 0 00.788 0l7-4a1 1 0 00.526-.92V6.994a1 1 0 00-.526-.92l-7-4zM10 18.341L3.5 14.5v-7.842L10 10.341v8zM16.5 14.5L10 18.341v-8L16.5 6.658v7.842zM10 3.659l6.5 3.714-6.5 3.715L3.5 7.373 10 3.659z" />
             </svg>
             <h2 id="sidebar-title" className="text-xl font-bold text-slate-900">Keju</h2>
           </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 rounded-full text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue"
            aria-label="Close navigation menu"
          >
            <XCircleIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div className="flex flex-col h-full">
            {/* Navigation Links */}
            <nav className="p-4">
              <ul className="space-y-2">
                <li>
                  <NavLink
                    to="/career-coach"
                    className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : highlightedNavLinkClasses}`}
                  >
                    <CareerCoachIcon />
                    Career Coach
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/coffee-chats"
                    className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}
                  >
                    <CoffeeChatIcon />
                    Coffee Chats
                  </NavLink>
                </li>
                 <li>
                  <NavLink
                    to="/career-path"
                    className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}
                  >
                    <CareerPathIcon />
                    Career Path
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/generate"
                    className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}
                  >
                    <CreateDocIcon />
                    Create Resume / Cover Letter
                  </NavLink>
                </li>
              </ul>
            </nav>
            
            {/* Document History */}
            <div className="p-4 border-t border-slate-200 flex-grow flex flex-col min-h-0">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
                History
                </h3>
                <div className="flex-grow overflow-y-auto pr-2 -mr-2">
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
      </aside>
    </>
  );
};

export default Sidebar;
