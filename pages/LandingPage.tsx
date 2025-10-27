import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
    return (
        <div className="animate-fade-in">
            {/* Hero Section */}
            <section className="bg-white">
                <div className="mx-auto px-6 py-24 text-center">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-neutral tracking-tight">
                        AI-Powered Resume & Cover Letter Builder
                    </h1>
                    <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-600">
                        Effortlessly create job-winning resumes and personalized cover letters for every application. Our AI helps you stand out to recruiters and land more interviews.
                    </p>
                    <div className="mt-10">
                        <Link
                            to="/builder"
                            className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-full shadow-lg text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-transform transform hover:scale-105"
                        >
                            Get Started for Free
                        </Link>
                        <p className="mt-4 text-sm text-gray-500">No credit card required.</p>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="how-it-works" className="py-20 bg-base-200">
                <div className="mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-neutral">Why Choose Our AI Builder?</h2>
                        <p className="mt-3 text-gray-500">Everything you need to stand out and get hired in today's competitive job market.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
                            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mx-auto">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                            </div>
                            <h3 className="mt-5 text-xl font-semibold text-neutral">Intelligent Tailoring</h3>
                            <p className="mt-2 text-gray-500">Our AI analyzes any job description to create a personalized resume and cover letter that highlights your most relevant skills and experience, ensuring you're the perfect fit.</p>
                        </div>
                        <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
                            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-secondary/10 mx-auto">
                               <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </div>
                            <h3 className="mt-5 text-xl font-semibold text-neutral">Professional Writing</h3>
                            <p className="mt-2 text-gray-500">Go beyond grammar checks. Our AI acts as your personal writing coach, helping you craft powerful and professional statements that grab recruiters' attention.</p>
                        </div>
                        <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
                            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-accent/10 mx-auto">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            </div>
                            <h3 className="mt-5 text-xl font-semibold text-neutral">Save Time & Effort</h3>
                            <p className="mt-2 text-gray-500">Create a unique, personalized cover letter for every job application in minutes. Stop writing from scratch and spend more time preparing for interviews.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;