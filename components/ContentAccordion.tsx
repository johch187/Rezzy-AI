import React, { useState } from 'react';
import { ArrowIcon } from './Icons';
import { AnimatePresence, motion } from 'framer-motion';

const ContentAccordion: React.FC<{ title: string, children: React.ReactNode, initiallyOpen?: boolean }> = ({ title, children, initiallyOpen = false }) => {
    const [isOpen, setIsOpen] = useState(initiallyOpen);
    
    return (
        <div className="border-t border-slate-200 last:border-b-0">
            <button
                className="flex items-center justify-between w-full py-5 font-medium text-left text-slate-700 hover:text-slate-900 focus:outline-none"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="text-lg font-semibold">{title}</span>
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
                    transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                    className="overflow-hidden"
                >
                    <div className="pb-5">
                        {children}
                    </div>
                </motion.div>
            )}
            </AnimatePresence>
        </div>
    );
};

export default ContentAccordion;