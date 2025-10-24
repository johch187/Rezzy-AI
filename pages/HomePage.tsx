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
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* Sidebar */}
        <aside className="lg:col-start-1 lg:col-span-1 lg:row-span-2">
          <div className="sticky top-24 space-y-8">
            <VibeFocusSelector />
          </div>
        </aside>

        {/* ProfileForm */}
        <div className="lg:col-start-2 lg:col-span-3">
          <ProfileForm />
        </div>

      </div>
    </div>
  );
};

export default HomePage;