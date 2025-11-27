import React from 'react';
import { ArrowIcon } from './Icons';
import { motion, AnimatePresence } from 'framer-motion';

interface AccordionItemProps {
  sectionId: string;
  title: string;
  isOpen: boolean;
  setIsOpen: () => void;
  children: React.ReactNode;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ 
  sectionId, 
  title, 
  isOpen, 
  setIsOpen, 
  children 
}) => {
  const contentId = `${sectionId}-content`;
  
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        type="button"
        className="flex items-center justify-between w-full py-4 px-1 text-left text-gray-700 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 rounded-lg transition-colors"
        onClick={setIsOpen}
        aria-expanded={isOpen}
        aria-controls={contentId}
      >
        <span className="text-sm font-medium">{title}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ArrowIcon collapsed={!isOpen} className="w-4 h-4 text-gray-400" />
        </motion.div>
      </button>
      
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            id={contentId}
            role="region"
            className="overflow-hidden"
          >
            <div className="pb-4 px-1">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AccordionItem;
