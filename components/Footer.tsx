import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-base-100 border-t border-base-300 text-slate-500">
      <div className="mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left space-y-4 md:space-y-0">
          <div className="text-sm">
            <p>&copy; 2025 Keju. All rights reserved.</p>
            <p className="mt-1">
              For any inquiry, contact us at{' '}
              <a href="mailto:support@keju.io" className="text-brand-blue hover:underline">
                support@keju.io
              </a>
            </p>
          </div>
          <div className="flex space-x-6 text-sm">
            <Link to="/" className="hover:text-brand-blue hover:underline">Home</Link>
            <Link to="/subscription" className="hover:text-brand-blue hover:underline">Pricing</Link>
            <Link to="/privacy" className="hover:text-brand-blue hover:underline">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-brand-blue hover:underline">Terms of Service</Link>
            <Link to="/gdpr" className="hover:text-brand-blue hover:underline">GDPR</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default React.memo(Footer);