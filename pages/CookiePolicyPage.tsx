import React from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/Container';

const CookiePolicyPage: React.FC = () => {
  return (
    <div className="bg-white py-12 sm:py-16">
      <Container size="narrow">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-semibold text-gray-900">Cookie Policy</h1>
          <p className="mt-2 text-sm text-gray-500">Last updated: November 2024</p>
        </div>

        {/* Content */}
        <div className="prose prose-gray max-w-none">
          <p className="lead text-gray-600">
            This Cookie Policy explains how Keju AB uses cookies and similar technologies on keju.io.
          </p>

          <h2>What Are Cookies</h2>
          <p>
            Cookies are small text files placed on your device when you visit a website. They help websites function properly and provide information to site owners.
          </p>

          <h2>Why We Use Cookies</h2>
          <ul>
            <li><strong>Essential Functionality:</strong> Authentication and account management</li>
            <li><strong>Security:</strong> Protecting your account and detecting fraud</li>
            <li><strong>Performance:</strong> Understanding how the Service performs</li>
            <li><strong>Preferences:</strong> Remembering your settings</li>
          </ul>

          <h2>Types of Cookies We Use</h2>

          <h3>1. Strictly Necessary Cookies</h3>
          <p>Essential for the website to function. These enable:</p>
          <ul>
            <li>Authentication and session management (via Supabase)</li>
            <li>Security features (CSRF protection)</li>
            <li>Account-related functionality</li>
          </ul>
          <p>
            These cookies cannot be disabled. They do not collect personal information for marketing.
          </p>

          <h3>2. Performance Cookies</h3>
          <p>Help us understand website usage through anonymized data:</p>
          <ul>
            <li>Pages visited and features used</li>
            <li>Time spent on pages</li>
            <li>Error messages</li>
          </ul>
          <p>
            We use Google Cloud BigQuery for privacy-focused analytics. Data is aggregated and anonymized.
          </p>

          <h3>3. Functional Cookies</h3>
          <p>Enable enhanced functionality:</p>
          <ul>
            <li>Remembering preferences</li>
            <li>Storing workspace settings</li>
          </ul>

          <h2>Third-Party Cookies</h2>

          <h3>Supabase (Authentication)</h3>
          <p>
            We use Supabase for authentication. Supabase may set cookies according to their privacy policy.
          </p>

          <h3>Polar (Payments)</h3>
          <p>
            Our payment processor Polar may set cookies during checkout. Payment data is handled directly by Polar.
          </p>

          <h3>Google Cloud</h3>
          <p>
            We use Google Cloud for hosting and analytics. Google may set cookies for security and performance.
          </p>

          <h2>What We DON'T Do</h2>
          <ul>
            <li>❌ Use advertising or tracking cookies</li>
            <li>❌ Track you across other websites</li>
            <li>❌ Sell cookie data</li>
            <li>❌ Share data with advertising networks</li>
            <li>❌ Use Facebook Pixel, Google Ads, or similar trackers</li>
          </ul>

          <h2>Cookie Duration</h2>

          <h3>Session Cookies</h3>
          <p>Expire when you close your browser. Used for:</p>
          <ul>
            <li>Maintaining login state during session</li>
            <li>Security features</li>
          </ul>

          <h3>Persistent Cookies</h3>
          <p>Remain until they expire or you delete them:</p>
          <ul>
            <li><strong>Remember Me:</strong> Up to 30 days</li>
            <li><strong>Preferences:</strong> Up to 1 year</li>
          </ul>

          <h2>Your Cookie Choices</h2>

          <h3>Browser Settings</h3>
          <p>You can control cookies through your browser:</p>
          <ul>
            <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies</li>
            <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies</li>
            <li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
            <li><strong>Edge:</strong> Settings → Privacy → Cookies</li>
          </ul>

          <h3>Impact of Blocking Cookies</h3>
          <p>If you block cookies:</p>
          <ul>
            <li>You may not be able to log in</li>
            <li>Preferences won't be saved</li>
            <li>Some features may not work</li>
          </ul>

          <h2>Do Not Track</h2>
          <p>
            We respect Do Not Track (DNT) signals. When detected, we disable non-essential analytics. Essential cookies for Service functionality will still be used.
          </p>

          <h2>GDPR Compliance</h2>
          <p>
            As a Swedish company, we comply with GDPR cookie requirements. We only use essential cookies by default and request consent for non-essential cookies where required.
          </p>

          <h2>Changes to This Policy</h2>
          <p>
            We may update this Cookie Policy. Material changes will be communicated via website notice or email.
          </p>

          <h2>Contact Us</h2>
          <ul>
            <li><strong>Email:</strong> <a href="mailto:privacy@keju.io">privacy@keju.io</a></li>
            <li><strong>Company:</strong> Keju AB, Sweden</li>
            <li><strong>Website:</strong> keju.io</li>
          </ul>

          <p>
            See also: <Link to="/privacy">Privacy Policy</Link> | <Link to="/gdpr">GDPR Notice</Link> | <Link to="/terms">Terms of Service</Link>
          </p>
        </div>
      </Container>
    </div>
  );
};

export default CookiePolicyPage;
