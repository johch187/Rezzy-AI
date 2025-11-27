import React, { useContext } from 'react';
import { ProfileContext } from '../App';
import ProfileForm from '../components/ProfileForm';
import TemplateSelector from '../components/TemplateSelector';
import VibeFocusSelector from '../components/VibeFocusSelector';
import Container from '../components/Container';

const HomePage: React.FC = () => {
  const profileContext = useContext(ProfileContext);

  if (!profileContext) {
    return <div>Loading...</div>;
  }
  
  return (
    <Container>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 items-start">
        <aside className="lg:col-span-1">
          <div className="lg:sticky lg:top-24 space-y-6 lg:space-y-8">
            <VibeFocusSelector />
          </div>
        </aside>
        <div className="lg:col-span-3">
          <ProfileForm />
        </div>
      </div>
    </Container>
  );
};

export default HomePage;
