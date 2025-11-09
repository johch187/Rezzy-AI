import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ProfileContext } from '../App';
import { CreateDocIcon } from '../components/Icons';
import { DocumentGeneration } from '../types';

const GeneratedDocumentsPage: React.FC = () => {
    const profileContext = useContext(ProfileContext);

    if (!profileContext) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    const { documentHistory } = profileContext;

    const getDocumentTitle = (doc: DocumentGeneration) => {
        if (doc.companyName && doc.jobTitle) {
            return `Application for ${doc.companyName}, ${doc.jobTitle}`;
        }
        return `Application for ${doc.jobTitle || doc.companyName || 'Untitled Role'}`;
    };

    return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold tracking-tight text-neutral sm:text-5xl">Generated Documents</h1>
                <p className="mt-4 max-w-3xl mx-auto text-xl text-gray-600">
                    Here you can find all the resumes and cover letters you've generated.
                </p>
            </div>

            {documentHistory.length > 0 ? (
                <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-200">
                    <ul role="list" className="divide-y divide-gray-200">
                        {documentHistory.map((doc) => (
                            <li key={doc.id} className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4 py-5 sm:flex-nowrap">
                                <div>
                                    <p className="text-sm font-semibold leading-6 text-gray-900">
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
                                            className="hover:underline"
                                        >
                                            {getDocumentTitle(doc)}
                                        </Link>
                                    </p>
                                    <div className="mt-1 flex items-center gap-x-2 text-xs leading-5 text-gray-500">
                                        <p>
                                            <time dateTime={doc.generatedAt}>
                                                Generated on {new Date(doc.generatedAt).toLocaleString()}
                                            </time>
                                        </p>
                                    </div>
                                </div>
                                <dl className="flex w-full flex-none justify-between gap-x-8 sm:w-auto">
                                    <div className="flex space-x-2">
                                        {doc.resumeContent && (
                                            <dd>
                                                <span className="capitalize inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset bg-blue-50 text-blue-700 ring-blue-600/20">
                                                    Resume
                                                </span>
                                            </dd>
                                        )}
                                        {doc.coverLetterContent && (
                                            <dd>
                                                <span className="capitalize inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset bg-green-50 text-green-700 ring-green-600/20">
                                                    Cover Letter
                                                </span>
                                            </dd>
                                        )}
                                    </div>
                                </dl>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <div className="text-center py-16 bg-white p-6 rounded-2xl shadow-xl border border-gray-200">
                    <div className="flex items-center justify-center h-16 w-16 rounded-full bg-slate-100 mx-auto">
                        <CreateDocIcon />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-gray-900">No Documents Yet</h3>
                    <p className="mt-2 text-sm text-gray-500">Your generated resumes and cover letters will appear here.</p>
                    <div className="mt-6">
                        <Link to="/generate" className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                            Tailor Your First Application
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GeneratedDocumentsPage;