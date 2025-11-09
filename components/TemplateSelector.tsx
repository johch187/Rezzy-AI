import React, { useContext, useState } from 'react';
import { ProfileContext } from '../App';
import { ArrowIcon, MagnifyingGlassIcon } from './Icons';

export const templates = {
  resume: [
    { id: 'classic', name: 'Classic', imageUrl: 'https://dummyimage.com/200x280/f3f4f6/6b7280&text=Classic' },
    { id: 'tech', name: 'Tech', imageUrl: 'https://dummyimage.com/200x280/4F46E5/ffffff&text=Tech+Resume' },
  ],
  coverLetter: [
    { id: 'professional', name: 'Professional', imageUrl: 'https://dummyimage.com/200x280/f3f4f6/6b7280&text=Professional' },
    { id: 'finance', name: 'Finance', imageUrl: 'https://dummyimage.com/200x280/4F46E5/ffffff&text=Finance+Cover+Letter' },
  ]
};

const TemplateSelector: React.FC = () => {
  const profileContext = useContext(ProfileContext);
  const [modalImage, setModalImage] = useState<string | null>(null);

  if (!profileContext) return null;

  const { profile, setProfile, saveProfile } = profileContext;

  const handleSelect = (type: 'resume' | 'coverLetter', templateId: string) => {
    const key = type === 'resume' ? 'selectedResumeTemplate' : 'selectedCoverLetterTemplate';
    const newProfile = { ...profile, [key]: templateId };
    setProfile(newProfile);
    saveProfile(); // Immediately save the updated profile
  };

  const openPreview = (imageUrl: string) => {
    // Request a much larger image for the modal preview
    setModalImage(imageUrl.replace('200x280', '800x1120')); 
  };

  const renderTemplateOptions = (type: 'resume' | 'coverLetter') => {
    const selectedId = type === 'resume' ? profile.selectedResumeTemplate : profile.selectedCoverLetterTemplate;

    return templates[type].map(template => (
      <div key={template.id} className="relative group">
        <button
          onClick={() => handleSelect(type, template.id)}
          onDoubleClick={() => openPreview(template.imageUrl)} // Double click to preview
          className={`w-full block rounded-lg overflow-hidden border-4 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary ${selectedId === template.id ? 'border-neutral shadow-lg' : 'border-gray-300 hover:border-blue-400'}`}
          aria-label={`Select ${template.name} ${type} template`}
        >
          <img src={template.imageUrl} alt={template.name} className="w-full h-auto object-cover" />
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 text-center">{template.name}</div>
        </button>
        {/* Magnifying glass icon for explicit preview */}
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent the parent button's onClick from firing
            openPreview(template.imageUrl);
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          aria-label={`Preview ${template.name} ${type} template`}
          title="Click to preview template"
        >
          <MagnifyingGlassIcon />
        </button>
      </div>
    ));
  };
  
  return (
    <>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Resume Templates</h3>
          <div className="grid grid-cols-5 gap-2">
            {renderTemplateOptions('resume')}
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Cover Letter Templates</h3>
          <div className="grid grid-cols-5 gap-2">
            {renderTemplateOptions('coverLetter')}
          </div>
        </div>
      </div>

      {modalImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fade-in"
          onClick={() => setModalImage(null)}
        >
          <div className="relative p-4" onClick={e => e.stopPropagation()}>
             {/* Adjusted max-w and max-h to allow larger image display */}
             <img src={modalImage} alt="Expanded template preview" className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl" />
             <button
              onClick={() => setModalImage(null)}
              className="absolute -top-2 -right-2 bg-white rounded-full p-1 text-gray-700 hover:text-black"
              aria-label="Close preview"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default TemplateSelector;