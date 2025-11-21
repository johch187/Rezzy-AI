import React from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/Container';
import PageHeader from '../components/PageHeader';

const GDPRPage: React.FC = () => {
  return (
    <div className="bg-white py-16 sm:py-24 animate-fade-in">
      <Container className="max-w-4xl py-0">
        <PageHeader title="GDPR Notice" />
        <div className="max-w-3xl mx-auto">
          <div className="prose prose-lg max-w-none prose-a:text-brand-blue hover:prose-a:text-blue-700">
            <p>
              This notice explains how Keju Inc. processes personal data under the EU/EEA General Data Protection Regulation (GDPR). It applies when you use our web app, APIs, and related services.
            </p>

            <h2>Controller & Contact</h2>
            <p>
              Keju Inc. is the data controller for the Service. For data rights requests or questions, contact{' '}
              <a href="mailto:support@keju.io">support@keju.io</a>.
            </p>

            <h2>What We Collect</h2>
            <p>
              We process: (a) account details (email, login metadata); (b) content you upload or enter (resumes, cover letters, profiles, chat history); (c) subscription and payment metadata (via our payment provider); (d) technical/usage data for security and product analytics; (e) logs and error reports.
            </p>

            <h2>Why We Process Data (Legal Bases)</h2>
            <p>
              We process data to: deliver the Service and fulfill our contract with you; secure and maintain the platform (legitimate interests); comply with legal obligations (e.g., invoicing, security); and, where applicable, based on your consent (e.g., optional marketing or certain analytics/cookies).
            </p>

            <h2>Subprocessors & Transfers</h2>
            <p>
              We use trusted providers to operate the Service, including: Google Cloud (hosting, Vertex AI, analytics), Supabase (authentication/storage), and payment processors for billing. Data may be stored or processed in the EU/EEA or transferred internationally with appropriate safeguards (e.g., SCCs). These processors act under our instructions and data processing agreements.
            </p>

            <h2>Data Location & Retention</h2>
            <p>
              We aim to host in EU regions where available for your subscription. We retain data only as long as needed for the purposes above, then delete or anonymize it. Backups and logs are pruned on rolling schedules.
            </p>

            <h2>Your Rights</h2>
            <p>
              You can request access, correction, deletion, restriction, portability, or object to certain processing. You may withdraw consent where processing is based on consent. To exercise rights, email <a href="mailto:support@keju.io">support@keju.io</a>. You can also lodge a complaint with your local supervisory authority.
            </p>

            <h2>Security</h2>
            <p>
              We implement technical and organizational measures (encryption in transit, access controls, monitoring) to protect personal data. You are responsible for keeping your credentials secure.
            </p>

            <h2>AI Processing</h2>
            <p>
              We use AI models (e.g., Google Vertex AI) to generate or process content you submit. Outputs may be inaccurate—review before use. Do not submit sensitive data unless needed and lawful. We do not permit abusive, unlawful, or discriminatory use of the Service.
            </p>

            <h2>Updates</h2>
            <p>
              We may update this notice to reflect changes in processing. Material updates will be communicated via the Service or email. For fuller details, see our{' '}
              <Link to="/privacy">Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default GDPRPage;
