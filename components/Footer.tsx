import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-base-300 text-gray-600">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left space-y-4 md:space-y-0">
          <div className="text-sm">
            <p>&copy; 2025 Johan Chen. All rights reserved.</p>
            <p className="mt-1">
              For any inquiry, contact us at{' '}
              <a href="mailto:hello@example.com" className="text-primary hover:underline">
                hello@example.com
              </a>
            </p>
          </div>
          <div className="flex space-x-6 text-sm">
            <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
            <Link to="/terms" className="hover:underline">Terms of Service</Link>
            <Link to="/gdpr" className="hover:underline">GDPR</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default React.memo(Footer);
