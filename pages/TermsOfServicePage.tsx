import React from 'react';
import Container from '../components/Container';
import PageHeader from '../components/PageHeader';

const TermsOfServicePage: React.FC = () => {
  return (
    <div className="bg-white py-16 sm:py-24 animate-fade-in">
      <Container className="max-w-4xl py-0">
        <PageHeader title="Terms of Service" />
        <div className="max-w-3xl mx-auto">
          <div className="prose prose-lg max-w-none prose-h2:text-slate-900 prose-a:text-brand-blue hover:prose-a:text-blue-700">
            <p>
              Please read these terms of use carefully before using the Keju
              app. By using the app, you agree to comply with these
              terms throughout your usage. If you do not agree to these terms,
              please stop using the app immediately.
            </p>
            <h2>Usage of the App</h2>
            <p>
              The Keju app (“the app”) is developed by Keju Inc.
              (“we,” “us” or “the company”) to assist users in navigating their careers using AI-powered tools.
            </p>
            <h2>Limitation of Liability</h2>
            <p>
              We do not take responsibility for the accuracy, completeness, or
              timeliness of the data provided by the app. Keju
              serves as a tool to assist users in their career journey, but it is the
              user’s responsibility to verify the accuracy of the content and
              ensure compliance with any applicable job application standards or
              personal requirements.
            </p>
            <h2>Privacy and Security</h2>
            <p>
              We prioritize user privacy and take steps to protect any personal
              data collected through the app. Please review our{' '}
              <a href="/privacy">Privacy Policy</a> to understand how we collect,
              use, and safeguard your information.
            </p>
            <h2>Changes and Updates</h2>
            <p>
              We reserve the right to modify or update these terms of use at any
              time. Any updates will be posted on this page, and it is your
              responsibility to review the terms regularly. Continued use of the
              app after such changes signifies acceptance of the revised terms.
            </p>
            <h2>Termination of Use</h2>
            <p>
              You can terminate your use of the app at any time by uninstalling
              it from your device. We also reserve the right to restrict or
              terminate your access to the app if you violate these terms or
              applicable laws.
            </p>
            <h2>Intellectual Property Rights</h2>
            <p>
              All content within the app, including but not limited to text,
              images, graphics, logos, and icons, is owned by the company or
              its licensors and is protected by intellectual property laws.
            </p>
            <p>
              By using the Keju app, you confirm that you have
              read, understood, and accepted these terms of use. If you have any
              questions, please contact us at{' '}
              <a href="mailto:support@keju.io">support@keju.io</a>.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default TermsOfServicePage;
