import React, { useState, useContext } from "react";
import {
  Sidebar as SidebarContainer,
  SidebarBody,
  SidebarLink,
} from "./ui/sidebar";
import { useSidebar } from "./ui/sidebar";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CareerCoachIcon,
  CreateDocIcon,
  DocumentDuplicateIcon,
  CareerPathIcon,
  InterviewPrepIcon,
  CoffeeChatIcon,
  SidebarToggleIcon,
} from "./Icons";
import ProfileMenu from "./ProfileMenu";
import { ProfileContext } from "../App";
import type { BackgroundTask } from '../types';

export const Logo = () => {
  const { open } = useSidebar();
  return (
    <Link
      to="/career-coach"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-8 w-auto text-slate-900 flex-shrink-0">
        <path d="M6 40 C 18 25, 12 45, 24 24 C 36 3, 30 23, 42 8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10 32 C 16 20, 20 32, 24 24" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="6" cy="40" r="2.5" fill="currentColor"/>
        <circle cx="10" cy="32" r="2.5" fill="currentColor"/>
        <circle cx="24" cy="24" r="2.5" fill="currentColor"/>
        <circle cx="42" cy="8" r="2.5" fill="currentColor"/>
      </svg>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: open ? 1 : 0 }}
        className="font-bold text-xl text-slate-900 whitespace-pre"
      >
        Keju
      </motion.span>
    </Link>
  );
};

export const LogoIcon = () => {
  return (
    <Link
      to="/career-coach"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-8 w-auto text-slate-900 flex-shrink-0">
          <path d="M6 40 C 18 25, 12 45, 24 24 C 36 3, 30 23, 42 8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M10 32 C 16 20, 20 32, 24 24" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="6" cy="40" r="2.5" fill="currentColor"/>
          <circle cx="10" cy="32" r="2.5" fill="currentColor"/>
          <circle cx="24" cy="24" r="2.5" fill="currentColor"/>
          <circle cx="42" cy="8" r="2.5" fill="currentColor"/>
        </svg>
    </Link>
  );
};

const Sidebar: React.FC = () => {
    const { careerChatHistory, backgroundTasks, markTaskAsViewed } = useContext(ProfileContext)!;
    const [open, setOpen] = useState(true); // Default to true

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

    const links = [
        { label: "New Chat", to: "/career-coach", icon: <CareerCoachIcon /> },
        { label: "Tailor App", to: "/generate", icon: <CreateDocIcon /> },
        { label: "Documents", to: "/generated-documents", icon: <DocumentDuplicateIcon />, notification: hasUnreadNotificationsFor('document-generation'), onClick: () => markTasksAsViewedFor('document-generation') },
        { label: "Career Path", to: "/career-path", icon: <CareerPathIcon />, notification: hasUnreadNotificationsFor('career-path'), onClick: () => markTasksAsViewedFor('career-path') },
        { label: "Interview Prep", to: "/interview-prep", icon: <InterviewPrepIcon />, notification: hasUnreadNotificationsFor('interview-prep'), onClick: () => markTasksAsViewedFor('interview-prep') },
        { label: "Coffee Chats", to: "/coffee-chats", icon: <CoffeeChatIcon />, notification: hasUnreadNotificationsFor('coffee-chat'), onClick: () => markTasksAsViewedFor('coffee-chat') },
    ];
    
    return (
        <SidebarContainer open={open} setOpen={setOpen} animate={true}>
            <SidebarBody>
                <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                    <div className="px-2 flex items-center justify-between">
                        {open ? <Logo /> : <LogoIcon />}
                        {open && (
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setOpen(false);
                                }}
                                className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors"
                                aria-label="Collapse sidebar"
                            >
                                <SidebarToggleIcon collapsed={false} className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                    <div className="mt-8 flex flex-col gap-2">
                        {links.map((link, idx) => (
                            <div key={idx} className="relative" onClick={link.onClick}>
                                <SidebarLink link={link} />
                                {link.notification && <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>}
                            </div>
                        ))}
                    </div>
                    <div className={`mt-8 pt-4 transition-all duration-300 ${!open ? 'opacity-0 h-0 invisible' : 'opacity-100 visible'}`}>
                        <h3 className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Career Chat History</h3>
                        {careerChatHistory.length > 0 ? (
                            <ul className="mt-2 space-y-1">
                                {careerChatHistory.slice(0, 5).map(chatSummary => {
                                    const date = new Date(chatSummary.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                                    return (
                                        <li key={chatSummary.id}>
                                            <Link 
                                                to="/career-coach" 
                                                className="group flex items-center justify-between text-sm px-2 py-2 rounded-lg text-slate-700 hover:bg-slate-100"
                                            >
                                                <span className="truncate">{chatSummary.title}</span>
                                                <span className="text-xs text-slate-500 flex-shrink-0 ml-2">{date}</span>
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <p className="mt-2 px-2 text-sm text-slate-500">No chat history yet.</p>
                        )}
                    </div>
                </div>
                <div>
                    <ProfileMenu isCollapsed={!open} />
                </div>
            </SidebarBody>
        </SidebarContainer>
    );
};

export default Sidebar;
