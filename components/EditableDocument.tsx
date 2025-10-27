import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import type { ProfileData, ParsedCoverLetter } from '../types';
import { DownloadIcon, EditIcon, SaveIcon, CheckIcon, GoogleDocsIcon, SubscriptionCheckIcon } from './Icons';
import { coverLetterToMarkdown, profileToMarkdown, formatContentForDisplay } from './editor/markdownConverter';
import { ResumeDisplay } from './editor/ResumeDisplay';
import { CoverLetterDisplay } from './editor/CoverLetterDisplay';

// --- Type Guards ---
function isParsedCoverLetter(content: any): content is ParsedCoverLetter {
  return content && typeof content === 'object' && 'recipientName' in content && 'salutation' in content;
}

function isParsedResume(content: any): content is Partial<ProfileData> {
  return content && typeof content === 'object' && ('experience' in content || 'education' in content);
}

interface EditableDocumentProps {
  documentType: 'resume' | 'cover-letter';
  initialContent: string;
  onSave: (newContent: string, newStructuredData: Partial<ProfileData> | ParsedCoverLetter | null) => void;
  structuredContent?: Partial<ProfileData> | ParsedCoverLetter | null;
  tokens: number;
  setTokens: React.Dispatch<React.SetStateAction<number>>;
}

interface HistoryState {
  formData: Partial<ProfileData> | ParsedCoverLetter | null;
  sectionOrder: string[];
}

