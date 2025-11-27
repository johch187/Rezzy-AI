import React, { useContext } from 'react';
import { ProfileContext } from '../App';
import ProfileForm from '../components/ProfileForm';
import VibeFocusSelector from '../components/VibeFocusSelector';
import Container from '../components/Container';

const HomePage: React.FC = () => {
  const profileContext = useContext(ProfileContext);

  if (!profileContext) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }
  
  return (
    <Container>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 items-start">
        {/* Sidebar - Target Role */}
        <aside className="lg:col-span-1">
          <div className="lg:sticky lg:top-6">
            <VibeFocusSelector />
          </div>
        </aside>
        
        {/* Main Content - Profile Form */}
        <div className="lg:col-span-3">
          <ProfileForm />
        </div>
      </div>
    </Container>
  );
};

export default HomePage;
