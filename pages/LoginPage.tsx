import React from 'react';
import Container from '../components/Container';
import PageHeader from '../components/PageHeader';

const LoginPage: React.FC = () => {
  return (
    <div className="bg-white py-16 sm:py-24 animate-fade-in">
      <Container className="max-w-4xl py-0">
        <div className="max-w-md mx-auto text-center">
          <PageHeader
            title="Login or Register"
            subtitle="Access your profile and build your next application."
          />
          <div className="bg-gray-100 p-8 rounded-2xl border border-gray-200">
            <p className="text-gray-500">Google Sign-in will be configured here in the future.</p>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default LoginPage;
