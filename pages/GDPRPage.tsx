import React from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/Container';
import PageHeader from '../components/PageHeader';

const GDPRPage: React.FC = () => {
  return (
    <div className="bg-white py-16 sm:py-24 animate-fade-in">
      <Container className="max-w-4xl py-0">
        <PageHeader title="GDPR Disclaimer" />
        <div className="max-w-3xl mx-auto">
          <div className="prose prose-lg max-w-none prose-a:text-brand-blue hover:prose-a:text-blue-700">
            <p>
              At Keju Inc., we respect your privacy. By using the Keju app, you consent to the collection, processing, and storage of your personal data in accordance with our Privacy Policy. We collect minimal personal data and use it only to enhance your experience with the app. Your data may be processed by third-party services like Firebase, Google Gemini, and OpenAI, who adhere to strict data protection standards.
            </p>
            <p>
              For more details on how your data is handled, including your rights under the GDPR, please review our full{' '}
              <Link to="/privacy">Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default GDPRPage;
