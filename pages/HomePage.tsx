import React, { useContext } from 'react';
import { ProfileContext } from '../App';
import ProfileForm from '../components/ProfileForm';
import TemplateSelector from '../components/TemplateSelector';
import VibeFocusSelector from '../components/VibeFocusSelector';

const HomePage: React.FC = () => {
  const profileContext = useContext(ProfileContext);

  if (!profileContext) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Changed to a 4-column grid to achieve the 25%/75% split */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">

        {/* First Column (takes 1 of 4 columns -> 25%) */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24 space-y-8">
            <VibeFocusSelector />
          </div>
        </aside>

        {/* Second Column (takes 3 of 4 columns -> 75%) */}
        <div className="lg:col-span-3">
          <ProfileForm />
        </div>

      </div>
    </div>
  );
};

export default HomePage;