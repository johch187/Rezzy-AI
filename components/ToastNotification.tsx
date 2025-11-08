import React from 'react';

interface ToastNotificationProps {
    toast: { message: string; id: string } | null;
    onDismiss: () => void;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({ toast, onDismiss }) => {
    if (!toast) return null;

    return (
        <div className="fixed top-24 right-6 bg-slate-900 text-white py-3 px-5 rounded-lg shadow-2xl z-[60] animate-slide-in-up" role="status">
            {toast.message}
        </div>
    );
};

export default ToastNotification;