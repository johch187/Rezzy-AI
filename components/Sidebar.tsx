import React, { useState, useContext } from "react";
import {
  Sidebar as SidebarContainer,
  SidebarBody,
  SidebarLink,
} from "./ui/sidebar";
import { useSidebar } from "./ui/sidebar";
import { Link, useNavigate, useLocation } from "react-router-dom";
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

const TrashIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

export const Logo = () => {
  const { open } = useSidebar();
  return (
    <Link
      to="/career-coach"
      className="flex items-center gap-2.5 py-1"
    >
      <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
        <path d="M24 14L32.66 19V29L24 34L15.34 29V19L24 14Z" stroke="#0d0d0d" strokeWidth="2.5" strokeLinejoin="round"/>
        <path d="M32.66 19C37 16 43 19 43 26" stroke="#10a37f" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M32.66 29C37 32 43 29 43 22" stroke="#0d0d0d" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M15.34 29C11 32 5 29 5 22" stroke="#10a37f" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M15.34 19C11 16 5 19 5 26" stroke="#0d0d0d" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: open ? 1 : 0 }}
        className="font-semibold text-gray-900 whitespace-pre"
      >
        Keju
      </motion.span>
    </Link>
  );
};

export const LogoIcon = () => (
  <Link to="/career-coach" className="flex items-center py-1">
    <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
      <path d="M24 14L32.66 19V29L24 34L15.34 29V19L24 14Z" stroke="#0d0d0d" strokeWidth="2.5" strokeLinejoin="round"/>
      <path d="M32.66 19C37 16 43 19 43 26" stroke="#10a37f" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M32.66 29C37 32 43 29 43 22" stroke="#0d0d0d" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M15.34 29C11 32 5 29 5 22" stroke="#10a37f" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M15.34 19C11 16 5 19 5 26" stroke="#0d0d0d" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  </Link>
);

const Sidebar: React.FC = () => {
  const { careerChatHistory, removeCareerChat, backgroundTasks, markTaskAsViewed } = useContext(ProfileContext)!;
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

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

  const handleDeleteChat = (e: React.MouseEvent, chatId: string) => {
    e.preventDefault();
    e.stopPropagation();
    removeCareerChat(chatId);
    // If we're currently viewing this chat, navigate to a fresh chat
    if (location.search.includes(chatId)) {
      navigate('/career-coach');
    }
  };

  const links = [
    { label: "Career Coach", to: "/career-coach", icon: <CareerCoachIcon /> },
    { label: "Create Documents", to: "/generate", icon: <CreateDocIcon /> },
    { label: "Documents", to: "/generated-documents", icon: <DocumentDuplicateIcon />, notification: hasUnreadNotificationsFor('document-generation'), onClick: () => markTasksAsViewedFor('document-generation') },
    { label: "Career Path", to: "/career-path", icon: <CareerPathIcon />, notification: hasUnreadNotificationsFor('career-path'), onClick: () => markTasksAsViewedFor('career-path') },
    { label: "Interview Prep", to: "/interview-prep", icon: <InterviewPrepIcon />, notification: hasUnreadNotificationsFor('interview-prep'), onClick: () => markTasksAsViewedFor('interview-prep') },
    { label: "Coffee Chats", to: "/coffee-chats", icon: <CoffeeChatIcon />, notification: hasUnreadNotificationsFor('coffee-chat'), onClick: () => markTasksAsViewedFor('coffee-chat') },
  ];

  return (
    <SidebarContainer open={open} setOpen={setOpen} animate={true}>
      <SidebarBody>
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin">
          {/* Logo & Toggle */}
          <div className="px-2 flex items-center justify-between">
            {open ? <Logo /> : <LogoIcon />}
            {open && (
              <button 
                onClick={(e) => { e.stopPropagation(); setOpen(false); }}
                className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Collapse sidebar"
              >
                <SidebarToggleIcon collapsed={false} className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="mt-6 flex flex-col gap-1">
            {links.map((link, idx) => (
              <div key={idx} className="relative">
                <SidebarLink link={link} />
                {link.notification && (
                  <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary ring-2 ring-white" />
                )}
              </div>
            ))}
          </nav>

          {/* Chat History */}
          <div className={`mt-8 pt-6 border-t border-gray-100 transition-all duration-200 ${!open ? 'opacity-0 h-0 invisible' : 'opacity-100 visible'}`}>
            <div className="flex items-center justify-between px-2 mb-3">
              <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Recent Chats
              </h3>
              <Link 
                to="/career-coach" 
                className="text-xs text-primary hover:text-primary-600 transition-colors"
              >
                + New
              </Link>
            </div>
            {careerChatHistory.length > 0 ? (
              <ul className="space-y-0.5">
                {careerChatHistory.slice(0, 5).map(chatSummary => {
                  const date = new Date(chatSummary.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                  const hasMessages = chatSummary.messages && chatSummary.messages.length > 0;
                  return (
                    <li key={chatSummary.id} className="group relative">
                      <Link 
                        to={hasMessages ? `/career-coach?chat=${chatSummary.id}` : '/career-coach'}
                        className="flex items-center justify-between px-2 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors pr-8"
                      >
                        <span className="truncate group-hover:text-gray-900">{chatSummary.title}</span>
                        <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{date}</span>
                      </Link>
                      <button
                        onClick={(e) => handleDeleteChat(e, chatSummary.id)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                        title="Delete chat"
                      >
                        <TrashIcon />
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="px-2 text-sm text-gray-400">No chats yet</p>
            )}
          </div>
        </div>

        {/* Profile Menu */}
        <div className="mt-auto pt-4 border-t border-gray-100">
          <ProfileMenu isCollapsed={!open} />
        </div>
      </SidebarBody>
    </SidebarContainer>
  );
};

export default Sidebar;
