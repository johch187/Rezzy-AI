import React, { useContext } from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { ProfileContext } from '../App';
// FIX: Added UserIcon to imports
import { XCircleIcon, CareerPathIcon, InterviewPrepIcon, CreateDocIcon, CoffeeChatIcon, SidebarToggleIcon, UserIcon, CareerCoachIcon, DocumentDuplicateIcon } from './Icons';
import ProfileMenu from './ProfileMenu';
import type { BackgroundTask } from '../types';

const Sidebar: React.FC = () => {
  const profileContext = useContext(ProfileContext);
  const location = useLocation();

  if (!profileContext) return null;

  const { isSidebarOpen, setIsSidebarOpen, documentHistory, careerChatHistory, isSidebarCollapsed, setIsSidebarCollapsed, backgroundTasks, markTaskAsViewed } = profileContext;

  const getNavLinkClasses = (isActive: boolean, isHighlighted = false) => {
    const base = `flex items-center font-medium transition-all duration-300 ease-out text-sm`;
    const expanded = `px-3 py-2 rounded-lg gap-x-3`;
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
  
  // Removed this useEffect to prevent automatic closing of the mobile sidebar on initial app page load.
  // Mobile sidebar will now stay open if isSidebarOpen is true, until a link is clicked or the close button is used.
  // React.useEffect(() => {
  //   if (isSidebarOpen) {
  //       setIsSidebarOpen(false);
  //   }
  // }, [location.pathname]);

  const hasUnreadNotificationsFor = (type: BackgroundTask['type']) => {
    return backgroundTasks.some(task => task.type === type && (task.status === 'completed' || task.status === 'error') && !task.viewed);
  };

  const markTasksAsViewedFor = (type: BackgroundTask['type']) => {
    backgroundTasks.forEach(task => {
        if (task.type === type && !task.viewed) {
            markTaskAsViewed(task.id);
        }
    });
  };

  const NotificationDot: React.FC = () => (
    <span className={`absolute block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white ${isSidebarCollapsed ? 'lg:top-2 lg:right-2' : 'top-1 right-1'}`}></span>
  );

  return (
    <>
      {/* Removed the fixed inset-0 bg-black overlay div to allow interaction with the main content */}

      <aside
        onClick={() => {
          // Only expand if currently collapsed on a large screen
          if (isSidebarCollapsed) {
            setIsSidebarCollapsed(false);
          }
        }}
        className={`fixed top-0 left-0 h-full bg-white shadow-2xl z-50 transform transition-transform lg:transition-all duration-300 ease-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:shadow-none ${isSidebarCollapsed ? 'lg:w-20 lg:cursor-pointer' : 'lg:w-64'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sidebar-title"
      >
        <div className="flex flex-col h-full">
           <div className={`flex items-center h-[65px] px-6 flex-shrink-0 ${isSidebarCollapsed ? 'lg:justify-center' : 'justify-between'}`}>
               <Link to="/career-coach" className="flex items-center gap-2 overflow-hidden text-slate-900" onClick={(e) => {e.stopPropagation(); setIsSidebarOpen(false);}}>
                 {isSidebarCollapsed ? (
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-900">
                      {/* Main path with bigger loops */}
                      <path d="M6 40 C 18 25, 12 45, 24 24 C 36 3, 30 23, 42 8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                      {/* Secondary path with bigger loops */}
                      <path d="M10 32 C 16 20, 20 32, 24 24" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="6" cy="40" r="2.5" fill="currentColor"/>
                      <circle cx="10" cy="32" r="2.5" fill="currentColor"/>
                      <circle cx="24" cy="24" r="2.5" fill="currentColor"/>
                      <circle cx="42" cy="8" r="2.5" fill="currentColor"/>
                    </svg>
                 ) : (
                    <>
                      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-8 w-auto text-slate-900">
                        {/* Main path with bigger loops */}
                        <path d="M6 40 C 18 25, 12 45, 24 24 C 36 3, 30 23, 42 8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                        {/* Secondary path with bigger loops */}
                        <path d="M10 32 C 16 20, 20 32, 24 24" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="6" cy="40" r="2.5" fill="currentColor"/>
                        <circle cx="10" cy="32" r="2.5" fill="currentColor"/>
                        <circle cx="24" cy="24" r="2.5" fill="currentColor"/>
                        <circle cx="42" cy="8" r="2.5" fill="currentColor"/>
                      </svg>
                      <span className="text-xl font-bold">Keju</span>
                    </>
                 )}
               </Link>
                <div className={isSidebarCollapsed ? 'lg:hidden' : ''}>
                    {!isSidebarCollapsed && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); setIsSidebarCollapsed(true); }} 
                            className="hidden lg:block p-2 rounded-full text-slate-600 hover:bg-slate-100"
                            aria-label="Collapse sidebar"
                        >
                            <SidebarToggleIcon collapsed={isSidebarCollapsed} />
                        </button>
                    )}
                    <button onClick={() => setIsSidebarOpen(false)} className="p-2 rounded-full text-slate-600 hover:bg-slate-100 lg:hidden">
                        <XCircleIcon className="h-6 w-6" />
                    </button>
                </div>
           </div>
           
           <nav className="flex-grow pt-4 overflow-y-auto">
               <ul className="space-y-1 px-6">
                   <li><NavLink to="/career-coach" onClick={() => setIsSidebarOpen(false)} className={({ isActive }) => getNavLinkClasses(isActive)}><CareerCoachIcon /><span className={textSpanClasses}>New Chat</span></NavLink></li>
                   <li><NavLink to="/generate" onClick={() => setIsSidebarOpen(false)} className={({ isActive }) => getNavLinkClasses(isActive)}><CreateDocIcon /><span className={textSpanClasses}>Tailor App</span></NavLink></li>
                   <li>
                        <NavLink to="/generated-documents" onClick={() => { markTasksAsViewedFor('document-generation'); setIsSidebarOpen(false); }} className={({ isActive }) => getNavLinkClasses(isActive) + ' relative'}>
                            <DocumentDuplicateIcon />
                            <span className={textSpanClasses}>Documents</span>
                            {hasUnreadNotificationsFor('document-generation') && <NotificationDot />}
                        </NavLink>
                   </li>
                   <li>
                        <NavLink to="/career-path" onClick={() => { markTasksAsViewedFor('career-path'); setIsSidebarOpen(false); }} className={({ isActive }) => getNavLinkClasses(isActive) + ' relative'}>
                           <CareerPathIcon />
                           <span className={textSpanClasses}>Career Path</span>
                           {hasUnreadNotificationsFor('career-path') && <NotificationDot />}
                        </NavLink>
                   </li>
                   <li>
                        <NavLink to="/interview-prep" onClick={() => { markTasksAsViewedFor('interview-prep'); setIsSidebarOpen(false); }} className={({ isActive }) => getNavLinkClasses(isActive) + ' relative'}>
                            <InterviewPrepIcon />
                            <span className={textSpanClasses}>Interview Prep</span>
                            {hasUnreadNotificationsFor('interview-prep') && <NotificationDot />}
                        </NavLink>
                   </li>
                   <li>
                        <NavLink to="/coffee-chats" onClick={() => { markTasksAsViewedFor('coffee-chat'); setIsSidebarOpen(false); }} className={({ isActive }) => getNavLinkClasses(isActive) + ' relative'}>
                            <CoffeeChatIcon />
                            <span className={textSpanClasses}>Coffee Chats</span>
                            {hasUnreadNotificationsFor('coffee-chat') && <NotificationDot />}
                        </NavLink>
                   </li>
               </ul>

               <div className={`mt-8 pt-4 transition-opacity duration-300 ${isSidebarCollapsed ? 'lg:opacity-0 lg:h-0' : 'lg:opacity-100'}`}>
                   <h3 className="px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Career Chat History</h3>
                   {careerChatHistory.length > 0 ? (
                       <ul className="mt-2 space-y-1 px-6">
                           {careerChatHistory.map(chatSummary => {
                               const date = new Date(chatSummary.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                               return (
                                   <li key={chatSummary.id}>
                                       <Link 
                                        to="/career-coach" 
                                        onClick={() => setIsSidebarOpen(false)} // Close sidebar when history link is clicked
                                        className="group flex items-center justify-between text-sm px-4 py-2 rounded-lg text-slate-700 hover:bg-slate-100"
                                       >
                                           <span className="truncate">{chatSummary.title}</span>
                                           <span className="text-xs text-slate-500 flex-shrink-0 ml-2">{date}</span>
                                       </Link>
                                   </li>
                               );
                           })}
                       </ul>
                   ) : (
                       <p className="mt-2 px-6 text-sm text-slate-500">No chat history yet.</p>
                   )}
               </div>
           </nav>
           
           <div className="flex-shrink-0 p-2">
                {/* FIX: Corrected variable name from isCollapsed to isSidebarCollapsed */}
                <ProfileMenu isCollapsed={isSidebarCollapsed} />
           </div>
        </div>
      </aside>
    </>
  );
};

// FIX: Added default export to resolve module import error.
export default Sidebar;