import React from 'react';
import Container from '../components/Container';
import PageHeader from '../components/PageHeader';

const TermsOfServicePage: React.FC = () => {
  return (
    <div className="bg-white py-16 sm:py-24 animate-fade-in">
      <Container className="max-w-4xl py-0">
        <PageHeader title="Terms of Service" subtitle="Last updated: November 2024" />
        <div className="max-w-3xl mx-auto">
          <div className="prose prose-lg max-w-none prose-h2:text-slate-900 prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-slate-800 prose-h3:mt-6 prose-h3:mb-3 prose-a:text-brand-blue hover:prose-a:text-blue-700 prose-ul:list-disc prose-ul:pl-6 prose-li:my-2">
            <h2>Agreement to Terms</h2>
            <p className="text-slate-700 leading-relaxed">
              These Terms of Service ("Terms") govern your access to and use of Keju's services, website, and applications (collectively, the "Service"). By accessing or using the Service, you agree to be bound by these Terms.
            </p>
            <p className="text-slate-700 leading-relaxed">
              If you do not agree to these Terms, you may not access or use the Service.
            </p>

            <h2>Account Registration and Security</h2>
            <p className="text-slate-700 leading-relaxed">To use Keju, you must create an account. You agree to:</p>
            <ul className="text-slate-700">
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain and promptly update your account information</li>
              <li>Maintain the security and confidentiality of your password</li>
              <li>Notify us immediately of any unauthorized access or security breach</li>
              <li>Accept responsibility for all activities that occur under your account</li>
            </ul>
            <p className="text-slate-700 leading-relaxed">
              You must be at least 13 years old to use the Service. If you are under 18, you may only use the Service with the consent of a parent or legal guardian.
            </p>

            <h2>Acceptable Use</h2>
            <p className="text-slate-700 leading-relaxed">You agree to use the Service only for lawful purposes. You agree NOT to:</p>
            <ul className="text-slate-700">
              <li>Violate any laws, regulations, or third-party rights</li>
              <li>Upload malicious code, viruses, or harmful content</li>
              <li>Attempt to gain unauthorized access to our systems or other users' accounts</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Use automated scripts or bots to access the Service</li>
              <li>Resell, redistribute, or make the Service available to third parties</li>
              <li>Reverse engineer, decompile, or attempt to extract source code</li>
              <li>Remove or modify any copyright, trademark, or proprietary notices</li>
              <li>Use the Service to create competing products or services</li>
              <li>Upload content that infringes intellectual property rights</li>
              <li>Upload or generate unlawful, discriminatory, harassing, or abusive content</li>
              <li>Misrepresent AI-generated outputs as human-generated when required by law to disclose AI assistance</li>
            </ul>
            <p className="text-slate-700 leading-relaxed">
              We reserve the right to suspend or terminate your account if you violate these terms.
            </p>

            <h2>Your Data and Content</h2>
            
            <h3>Ownership</h3>
            <p className="text-slate-700 leading-relaxed font-medium">
              <strong>You retain full ownership of all data and files you upload to Keju.</strong> This includes:
            </p>
            <ul className="text-slate-700">
              <li>Resumes, profiles, and cover letters you create or upload</li>
              <li>Career chat history and conversations</li>
              <li>Document generation history and associated metadata</li>
              <li>Any content you create using the Service</li>
            </ul>

            <h3>License Grant</h3>
            <p className="text-slate-700 leading-relaxed">
              By uploading content to Keju, you grant us a limited, non-exclusive license to:
            </p>
            <ul className="text-slate-700">
              <li>Process your data to generate resumes, cover letters, and career guidance</li>
              <li>Store your files on our secure servers</li>
              <li>Display your documents back to you</li>
              <li>Operate, improve, and secure the Service</li>
            </ul>
            <p className="text-slate-700 leading-relaxed">
              This license exists solely to provide you with the Service. We do NOT use your data for any other purpose, and this license terminates when you delete your content or account.
            </p>

            <h3>Data Security and Privacy</h3>
            <p className="text-slate-700 leading-relaxed">We are committed to protecting your data:</p>
            <ul className="text-slate-700">
              <li>All data is encrypted at rest and in transit</li>
              <li>We never access your files except to provide the Service</li>
              <li>We never share your data with third parties for their purposes</li>
              <li>You can delete your data at any time</li>
            </ul>
            <p className="text-slate-700 leading-relaxed">
              We process personal data in line with applicable EU/EEA GDPR requirements. See our <a href="/privacy">Privacy Policy</a> for details on what we collect, why, and how long we retain it. You must not store special categories of data (e.g., health, biometric) unless the Service explicitly supports it.
            </p>

            <h2>Subscription and Payment</h2>
            
            <h3>Plans and Pricing</h3>
            <p className="text-slate-700 leading-relaxed">
              Keju offers various subscription plans with different features and token allocations. Current pricing is available on our website and may be changed with notice.
            </p>

            <h3>Payment Terms</h3>
            <ul className="text-slate-700">
              <li>Subscriptions are billed in advance on a monthly or annual basis</li>
              <li>All fees are non-refundable except as required by law</li>
              <li>You authorize us to charge your payment method automatically</li>
              <li>You are responsible for providing valid payment information</li>
              <li>Failure to pay may result in service suspension or termination</li>
              <li>Plans may auto-renew unless cancelled</li>
              <li>Taxes may apply</li>
            </ul>

            <h3>Token System</h3>
            <ul className="text-slate-700">
              <li>Tokens are used to generate documents and access AI features</li>
              <li>Token allocations vary by subscription plan</li>
              <li>Unused tokens may expire according to your plan terms</li>
              <li>Tokens are non-transferable and have no cash value</li>
            </ul>

            <h3>Cancellation and Refunds</h3>
            <p className="text-slate-700 leading-relaxed">
              You may cancel your subscription at any time from your account settings. Cancellation will take effect at the end of your current billing period. We do not provide refunds for partial months or unused tokens, except as required by law.
            </p>

            <h2>Intellectual Property Rights</h2>
            <p className="text-slate-700 leading-relaxed">
              The Service and its original content, features, and functionality are owned by Keju and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>
            <p className="text-slate-700 leading-relaxed">
              You may not copy, modify, distribute, sell, or lease any part of our Service or software, nor may you reverse engineer or attempt to extract the source code of that software, unless explicitly permitted by law or you have our written permission.
            </p>

            <h2>Disclaimers and Limitations</h2>
            
            <h3>Service Availability</h3>
            <p className="text-slate-700 leading-relaxed">The Service is provided "as is" and "as available." We do not guarantee that:</p>
            <ul className="text-slate-700">
              <li>The Service will be uninterrupted, timely, secure, or error-free</li>
              <li>Results obtained from the Service will be accurate or reliable</li>
              <li>The Service will meet your specific requirements</li>
              <li>Any errors or defects will be corrected</li>
            </ul>

            <h3>AI-Generated Content</h3>
            <p className="text-slate-700 leading-relaxed">Keju uses artificial intelligence to generate resumes, cover letters, and career guidance. You acknowledge that:</p>
            <ul className="text-slate-700">
              <li>AI-generated content may contain errors or inaccuracies</li>
              <li>You are responsible for reviewing and verifying all generated content</li>
              <li>You should not rely solely on AI-generated insights for critical decisions</li>
              <li>We are not liable for any decisions made based on AI-generated content</li>
              <li>You remain responsible for compliance with employer, academic, or regulatory requirements</li>
            </ul>
            <p className="text-slate-700 leading-relaxed">
              Do not submit sensitive or third-party data unless you have the legal right to do so.
            </p>

            <h3>Limitation of Liability</h3>
            <p className="text-slate-700 leading-relaxed">
              To the maximum extent permitted by law, Keju shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to:
            </p>
            <ul className="text-slate-700">
              <li>Loss of profits, data, use, or goodwill</li>
              <li>Service interruption or downtime</li>
              <li>Errors or inaccuracies in generated content</li>
              <li>Unauthorized access to your account or data</li>
            </ul>
            <p className="text-slate-700 leading-relaxed">
              Our total liability to you for all claims shall not exceed the amount you paid us in the 12 months preceding the claim.
            </p>

            <h2>Termination</h2>
            <p className="text-slate-700 leading-relaxed">
              We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason, including but not limited to:
            </p>
            <ul className="text-slate-700">
              <li>Breach of these Terms</li>
              <li>Fraudulent, abusive, or illegal activity</li>
              <li>Violation of intellectual property rights</li>
              <li>Non-payment of fees</li>
            </ul>
            <p className="text-slate-700 leading-relaxed">
              Upon termination, your right to use the Service will cease immediately. We will make reasonable efforts to provide you with access to export your data within 30 days of termination, after which your data will be permanently deleted.
            </p>
            <p className="text-slate-700 leading-relaxed">
              You may terminate your account at any time by deleting it from your account settings. All provisions of these Terms that by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
            </p>

            <h2>Indemnification</h2>
            <p className="text-slate-700 leading-relaxed">
              You agree to defend, indemnify, and hold harmless Keju and its officers, directors, employees, and agents from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of or relating to your violation of these Terms or your use of the Service.
            </p>

            <h2>Third-Party Services</h2>
            <p className="text-slate-700 leading-relaxed">
              The Service integrates third parties (e.g., Supabase auth/storage, payment processors, analytics, Google Vertex AI). Their terms and privacy practices apply to their components. We are not responsible for third-party failures or actions.
            </p>

            <h2>Governing Law and Disputes</h2>
            <p className="text-slate-700 leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.
            </p>
            <p className="text-slate-700 leading-relaxed">
              Any dispute arising from or relating to these Terms or the Service shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association, except that either party may seek injunctive or other equitable relief in a court of competent jurisdiction.
            </p>
            <p className="text-slate-700 leading-relaxed">
              You agree to waive any right to a jury trial or to participate in a class action lawsuit.
            </p>

            <h2>Changes to Terms</h2>
            <p className="text-slate-700 leading-relaxed">We reserve the right to modify these Terms at any time. We will notify you of any material changes by:</p>
            <ul className="text-slate-700">
              <li>Posting the updated Terms on our website</li>
              <li>Updating the "Last updated" date</li>
              <li>Sending an email notification to your registered email address</li>
            </ul>
            <p className="text-slate-700 leading-relaxed">
              Your continued use of the Service after any changes indicates your acceptance of the new Terms. If you do not agree to the modified Terms, you must stop using the Service.
            </p>

            <h2>Contact Us</h2>
            <p className="text-slate-700 leading-relaxed">
              If you have any questions about these Terms, please contact us:
            </p>
            <p className="text-slate-700 leading-relaxed">
              <strong>Email:</strong> <a href="mailto:legal@keju.io">legal@keju.io</a>
            </p>
            <p className="text-slate-700 leading-relaxed">
              <strong>Website:</strong> keju.io
            </p>
            <p className="text-slate-700 leading-relaxed">
              We will respond to all legitimate inquiries within 30 days.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default TermsOfServicePage;
