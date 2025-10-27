import React from 'react';

const LoginPage: React.FC = () => {
  return (
    <div className="bg-white py-16 sm:py-24 animate-fade-in">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-neutral sm:text-5xl mb-4">Login or Register</h1>
          <p className="text-xl text-gray-600 mb-8">
            Access your profile and build your next application.
          </p>
          <div className="bg-gray-100 p-8 rounded-2xl border border-gray-200">
            <p className="text-gray-500">Google Sign-in will be configured here in the future.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;