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
              Please read these Terms of Service (“Terms”) carefully before using Keju (“the Service”). By accessing or using the Service, you agree to be bound by these Terms. If you do not agree, do not use the Service.
            </p>

            <h2>Who We Are</h2>
            <p>
              Keju is provided by Keju AB. (“Keju”, “we”, “us”). The Service offers AI-powered career tools delivered via our web application and APIs.
            </p>

            <h2>Account & Access</h2>
            <p>
              You must provide accurate information, keep credentials secure, and ensure your account is used only by you or your organization’s authorized users. You are responsible for all activity under your account.
            </p>

            <h2>Acceptable Use</h2>
            <p>
              You agree not to: (a) break the law or violate others’ rights; (b) upload or generate unlawful, discriminatory, harassing, or abusive content; (c) probe, scan, or attack our systems; (d) attempt to bypass security or quotas; (e) misrepresent outputs as human-generated when required by law to disclose AI assistance; or (f) reverse engineer or misuse the APIs or models. We may audit and rate-limit usage to protect the platform.
            </p>

            <h2>AI Outputs & Professional Use</h2>
            <p>
              AI-generated content may be inaccurate or incomplete. You remain responsible for reviewing, verifying, and deciding how to use outputs, including compliance with employer, academic, or regulatory requirements. Do not submit sensitive or third-party data unless you have the legal right to do so.
            </p>

            <h2>Data, Privacy & Security</h2>
            <p>
              We process personal data in line with applicable EU/EEA requirements. See our <a href="/privacy">Privacy Policy</a> for details on what we collect, why, and how long we retain it. You must not store special categories of data (e.g., health, biometric) unless the Service explicitly supports it. We use third-party processors (e.g., hosting, analytics, authentication, LLM providers such as Google Vertex AI) to deliver the Service.
            </p>

            <h2>Payment & Subscriptions</h2>
            <p>
              If you buy paid plans, billing terms are provided at checkout. Fees are non-refundable except where required by law. Plans may auto-renew unless cancelled. Taxes may apply. We may change pricing with notice; continued use after notice constitutes acceptance.
            </p>

            <h2>Availability & Changes</h2>
            <p>
              We strive for reliable service but do not guarantee uninterrupted availability. Features may change or be removed. We may suspend or throttle access to protect the Service or comply with law.
            </p>

            <h2>Third-Party Services</h2>
            <p>
              The Service integrates third parties (e.g., Supabase auth/storage, payment processors, analytics, Vertex AI). Their terms and privacy practices apply to their components. We are not responsible for third-party failures or actions.
            </p>

            <h2>Intellectual Property</h2>
            <p>
              Keju owns all rights in the Service. You receive a limited, revocable right to use the Service during your subscription. You retain rights to your own uploads and lawful outputs; you grant us the rights needed to operate, improve, and secure the Service.
            </p>

            <h2>Termination & Suspension</h2>
            <p>
              You may stop using the Service at any time. We may suspend or terminate accounts immediately for abuse, security risks, non-payment, or violations of these Terms, and may remove content that breaches these Terms or the law. Upon termination, your right to use the Service ends; certain obligations (e.g., payment, indemnity, limitations) survive.
            </p>

            <h2>Disclaimers</h2>
            <p>
              The Service and AI outputs are provided “as is” without warranties. We disclaim all implied warranties to the maximum extent permitted by law, including accuracy, fitness for a particular purpose, and non-infringement.
            </p>

            <h2>Limitation of Liability</h2>
            <p>
              To the fullest extent allowed by law, Keju will not be liable for indirect, incidental, special, consequential, or punitive damages, or for lost profits, revenues, data, or goodwill. Our aggregate liability is limited to the fees you paid for the Service in the 3 months preceding the event giving rise to the claim.
            </p>

            <h2>Indemnity</h2>
            <p>
              You agree to indemnify and hold Keju harmless from claims, losses, and expenses arising from your content, use of the Service, or breach of these Terms or applicable law.
            </p>

            <h2>Changes to These Terms</h2>
            <p>
              We may update these Terms. Material changes will be communicated via the Service or email. Continued use after changes take effect constitutes acceptance.
            </p>

            <h2>Contact</h2>
            <p>
              Questions? Contact <a href="mailto:support@keju.io">support@keju.io</a>.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default TermsOfServicePage;
