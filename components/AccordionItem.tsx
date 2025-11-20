import React from 'react';
import { ArrowIcon } from './Icons';
import { motion, AnimatePresence } from 'framer-motion';

const AccordionItem: React.FC<{
  sectionId: string;
  title: string;
  isOpen: boolean;
  setIsOpen: () => void;
  children: React.ReactNode;
}> = ({ sectionId, title, isOpen, setIsOpen, children }) => {
  const contentId = `${sectionId}-content`;
  return (
    <div className="border-b border-slate-200 last:border-b-0">
      <button
        type="button"
        className="flex items-center justify-between w-full p-4 font-semibold text-left text-slate-700 hover:bg-slate-50 focus:outline-none rounded-t-lg"
        onClick={setIsOpen}
        aria-expanded={isOpen}
        aria-controls={contentId}
      >
        <span>{title}</span>
        <ArrowIcon collapsed={!isOpen} />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { opacity: 1, height: "auto" },
              collapsed: { opacity: 0, height: 0 }
            }}
            transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
            id={contentId}
            role="region"
            className="overflow-hidden"
          >
            <div className="p-4 pt-0">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AccordionItem;