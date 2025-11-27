import { cn } from "../../utils";
import {
  IconUserScan,
  IconMessages,
  IconTargetArrow,
  IconMap2,
  IconMicrophone2,
  IconCoffee,
  IconAnalyze,
  IconEdit,
} from "@tabler/icons-react";
import React from "react";

export function FeaturesSectionWithHoverEffects() {
  const features = [
    {
      title: "Build Your Profile",
      description: "Import your resume in seconds or build a dynamic professional profile that powers all AI guidance.",
      icon: <IconUserScan />,
    },
    {
      title: "Career Coach",
      description: "Chat with your personal advisor. Get instant answers, improve your profile, and discover next steps.",
      icon: <IconMessages />,
    },
    {
      title: "Tailor Applications",
      description: "Generate perfectly tailored resumes and cover letters. Highlight your most relevant skills.",
      icon: <IconTargetArrow />,
    },
    {
      title: "Plan Your Path",
      description: "Build a career, not just find a job. Get a step-by-step roadmap to your dream role.",
      icon: <IconMap2 />,
    },
    {
      title: "Ace Interviews",
      description: "Walk in with confidence. Shape your stories, practice questions, and prepare for success.",
      icon: <IconMicrophone2 />,
    },
    {
      title: "Network Smarter",
      description: "Prepare for coffee chats with AI-generated talking points and crafted outreach messages.",
      icon: <IconCoffee />,
    },
    {
      title: "Analyze Your Fit",
      description: "Get an instant Fit Score and detailed analysis to identify gaps and opportunities.",
      icon: <IconAnalyze />,
    },
    {
      title: "Rich Editor",
      description: "Fine-tune every detail, reorder sections with drag-and-drop, and export to PDF.",
      icon: <IconEdit />,
    },
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-gray-200 rounded-2xl overflow-hidden">
      {features.map((feature, index) => (
        <Feature key={feature.title} {...feature} index={index} />
      ))}
    </div>
  );
}

type FeatureProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
};

const Feature: React.FC<FeatureProps> = ({ title, description, icon, index }) => {
  return (
    <div className="bg-white p-8 group/feature relative transition-colors hover:bg-gray-50">
      {/* Icon */}
      <div className="mb-4 text-gray-400 group-hover/feature:text-primary transition-colors">
        {icon}
      </div>
      
      {/* Title */}
      <h3 className="text-base font-semibold text-gray-900 mb-2 group-hover/feature:text-primary transition-colors">
        {title}
      </h3>
      
      {/* Description */}
      <p className="text-sm text-gray-500 leading-relaxed">
        {description}
      </p>
      
      {/* Accent line */}
      <div className="absolute left-0 top-8 bottom-8 w-0.5 bg-gray-100 group-hover/feature:bg-primary transition-colors" />
    </div>
  );
};
