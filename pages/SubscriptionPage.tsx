import React, { useState } from 'react';

const SubscriptionPage: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');
  const [selectedPack, setSelectedPack] = useState('20');

  const plans = {
    premium: {
      monthly: 8,
      annually: 74.88, // 8 * 12 * (1 - 0.22)
    },
    crew: {
      monthly: 32,
      annually: 299.52, // 32 * 12 * (1 - 0.22)
    }
  };

  return (
    <div className="bg-white py-12 sm:py-16 animate-fade-in">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold tracking-tight text-neutral sm:text-5xl">Our Subscription Plans</h1>
            <p className="mt-4 text-xl text-gray-500">
              Choose the plan that's right for you. Upgrade, downgrade, or cancel anytime.
            </p>
          </div>

          {/* Billing Cycle Toggle */}
          <div className="flex justify-center items-center space-x-4 mb-10">
            <span className={`font-medium ${billingCycle === 'monthly' ? 'text-primary' : 'text-gray-500'}`}>Monthly</span>
            <label htmlFor="billing-toggle" className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="billing-toggle"
                className="sr-only peer"
                checked={billingCycle === 'annually'}
                onChange={() => setBillingCycle(prev => prev === 'monthly' ? 'annually' : 'monthly')}
              />
              <div className="w-14 h-8 bg-gray-200 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary peer-checked:bg-primary transition-colors"></div>
              <div className="absolute top-1 left-1 bg-white border-gray-300 border rounded-full h-6 w-6 peer-checked:translate-x-full transition-transform"></div>
            </label>
            <span className={`font-medium ${billingCycle === 'annually' ? 'text-primary' : 'text-gray-500'}`}>
              Annually <span className="text-sm text-green-600 font-semibold">(Save 22%)</span>
            </span>
          </div>


          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Basic Plan */}
            <div className="border border-gray-200 rounded-2xl p-8 flex flex-col">
              <h3 className="text-2xl font-bold text-neutral">Basic</h3>
              <p className="mt-2 text-gray-500">Free</p>
              <p className="mt-4 text-gray-600 flex-grow">Perfect for getting started and handling occasional applications.</p>
              <ul className="mt-6 space-y-4 text-gray-700">
                <li className="flex items-start">
                  <svg className="flex-shrink-0 h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  <span className="ml-3">5 document generations per week</span>
                </li>
                 <li className="flex items-start">
                  <svg className="flex-shrink-0 h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  <span className="ml-3">Standard AI model</span>
                </li>
              </ul>
              <div className="mt-8">
                <button disabled className="w-full text-center px-4 py-3 border border-gray-300 text-sm font-bold rounded-lg text-gray-400 bg-gray-100 cursor-default">Current Plan</button>
              </div>
            </div>

            {/* Premium Plan */}
            <div className="border-2 border-primary rounded-2xl p-8 flex flex-col relative">
               <span className="absolute top-0 -translate-y-1/2 bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full">Most Popular</span>
              <h3 className="text-2xl font-bold text-neutral">Premium</h3>
              <div className="mt-2 text-gray-500">
                <span className="text-4xl font-extrabold text-neutral">
                  €{billingCycle === 'monthly' ? plans.premium.monthly : (plans.premium.annually / 12).toFixed(2)}
                </span>
                <span> / month</span>
                {billingCycle === 'annually' && <p className="text-sm">Billed €{plans.premium.annually} annually</p>}
              </div>
              <p className="mt-4 text-gray-600 flex-grow">Unlock your full potential for a more demanding job search.</p>
              <ul className="mt-6 space-y-4 text-gray-700">
                <li className="flex items-start">
                  <svg className="flex-shrink-0 h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  <span className="ml-3">70 document generations per week</span>
                </li>
                <li className="flex items-start">
                  <svg className="flex-shrink-0 h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  <span className="ml-3">Access to advanced "Thinking Mode" AI</span>
                </li>
                <li className="flex items-start">
                  <svg className="flex-shrink-0 h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  <span className="ml-3">Priority support</span>
                </li>
              </ul>
              <div className="mt-8">
                <button className="w-full text-center px-4 py-3 border border-transparent text-sm font-bold rounded-lg text-white bg-primary hover:bg-blue-800 transition-transform transform hover:scale-105">Get Started</button>
              </div>
            </div>

            {/* The Crew Plan */}
            <div className="border border-gray-200 rounded-2xl p-8 flex flex-col">
              <h3 className="text-2xl font-bold text-neutral">The Crew</h3>
               <div className="mt-2 text-gray-500">
                <span className="text-4xl font-extrabold text-neutral">
                  €{billingCycle === 'monthly' ? plans.crew.monthly : (plans.crew.annually / 12).toFixed(2)}
                </span>
                 <span> / month</span>
                {billingCycle === 'annually' && <p className="text-sm">Billed €{plans.crew.annually} annually</p>}
              </div>
              <p className="mt-4 text-gray-600 flex-grow">Collaborate and succeed together with your team or support group.</p>
              <ul className="mt-6 space-y-4 text-gray-700">
                <li className="flex items-start">
                  <svg className="flex-shrink-0 h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  <span className="ml-3">All Premium features</span>
                </li>
                <li className="flex items-start">
                  <svg className="flex-shrink-0 h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  <span className="ml-3">For up to 5 users</span>
                </li>
                 <li className="flex items-start">
                  <svg className="flex-shrink-0 h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  <span className="ml-3">Ideal for groups, families, or colleagues</span>
                </li>
              </ul>
               <div className="mt-8">
                <button className="w-full text-center px-4 py-3 border border-transparent text-sm font-bold rounded-lg text-white bg-primary hover:bg-blue-800 transition-transform transform hover:scale-105">Get Started</button>
              </div>
            </div>
          </div>

          {/* Boost Applications Section */}
          <div className="mt-16 text-center bg-gray-50 p-8 rounded-2xl shadow-inner">
            <h3 className="text-2xl font-bold text-neutral">Boost Your Applications</h3>
            <p className="mt-2 text-gray-600 max-w-2xl mx-auto">
              Need a few extra documents to apply for more roles? Purchase a one-time generation pack. No subscription required, and your generations never expire.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-4 max-w-lg mx-auto">
                <select 
                  value={selectedPack}
                  onChange={(e) => setSelectedPack(e.target.value)}
                  className="w-full sm:w-auto flex-grow block pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md shadow-sm"
                >
                    <option value="20">20 Generations Pack - €5</option>
                    <option value="50">50 Generations Pack - €10</option>
                </select>
                <button className="w-full sm:w-auto flex-shrink-0 text-center px-6 py-3 border border-transparent text-sm font-bold rounded-lg text-white bg-accent hover:bg-purple-700 transition-transform transform hover:scale-105">
                  Purchase Pack
                </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;