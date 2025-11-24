import React from 'react';
import Container from '../components/Container';
import PageHeader from '../components/PageHeader';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="bg-white py-16 sm:py-24 animate-fade-in">
      <Container className="max-w-4xl py-0">
        <PageHeader title="Privacy Policy" subtitle="Last updated: November 2024" />
        <div className="max-w-3xl mx-auto">
          <div className="prose prose-lg max-w-none prose-h2:text-slate-900 prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-slate-800 prose-h3:mt-6 prose-h3:mb-3 prose-a:text-brand-blue hover:prose-a:text-blue-700 prose-ul:list-disc prose-ul:pl-6 prose-li:my-2">
            <p className="text-slate-700 leading-relaxed">
              At Keju, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service. We are committed to protecting your data with the highest security standards and in compliance with EU/EEA GDPR requirements.
            </p>
            <p className="text-slate-700 leading-relaxed">
              By using Keju, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our service.
            </p>

            <h2>Introduction</h2>
            <p className="text-slate-700 leading-relaxed">
              Keju Inc. ("Keju", "we", "us") respects your privacy. This policy explains how we collect, use, disclose, and protect personal data when you use our web app, APIs, and related services.
            </p>

            <h2>Information We Collect</h2>
            
            <h3>Account Information</h3>
            <p className="text-slate-700 leading-relaxed">When you create an account, we collect:</p>
            <ul className="text-slate-700">
              <li>Email address</li>
              <li>Name (if provided)</li>
              <li>Password (encrypted and never stored in plain text)</li>
              <li>Account preferences and settings</li>
              <li>Authentication metadata</li>
            </ul>

            <h3>Content Data</h3>
            <p className="text-slate-700 leading-relaxed">When you use Keju, we collect:</p>
            <ul className="text-slate-700">
              <li>Resumes, profiles, and cover letters you create or upload</li>
              <li>Career chat history and conversations</li>
              <li>Document generation history and associated metadata</li>
              <li>File upload timestamps and modification history</li>
            </ul>
            <p className="text-slate-700 leading-relaxed font-medium">
              <strong>Important:</strong> All uploaded files and content are encrypted at rest and in transit. We do not access, read, or use your content for any purpose other than providing the requested services.
            </p>

            <h3>Usage Information</h3>
            <p className="text-slate-700 leading-relaxed">We automatically collect certain information about your device and how you interact with Keju:</p>
            <ul className="text-slate-700">
              <li>Log data (IP address, browser type, operating system)</li>
              <li>Device information (device type, unique identifiers)</li>
              <li>Usage patterns (features used, time spent, click patterns)</li>
              <li>Performance data (load times, errors encountered)</li>
            </ul>

            <h3>Subscription and Payment Information</h3>
            <p className="text-slate-700 leading-relaxed">
              When you subscribe to our service, we collect payment metadata from our payment provider. We do not store your full payment card details—these are handled securely by our payment processor.
            </p>

            <h2>How We Use Your Information</h2>
            <p className="text-slate-700 leading-relaxed">We use your information solely for the following purposes:</p>
            <ul className="text-slate-700">
              <li><strong>Provide Services:</strong> To generate resumes, cover letters, career paths, and provide AI-powered career coaching</li>
              <li><strong>Account Management:</strong> To create and maintain your account and workspace</li>
              <li><strong>Communication:</strong> To send you service-related notifications and updates</li>
              <li><strong>Improve Service:</strong> To analyze usage patterns and improve our platform (using aggregated, anonymized data only)</li>
              <li><strong>Security:</strong> To detect and prevent fraud, abuse, and security incidents</li>
              <li><strong>Legal Compliance:</strong> To comply with legal obligations and enforce our terms</li>
            </ul>
            <p className="text-slate-700 leading-relaxed font-medium">
              <strong>We DO NOT</strong> use your data for marketing, advertising, or any third-party purposes. <strong>We DO NOT</strong> sell, rent, or share your personal information with third parties for their marketing purposes.
            </p>

            <h2>Data Security</h2>
            <p className="text-slate-700 leading-relaxed">We implement industry-leading security measures to protect your data:</p>
            <ul className="text-slate-700">
              <li><strong>Encryption:</strong> All data is encrypted in transit (TLS/SSL) and at rest (AES-256)</li>
              <li><strong>Access Controls:</strong> Strict access controls ensure only authorized personnel can access systems</li>
              <li><strong>Authentication:</strong> Secure authentication protocols protect your account</li>
              <li><strong>Regular Audits:</strong> We conduct regular security audits and vulnerability assessments</li>
              <li><strong>Data Isolation:</strong> Each user's data is isolated and cannot be accessed by other users</li>
              <li><strong>Secure Infrastructure:</strong> Our servers are hosted in secure, certified data centers</li>
            </ul>
            <p className="text-slate-700 leading-relaxed">
              While we implement robust security measures, no system is 100% secure. We continuously monitor and improve our security practices to protect your information.
            </p>

            <h2>Processing by AI & Third Parties</h2>
            <p className="text-slate-700 leading-relaxed">To deliver the Service, data may be processed by:</p>
            <ul className="text-slate-700">
              <li><strong>Google Cloud:</strong> Hosting, Vertex AI for model inference, and analytics</li>
              <li><strong>Supabase:</strong> Authentication and storage</li>
              <li><strong>Payment Processors:</strong> Secure payment processing for subscriptions</li>
              <li><strong>Other Infrastructure Providers:</strong> Monitoring and infrastructure services</li>
            </ul>
            <p className="text-slate-700 leading-relaxed">
              These subprocessors act under our instructions and data processing agreements. <strong>We do not sell personal data.</strong>
            </p>
            <p className="text-slate-700 leading-relaxed">
              <strong>AI Processing Notice:</strong> We use AI models (e.g., Google Vertex AI) to generate or process content you submit. AI outputs may be inaccurate—please review before use. Do not submit sensitive data unless needed and lawful.
            </p>

            <h2>International Data Transfers</h2>
            <p className="text-slate-700 leading-relaxed">
              Your information may be transferred to and maintained on servers located outside of your state, province, country, or other governmental jurisdiction where data protection laws may differ.
            </p>
            <p className="text-slate-700 leading-relaxed">
              Data may be stored or processed in the EU/EEA and in other countries. Where data is transferred outside the EU/EEA, we rely on appropriate safeguards (e.g., Standard Contractual Clauses) and require equivalent protections from our processors.
            </p>
            <p className="text-slate-700 leading-relaxed">
              If you are located outside the United States and choose to provide information to us, we transfer your data to secure locations and process it there. Your consent to this Privacy Policy followed by your submission of such information represents your agreement to that transfer.
            </p>

            <h2>Data Retention and Deletion</h2>
            <p className="text-slate-700 leading-relaxed">We retain your data only as long as necessary:</p>
            <ul className="text-slate-700">
              <li><strong>Active Accounts:</strong> Your data is retained while your account is active</li>
              <li><strong>Deleted Files:</strong> When you delete a file, it is permanently removed from our systems within 30 days</li>
              <li><strong>Account Deletion:</strong> When you delete your account, all associated data is permanently deleted within 90 days</li>
              <li><strong>Backup Data:</strong> Backup copies are securely deleted according to our backup retention schedule</li>
            </ul>
            <p className="text-slate-700 leading-relaxed">
              You have complete control over your data. You can delete individual files or your entire account at any time from your account settings.
            </p>

            <h2>Data Sharing and Disclosure</h2>
            <p className="text-slate-700 leading-relaxed">
              <strong>We do NOT sell, rent, or trade your personal information.</strong> We may share your information only in the following limited circumstances:
            </p>
            <ul className="text-slate-700">
              <li><strong>Service Providers:</strong> Trusted third-party services that help us operate our platform (e.g., cloud hosting, payment processing). These providers are contractually obligated to protect your data and use it only for specified purposes.</li>
              <li><strong>Legal Requirements:</strong> When required by law, court order, or government regulation</li>
              <li><strong>Protection of Rights:</strong> To protect our rights, property, or safety, or that of our users</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets (with notice to affected users)</li>
            </ul>
            <p className="text-slate-700 leading-relaxed">
              All third-party service providers are carefully vetted and must maintain the same level of data protection as we do.
            </p>

            <h2>Your Rights and Choices</h2>
            <p className="text-slate-700 leading-relaxed">You have the following rights regarding your personal information:</p>
            <ul className="text-slate-700">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Delete your files or entire account at any time</li>
              <li><strong>Export:</strong> Download all your documents and data</li>
              <li><strong>Portability:</strong> Receive your data in a portable format</li>
              <li><strong>Restriction:</strong> Request restriction of processing</li>
              <li><strong>Objection:</strong> Object to certain processing activities</li>
              <li><strong>Withdraw Consent:</strong> Where we rely on consent, you may withdraw it at any time</li>
            </ul>
            <p className="text-slate-700 leading-relaxed">
              To exercise any of these rights, please contact us at <a href="mailto:privacy@keju.io">privacy@keju.io</a> or use the tools available in your account settings. You can also lodge a complaint with your local supervisory authority.
            </p>

            <h2>Cookies & Analytics</h2>
            <p className="text-slate-700 leading-relaxed">
              We may use cookies or similar technologies for authentication, security, and product analytics. Where required, we will request your consent for non-essential cookies. For detailed information about how we use cookies, please see our <a href="/cookies">Cookie Policy</a>.
            </p>

            <h2>Children's Privacy</h2>
            <p className="text-slate-700 leading-relaxed">
              Keju is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete that information immediately.
            </p>

            <h2>Changes to This Privacy Policy</h2>
            <p className="text-slate-700 leading-relaxed">We may update this Privacy Policy from time to time. We will notify you of any changes by:</p>
            <ul className="text-slate-700">
              <li>Posting the new Privacy Policy on this page</li>
              <li>Updating the "Last updated" date</li>
              <li>Sending you an email notification for significant changes</li>
            </ul>
            <p className="text-slate-700 leading-relaxed">
              Your continued use of Keju after any changes indicates your acceptance of the updated policy.
            </p>

            <h2>Contact Us</h2>
            <p className="text-slate-700 leading-relaxed">
              If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
            </p>
            <p className="text-slate-700 leading-relaxed">
              <strong>Email:</strong> <a href="mailto:privacy@keju.io">privacy@keju.io</a>
            </p>
            <p className="text-slate-700 leading-relaxed">
              <strong>Website:</strong> keju.io
            </p>
            <p className="text-slate-700 leading-relaxed">
              We will respond to all legitimate requests within 30 days.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default PrivacyPolicyPage;
