import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProfileContext } from '../App';
import { CreateDocIcon } from '../components/Icons';
import { DocumentGeneration } from '../types';
import Container from '../components/Container';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';

const TrashIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

// Confirmation Dialog Component
const ConfirmDialog: React.FC<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}> = ({ isOpen, title, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onCancel}
            />
            
            {/* Dialog */}
            <div className="relative bg-white rounded-xl shadow-xl max-w-sm w-full mx-4 p-6 animate-in fade-in zoom-in-95 duration-200">
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                <p className="mt-2 text-sm text-gray-600">{message}</p>
                
                <div className="mt-6 flex gap-3 justify-end">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

const GeneratedDocumentsPage: React.FC = () => {
    const profileContext = useContext(ProfileContext);
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; documentId: string | null; title: string }>({
        isOpen: false,
        documentId: null,
        title: '',
    });

    if (!profileContext) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    const { documentHistory, removeDocument } = profileContext;

    const getDocumentTitle = (doc: DocumentGeneration) => {
        if (doc.companyName && doc.jobTitle) {
            return `${doc.jobTitle} at ${doc.companyName}`;
        }
        return doc.jobTitle || doc.companyName || 'Untitled Application';
    };

    const handleDeleteClick = (doc: DocumentGeneration) => {
        setDeleteConfirm({
            isOpen: true,
            documentId: doc.id,
            title: getDocumentTitle(doc),
        });
    };

    const handleConfirmDelete = () => {
        if (deleteConfirm.documentId) {
            removeDocument(deleteConfirm.documentId);
        }
        setDeleteConfirm({ isOpen: false, documentId: null, title: '' });
    };

    const handleCancelDelete = () => {
        setDeleteConfirm({ isOpen: false, documentId: null, title: '' });
    };

    return (
        <div className="flex-grow bg-gray-50">
            <Container>
                <PageHeader
                    title="Generated Documents"
                    description="Your resumes and cover letters in one place."
                />

                {documentHistory.length > 0 ? (
                    <Card>
                        <ul role="list" className="divide-y divide-gray-100">
                            {documentHistory.map((doc) => (
                                <li key={doc.id} className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-4 sm:flex-nowrap group">
                                    <div className="min-w-0 flex-1">
                                        <Link
                                            to="/generate/results"
                                            state={{
                                                generatedContent: {
                                                    resume: doc.resumeContent,
                                                    coverLetter: doc.coverLetterContent,
                                                },
                                                analysisResult: doc.analysisResult,
                                                parsedResume: doc.parsedResume,
                                                parsedCoverLetter: doc.parsedCoverLetter,
                                            }}
                                            className="text-sm font-medium text-gray-900 hover:text-primary transition-colors"
                                        >
                                            {getDocumentTitle(doc)}
                                        </Link>
                                        <p className="mt-1 text-xs text-gray-500">
                                            {new Date(doc.generatedAt).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex gap-2">
                                            {doc.resumeContent && (
                                                <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20">
                                                    Resume
                                                </span>
                                            )}
                                            {doc.coverLetterContent && (
                                                <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20">
                                                    Cover Letter
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleDeleteClick(doc)}
                                            className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                                            title="Delete document"
                                        >
                                            <TrashIcon />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </Card>
                ) : (
                    <Card className="text-center py-12">
                        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
                            <CreateDocIcon />
                        </div>
                        <h3 className="mt-4 text-base font-medium text-gray-900">No Documents Yet</h3>
                        <p className="mt-1 text-sm text-gray-500">Your generated resumes and cover letters will appear here.</p>
                        <div className="mt-5">
                            <Button as="link" to="/generate" variant="primary">
                                Tailor Your First Application
                            </Button>
                        </div>
                    </Card>
                )}
            </Container>

            {/* Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                title="Delete Document?"
                message={`Are you sure you want to delete "${deleteConfirm.title}"? This action cannot be undone.`}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
            />
        </div>
    );
};

export default GeneratedDocumentsPage;
