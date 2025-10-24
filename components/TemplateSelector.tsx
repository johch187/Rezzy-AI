import React, { useContext, useState } from 'react';
import { ProfileContext } from '../App';

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

const ArrowIcon: React.FC<{ collapsed: boolean }> = ({ collapsed }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-gray-500 transition-transform duration-300 ${!collapsed && 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
);

const MagnifyingGlassIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);


const TemplateSelector: React.FC = () => {
  const profileContext = useContext(ProfileContext);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!profileContext) return null;

  const { profile, setProfile, saveProfile } = profileContext;

  const handleSelect = (type: 'resume' | 'coverLetter', templateId: string) => {
    const key = type === 'resume' ? 'selectedResumeTemplate' : 'selectedCoverLetterTemplate';
    const newProfile = { ...profile, [key]: templateId };
    setProfile(newProfile);
    saveProfile(newProfile); // Immediately save the updated profile
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
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-sm p-1 text-center">{template.name}</div>
        </button>
        {/* Magnifying glass icon for explicit preview */}
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent the parent button's onClick from firing
            openPreview(template.imageUrl);
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
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
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsCollapsed(!isCollapsed)}>
          <h2 className="text-2xl font-bold text-neutral">Templates</h2>
          <button className="p-2 rounded-full hover:bg-gray-100" aria-label={isCollapsed ? 'Expand templates' : 'Collapse templates'}>
              <ArrowIcon collapsed={isCollapsed} />
          </button>
        </div>
        
        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[1000px] opacity-100 mt-4'}`}>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Resume Templates</h3>
                <div className="grid grid-cols-2 gap-4">
                  {renderTemplateOptions('resume')}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Cover Letter Templates</h3>
                <div className="grid grid-cols-2 gap-4">
                  {renderTemplateOptions('coverLetter')}
                </div>
              </div>
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