import type { ProfileData } from './types.js';

export const DEFAULT_TOKEN_BALANCE = 65;

const generateId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `profile_${Math.random().toString(36).slice(2)}`;
};

export const createNewProfile = (name: string): ProfileData => {
  const newId = generateId();
  return {
    id: newId,
    name,
    fullName: '',
    jobTitle: '',
    email: '',
    phone: '',
    website: '',
    location: '',
    linkedin: '',
    github: '',
    summary: '',
    education: [],
    experience: [],
    projects: [],
    technicalSkills: [],
    softSkills: [],
    tools: [],
    languages: [],
    certifications: [],
    interests: [],
    customSections: [],
    additionalInformation: '',
    industry: '',
    experienceLevel: 'entry',
    vibe: '',
    selectedResumeTemplate: 'classic',
    selectedCoverLetterTemplate: 'professional',
    targetJobTitle: '',
    companyName: '',
    companyKeywords: '',
    keySkillsToHighlight: '',
    careerPath: null,
  };
};
