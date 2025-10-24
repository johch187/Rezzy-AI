import React from 'react';

const AccordionItem: React.FC<{
  sectionId: string;
  title: string;
  isOpen: boolean;
  setIsOpen: () => void;
  children: React.ReactNode;
}> = ({ sectionId, title, isOpen, setIsOpen, children }) => {
  const contentId = `${sectionId}-content`;
  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <h2>
        <button
          type="button"
          className="flex items-center justify-between w-full p-4 font-medium text-left text-gray-600 bg-gray-100 hover:bg-gray-200 focus:outline-none"
          onClick={setIsOpen}
          aria-expanded={isOpen}
          aria-controls={contentId}
        >
          <span>{title}</span>
          <svg
            className={`w-6 h-6 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
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