const EditableDocument: React.FC<EditableDocumentProps> = ({ documentType, initialContent, onSave, structuredContent, tokens, setTokens }) => {
  const [editedContent, setEditedContent] = useState(initialContent);
  const [formData, setFormData] = useState<Partial<ProfileData> | ParsedCoverLetter | null | undefined>(structuredContent);
  const [sectionOrder, setSectionOrder] = useState<string[]>([]);
  const [initialSectionOrder, setInitialSectionOrder] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const recordUndoState = useCallback(() => {
    setHistory(prev => [...prev, { formData, sectionOrder }]);
  }, [formData, sectionOrder]);

  const handleUndo = () => {
    if (history.length === 0) return;
    const lastState = history[history.length - 1];
    setFormData(lastState.formData);
    setSectionOrder(lastState.sectionOrder);
    setHistory(prev => prev.slice(0, -1));
  };

  useEffect(() => {
    setEditedContent(initialContent);
    setFormData(structuredContent);
    if (isParsedResume(structuredContent)) {
        const defaultOrder: string[] = ['summary', 'experience', 'education', 'projects', 'skills'];
        const initialOrder = structuredContent.sectionOrder || defaultOrder;

        const availableSections = initialOrder.filter(key => {
            if (key === 'skills') {
                return (structuredContent.technicalSkills?.length ?? 0 > 0) ||
                       (structuredContent.softSkills?.length ?? 0 > 0) ||
                       (structuredContent.tools?.length ?? 0 > 0);
            }
            const data = structuredContent[key as keyof ProfileData];
            return Array.isArray(data) ? data.length > 0 : !!data;
        });
        setSectionOrder(availableSections);
        setInitialSectionOrder(availableSections);
    }
  }, [initialContent, structuredContent]);

  useEffect(() => {
    if (isEditing) {
        setHistory([]);
    }
  }, [isEditing]);

  const handleSave = () => {
    let newMarkdown = editedContent;
    let newFormData = formData;

    if (isParsedCoverLetter(formData)) {
        newMarkdown = coverLetterToMarkdown(formData);
    } else if (isParsedResume(formData)) {
        const dataToSave: Partial<ProfileData> = { ...formData, sectionOrder };
        newMarkdown = profileToMarkdown(dataToSave, sectionOrder);
        newFormData = dataToSave;
    }
    onSave(newMarkdown, newFormData);
    setIsEditing(false);
    setShowSaveConfirmation(true);
    setTimeout(() => setShowSaveConfirmation(false), 3000);
  };

  const handleDownloadPdf = () => {
    if (tokens < 1) {
        console.warn("Attempted to download PDF with insufficient tokens.");
        return;
    }
    setTokens(prev => prev - 1);

    const contentElement = document.getElementById(`document-content-display-${documentType}`);
    if (!contentElement) {
      console.error('Printable content not found.');
      return;
    }
  
    const printContainer = document.createElement('div');
    printContainer.id = 'print-container';
    printContainer.innerHTML = contentElement.innerHTML;
    document.body.appendChild(printContainer);
    
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        body > *:not(#print-container) { display: none !important; }
        #print-container { display: block !important; margin: 2rem; }
      }
    `;
    document.head.appendChild(style);
    
    window.print();
    
    document.body.removeChild(printContainer);
    document.head.removeChild(style);
  };
  
  const handleOpenInGoogleDocs = () => {
    let contentToCopy = '';

    if (isParsedCoverLetter(formData)) {
        contentToCopy = coverLetterToMarkdown(formData);
    } else if (isParsedResume(formData)) {
        contentToCopy = profileToMarkdown(formData, sectionOrder);
    } else {
        contentToCopy = editedContent;
    }

    const plainTextContent = contentToCopy
        .replace(/^# (.*$)/gm, '$1')
        .replace(/^## (.*$)/gm, '$1')
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/^- /gm, '\u2022 ')
        .replace(/ \| /g, '\t')
        .replace(/\n{3,}/g, '\n\n');

    navigator.clipboard.writeText(plainTextContent).then(() => {
        setIsCopied(true);
        window.open('https://docs.google.com/document/create', '_blank', 'noopener,noreferrer');
        setTimeout(() => setIsCopied(false), 3000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
  };

  const handleCancel = () => {
    setEditedContent(initialContent);
    setFormData(structuredContent);
    if (isParsedResume(structuredContent)) {
        setSectionOrder(initialSectionOrder);
    }
    setIsEditing(false);
  };

  const isDirty = (structuredContent && formData)
    ? JSON.stringify(formData) !== JSON.stringify(structuredContent) || (isParsedResume(formData) && JSON.stringify(sectionOrder) !== JSON.stringify(initialSectionOrder))
    : editedContent !== initialContent;
  
  const hasEnoughTokensForDownload = tokens >= 1;
  
  return (
    <div className="bg-white p-8 sm:p-12 rounded-2xl shadow-xl border border-gray-200 animate-slide-in-up">
      <div id={`document-content-display-${documentType}`}>
          {isEditing ? (
              isParsedCoverLetter(formData) ? (
                <CoverLetterDisplay formData={formData} isEditing={isEditing} setFormData={setFormData as any} recordUndoState={recordUndoState} />
              ) : isParsedResume(formData) ? (
                <ResumeDisplay formData={formData} sectionOrder={sectionOrder} isEditing={isEditing} setFormData={setFormData as any} setSectionOrder={setSectionOrder} recordUndoState={recordUndoState} />
              ) : (
                  <textarea
                      className="w-full h-96 p-4 border border-gray-300 rounded-md focus:ring-primary focus:border-primary font-mono text-sm resize-y"
                      value={editedContent}
                      onChange={(e) => { recordUndoState(); setEditedContent(e.target.value); }}
                      aria-label={`Edit document content`}
                  />
              )
          ) : (
              isParsedCoverLetter(formData) ? (
                <CoverLetterDisplay formData={formData} isEditing={isEditing} setFormData={setFormData as any} recordUndoState={recordUndoState} />
              ) : isParsedResume(formData) ? (
                <ResumeDisplay formData={formData} sectionOrder={sectionOrder} isEditing={isEditing} setFormData={setFormData as any} setSectionOrder={setSectionOrder} recordUndoState={recordUndoState} />
              ) : (
                  <div
                      className="prose max-w-none prose-p:mb-4"
                      dangerouslySetInnerHTML={{ __html: formatContentForDisplay(initialContent) }}
                  />
              )
          )}
      </div>
          
      <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-end items-center gap-4">
               {showSaveConfirmation && (
                  <div className="flex items-center text-green-600 text-sm font-medium transition-opacity duration-300 animate-fade-in" role="status">
                      <CheckIcon /> <span className="ml-2">Saved successfully!</span>
                  </div>
              )}
              <div className="flex flex-wrap justify-end items-center gap-3">
                  {isEditing ? (
                    <>
                      <button onClick={handleUndo} disabled={history.length === 0} className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" /></svg>
                        Undo
                      </button>
                      <button onClick={handleCancel} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">Cancel</button>
                      <button onClick={handleSave} disabled={!isDirty} className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400">
                        <SaveIcon className="h-5 w-5 mr-2" />
                        Save
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={handleDownloadPdf} 
                        disabled={!hasEnoughTokensForDownload}
                        className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        {hasEnoughTokensForDownload ? (
                            <>
                                <DownloadIcon className="h-5 w-5 mr-2" />
                                <span>Download PDF (1 Token)</span>
                            </>
                        ) : (
                            <div className="text-center text-xs px-1">
                                <span className="font-bold text-red-600 block">Insufficient Tokens</span>
                                <Link to="/subscription" className="text-primary underline hover:text-blue-700">Get More</Link>
                            </div>
                        )}
                      </button>
                      <button
                        onClick={handleOpenInGoogleDocs}
                        className={`inline-flex items-center justify-center px-4 py-2 border rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200 ${
                            isCopied
                            ? 'bg-green-50 border-green-300 text-green-800'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {isCopied ? (
                            <SubscriptionCheckIcon className="h-5 w-5 text-green-600" />
                        ) : (
                            <GoogleDocsIcon className="h-5 w-5" />
                        )}
                        <span className="ml-2">{isCopied ? 'Copied! Now Paste.' : 'Open in Google Docs'}</span>
                      </button>
                      <button onClick={() => setIsEditing(true)} className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-secondary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary">
                        <EditIcon className="h-5 w-5 mr-2" />
                        Edit
                      </button>
                    </>
                  )}
              </div>
          </div>
      </div>
    </div>
  );
};

export default EditableDocument;
