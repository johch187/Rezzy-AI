import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { ProfileContext } from '../App';
import { DocumentDuplicateIcon } from '../components/Icons';

// Reusable card component for styling consistency
const SettingsCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200">
    <h2 className="text-xl font-bold text-neutral border-b border-gray-200 pb-4 mb-6">{title}</h2>
    {children}
  </div>
);

// Reusable button component
const Button: React.FC<{ onClick?: () => void; children: React.ReactNode; variant?: 'primary' | 'secondary' | 'danger'; className?: string }> = ({ onClick, children, variant = 'secondary', className }) => {
  const baseClasses = "px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200";
  let variantClasses = '';
  switch (variant) {
    case 'primary':
      variantClasses = 'text-white bg-primary hover:bg-blue-700 focus:ring-primary';
      break;
    case 'danger':
      variantClasses = 'text-red-700 bg-red-100 hover:bg-red-200 focus:ring-red-500';
      break;
    default: // secondary
      variantClasses = 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:ring-primary';
      break;
  }
  return (
    <button onClick={onClick} className={`${baseClasses} ${variantClasses} ${className}`}>
      {children}
    </button>
  );
};


const ManageSubscriptionPage: React.FC = () => {
  const profileContext = useContext(ProfileContext);
  const [copied, setCopied] = useState(false);
  
  const userEmail = profileContext?.profile?.email || 'user@example.com';
  const referralLink = `https://airesumebuilder.app/join?ref=${userEmail.split('@')[0]}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="bg-base-200 py-16 sm:py-24 animate-fade-in">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold tracking-tight text-neutral sm:text-5xl">Account Settings</h1>
            <p className="mt-4 text-xl text-gray-500">
              Manage your subscription, billing, and account details.
            </p>
          </div>
          
          <div className="space-y-8">
            {/* Current Plan Card */}
            <SettingsCard title="Current Plan">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                  <p className="text-lg font-semibold text-gray-800">Basic Plan (Free)</p>
                  <p className="text-gray-500 text-sm mt-1">You currently have the free Basic plan.</p>
                </div>
                <div className="flex space-x-2 mt-4 sm:mt-0">
                  <Link to="/subscription">
                    <Button variant="primary">Upgrade Plan</Button>
                  </Link>
                  <Button variant="danger">Cancel Subscription</Button>
                </div>
              </div>
            </SettingsCard>

            {/* Billing Information Card */}
            <SettingsCard title="Billing Information">
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                  <p className="text-gray-800"><span className="font-semibold">Payment Method:</span> Visa ending in 1234</p>
                  <p className="text-gray-500 text-sm mt-1">Next invoice will be billed on November 24, 2025.</p>
                </div>
                <div className="flex space-x-2 mt-4 sm:mt-0">
                    <Button>Update Payment</Button>
                    <Button>View History</Button>
                </div>
              </div>
            </SettingsCard>

            {/* Account Details Card */}
            <SettingsCard title="Account Details">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email Address</label>
                  <input type="email" disabled value={userEmail} className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm sm:text-sm" />
                </div>
                <div className="flex justify-end">
                  <Button variant="danger">Delete Account</Button>
                </div>
              </div>
            </SettingsCard>
            
            {/* Refer a Friend Card */}
            <SettingsCard title="Refer a Friend & Earn Tokens">
                <p className="text-gray-600 mb-4">
                    Share your unique referral link with friends. For every friend that signs up, you both get 20 bonus tokens!
                </p>
                <div className="flex flex-col sm:flex-row items-stretch gap-2">
                    <input 
                        type="text" 
                        readOnly 
                        value={referralLink} 
                        className="flex-grow block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm sm:text-sm focus:ring-0 focus:border-gray-300"
                    />
                    <button 
                        onClick={handleCopyLink}
                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-secondary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
                    >
                        <DocumentDuplicateIcon />
                        <span className="ml-2">{copied ? 'Copied!' : 'Copy Link'}</span>
                    </button>
                </div>
            </SettingsCard>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageSubscriptionPage;