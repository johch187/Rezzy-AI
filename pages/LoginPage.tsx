import React from 'react';

const LoginPage: React.FC = () => {
  return (
    <div className="bg-white py-12 sm:py-16 animate-fade-in">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-3xl font-bold text-neutral mb-4">Login</h1>
          <p className="text-gray-600 mb-8">
            This is where the login functionality will be. Google Login coming soon!
          </p>
          <div className="bg-gray-100 p-8 rounded-lg border border-gray-200">
            <p className="text-gray-500">Google Sign-in will be configured here in the future.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;