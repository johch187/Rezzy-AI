

import React, { useContext, useState, useRef } from 'react';
import { ProfileContext } from '../App';
import ProfileForm from '../components/ProfileForm';
import TemplateSelector from '../components/TemplateSelector';
import VibeFocusSelector from '../components/VibeFocusSelector';
import type { ProfileData } from '../types';


const HomePage: React.FC = () => {
  const profileContext = useContext(ProfileContext);

  if (!profileContext) {
    return <div>Loading...</div>;
  }

  // Profile and setProfile are now used directly in ProfileForm via context
  // const { profile, setProfile } = profileContext; 
  
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* Welcome Card - Order first on mobile, but part of the right column on desktop */}
        <div className="order-1 lg:col-start-2 lg:col-span-3">
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="prose max-w-none">
              <h1 className="text-4xl font-extrabold tracking-tight text-neutral sm:text-5xl">Welcome!</h1>
              <p className="mt-4 text-xl text-gray-500">
                This is your professional dashboard. Keep your information up-to-date to generate perfectly tailored resumes and cover letters in seconds.
                Use the panels below to add or edit your details and select your preferred document templates from the sidebar.
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar (VibeFocusSelector, TemplateSelector) - Order second on mobile, but first column on desktop */}
        <aside className="order-2 lg:col-start-1 lg:col-span-1">
          <div className="sticky top-24 space-y-8">
            <VibeFocusSelector />
            <TemplateSelector />
          </div>
        </aside>

        {/* ProfileForm - Order third on mobile, but part of the right column on desktop, below Welcome Card */}
        <div className="order-3 lg:col-start-2 lg:col-span-3">
          <ProfileForm /> {/* No props needed anymore as it uses context directly */}
        </div>

      </div>
    </div>
  );
};

export default HomePage;