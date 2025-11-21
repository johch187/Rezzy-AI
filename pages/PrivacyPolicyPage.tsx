import React from 'react';
import Container from '../components/Container';
import PageHeader from '../components/PageHeader';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="bg-white py-16 sm:py-24 animate-fade-in">
      <Container className="max-w-4xl py-0">
        <PageHeader title="Privacy Policy" subtitle="Last updated: March 2025" />
        <div className="max-w-3xl mx-auto">
          <div className="prose prose-lg max-w-none prose-h2:text-slate-900 prose-a:text-brand-blue hover:prose-a:text-blue-700">
            <p>
              Keju Inc. (“Keju”, “we”, “us”) respects your privacy. This policy explains how we collect, use, disclose, and protect personal data when you use our web app, APIs, and related services in line with EU/EEA GDPR requirements.
            </p>

            <h2>Who We Are & Contact</h2>
            <p>
              Keju Inc. is the controller for the Service. For privacy questions or data rights requests, email{' '}
              <a href="mailto:privacy@keju.io">privacy@keju.io</a>.
            </p>

            <h2>Data We Collect</h2>
            <p>
              We process: (a) account data (email, auth metadata); (b) content you provide (resumes, profiles, cover letters, chat history, uploads); (c) subscription and payment metadata from our payment provider; (d) usage, device, and log data for security, fraud prevention, and product analytics; (e) support communications you send us.
            </p>

            <h2>Purpose & Legal Bases</h2>
            <p>
              We use data to provide the Service (contract), secure and improve it (legitimate interests), comply with legal obligations (e.g., invoicing, security), and where applicable, with your consent (e.g., optional marketing or certain analytics/cookies).
            </p>

            <h2>How We Use Data</h2>
            <p>
              We authenticate users, store workspace data, process documents and chats with AI models, personalize the experience, prevent abuse, provide support, and analyze performance. AI outputs may be inaccurate—review before use and do not submit sensitive data unless necessary and lawful.
            </p>

            <h2>Processing by AI & Third Parties</h2>
            <p>
              To deliver the Service, data may be processed by: Google Cloud (hosting, Vertex AI for model inference, analytics), Supabase (authentication/storage), payment processors, and other infrastructure/monitoring providers. These subprocessors act under our instructions and data processing agreements. We do not sell personal data.
            </p>

            <h2>International Transfers</h2>
            <p>
              Data may be stored or processed in the EU/EEA and in other countries. Where data is transferred outside the EU/EEA, we rely on appropriate safeguards (e.g., Standard Contractual Clauses) and require equivalent protections from our processors.
            </p>

            <h2>Retention</h2>
            <p>
              We keep personal data only as long as needed for the purposes above, then delete or anonymize it. Backups and logs are retained on rolling schedules.
            </p>

            <h2>Security</h2>
            <p>
              We use technical and organizational measures (encryption in transit, access controls, monitoring) to protect data. You are responsible for keeping credentials secure and using the Service lawfully.
            </p>

            <h2>Your Rights</h2>
            <p>
              You can request access, correction, deletion, restriction, portability, or object to certain processing. Where we rely on consent, you may withdraw it. To exercise rights, contact{' '}
              <a href="mailto:privacy@keju.io">privacy@keju.io</a>. You can also lodge a complaint with your local supervisory authority.
            </p>

            <h2>Cookies & Analytics</h2>
            <p>
              We may use cookies or similar technologies for authentication, security, and product analytics. Where required, we will request your consent for non-essential cookies.
            </p>

            <h2>Changes to This Policy</h2>
            <p>
              We may update this policy to reflect changes in processing or law. Material updates will be communicated via the Service or email. Continued use after updates means you accept the revised policy.
            </p>

            <h2>Contact</h2>
            <p>
              Questions or requests? Email <a href="mailto:privacy@keju.io">privacy@keju.io</a>.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default PrivacyPolicyPage;
