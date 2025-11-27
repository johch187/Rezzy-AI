import React from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/Container';

const GDPRPage: React.FC = () => {
  return (
    <div className="bg-white py-12 sm:py-16">
      <Container size="narrow">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-semibold text-gray-900">GDPR Compliance</h1>
          <p className="mt-2 text-sm text-gray-500">Last updated: November 2024</p>
        </div>

        {/* Content */}
        <div className="prose prose-gray max-w-none">
          <p className="lead text-gray-600">
            Keju AB is a Swedish company fully committed to GDPR compliance. This notice explains how we process personal data under the General Data Protection Regulation (GDPR).
          </p>

          <h2>Data Controller</h2>
          <p>
            <strong>Keju AB</strong> is the data controller for personal data processed through keju.io.
          </p>
          <ul>
            <li><strong>Company:</strong> Keju AB</li>
            <li><strong>Country:</strong> Sweden (EU Member State)</li>
            <li><strong>Website:</strong> keju.io</li>
            <li><strong>Data Protection Contact:</strong> <a href="mailto:privacy@keju.io">privacy@keju.io</a></li>
          </ul>

          <h2>Legal Bases for Processing</h2>
          <p>We process personal data under the following legal bases:</p>

          <h3>Contract Performance (Article 6(1)(b))</h3>
          <ul>
            <li>Providing access to the Service</li>
            <li>Generating resumes, cover letters, and career guidance</li>
            <li>Managing your account and subscriptions</li>
            <li>Processing payments via Polar</li>
          </ul>

          <h3>Legitimate Interests (Article 6(1)(f))</h3>
          <ul>
            <li>Securing and maintaining the platform</li>
            <li>Preventing fraud and abuse</li>
            <li>Improving services using aggregated analytics</li>
          </ul>

          <h3>Legal Obligations (Article 6(1)(c))</h3>
          <ul>
            <li>Tax and accounting requirements</li>
            <li>Swedish and EU data protection laws</li>
          </ul>

          <h3>Consent (Article 6(1)(a))</h3>
          <ul>
            <li>Optional marketing communications</li>
            <li>Non-essential cookies</li>
          </ul>

          <h2>Data We Process</h2>
          
          <h3>Account Data</h3>
          <ul>
            <li>Email address and name</li>
            <li>Authentication information (via Supabase)</li>
            <li>Account settings</li>
          </ul>

          <h3>Content Data</h3>
          <ul>
            <li>Resumes, profiles, cover letters</li>
            <li>Chat history and AI interactions</li>
            <li>Generated documents</li>
          </ul>

          <h3>Technical Data</h3>
          <ul>
            <li>IP address, browser, device information</li>
            <li>Usage patterns and analytics</li>
          </ul>

          <h3>Payment Data</h3>
          <ul>
            <li>Subscription status and billing history</li>
            <li>Payment processing handled by Polar (we don't store card details)</li>
          </ul>

          <h2>Data Processors (Subprocessors)</h2>
          <p>We use the following trusted processors, all under GDPR-compliant data processing agreements:</p>
          
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left py-2">Processor</th>
                <th className="text-left py-2">Purpose</th>
                <th className="text-left py-2">Location</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-2">Google Cloud Platform</td>
                <td className="py-2">Hosting, AI (Vertex AI), Analytics</td>
                <td className="py-2">EU (europe-north1)</td>
              </tr>
              <tr>
                <td className="py-2">Supabase</td>
                <td className="py-2">Authentication, Database</td>
                <td className="py-2">EU</td>
              </tr>
              <tr>
                <td className="py-2">Polar</td>
                <td className="py-2">Payment Processing</td>
                <td className="py-2">EU</td>
              </tr>
            </tbody>
          </table>

          <h2>International Transfers</h2>
          <p>
            As a Swedish company, we prioritize EU/EEA data processing. Our primary infrastructure is hosted in Google Cloud's <strong>europe-north1</strong> region (Finland).
          </p>
          <p>
            When data is transferred outside the EU/EEA (e.g., for certain AI processing), we rely on:
          </p>
          <ul>
            <li>EU Standard Contractual Clauses (SCCs)</li>
            <li>Adequacy decisions where applicable</li>
            <li>Supplementary technical measures</li>
          </ul>

          <h2>Your GDPR Rights</h2>
          <p>Under GDPR, you have the following rights:</p>

          <h3>Right of Access (Article 15)</h3>
          <p>Request a copy of all personal data we hold about you.</p>

          <h3>Right to Rectification (Article 16)</h3>
          <p>Correct inaccurate or incomplete personal data.</p>

          <h3>Right to Erasure (Article 17)</h3>
          <p>Request deletion of your personal data ("right to be forgotten").</p>

          <h3>Right to Restrict Processing (Article 18)</h3>
          <p>Request limitation of processing in certain circumstances.</p>

          <h3>Right to Data Portability (Article 20)</h3>
          <p>Receive your data in a structured, machine-readable format.</p>

          <h3>Right to Object (Article 21)</h3>
          <p>Object to processing based on legitimate interests.</p>

          <h3>Right to Withdraw Consent (Article 7)</h3>
          <p>Withdraw consent at any time where processing is based on consent.</p>

          <h3>Right to Lodge a Complaint</h3>
          <p>
            You may lodge a complaint with the <strong>Swedish Authority for Privacy Protection (Integritetsskyddsmyndigheten, IMY)</strong>:
          </p>
          <ul>
            <li>Website: <a href="https://www.imy.se" target="_blank" rel="noopener noreferrer">imy.se</a></li>
            <li>Email: imy@imy.se</li>
          </ul>
          <p>You may also contact your local EU supervisory authority.</p>

          <h2>Exercising Your Rights</h2>
          <p>
            To exercise any of your GDPR rights, contact us at <a href="mailto:privacy@keju.io">privacy@keju.io</a>. We will respond within 30 days as required by GDPR.
          </p>
          <p>
            You can also manage your data directly in your account settings, including downloading and deleting your content.
          </p>

          <h2>Data Retention</h2>
          <ul>
            <li><strong>Active accounts:</strong> Data retained while account is active</li>
            <li><strong>Deleted content:</strong> Permanently removed within 30 days</li>
            <li><strong>Closed accounts:</strong> All data deleted within 90 days</li>
            <li><strong>Legal requirements:</strong> Some data may be retained longer for tax/legal purposes</li>
          </ul>

          <h2>Data Security</h2>
          <p>We implement appropriate technical and organizational measures:</p>
          <ul>
            <li>Encryption in transit (TLS) and at rest (AES-256)</li>
            <li>Access controls and authentication via Supabase</li>
            <li>Regular security assessments</li>
            <li>Data isolation between users</li>
            <li>Secure infrastructure on Google Cloud</li>
          </ul>

          <h2>AI Processing</h2>
          <p>
            We use Google Vertex AI for content generation. Your content is processed by AI models but is <strong>not used to train AI models</strong>. AI outputs may contain errors—always review before use.
          </p>

          <h2>Children's Data</h2>
          <p>
            Keju is not intended for children under 13. We do not knowingly collect data from children under 13.
          </p>

          <h2>Updates to This Notice</h2>
          <p>
            We may update this notice to reflect changes in our practices or legal requirements. Material changes will be communicated via email or website notice.
          </p>

          <h2>Contact</h2>
          <p>For GDPR-related inquiries:</p>
          <ul>
            <li><strong>Email:</strong> <a href="mailto:privacy@keju.io">privacy@keju.io</a></li>
            <li><strong>Company:</strong> Keju AB, Sweden</li>
            <li><strong>Website:</strong> keju.io</li>
          </ul>

          <p>
            See also: <Link to="/privacy">Privacy Policy</Link> | <Link to="/cookies">Cookie Policy</Link> | <Link to="/terms">Terms of Service</Link>
          </p>
        </div>
      </Container>
    </div>
  );
};

export default GDPRPage;
