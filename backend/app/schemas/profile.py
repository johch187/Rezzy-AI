from typing import List, Optional

from pydantic import BaseModel


class Skill(BaseModel):
    id: str
    name: str


class Experience(BaseModel):
    id: str
    company: str
    title: str
    location: str
    startDate: str
    endDate: str
    achievements: List[dict]


class Education(BaseModel):
    id: str
    institution: str
    degree: str
    fieldOfStudy: str
    startDate: str
    endDate: str
    gpa: str
    relevantCoursework: str
    awardsHonors: str


class Project(BaseModel):
    id: str
    name: str
    description: str
    url: str
    technologiesUsed: str
    startDate: str
    endDate: str


class ProfileData(BaseModel):
    id: str
    name: str
    fullName: str
    jobTitle: str
    email: str
    phone: str
    website: str
    location: str
    linkedin: str
    github: str
    summary: str
    education: List[Education]
    experience: List[Experience]
    projects: List[Project]
    technicalSkills: List[Skill]
    softSkills: List[Skill]
    tools: List[Skill]
    languages: List[dict]
    certifications: List[Skill]
    interests: List[Skill]
    customSections: List[dict]
    additionalInformation: str
    industry: str
    experienceLevel: str
    vibe: str
    selectedResumeTemplate: str
    selectedCoverLetterTemplate: str
    sectionOrder: Optional[List[str]] = None
    targetJobTitle: str
    companyName: str
    companyKeywords: str
    keySkillsToHighlight: str
    careerPath: Optional[dict]
