import type { ReactNode } from 'react';

export interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  gpa: string;
  relevantCoursework: string;
  awardsHonors: string;
}

export interface Experience {
  id: string;
  company: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  achievements: { id: string; text: string }[];
}

export interface Project {
  id:string;
  name: string;
  description: string;
  url: string;
  technologiesUsed: string;
  startDate: string;
  endDate: string;
}

export interface Skill {
  id: string;
  name: string;
}

export interface Language {
  id: string;
  name: string;
  proficiency: 'native' | 'fluent' | 'conversational' | 'basic';
}

export interface Certification {
  id: string;
  name: string;
}

export interface Interest {
  id: string;
  name: string;
}

export interface CustomSectionItem {
  id: string;
  text: string;
}

export interface CustomSection {
  id: string;
  title: string;
  items: CustomSectionItem[];
}

export interface ProfileData {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  website: string;
  location: string;
  linkedin: string;
  github: string;
  summary: string;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  technicalSkills: Skill[];
  softSkills: Skill[];
  tools: Skill[];
  languages: Language[];
  certifications: Certification[];
  interests: Interest[];
  customSections: CustomSection[];
  additionalInformation: string;
  industry: string;
  experienceLevel: 'internship' | 'entry' | 'mid' | 'senior' | 'executive';
  vibe: string;
  selectedResumeTemplate: string;
  selectedCoverLetterTemplate: string;
  sectionOrder?: string[];
  targetJobTitle: string;
  companyKeywords: string;
  keySkillsToHighlight: string;
}

export interface ParsedCoverLetter {
  senderName: string;
  senderAddress: string;
  senderContact: string;
  date: string;
  recipientName: string;
  recipientTitle: string;
  companyName: string;
  companyAddress: string;
  salutation: string;
  body: string;
  closing: string;
  signature: string;
}

export interface GenerationOptions {
  jobDescription: string;
  generateResume: boolean;
  generateCoverLetter: boolean;
  resumeLength: '1 page max' | '2 pages max';
  includeSummary: boolean;
  tone: number;
  technicality: number;
  thinkingMode: boolean;
  uploadedResume: string | null;
  uploadedCoverLetter: string | null;
}

export interface GeneratedContent {
  resume: string | null;
  coverLetter: string | null;
}

// Fix: Add missing IncludedProfileSelections interface.
export interface IncludedProfileSelections {
  summary: boolean;
  additionalInformation: boolean;
  educationIds: Set<string>;
  experienceIds: Set<string>;
  projectIds: Set<string>;
  technicalSkillIds: Set<string>;
  softSkillIds: Set<string>;
  toolIds: Set<string>;
  languageIds: Set<string>;
  certificationIds: Set<string>;
  interestIds: Set<string>;
  customSectionIds: Set<string>;
  customSectionItemIds: { [sectionId: string]: Set<string> };
}