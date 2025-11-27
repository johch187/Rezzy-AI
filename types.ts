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
  id: string;
  name: string;
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
  companyName: string;
  companyKeywords: string;
  keySkillsToHighlight: string;
  careerPath: CareerPath | null;
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
  coverLetterLength: 'short' | 'medium' | 'long';
  includeSummary: boolean;
  tone: 'formal' | 'friendly' | 'persuasive';
  technicality: number;
  thinkingMode: boolean;
  uploadedResume: string | null;
  uploadedCoverLetter: string | null;
}

export interface GeneratedContent {
  resume: string | null;
  coverLetter: string | null;
}

export interface DocumentGeneration {
  id: string;
  jobTitle: string;
  companyName: string;
  generatedAt: string; // ISO date string
  resumeContent: string | null;
  coverLetterContent: string | null;
  analysisResult: ApplicationAnalysisResult | null;
  parsedResume: Partial<ProfileData> | null;
  parsedCoverLetter: ParsedCoverLetter | null;
}

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

// --- Career Path Types ---
export interface ActionItem {
  category: 'Academics' | 'Internships' | 'Projects' | 'Skills' | 'Networking' | 'Career' | 'Extracurriculars' | 'Certifications';
  title: string;
  description: string;
}

export interface CareerMilestone {
  timeframe: string;
  milestoneTitle: string;
  milestoneDescription: string;
  actionItems: ActionItem[];
  learningTopics?: string[];
  recommendedVideos?: YouTubeVideo[]; // Legacy support
}

export interface YouTubeVideo {
  title: string;
  channel: string;
  description: string;
  videoId: string;
}

export interface CareerPath {
  path: CareerMilestone[];
  currentRole: string;
  targetRole: string;
}

// --- New Feature Types ---
export interface ApplicationAnalysisResult {
  fitScore: number; // A percentage from 0-100
  gapAnalysis: string; // Markdown formatted text
  keywordOptimization: string; // Markdown formatted text
  impactEnhancer: string; // Markdown formatted text
}

// FIX: Add MentorMatch interface to resolve missing type error.
export interface MentorMatch {
  name: string;
  score: number;
  reasoning: string;
}

export interface BackgroundTask {
  id: string;
  // FIX: Add new task types to support mentor matching and application analysis features.
  type: 'document-generation' | 'career-path' | 'coffee-chat' | 'interview-prep' | 'application-analysis' | 'mentor-match';
  status: 'running' | 'completed' | 'error';
  description: string;
  result: any; // Payload for the result page or error message
  viewed: boolean;
  createdAt: string; // ISO string
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: string;
}

export interface CareerChatSummary {
  id: string;
  title: string;
  timestamp: string; // ISO date string
  messages: ChatMessage[];
}
