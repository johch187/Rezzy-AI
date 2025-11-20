import React from 'react';
import { HeroSection } from '../components/ui/hero-section';
import { FeaturesSectionWithHoverEffects } from '../components/ui/feature-section-with-hover-effects';

const LandingPage: React.FC = () => {
    return (
        <div>
            <HeroSection
              badge={{
                text: "AI-Powered Career Navigation",
                action: {
                  text: "How it works",
                  href: "/how-it-works",
                },
              }}
              title="Your Career, Navigated by AI"
              description="Stop guessing. Keju provides a personalized, data-driven roadmap to your dream job. Build tailored resumes, plan your career path, and ace interviews with your AI co-pilot."
              actions={[
                {
                  text: "Start for Free",
                  href: "/career-coach",
                  variant: "default",
                },
                {
                  text: "Learn More",
                  href: "/how-it-works",
                  variant: "outline",
                }
              ]}
            />
            <div className="py-20 bg-base-200">
                <div className="mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900">How Keju Guides Your Journey</h2>
                        <p className="mt-3 text-lg text-slate-500 max-w-2xl mx-auto">An integrated platform to help you plan your future and get hired.</p>
                    </div>
                    <FeaturesSectionWithHoverEffects />
                </div>
            </div>
        </div>
    );
};

export default LandingPage;