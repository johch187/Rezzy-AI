import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ProfileContext } from '../App';
import { CreateDocIcon, DownloadIcon } from '../components/Icons';
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
            return `Application for ${doc.companyName}, ${doc.jobTitle}`;
        }
        return `Application for ${doc.jobTitle || doc.companyName || 'Untitled Role'}`;
    };

    const handleExportCSV = () => {
        if (!documentHistory.length) return;

        const headers = ['Date', 'Company', 'Job Title', 'Fit Score', 'Resume Generated', 'Cover Letter Generated'];
        const rows = documentHistory.map(doc => [
            new Date(doc.generatedAt).toLocaleDateString(),
            doc.companyName || 'N/A',
            doc.jobTitle || 'N/A',
            doc.analysisResult?.fitScore ? `${doc.analysisResult.fitScore}%` : '',
            doc.resumeContent ? 'Yes' : 'No',
            doc.coverLetterContent ? 'Yes' : 'No'
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `keju_history_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <Container>
            <PageHeader
                title="Generated Documents"
                subtitle="Here you can find all the resumes and cover letters you've generated."
            />

            {documentHistory.length > 0 ? (
                <>
                    <div className="flex justify-end mb-4 animate-fade-in">
                        <Button onClick={handleExportCSV} variant="outline" size="sm" leftIcon={<DownloadIcon />}>
                            Export History to CSV
                        </Button>
                    </div>
                    <Card>
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
                    </Card>
                </>
            ) : (
                <Card className="text-center py-16">
                    <div className="flex items-center justify-center h-16 w-16 rounded-full bg-slate-100 mx-auto">
                        <CreateDocIcon />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-gray-900">No Documents Yet</h3>
                    <p className="mt-2 text-sm text-gray-500">Your generated resumes and cover letters will appear here.</p>
                    <div className="mt-6">
                        <Button as="link" to="/generate" variant="primary">
                            Tailor Your First Application
                        </Button>
                    </div>
                </Card>
            )}
        </Container>
    );
};

export default GeneratedDocumentsPage;