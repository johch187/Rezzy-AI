import React from 'react';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="bg-white py-16 sm:py-24 animate-fade-in">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="prose prose-lg max-w-none prose-h1:text-neutral prose-h2:text-neutral prose-a:text-primary hover:prose-a:text-blue-700">
            <h1 className="text-center">Privacy Policy</h1>
            <p>
              Johanchen AB (“we” or “us”) respects your privacy and collects minimal
              information. This privacy policy applies to our AI-powered
              application, AI Resume Builder, designed to help users create resumes. By using our
              app, you agree to our collection, use, and sharing of your
              information as described in this policy.
            </p>
            <h2>Information We Collect</h2>
            <p>
              We do not directly collect personal information. However, our
              third-party provider, Firebase, may collect data through services
              like Firebase Crashlytics, Performance Monitoring, and Remote
              Config to improve the app. The data collected is subject to
              Firebase’s privacy policy.
            </p>
            <p>
              Additionally, all data entered into the app is sent to platforms
              like Google Gemini or OpenAI for processing to generate your resume.
              This data is used solely to provide and enhance the app's AI
              capabilities.
            </p>
            <h2>How We Use Your Information</h2>
            <p>
              The information you provide is processed by the AI to help generate
              and refine your resume. The data shared with Firebase is used
              solely to improve app performance, identify bugs, and enhance the
              overall user experience. Data sent to Google Gemini or OpenAI is
              used exclusively to process your resume and optimize the AI features
              of the app.
            </p>
            <h2>Sharing Your Information</h2>
            <p>
              We may share your information with Firebase, Google Gemini, or
              OpenAI to help us provide and enhance the app. These third-party
              service providers are required to protect the confidentiality and
              security of your data and cannot use it for any other purpose.
            </p>
            <p>
              Although we collect minimal information, we may still need to
              comply with legal obligations and disclose data if required by law
              or court order.
            </p>
            <h2>Security</h2>
            <p>
              We take reasonable measures to safeguard your data, but no system
              is completely secure, and we cannot guarantee the full protection
              of your information.
            </p>
            <h2>Changes to this Policy</h2>
            <p>
              We may update this privacy policy periodically to reflect changes in
              our practices or due to legal or regulatory requirements.
            </p>
            <h2>Contact Us</h2>
            <p>
              If you have any questions or concerns about this privacy policy,
              please contact us at{' '}
              <a href="mailto:info@johanchen.com">info@johanchen.com</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
