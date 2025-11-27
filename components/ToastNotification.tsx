import React from 'react';
import { XCircleIcon } from './Icons';

interface ToastNotificationProps {
  toast: { message: string; id: string } | null;
  onDismiss: () => void;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({ toast, onDismiss }) => {
  if (!toast) return null;

  return (
    <div 
      key={toast.id}
      className="fixed bottom-6 right-6 z-50 animate-fade-in"
    >
      <div className="flex items-center gap-3 bg-gray-900 text-white py-3 px-4 rounded-lg shadow-xl">
        <span className="text-sm font-medium">{toast.message}</span>
        <button 
          onClick={onDismiss}
          className="p-1 rounded-md hover:bg-white/10 transition-colors"
        >
          <XCircleIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ToastNotification;
