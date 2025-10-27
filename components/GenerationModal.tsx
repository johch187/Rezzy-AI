import React from 'react';
import { LoadingSpinnerIcon } from './Icons';

const GenerationModal: React.FC<{ isOpen: boolean; thinkingMode: boolean }> = ({ isOpen, thinkingMode }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white p-8 sm:p-12 rounded-2xl shadow-xl border border-gray-200 text-center max-w-md w-full mx-4 transform transition-all animate-slide-in-up">
        <LoadingSpinnerIcon className="h-12 w-12 text-primary mx-auto" />
        <h2 className="text-2xl font-bold text-neutral mt-6">AI is Crafting Your Documents</h2>
        <p className="text-gray-600 mt-4">
          This may take a moment. Please don't close or refresh this tab.
        </p>
        {thinkingMode && (
          <p className="text-sm text-purple-700 bg-purple-100 p-3 rounded-lg mt-6 font-medium">
            <strong>Thinking Mode is enabled.</strong> This uses a more advanced model for higher quality results and may take up to a minute.
          </p>
        )}
      </div>
    </div>
  );
};

export default GenerationModal;