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
      description: "Import your resume in seconds or build a dynamic professional profile. This becomes the single source of truth for all AI-powered guidance.",
      icon: <IconUserScan />,
    },
    {
      title: "AI Career Coach",
      description: "Chat with your personal career advisor. Get instant answers, improve your profile, and discover your next steps in a natural conversation.",
      icon: <IconMessages />,
    },
    {
      title: "Tailor Applications",
      description: "Generate perfectly tailored resumes and cover letters for any job. Our AI highlights your most relevant skills to make you stand out.",
      icon: <IconTargetArrow />,
    },
    {
      title: "Plan Your Path",
      description: "Don't just look for a job—build a career. Generate a step-by-step roadmap from your current role to your dream job.",
      icon: <IconMap2 />,
    },
    {
      title: "Ace Interviews",
      description: "Walk into any interview with confidence. Use AI to shape your stories, generate practice questions, and build rapport with your interviewer.",
      icon: <IconMicrophone2 />,
    },
    {
      title: "Network Smarter",
      description: "Prepare for any coffee chat or networking event. Get AI-generated talking points and perfectly crafted outreach messages.",
      icon: <IconCoffee />,
    },
    {
      title: "Analyze Your Fit",
      description: "Get an instant 'Fit Score' and detailed analysis of your resume against the job description to identify gaps and opportunities.",
      icon: <IconAnalyze />,
    },
    {
      title: "Rich Document Editor",
      description: "Fine-tune every detail in our rich editor, reorder sections with drag-and-drop, and export to PDF when you're ready.",
      icon: <IconEdit />,
    },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4  relative z-10 py-10 max-w-7xl mx-auto">
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

// FIX: Changed the component to use React.FC to correctly type props and handle React-specific properties like 'key'.
// The previous function declaration was causing TypeScript to incorrectly include the 'key' prop during type checking.
const Feature: React.FC<FeatureProps> = ({
  title,
  description,
  icon,
  index,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col lg:border-r  py-10 relative group/feature dark:border-neutral-800",
        (index === 0 || index === 4) && "lg:border-l dark:border-neutral-800",
        index < 4 && "lg:border-b dark:border-neutral-800"
      )}
    >
      {index < 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-slate-100 to-transparent pointer-events-none" />
      )}
      {index >= 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-slate-100 to-transparent pointer-events-none" />
      )}
      <div className="mb-4 relative z-10 px-10 text-neutral-600 dark:text-neutral-400">
        {icon}
      </div>
      <div className="text-lg font-bold mb-2 relative z-10 px-10">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-neutral-300 dark:bg-neutral-700 group-hover/feature:bg-blue-500 transition-all duration-200 origin-center" />
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-neutral-800 dark:text-neutral-100">
          {title}
        </span>
      </div>
      <p className="text-sm text-neutral-600 dark:text-neutral-300 max-w-xs relative z-10 px-10">
        {description}
      </p>
    </div>
  );
};