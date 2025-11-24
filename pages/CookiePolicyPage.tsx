import React from 'react';
import Container from '../components/Container';
import PageHeader from '../components/PageHeader';

const CookiePolicyPage: React.FC = () => {
  return (
    <div className="bg-white py-16 sm:py-24 animate-fade-in">
      <Container className="max-w-4xl py-0">
        <PageHeader title="Cookie Policy" subtitle="Last updated: November 2024" />
        <div className="max-w-3xl mx-auto">
          <div className="prose prose-lg max-w-none prose-h2:text-slate-900 prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-slate-800 prose-h3:mt-6 prose-h3:mb-3 prose-a:text-brand-blue hover:prose-a:text-blue-700 prose-ul:list-disc prose-ul:pl-6 prose-li:my-2">
            <h2>What Are Cookies</h2>
            <p className="text-slate-700 leading-relaxed">
              Cookies are small text files that are placed on your device (computer, smartphone, or tablet) when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.
            </p>
            <p className="text-slate-700 leading-relaxed">
              This Cookie Policy explains how Keju uses cookies and similar technologies to recognize you when you visit our website and use our services. It explains what these technologies are, why we use them, and your rights to control their use.
            </p>

            <h2>Why We Use Cookies</h2>
            <p className="text-slate-700 leading-relaxed">We use cookies for several important reasons:</p>
            <ul className="text-slate-700">
              <li><strong>Essential Functionality:</strong> To enable core features like authentication and account management</li>
              <li><strong>Security:</strong> To protect your account and detect fraudulent activity</li>
              <li><strong>Performance:</strong> To understand how our Service performs and identify areas for improvement</li>
              <li><strong>User Preferences:</strong> To remember your settings and preferences</li>
              <li><strong>Analytics:</strong> To understand how visitors use our website (using anonymized data)</li>
            </ul>

            <h2>Types of Cookies We Use</h2>
            
            <h3>1. Strictly Necessary Cookies</h3>
            <p className="text-slate-700 leading-relaxed">
              These cookies are essential for the website to function properly. They enable core functionality such as:
            </p>
            <ul className="text-slate-700">
              <li><strong>Authentication:</strong> To keep you logged in and manage your session</li>
              <li><strong>Security:</strong> To protect against unauthorized access and CSRF attacks</li>
              <li><strong>Account Management:</strong> To enable account-related features</li>
            </ul>
            <p className="text-slate-700 leading-relaxed">
              These cookies cannot be disabled as they are necessary for the Service to work. They do not collect personal information and are deleted when you close your browser.
            </p>

            <h3>2. Performance and Analytics Cookies</h3>
            <p className="text-slate-700 leading-relaxed">
              These cookies help us understand how visitors interact with our website by collecting anonymous information:
            </p>
            <ul className="text-slate-700">
              <li>Pages visited and features used</li>
              <li>Time spent on pages</li>
              <li>Error messages encountered</li>
              <li>Browser and device information</li>
            </ul>
            <p className="text-slate-700 leading-relaxed font-medium">
              <strong>Important:</strong> All analytics data is aggregated and anonymized. We cannot identify individual users from this data. We do NOT track you across other websites.
            </p>

            <h3>3. Functional Cookies</h3>
            <p className="text-slate-700 leading-relaxed">
              These cookies enable enhanced functionality and personalization:
            </p>
            <ul className="text-slate-700">
              <li>Remembering your preferences (e.g., language, theme)</li>
              <li>Storing your workspace settings</li>
              <li>Remembering your previous choices</li>
            </ul>
            <p className="text-slate-700 leading-relaxed">
              If you decline these cookies, some features may not work correctly or remember your preferences.
            </p>

            <h2>What We DON'T Do</h2>
            <p className="text-slate-700 leading-relaxed">We are committed to your privacy. We DO NOT:</p>
            <ul className="text-slate-700">
              <li><strong>Use advertising cookies:</strong> We do not serve ads or use cookies for advertising purposes</li>
              <li><strong>Track you across websites:</strong> We do not use cross-site tracking cookies</li>
              <li><strong>Sell your data:</strong> We never sell cookie data or any other personal information</li>
              <li><strong>Share with advertisers:</strong> We do not share cookie data with advertising networks</li>
              <li><strong>Build profiles:</strong> We do not create detailed user profiles for marketing purposes</li>
              <li><strong>Use social media tracking:</strong> We do not use Facebook Pixel, Google Ads tracking, or similar technologies</li>
            </ul>

            <h2>Third-Party Services</h2>
            <p className="text-slate-700 leading-relaxed">
              We use a limited number of trusted third-party services that may set cookies:
            </p>

            <h3>Analytics</h3>
            <p className="text-slate-700 leading-relaxed">
              We use privacy-focused analytics tools (including BigQuery) to understand website usage. These tools:
            </p>
            <ul className="text-slate-700">
              <li>Collect only anonymized, aggregated data</li>
              <li>Do not track individual users</li>
              <li>Do not share data with advertising networks</li>
              <li>Are fully GDPR and privacy-compliant</li>
            </ul>

            <h3>Authentication</h3>
            <p className="text-slate-700 leading-relaxed">
              We use Supabase for authentication, which may set cookies according to their own cookie policy. If you sign in using Google OAuth, Google may set cookies according to their own cookie policy. We recommend reviewing Supabase's and Google's privacy policies for more information.
            </p>

            <h3>Payment Processing</h3>
            <p className="text-slate-700 leading-relaxed">
              Our payment processor (Polar) may use cookies to securely process transactions. Payment data is handled directly by the processor and never stored on our servers.
            </p>

            <h2>How Long Cookies Last</h2>
            <p className="text-slate-700 leading-relaxed">
              Cookies can be either "session" or "persistent" cookies:
            </p>

            <h3>Session Cookies</h3>
            <p className="text-slate-700 leading-relaxed">
              These are temporary cookies that expire when you close your browser. We use session cookies for:
            </p>
            <ul className="text-slate-700">
              <li>Maintaining your logged-in state during a browsing session</li>
              <li>Temporarily storing form data</li>
              <li>Security features like CSRF protection</li>
            </ul>

            <h3>Persistent Cookies</h3>
            <p className="text-slate-700 leading-relaxed">
              These remain on your device until they expire or you delete them. We use persistent cookies for:
            </p>
            <ul className="text-slate-700">
              <li><strong>Remember Me:</strong> To keep you logged in across sessions (expires after 30 days)</li>
              <li><strong>Preferences:</strong> To remember your settings (expires after 1 year)</li>
              <li><strong>Analytics:</strong> To distinguish users in aggregated statistics (expires after 2 years)</li>
            </ul>

            <h2>Your Cookie Choices</h2>
            <p className="text-slate-700 leading-relaxed">
              You have several options to control or limit how cookies are used:
            </p>

            <h3>Browser Settings</h3>
            <p className="text-slate-700 leading-relaxed">Most browsers allow you to:</p>
            <ul className="text-slate-700">
              <li>View and delete cookies</li>
              <li>Block all cookies (may affect website functionality)</li>
              <li>Block third-party cookies</li>
              <li>Clear cookies when you close the browser</li>
              <li>Set exceptions for specific websites</li>
            </ul>

            <h3>Browser-Specific Instructions</h3>
            <ul className="text-slate-700">
              <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
              <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data</li>
              <li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
              <li><strong>Edge:</strong> Settings → Privacy, search, and services → Cookies and site permissions</li>
            </ul>

            <h3>Impact of Blocking Cookies</h3>
            <p className="text-slate-700 leading-relaxed">
              If you choose to block cookies, please note that:
            </p>
            <ul className="text-slate-700">
              <li>You may not be able to log in or use certain features</li>
              <li>Your preferences and settings will not be saved</li>
              <li>The Service may not function as intended</li>
              <li>You'll need to re-enter information each visit</li>
            </ul>

            <h2>Do Not Track Signals</h2>
            <p className="text-slate-700 leading-relaxed">
              Some browsers include "Do Not Track" (DNT) features that signal websites you visit that you do not want to have your online activity tracked.
            </p>
            <p className="text-slate-700 leading-relaxed">
              We respect DNT signals. When we detect a DNT signal, we disable non-essential analytics cookies. However, strictly necessary cookies required for the Service to function will still be used.
            </p>

            <h2>Changes to This Cookie Policy</h2>
            <p className="text-slate-700 leading-relaxed">
              We may update this Cookie Policy from time to time to reflect changes in our practices or for legal, operational, or regulatory reasons. We will notify you of any material changes by:
            </p>
            <ul className="text-slate-700">
              <li>Posting the updated Cookie Policy on this page</li>
              <li>Updating the "Last updated" date</li>
              <li>Sending an email notification for significant changes</li>
            </ul>
            <p className="text-slate-700 leading-relaxed">
              We encourage you to review this Cookie Policy periodically to stay informed about how we use cookies.
            </p>

            <h2>Contact Us</h2>
            <p className="text-slate-700 leading-relaxed">
              If you have any questions about our use of cookies or this Cookie Policy, please contact us:
            </p>
            <p className="text-slate-700 leading-relaxed">
              <strong>Email:</strong> <a href="mailto:privacy@keju.io">privacy@keju.io</a>
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

export default CookiePolicyPage;

