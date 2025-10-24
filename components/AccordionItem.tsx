import React from 'react';
import { ArrowIcon } from './Icons';

const AccordionItem: React.FC<{
  sectionId: string;
  title: string;
  isOpen: boolean;
  setIsOpen: () => void;
  children: React.ReactNode;
}> = ({ sectionId, title, isOpen, setIsOpen, children }) => {
  const contentId = `${sectionId}-content`;
  return (
    <div className="border border-gray-300 rounded-lg">
      <h2>
        <button
          type="button"
          className="flex items-center justify-between w-full p-4 font-medium text-left text-gray-600 bg-gray-100 hover:bg-gray-200 focus:outline-none"
          onClick={setIsOpen}
          aria-expanded={isOpen}
          aria-controls={contentId}
        >
          <span>{title}</span>
          <ArrowIcon collapsed={!isOpen} />
        </button>
      </h2>
      {isOpen && (
        <div id={contentId} role="region" className="p-4 bg-white border-t border-gray-300">
          {children}
        </div>
      )}
    </div>
  );
};

export default AccordionItem;