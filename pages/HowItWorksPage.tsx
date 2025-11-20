import React from 'react';
import Container from '../components/Container';
import PageHeader from '../components/PageHeader';
import {
  IconUserScan,
  IconMessages,
  IconTargetArrow,
  IconMap2,
} from "@tabler/icons-react";

// FIX: Changed the component to use React.FC and a props interface.
// This correctly types the component for use with JSX, resolving an error where the `key` prop was being incorrectly
// flagged as an unknown property on the component's props type.
interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    step: number;
    isLast: boolean;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, step, isLast }) => (
    <div className={`relative pl-16 ${!isLast ? 'pb-12' : ''}`}>
        <div className="absolute left-0 top-0 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-white ring-8 ring-white">
            <span className="text-xl font-bold">{step}</span>
        </div>
        {!isLast && <div className="absolute left-6 top-14 h-full border-l-2 border-dashed border-slate-300"></div>}
        <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
        <p className="mt-2 text-slate-600">{description}</p>
    </div>
);


const HowItWorksPage: React.FC = () => {
  const features = [
    {
      icon: <IconUserScan className="h-8 w-8" />,
      title: "Build Your Core Profile",
      description: "Start by creating a comprehensive professional profile. You can either fill it out from scratch or import your existing resume in seconds. This profile becomes the single source of truth for all of Keju's AI-powered guidance, ensuring every piece of advice is tailored to you.",
    },
    {
      icon: <IconMessages className="h-8 w-8" />,
      title: "Chat with Your Career Coach",
      description: "Interact with your personal career advisor for any need. Get instant feedback on your profile, brainstorm career moves, or ask for help preparing for an interview. It's like having an industry expert on call, 24/7.",
    },
    {
      icon: <IconTargetArrow className="h-8 w-8" />,
      title: "Generate Tailored Applications",
      description: "Stop sending generic resumes. Provide a job description, and Keju will generate a perfectly tailored resume and cover letter that highlight your most relevant skills and experiences, helping you stand out from the crowd.",
    },
    {
      icon: <IconMap2 className="h-8 w-8" />,
      title: "Plan Your Long-Term Career Path",
      description: "Look beyond the next job and build a fulfilling career. Keju can generate a step-by-step roadmap from your current role to your dream job, complete with milestones, action items, and curated learning resources.",
    },
  ];

  return (
    <div className="bg-white py-16 sm:py-24 animate-fade-in">
        <Container className="py-0">
            <PageHeader
                title="How Keju Works"
                subtitle="Your personalized journey to a fulfilling career, powered by AI."
            />
            <div className="max-w-3xl mx-auto">
                <div className="space-y-0">
                    {features.map((feature, index) => (
                        <FeatureCard 
                            key={index}
                            step={index + 1}
                            icon={feature.icon}
                            title={feature.title}
                            description={feature.description}
                            isLast={index === features.length - 1}
                        />
                    ))}
                </div>
            </div>
        </Container>
    </div>
  );
};

export default HowItWorksPage;