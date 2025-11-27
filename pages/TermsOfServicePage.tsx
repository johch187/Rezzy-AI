import React from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/Container';

const TermsOfServicePage: React.FC = () => {
  return (
    <div className="bg-white py-12 sm:py-16">
      <Container size="narrow">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-semibold text-gray-900">Terms of Service</h1>
          <p className="mt-2 text-sm text-gray-500">Last updated: November 2024</p>
        </div>

        {/* Content */}
        <div className="prose prose-gray max-w-none">
          <p className="lead text-gray-600">
            These Terms of Service ("Terms") govern your use of Keju's services, website, and applications at keju.io (the "Service"). By using the Service, you agree to these Terms.
          </p>

          <h2>About Keju</h2>
          <ul>
            <li><strong>Company:</strong> Keju AB</li>
            <li><strong>Jurisdiction:</strong> Sweden (EU/EEA)</li>
            <li><strong>Website:</strong> keju.io</li>
          </ul>

          <h2>Account Registration</h2>
          <p>To use Keju, you must create an account. You agree to:</p>
          <ul>
            <li>Provide accurate and complete information</li>
            <li>Maintain the security of your password</li>
            <li>Notify us of any unauthorized access</li>
            <li>Accept responsibility for all account activity</li>
          </ul>
          <p>
            You must be at least 13 years old. If under 18, you need parental consent.
          </p>

          <h2>Acceptable Use</h2>
          <p>You agree NOT to:</p>
          <ul>
            <li>Violate any laws or third-party rights</li>
            <li>Upload malicious code or harmful content</li>
            <li>Attempt unauthorized access to our systems</li>
            <li>Interfere with or disrupt the Service</li>
            <li>Use automated bots without permission</li>
            <li>Resell or redistribute the Service</li>
            <li>Reverse engineer or extract source code</li>
            <li>Upload infringing, unlawful, or abusive content</li>
          </ul>
          <p>We may suspend or terminate accounts that violate these terms.</p>

          <h2>Your Data and Content</h2>
          
          <h3>Ownership</h3>
          <p>
            <strong>You retain full ownership of all data and content you upload.</strong> This includes resumes, profiles, cover letters, and chat history.
          </p>

          <h3>License to Keju</h3>
          <p>
            You grant us a limited license to process your data solely to provide the Service. This license terminates when you delete your content or account. We do NOT use your data for any other purpose.
          </p>

          <h3>Data Protection</h3>
          <p>
            We process data in compliance with GDPR. See our <Link to="/privacy">Privacy Policy</Link> and <Link to="/gdpr">GDPR Notice</Link> for details.
          </p>

          <h2>Subscription and Payment</h2>
          
          <h3>Billing</h3>
          <ul>
            <li>Subscriptions are billed in advance (monthly or annually)</li>
            <li>Payments are processed securely by Polar</li>
            <li>Prices are in EUR and may include applicable taxes</li>
            <li>Plans auto-renew unless cancelled</li>
          </ul>

          <h3>Token System</h3>
          <ul>
            <li>Tokens are used for AI-powered features</li>
            <li>Allocations vary by subscription plan</li>
            <li>Unused tokens may expire per plan terms</li>
            <li>Tokens are non-transferable</li>
          </ul>

          <h3>Cancellation</h3>
          <p>
            Cancel anytime from your account settings. Cancellation takes effect at the end of your billing period. Refunds are not provided for partial periods except as required by law.
          </p>

          <h2>Intellectual Property</h2>
          <p>
            The Service, features, and functionality are owned by Keju AB and protected by Swedish and international intellectual property laws. You may not copy, modify, or distribute any part of the Service without permission.
          </p>

          <h2>Disclaimers</h2>
          
          <h3>Service Availability</h3>
          <p>
            The Service is provided "as is" and "as available." We do not guarantee uninterrupted or error-free operation.
          </p>

          <h3>AI-Generated Content</h3>
          <p>
            Keju uses AI (Google Vertex AI) to generate content. You acknowledge:
          </p>
          <ul>
            <li>AI outputs may contain errors or inaccuracies</li>
            <li>You must review all generated content</li>
            <li>You are responsible for how you use AI outputs</li>
            <li>We are not liable for decisions based on AI content</li>
          </ul>

          <h3>Limitation of Liability</h3>
          <p>
            To the maximum extent permitted by Swedish law, Keju AB is not liable for indirect, incidental, or consequential damages. Our total liability is limited to amounts you paid us in the 12 months prior to the claim.
          </p>

          <h2>Termination</h2>
          <p>
            We may terminate or suspend your account for breach of these Terms, fraudulent activity, or non-payment. Upon termination, you may export your data within 30 days.
          </p>
          <p>
            You may terminate your account anytime from account settings.
          </p>

          <h2>Third-Party Services</h2>
          <p>
            The Service integrates with third parties including Google Cloud, Supabase, and Polar. Their terms apply to their components.
          </p>

          <h2>Governing Law</h2>
          <p>
            These Terms are governed by Swedish law. Disputes will be resolved in Swedish courts, except that EU consumers may bring claims in their local courts as permitted by EU law.
          </p>

          <h2>Changes to Terms</h2>
          <p>
            We may modify these Terms. We'll notify you of material changes via email or website notice. Continued use after changes indicates acceptance.
          </p>

          <h2>Contact Us</h2>
          <ul>
            <li><strong>Email:</strong> <a href="mailto:legal@keju.io">legal@keju.io</a></li>
            <li><strong>Company:</strong> Keju AB, Sweden</li>
            <li><strong>Website:</strong> keju.io</li>
          </ul>
        </div>
      </Container>
    </div>
  );
};

export default TermsOfServicePage;
