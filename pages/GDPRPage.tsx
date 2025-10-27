import React from 'react';
import { Link } from 'react-router-dom';

const GDPRPage: React.FC = () => {
  return (
    <div className="bg-white py-16 sm:py-24 animate-fade-in">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold tracking-tight text-neutral sm:text-5xl">GDPR Disclaimer</h1>
        </div>
        <div className="max-w-3xl mx-auto">
          <div className="prose prose-lg max-w-none prose-a:text-primary hover:prose-a:text-blue-700">
            <p>
              At Johanchen AB, we respect your privacy. By using the AI Resume Builder app, you consent to the collection, processing, and storage of your personal data in accordance with our Privacy Policy. We collect minimal personal data and use it only to enhance your experience with the app. Your data may be processed by third-party services like Firebase, Google Gemini, and OpenAI, who adhere to strict data protection standards.
            </p>
            <p>
              For more details on how your data is handled, including your rights under the GDPR, please review our full{' '}
              <Link to="/privacy">Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GDPRPage;