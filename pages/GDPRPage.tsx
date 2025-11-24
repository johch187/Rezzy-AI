import React from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/Container';
import PageHeader from '../components/PageHeader';

const GDPRPage: React.FC = () => {
  return (
    <div className="bg-white py-16 sm:py-24 animate-fade-in">
      <Container className="max-w-4xl py-0">
        <PageHeader title="GDPR Notice" subtitle="Last updated: November 2024" />
        <div className="max-w-3xl mx-auto">
          <div className="prose prose-lg max-w-none prose-h2:text-slate-900 prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-slate-800 prose-h3:mt-6 prose-h3:mb-3 prose-a:text-brand-blue hover:prose-a:text-blue-700 prose-ul:list-disc prose-ul:pl-6 prose-li:my-2">
            <p className="text-slate-700 leading-relaxed">
              This notice explains how Keju Inc. processes personal data under the EU/EEA General Data Protection Regulation (GDPR). It applies when you use our web app, APIs, and related services.
            </p>
            <p className="text-slate-700 leading-relaxed">
              If you are located in the European Economic Area (EEA), United Kingdom, or Switzerland, this notice provides important information about your rights and how we handle your personal data in compliance with GDPR.
            </p>

            <h2>Data Controller & Contact</h2>
            <p className="text-slate-700 leading-relaxed">
              <strong>Keju Inc.</strong> is the data controller for the Service. As the controller, we determine the purposes and means of processing your personal data.
            </p>
            <p className="text-slate-700 leading-relaxed">
              For data rights requests, questions about this notice, or to exercise your GDPR rights, please contact us:
            </p>
            <ul className="text-slate-700">
              <li><strong>Email:</strong> <a href="mailto:privacy@keju.io">privacy@keju.io</a></li>
              <li><strong>Website:</strong> keju.io</li>
            </ul>
            <p className="text-slate-700 leading-relaxed">
              We will respond to all legitimate requests within 30 days, as required by GDPR.
            </p>

            <h2>What Personal Data We Collect</h2>
            <p className="text-slate-700 leading-relaxed">We process the following categories of personal data:</p>
            
            <h3>Account Information</h3>
            <ul className="text-slate-700">
              <li>Email address</li>
              <li>Name (if provided)</li>
              <li>Authentication metadata and login history</li>
              <li>Account preferences and settings</li>
            </ul>

            <h3>Content Data</h3>
            <ul className="text-slate-700">
              <li>Resumes, profiles, and cover letters you create or upload</li>
              <li>Career chat history and conversations</li>
              <li>Document generation history</li>
              <li>File uploads and associated metadata</li>
            </ul>

            <h3>Subscription and Payment Data</h3>
            <ul className="text-slate-700">
              <li>Subscription status and plan information</li>
              <li>Payment metadata (processed securely by our payment provider)</li>
              <li>Billing information (we do not store full payment card details)</li>
            </ul>

            <h3>Technical and Usage Data</h3>
            <ul className="text-slate-700">
              <li>IP address, browser type, and operating system</li>
              <li>Device information and unique identifiers</li>
              <li>Usage patterns and feature interactions</li>
              <li>Performance data and error logs</li>
            </ul>

            <h2>Why We Process Your Data (Legal Bases)</h2>
            <p className="text-slate-700 leading-relaxed">Under GDPR, we process your personal data based on the following legal bases:</p>
            
            <h3>Contract Performance</h3>
            <p className="text-slate-700 leading-relaxed">
              We process your data to deliver the Service and fulfill our contract with you, including:
            </p>
            <ul className="text-slate-700">
              <li>Providing access to the Service</li>
              <li>Generating resumes, cover letters, and career guidance</li>
              <li>Managing your account and subscriptions</li>
              <li>Processing payments and billing</li>
            </ul>

            <h3>Legitimate Interests</h3>
            <p className="text-slate-700 leading-relaxed">
              We process data based on our legitimate interests to:
            </p>
            <ul className="text-slate-700">
              <li>Secure and maintain the platform</li>
              <li>Prevent fraud and abuse</li>
              <li>Improve our services (using aggregated, anonymized data)</li>
              <li>Analyze usage patterns for product development</li>
            </ul>

            <h3>Legal Obligations</h3>
            <p className="text-slate-700 leading-relaxed">
              We process data to comply with legal obligations, including:
            </p>
            <ul className="text-slate-700">
              <li>Tax and invoicing requirements</li>
              <li>Security and fraud prevention laws</li>
              <li>Data protection regulations</li>
            </ul>

            <h3>Consent</h3>
            <p className="text-slate-700 leading-relaxed">
              Where applicable, we process data based on your consent, such as:
            </p>
            <ul className="text-slate-700">
              <li>Optional marketing communications</li>
              <li>Non-essential cookies and analytics</li>
              <li>Additional data processing beyond core service delivery</li>
            </ul>
            <p className="text-slate-700 leading-relaxed">
              You may withdraw your consent at any time by contacting us or adjusting your account settings.
            </p>

            <h2>Data Processors and International Transfers</h2>
            
            <h3>Subprocessors</h3>
            <p className="text-slate-700 leading-relaxed">
              We use trusted third-party processors to operate the Service. These processors act under our instructions and are bound by data processing agreements:
            </p>
            <ul className="text-slate-700">
              <li><strong>Google Cloud Platform:</strong> Hosting, Vertex AI for model inference, and BigQuery for analytics</li>
              <li><strong>Supabase:</strong> Authentication and secure storage</li>
              <li><strong>Payment Processors:</strong> Secure payment processing (e.g., Polar)</li>
              <li><strong>Infrastructure Providers:</strong> Monitoring and infrastructure services</li>
            </ul>

            <h3>International Data Transfers</h3>
            <p className="text-slate-700 leading-relaxed">
              Your data may be stored or processed in the EU/EEA and in other countries. When we transfer data outside the EU/EEA, we rely on appropriate safeguards:
            </p>
            <ul className="text-slate-700">
              <li><strong>Standard Contractual Clauses (SCCs):</strong> We use EU-approved SCCs with our processors</li>
              <li><strong>Adequacy Decisions:</strong> We transfer to countries with adequacy decisions where applicable</li>
              <li><strong>Data Processing Agreements:</strong> All processors are contractually bound to protect your data</li>
            </ul>
            <p className="text-slate-700 leading-relaxed">
              We aim to host data in EU regions where available for your subscription. You can contact us to learn more about where your data is processed.
            </p>

            <h2>Data Retention and Deletion</h2>
            <p className="text-slate-700 leading-relaxed">
              We retain your personal data only as long as necessary for the purposes stated above:
            </p>
            <ul className="text-slate-700">
              <li><strong>Active Accounts:</strong> Data is retained while your account is active</li>
              <li><strong>Deleted Content:</strong> Files and content are permanently deleted within 30 days</li>
              <li><strong>Account Deletion:</strong> All associated data is permanently deleted within 90 days</li>
              <li><strong>Legal Requirements:</strong> Some data may be retained longer if required by law (e.g., tax records)</li>
              <li><strong>Backups:</strong> Backup copies are securely deleted according to our retention schedule</li>
            </ul>
            <p className="text-slate-700 leading-relaxed">
              After the retention period, data is permanently deleted or anonymized so it can no longer identify you.
            </p>

            <h2>Your GDPR Rights</h2>
            <p className="text-slate-700 leading-relaxed">
              Under GDPR, you have the following rights regarding your personal data:
            </p>
            
            <h3>Right of Access</h3>
            <p className="text-slate-700 leading-relaxed">
              You have the right to request a copy of the personal data we hold about you, including what data we process, why, and who we share it with.
            </p>

            <h3>Right to Rectification</h3>
            <p className="text-slate-700 leading-relaxed">
              You can request correction of inaccurate or incomplete personal data. You can also update your account information directly in your account settings.
            </p>

            <h3>Right to Erasure ("Right to be Forgotten")</h3>
            <p className="text-slate-700 leading-relaxed">
              You can request deletion of your personal data. We will delete your data unless we have a legal obligation to retain it. You can delete your account at any time from your account settings.
            </p>

            <h3>Right to Restrict Processing</h3>
            <p className="text-slate-700 leading-relaxed">
              You can request that we limit how we use your data in certain circumstances, such as when you contest the accuracy of the data.
            </p>

            <h3>Right to Data Portability</h3>
            <p className="text-slate-700 leading-relaxed">
              You can request a copy of your data in a structured, machine-readable format. You can also download your documents and data from your account settings.
            </p>

            <h3>Right to Object</h3>
            <p className="text-slate-700 leading-relaxed">
              You can object to processing based on legitimate interests. We will stop processing unless we have compelling legitimate grounds that override your interests.
            </p>

            <h3>Right to Withdraw Consent</h3>
            <p className="text-slate-700 leading-relaxed">
              Where processing is based on consent, you can withdraw it at any time. This does not affect the lawfulness of processing before withdrawal.
            </p>

            <h3>Right to Lodge a Complaint</h3>
            <p className="text-slate-700 leading-relaxed">
              You have the right to lodge a complaint with your local supervisory authority if you believe we have not handled your personal data in accordance with GDPR. You can find your supervisory authority at{' '}
              <a href="https://edpb.europa.eu/about-edpb/board/members_en" target="_blank" rel="noopener noreferrer">
                edpb.europa.eu
              </a>.
            </p>

            <h3>How to Exercise Your Rights</h3>
            <p className="text-slate-700 leading-relaxed">
              To exercise any of these rights, please contact us at <a href="mailto:privacy@keju.io">privacy@keju.io</a>. We will respond within 30 days as required by GDPR. You may also use the tools available in your account settings to manage your data.
            </p>

            <h2>Data Security</h2>
            <p className="text-slate-700 leading-relaxed">
              We implement technical and organizational measures to protect your personal data:
            </p>
            <ul className="text-slate-700">
              <li><strong>Encryption:</strong> All data is encrypted in transit (TLS/SSL) and at rest (AES-256)</li>
              <li><strong>Access Controls:</strong> Strict access controls ensure only authorized personnel can access data</li>
              <li><strong>Authentication:</strong> Secure authentication protocols protect your account</li>
              <li><strong>Regular Audits:</strong> We conduct regular security audits and vulnerability assessments</li>
              <li><strong>Data Isolation:</strong> Each user's data is isolated and cannot be accessed by other users</li>
              <li><strong>Monitoring:</strong> Continuous monitoring for security incidents and threats</li>
            </ul>
            <p className="text-slate-700 leading-relaxed">
              While we implement robust security measures, no system is 100% secure. You are responsible for keeping your credentials secure and using the Service lawfully.
            </p>

            <h2>AI Processing and Data Protection</h2>
            <p className="text-slate-700 leading-relaxed">
              We use AI models (e.g., Google Vertex AI) to generate resumes, cover letters, and career guidance. Important information:
            </p>
            <ul className="text-slate-700">
              <li><strong>AI Outputs:</strong> AI-generated content may contain errors or inaccuracies. Always review before use.</li>
              <li><strong>Data Processing:</strong> Your content is processed by AI models to generate outputs. We do not use your data to train models.</li>
              <li><strong>Sensitive Data:</strong> Do not submit sensitive personal data (e.g., health information, biometric data) unless necessary and lawful.</li>
              <li><strong>Third-Party AI:</strong> AI processing is performed by Google Cloud under our data processing agreement.</li>
              <li><strong>Prohibited Use:</strong> We do not permit abusive, unlawful, or discriminatory use of the Service.</li>
            </ul>

            <h2>Special Categories of Data</h2>
            <p className="text-slate-700 leading-relaxed">
              GDPR provides enhanced protection for "special categories" of personal data, including:
            </p>
            <ul className="text-slate-700">
              <li>Racial or ethnic origin</li>
              <li>Political opinions</li>
              <li>Religious or philosophical beliefs</li>
              <li>Health data</li>
              <li>Biometric data</li>
              <li>Sexual orientation</li>
            </ul>
            <p className="text-slate-700 leading-relaxed">
              <strong>Please do not submit special categories of data to our Service</strong> unless the Service explicitly supports it and you have a lawful basis for processing such data.
            </p>

            <h2>Children's Data</h2>
            <p className="text-slate-700 leading-relaxed">
              Keju is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are between 13 and 18, you may only use the Service with the consent of a parent or legal guardian.
            </p>
            <p className="text-slate-700 leading-relaxed">
              If we become aware that we have collected personal information from a child under 13, we will take steps to delete that information immediately.
            </p>

            <h2>Changes to This Notice</h2>
            <p className="text-slate-700 leading-relaxed">
              We may update this GDPR notice from time to time to reflect changes in our data processing practices or legal requirements. We will notify you of any material changes by:
            </p>
            <ul className="text-slate-700">
              <li>Posting the updated notice on this page</li>
              <li>Updating the "Last updated" date</li>
              <li>Sending an email notification for significant changes</li>
            </ul>
            <p className="text-slate-700 leading-relaxed">
              For more detailed information about our data practices, please see our <Link to="/privacy">Privacy Policy</Link> and <Link to="/cookies">Cookie Policy</Link>.
            </p>

            <h2>Contact Us</h2>
            <p className="text-slate-700 leading-relaxed">
              If you have any questions about this GDPR notice, your rights, or our data processing practices, please contact us:
            </p>
            <p className="text-slate-700 leading-relaxed">
              <strong>Email:</strong> <a href="mailto:privacy@keju.io">privacy@keju.io</a>
            </p>
            <p className="text-slate-700 leading-relaxed">
              <strong>Website:</strong> keju.io
            </p>
            <p className="text-slate-700 leading-relaxed">
              We will respond to all legitimate requests within 30 days, as required by GDPR.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default GDPRPage;
