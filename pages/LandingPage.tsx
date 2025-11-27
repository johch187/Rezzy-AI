import React from 'react';
import { HeroSection } from '../components/ui/hero-section';
import { FeaturesSectionWithHoverEffects } from '../components/ui/feature-section-with-hover-effects';

const LandingPage: React.FC = () => {
  return (
    <div className="bg-white">
      <HeroSection
        badge={{
          text: "AI-Powered Career Tools",
          action: {
            text: "See how it works",
            href: "/how-it-works",
          },
        }}
        title="Your Career, Expertly Navigated"
        description="Stop guessing. Get a personalized, data-driven roadmap to your dream job. Build tailored resumes, plan your career path, and ace interviews."
        actions={[
          {
            text: "Get Started Free",
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
      
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900">
              How Keju Guides Your Journey
            </h2>
            <p className="mt-3 text-base sm:text-lg text-gray-500 max-w-2xl mx-auto">
              An integrated platform to help you plan your future and get hired.
            </p>
          </div>
          <FeaturesSectionWithHoverEffects />
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
