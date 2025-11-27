import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ProfileContext } from '../App';
import { CreateDocIcon } from '../components/Icons';
import { DocumentGeneration } from '../types';
import Container from '../components/Container';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';

const GeneratedDocumentsPage: React.FC = () => {
    const profileContext = useContext(ProfileContext);

    if (!profileContext) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    const { documentHistory } = profileContext;

    const getDocumentTitle = (doc: DocumentGeneration) => {
        if (doc.companyName && doc.jobTitle) {
            return `${doc.jobTitle} at ${doc.companyName}`;
        }
        return doc.jobTitle || doc.companyName || 'Untitled Application';
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
                                <li key={doc.id} className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-4 sm:flex-nowrap">
                                    <div className="min-w-0">
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
        </div>
    );
};

export default GeneratedDocumentsPage;
