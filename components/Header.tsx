import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 4a1 1 0 00-.526.92V15a1 1 0 00.526.92l7 4a1 1 0 00.788 0l7-4a1 1 0 00.526-.92V6.994a1 1 0 00-.526-.92l-7-4zM10 18.341L3.5 14.5v-7.842L10 10.341v8zM16.5 14.5L10 18.341v-8L16.5 6.658v7.842zM10 3.659l6.5 3.714-6.5 3.715L3.5 7.373 10 3.659z" />
          </svg>
          <h1 className="text-2xl font-bold text-neutral">
            AI Resume Builder
          </h1>
        </Link>
        <nav className="flex items-center space-x-4">
            <Link
              to="/generate"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
            >
              Tailor for New Role
            </Link>
            <span className="text-sm text-gray-500">Logged in as Alex Doe</span>
        </nav>
      </div>
    </header>
  );
};

export default React.memo(Header);
