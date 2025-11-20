import type { ParsedCoverLetter, ProfileData } from '../types';

export const parseError = (error: any): { message: string } => {
    if (error && typeof error.message === 'string') {
        return { message: error.message };
    }
    
    const displayMessage = `An unexpected error occurred. Details: ${String(error) || 'No additional details available.'}`;
    console.error("Unhandled Error:", error);
    return { message: displayMessage };
};

export const downloadFile = (content: string, filename: string, mimeType: string = 'text/plain') => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export function isParsedCoverLetter(content: any): content is ParsedCoverLetter {
  return content && typeof content === 'object' && 'recipientName' in content && 'salutation' in content;
}

export function isParsedResume(content: any): content is Partial<ProfileData> {
  return content && typeof content === 'object' && ('experience' in content || 'education' in content);
}

export const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' ');

export const isValidVideoId = (videoId: string): Promise<boolean> => {
    if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
        return Promise.resolve(false);
    }

    return new Promise((resolve) => {
        const img = new Image();
        img.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        img.onload = () => {
            resolve(img.naturalWidth > 120);
        };
        img.onerror = () => {
            resolve(false);
        };
    });
};
