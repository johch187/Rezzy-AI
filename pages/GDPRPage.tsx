import React from 'react';
import { Link } from 'react-router-dom';

const GDPRPage: React.FC = () => {
  return (
    <div className="bg-white py-12 sm:py-16 animate-fade-in">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="prose prose-lg text-gray-700">
            <h1 className="text-center">GDPR Disclaimer</h1>
            <p>
              At Johanchen AB, we respect your privacy. By using the AI Resume Builder app, you consent to the collection, processing, and storage of your personal data in accordance with our Privacy Policy. We collect minimal personal data and use it only to enhance your experience with the app. Your data may be processed by third-party services like Firebase, Google Gemini, and OpenAI, who adhere to strict data protection standards.
            </p>
            <p>
              For more details on how your data is handled, including your rights under the GDPR, please review our full{' '}
              <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GDPRPage;
