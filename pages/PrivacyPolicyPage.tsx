import React from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/Container';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="bg-white py-12 sm:py-16">
      <Container size="narrow">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-semibold text-gray-900">Privacy Policy</h1>
          <p className="mt-2 text-sm text-gray-500">Last updated: November 2024</p>
        </div>

        {/* Content */}
        <div className="prose prose-gray max-w-none">
          <p className="lead text-gray-600">
            At Keju, we take your privacy seriously. This Privacy Policy explains how Keju AB ("Keju", "we", "us") collects, uses, and protects your personal data when you use our services at keju.io.
          </p>

          <h2>About Us</h2>
          <p>
            Keju AB is a Swedish company registered in Sweden. We are fully committed to GDPR compliance and protecting your data according to European data protection standards.
          </p>
          <ul>
            <li><strong>Company:</strong> Keju AB</li>
            <li><strong>Website:</strong> keju.io</li>
            <li><strong>Country:</strong> Sweden (EU/EEA)</li>
            <li><strong>Contact:</strong> <a href="mailto:privacy@keju.io">privacy@keju.io</a></li>
          </ul>

          <h2>Information We Collect</h2>
          
          <h3>Account Information</h3>
          <p>When you create an account, we collect:</p>
          <ul>
            <li>Email address</li>
            <li>Name (if provided)</li>
            <li>Password (encrypted, never stored in plain text)</li>
            <li>Account preferences and settings</li>
          </ul>

          <h3>Content Data</h3>
          <p>When you use Keju, we collect:</p>
          <ul>
            <li>Resumes, profiles, and cover letters you create or upload</li>
            <li>Career chat history and conversations</li>
            <li>Document generation history</li>
          </ul>
          <p>
            <strong>Important:</strong> All content is encrypted at rest and in transit. We do not access or use your content for any purpose other than providing the requested services.
          </p>

          <h3>Usage Information</h3>
          <p>We automatically collect:</p>
          <ul>
            <li>Log data (IP address, browser type, operating system)</li>
            <li>Device information</li>
            <li>Usage patterns and feature interactions</li>
            <li>Performance data</li>
          </ul>

          <h3>Payment Information</h3>
          <p>
            Payment processing is handled by Polar. We do not store your payment card details—these are securely processed by Polar according to their privacy policy.
          </p>

          <h2>How We Use Your Information</h2>
          <p>We use your information solely for:</p>
          <ul>
            <li><strong>Service Delivery:</strong> Generating resumes, cover letters, and career guidance</li>
            <li><strong>Account Management:</strong> Creating and maintaining your account</li>
            <li><strong>Communication:</strong> Service-related notifications</li>
            <li><strong>Improvement:</strong> Analyzing usage to improve our platform (aggregated data only)</li>
            <li><strong>Security:</strong> Detecting and preventing fraud and abuse</li>
            <li><strong>Legal Compliance:</strong> Meeting legal obligations</li>
          </ul>
          <p>
            <strong>We DO NOT</strong> sell, rent, or share your personal information with third parties for marketing purposes.
          </p>

          <h2>Data Processing & Third Parties</h2>
          <p>To deliver our services, data may be processed by:</p>
          <ul>
            <li><strong>Google Cloud Platform:</strong> Hosting, Vertex AI for AI processing, and analytics (EU regions)</li>
            <li><strong>Supabase:</strong> Authentication and secure data storage</li>
            <li><strong>Polar:</strong> Payment processing</li>
          </ul>
          <p>
            All processors operate under data processing agreements compliant with GDPR. We prioritize EU-based data processing where possible.
          </p>

          <h3>AI Processing Notice</h3>
          <p>
            We use Google Vertex AI to generate content. AI outputs may be inaccurate—please review before use. We do not use your data to train AI models.
          </p>

          <h2>Data Security</h2>
          <p>We implement industry-leading security measures:</p>
          <ul>
            <li><strong>Encryption:</strong> TLS/SSL in transit, AES-256 at rest</li>
            <li><strong>Access Controls:</strong> Strict access limitations</li>
            <li><strong>Authentication:</strong> Secure protocols via Supabase</li>
            <li><strong>Regular Audits:</strong> Security assessments and monitoring</li>
            <li><strong>Data Isolation:</strong> Each user's data is isolated</li>
          </ul>

          <h2>Data Retention</h2>
          <ul>
            <li><strong>Active Accounts:</strong> Data retained while account is active</li>
            <li><strong>Deleted Content:</strong> Permanently removed within 30 days</li>
            <li><strong>Account Deletion:</strong> All data deleted within 90 days</li>
          </ul>

          <h2>International Transfers</h2>
          <p>
            As a Swedish company, we prioritize EU/EEA data processing. When data is transferred outside the EU/EEA, we rely on Standard Contractual Clauses (SCCs) and ensure equivalent protections.
          </p>

          <h2>Your Rights (GDPR)</h2>
          <p>Under GDPR, you have the right to:</p>
          <ul>
            <li><strong>Access:</strong> Request a copy of your data</li>
            <li><strong>Rectification:</strong> Correct inaccurate data</li>
            <li><strong>Erasure:</strong> Delete your data ("right to be forgotten")</li>
            <li><strong>Portability:</strong> Receive your data in a portable format</li>
            <li><strong>Restriction:</strong> Limit processing</li>
            <li><strong>Objection:</strong> Object to certain processing</li>
            <li><strong>Withdraw Consent:</strong> Where processing is based on consent</li>
          </ul>
          <p>
            To exercise your rights, contact <a href="mailto:privacy@keju.io">privacy@keju.io</a>. You may also lodge a complaint with the Swedish Authority for Privacy Protection (IMY) or your local supervisory authority.
          </p>

          <h2>Cookies</h2>
          <p>
            We use essential cookies for authentication and security. For details, see our <Link to="/cookies">Cookie Policy</Link>.
          </p>

          <h2>Children's Privacy</h2>
          <p>
            Keju is not intended for children under 13. We do not knowingly collect data from children under 13.
          </p>

          <h2>Changes to This Policy</h2>
          <p>
            We may update this policy periodically. We'll notify you of material changes via email or on our website.
          </p>

          <h2>Contact Us</h2>
          <p>For questions about this policy or your data:</p>
          <ul>
            <li><strong>Email:</strong> <a href="mailto:privacy@keju.io">privacy@keju.io</a></li>
            <li><strong>Company:</strong> Keju AB, Sweden</li>
            <li><strong>Website:</strong> keju.io</li>
          </ul>
          <p>We respond to all legitimate requests within 30 days.</p>
        </div>
      </Container>
    </div>
  );
};

export default PrivacyPolicyPage;
