import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProfileContext } from '../App';
import Container from '../components/Container';

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
}

const steps: OnboardingStep[] = [
  {
    id: 1,
    title: 'Welcome to Keju',
    description: "Let's personalize your experience. We'll ask a few quick questions to set you up for success.",
  },
  {
    id: 2,
    title: 'What brings you here?',
    description: 'This helps us tailor your experience.',
  },
  {
    id: 3,
    title: 'Career details',
    description: "Tell us about your current situation.",
  },
];

const goals = [
  { id: 'job-search', label: 'Looking for a new job', icon: '💼' },
  { id: 'career-change', label: 'Changing careers', icon: '🔄' },
  { id: 'first-job', label: 'Finding my first job', icon: '🎓' },
  { id: 'promotion', label: 'Getting a promotion', icon: '📈' },
  { id: 'freelance', label: 'Building freelance career', icon: '💻' },
  { id: 'exploring', label: 'Just exploring', icon: '🔍' },
];

const experienceLevels = [
  { id: 'internship', label: 'Student/Intern', description: '0-1 years' },
  { id: 'entry', label: 'Entry Level', description: '1-3 years' },
  { id: 'mid', label: 'Mid Level', description: '3-7 years' },
  { id: 'senior', label: 'Senior', description: '7-12 years' },
  { id: 'executive', label: 'Executive', description: '12+ years' },
];

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const profileContext = useContext(ProfileContext);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [selectedExperience, setSelectedExperience] = useState<string | null>(null);
  const [targetRole, setTargetRole] = useState('');
  const [industry, setIndustry] = useState('');

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    // Update profile with onboarding data
    if (profileContext?.setProfile) {
      profileContext.setProfile(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          targetJobTitle: targetRole || prev.targetJobTitle,
          industry: industry || prev.industry,
          experienceLevel: (selectedExperience as any) || prev.experienceLevel,
        };
      });
      profileContext.saveProfile();
    }

    // Mark onboarding as complete
    localStorage.setItem('onboardingComplete', 'true');
    
    // Navigate to the main app
    navigate('/career-coach');
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return true;
      case 2:
        return !!selectedGoal;
      case 3:
        return !!selectedExperience;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-surface-secondary flex flex-col">
      {/* Progress bar */}
      <div className="w-full bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Step {currentStep} of {steps.length}</span>
            <button
              onClick={handleSkip}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Skip setup
            </button>
          </div>
          <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-xl">
          {/* Step 1: Welcome */}
          {currentStep === 1 && (
            <div className="text-center animate-fade-up">
              <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-primary/10 flex items-center justify-center">
                <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h1 className="text-3xl font-semibold text-gray-900 mb-4">
                {steps[0].title}
              </h1>
              <p className="text-lg text-gray-500 mb-8 max-w-md mx-auto">
                {steps[0].description}
              </p>
              <div className="space-y-4 text-left max-w-sm mx-auto">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-white border border-gray-100">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">AI-powered documents</h3>
                    <p className="text-sm text-gray-500">Generate tailored resumes and cover letters</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-white border border-gray-100">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Career coaching</h3>
                    <p className="text-sm text-gray-500">Get personalized advice from AI</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-white border border-gray-100">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Career path planning</h3>
                    <p className="text-sm text-gray-500">Map your journey to your dream role</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Goals */}
          {currentStep === 2 && (
            <div className="animate-fade-up">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                  {steps[1].title}
                </h1>
                <p className="text-gray-500">
                  {steps[1].description}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {goals.map((goal) => (
                  <button
                    key={goal.id}
                    onClick={() => setSelectedGoal(goal.id)}
                    className={`
                      p-4 rounded-xl border text-left transition-all duration-200
                      ${selectedGoal === goal.id
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    <span className="text-2xl mb-2 block">{goal.icon}</span>
                    <span className={`text-sm font-medium ${selectedGoal === goal.id ? 'text-primary' : 'text-gray-700'}`}>
                      {goal.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Experience & Role */}
          {currentStep === 3 && (
            <div className="animate-fade-up">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                  {steps[2].title}
                </h1>
                <p className="text-gray-500">
                  {steps[2].description}
                </p>
              </div>
              
              <div className="space-y-6">
                {/* Experience Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Experience Level</label>
                  <div className="flex flex-wrap gap-2">
                    {experienceLevels.map((level) => (
                      <button
                        key={level.id}
                        onClick={() => setSelectedExperience(level.id)}
                        className={`
                          px-4 py-2.5 rounded-xl border text-sm transition-all duration-200
                          ${selectedExperience === level.id
                            ? 'border-primary bg-primary/5 text-primary font-medium'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                          }
                        `}
                      >
                        {level.label}
                        <span className="text-xs text-gray-400 ml-1">({level.description})</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Target Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Target Role (optional)</label>
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g., Product Manager, Software Engineer"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                {/* Industry */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Industry (optional)</label>
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="e.g., Technology, Finance, Healthcare"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-100">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className={`
              px-6 py-2.5 rounded-xl text-sm font-medium transition-all
              ${currentStep === 1
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }
            `}
          >
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className={`
              px-8 py-2.5 rounded-xl text-sm font-medium transition-all
              ${canProceed()
                ? 'bg-gray-900 text-white hover:bg-gray-800'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {currentStep === steps.length ? 'Get Started' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;

