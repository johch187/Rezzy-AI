import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { ProfileContext } from '../App';
import { DocumentDuplicateIcon } from '../components/Icons';
import SettingsCard from '../components/SettingsCard';
import Button from '../components/Button';
import Container from '../components/Container';
import PageHeader from '../components/PageHeader';

const ManageSubscriptionPage: React.FC = () => {
  const profileContext = useContext(ProfileContext);
  const [copied, setCopied] = useState(false);
  
  const userEmail = profileContext?.profile?.email || 'user@example.com';
  const referralLink = `https://keju.io/join?ref=${userEmail.split('@')[0]}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="bg-base-200 py-16 sm:py-24 animate-fade-in">
      <Container className="max-w-4xl py-0">
        <PageHeader
          title="Account Settings"
          subtitle="Manage your subscription, billing, and account details."
        />
        
        <div className="space-y-8">
            {/* Current Plan Card */}
            <SettingsCard title="Current Plan">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                  <p className="text-lg font-semibold text-slate-800">Basic Plan (Free)</p>
                  <p className="text-slate-500 text-sm mt-1">You currently have the free Basic plan.</p>
                </div>
                <div className="flex space-x-2 mt-4 sm:mt-0">
                  <Button as="link" to="/subscription" variant="primary">Upgrade Plan</Button>
                  <Button variant="danger">Cancel Subscription</Button>
                </div>
              </div>
            </SettingsCard>

            {/* Billing Information Card */}
            <SettingsCard title="Billing Information">
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                  <p className="text-slate-800"><span className="font-semibold">Payment Method:</span> Visa ending in 1234</p>
                  <p className="text-slate-500 text-sm mt-1">Next invoice will be billed on November 24, 2025.</p>
                </div>
                <div className="flex space-x-2 mt-4 sm:mt-0">
                    <Button variant='outline'>Update Payment</Button>
                    <Button variant='outline'>View History</Button>
                </div>
              </div>
            </SettingsCard>

            {/* Account Details Card */}
            <SettingsCard title="Account Details">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Email Address</label>
                  <input type="email" disabled value={userEmail} className="mt-1 block w-full rounded-md border-slate-300 bg-slate-100 shadow-sm sm:text-sm" />
                </div>
                <div className="flex justify-end">
                  <Button variant="danger">Delete Account</Button>
                </div>
              </div>
            </SettingsCard>
            
            {/* Refer a Friend Card */}
            <SettingsCard title="Refer a Friend & Earn Tokens">
                <p className="text-slate-700 mb-4">
                    Share your unique referral link with friends. For every friend that signs up, you both get 20 bonus tokens!
                </p>
                <div className="flex flex-col sm:flex-row items-stretch gap-2">
                    <input 
                        type="text" 
                        readOnly 
                        value={referralLink} 
                        className="flex-grow block w-full rounded-md border-slate-300 bg-slate-100 shadow-sm sm:text-sm focus:ring-0 focus:border-slate-300"
                    />
                    <Button
                        onClick={handleCopyLink}
                        variant="secondary"
                        leftIcon={<DocumentDuplicateIcon />}
                    >
                        {copied ? 'Copied!' : 'Copy Link'}
                    </Button>
                </div>
            </SettingsCard>

          </div>
      </Container>
    </div>
  );
};

export default ManageSubscriptionPage;
