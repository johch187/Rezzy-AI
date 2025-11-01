import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
    return (
        <div className="animate-fade-in">
            {/* Hero Section */}
            <section className="bg-white">
                <div className="mx-auto px-6 py-24 text-center">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight">
                        From Insight to Opportunity.
                        <br />
                        Your AI-Powered Career Navigator.
                    </h1>
                    <p className="mt-6 max-w-3xl mx-auto text-lg text-slate-700">
                        Keju replaces generic advice and privileged networks with personalized, data-driven guidance. We help you find the right education, build the right skills, and launch a fulfilling career with confidence.
                    </p>
                    <div className="mt-10">
                        <Link
                            to="/builder"
                            className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-full shadow-lg text-white bg-brand-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue transition-transform transform hover:scale-105"
                        >
                            Start Your Journey for Free
                        </Link>
                        <p className="mt-4 text-sm text-slate-500">No credit card required.</p>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="how-it-works" className="py-20 bg-base-200">
                <div className="mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900">How Keju Guides Your Journey</h2>
                        <p className="mt-3 text-lg text-slate-500 max-w-2xl mx-auto">An integrated platform to help you plan your future and get hired.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <div className="text-center p-6 bg-white rounded-2xl shadow-lg border border-slate-200">
                            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-brand-blue/10 mx-auto">
                               <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                            </div>
                            <h3 className="mt-5 text-xl font-semibold text-slate-900">Personalized Career Roadmaps</h3>
                            <p className="mt-2 text-slate-500">Get a clear, step-by-step plan to reach your dream role. Our AI analyzes your profile to create a custom path, suggesting skills to learn, projects to build, and milestones to achieve.</p>
                        </div>
                        <div className="text-center p-6 bg-white rounded-2xl shadow-lg border border-slate-200">
                            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-brand-blue/10 mx-auto">
                               <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            </div>
                            <h3 className="mt-5 text-xl font-semibold text-slate-900">Intelligent Application Toolkit</h3>
                            <p className="mt-2 text-slate-500">Act on your roadmap with powerful tools. Generate tailored resumes and cover letters for any job, and get AI-powered prep for networking coffee chats to make the perfect impression.</p>
                        </div>
                        <div className="text-center p-6 bg-white rounded-2xl shadow-lg border border-slate-200">
                            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-brand-blue/10 mx-auto">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            </div>
                            <h3 className="mt-5 text-xl font-semibold text-slate-900">Your Dynamic Career Identity</h3>
                            <p className="mt-2 text-slate-500">Your Keju profile is more than a CV—it's a living blueprint of your skills, experiences, and potential. It evolves with you, becoming the single source of truth for your entire career journey.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;