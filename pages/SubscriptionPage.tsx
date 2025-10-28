import React, { useState } from 'react';
import { SubscriptionCheckIcon } from '../components/Icons';

const SubscriptionPage: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');

  const plans = {
    premium: {
      monthly: 9,
      annually: 9 * 12 * (1 - 0.10), // 10% discount
    },
    pro: {
      monthly: 30,
      annually: 30 * 12 * (1 - 0.10), // 10% discount
    },
  };
  
  const PlanCard: React.FC<{
    name: string;
    price: string;
    billingInfo?: string;
    description: string;
    features: string[];
    isCurrent?: boolean;
    isPopular?: boolean;
  }> = ({ name, price, billingInfo, description, features, isCurrent, isPopular }) => {
    
    const cardClasses = isPopular 
      ? "border-2 border-primary ring-4 ring-blue-100 bg-white" 
      : "border border-gray-200 bg-white";
    
    const buttonClasses = isCurrent
      ? "w-full text-center px-4 py-3 border border-gray-300 text-sm font-bold rounded-lg text-gray-500 bg-gray-100 cursor-default"
      : isPopular
      ? "w-full text-center px-4 py-3 border border-transparent text-base font-bold rounded-lg text-white bg-primary hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg hover:shadow-primary/50"
      : "w-full text-center px-4 py-3 border border-transparent text-base font-bold rounded-lg text-white bg-neutral hover:bg-gray-800 transition-transform transform hover:scale-105";

    return (
      <div className={`rounded-2xl p-8 flex flex-col relative transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${cardClasses}`}>
        {isPopular && <span className="absolute top-0 -translate-y-1/2 bg-primary text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-md">Most Popular</span>}
        
        <h3 className="text-2xl font-bold text-neutral">{name}</h3>
        
        <div className="mt-4 text-gray-500 flex items-baseline gap-x-2">
          <span className="text-5xl font-extrabold tracking-tight text-neutral">{price}</span>
          {price !== 'Free' && <span>/ month</span>}
        </div>
        {billingInfo && <p className="text-sm text-gray-500 mt-1">{billingInfo}</p>}

        <p className="mt-6 text-gray-600 flex-grow">{description}</p>
        
        <ul className="mt-8 space-y-4 text-gray-700">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <SubscriptionCheckIcon />
              <span className="ml-3">{feature}</span>
            </li>
          ))}
        </ul>

        <div className="mt-10">
          <button disabled={isCurrent} className={buttonClasses}>
            {isCurrent ? "Your Current Plan" : "Get Started"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-base-200 py-16 sm:py-24 animate-fade-in">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold tracking-tight text-neutral sm:text-5xl">Find the Perfect Plan</h1>
            <p className="mt-4 text-xl text-gray-500">
              Start for free, and unlock powerful features when you're ready.
            </p>
          </div>

          {/* Billing Cycle Toggle */}
          <div className="flex justify-center items-center space-x-4 mb-12">
            <span className={`font-medium transition-colors ${billingCycle === 'monthly' ? 'text-primary' : 'text-gray-500'}`}>Monthly</span>
            <label htmlFor="billing-toggle" className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="billing-toggle"
                className="sr-only peer"
                checked={billingCycle === 'annually'}
                onChange={() => setBillingCycle(prev => prev === 'monthly' ? 'annually' : 'monthly')}
              />
              <div className="w-14 h-8 bg-gray-200 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-offset-2 peer-focus:ring-offset-base-200 peer-focus:ring-primary peer-checked:bg-primary transition-colors"></div>
              <div className="absolute top-1 left-1 bg-white border-gray-300 border rounded-full h-6 w-6 peer-checked:translate-x-full transition-transform"></div>
            </label>
            <span className={`font-medium transition-colors ${billingCycle === 'annually' ? 'text-primary' : 'text-gray-500'}`}>
              Annually <span className="hidden sm:inline-block text-sm text-green-600 font-semibold">(Save 10%)</span>
            </span>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {/* Basic Plan */}
            <PlanCard
              name="Basic"
              price="Free"
              description="Perfect for getting started and handling occasional applications."
              features={[
                "5 tokens to start",
                "Access to basic templates",
                "FAQ support"
              ]}
              isCurrent
            />

            {/* Premium Plan */}
            <PlanCard
              name="Premium"
              price={`€${billingCycle === 'monthly' ? plans.premium.monthly : (plans.premium.annually / 12).toFixed(2)}`}
              billingInfo={billingCycle === 'annually' ? `Billed €${plans.premium.annually.toFixed(2)} annually` : undefined}
              description="Ideal for active job seekers who need more power and support."
              features={[
                "80 tokens per month",
                "Access to all templates",
                "Email support",
                "Extended history & storage (1 month)"
              ]}
              isPopular
            />
            
            {/* Pro Plan */}
            <PlanCard
              name="Pro"
              price={`€${billingCycle === 'monthly' ? plans.pro.monthly : (plans.pro.annually / 12).toFixed(2)}`}
              billingInfo={billingCycle === 'annually' ? `Billed €${plans.pro.annually.toFixed(2)} annually` : undefined}
              description="The ultimate toolkit for professionals who want to stand out."
              features={[
                "300 tokens per month",
                "Everything in Premium, plus:",
                "Extended history & storage (3 months)",
                "Priority chat & email support",
              ]}
            />
          </div>

          {/* Boost Applications Section */}
          <div className="mt-20 text-center bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-gray-200">
            <h3 className="text-3xl font-bold text-neutral">Need a Quick Boost?</h3>
            <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
              Purchase a one-time pack of tokens for extra document generations. They never expire and there's no subscription required.
            </p>
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {/* Starter Pack */}
              <div className="border border-gray-200 rounded-2xl p-6 flex flex-col items-center text-center transition-all duration-300 hover:shadow-lg hover:border-accent/50">
                <h4 className="text-xl font-bold text-neutral">Starter Pack</h4>
                <span className="text-4xl font-extrabold text-neutral mt-2">20 Tokens</span>
                <p className="text-3xl font-bold text-accent my-4">€5</p>
                <button className="w-full text-center px-6 py-3 border border-transparent text-base font-bold rounded-lg text-white bg-accent hover:bg-pink-700 transition-transform transform hover:scale-105 shadow-md hover:shadow-accent/40">
                  Purchase Pack
                </button>
              </div>
              {/* Boost Pack */}
              <div className="border border-gray-200 rounded-2xl p-6 flex flex-col items-center text-center transition-all duration-300 hover:shadow-lg hover:border-accent/50">
                <h4 className="text-xl font-bold text-neutral">Boost Pack</h4>
                <span className="text-4xl font-extrabold text-neutral mt-2">100 Tokens</span>
                <p className="text-3xl font-bold text-accent my-4">€15</p>
                <button className="w-full text-center px-6 py-3 border border-transparent text-base font-bold rounded-lg text-white bg-accent hover:bg-pink-700 transition-transform transform hover:scale-105 shadow-md hover:shadow-accent/40">
                  Purchase Pack
                </button>
              </div>
              {/* Power Pack */}
              <div className="border border-gray-200 rounded-2xl p-6 flex flex-col items-center text-center transition-all duration-300 hover:shadow-lg hover:border-accent/50">
                <h4 className="text-xl font-bold text-neutral">Power Pack</h4>
                <span className="text-4xl font-extrabold text-neutral mt-2">300 Tokens</span>
                <p className="text-3xl font-bold text-accent my-4">€40</p>
                <button className="w-full text-center px-6 py-3 border border-transparent text-base font-bold rounded-lg text-white bg-accent hover:bg-pink-700 transition-transform transform hover:scale-105 shadow-md hover:shadow-accent/40">
                  Purchase Pack
                </button>
              </div>
              {/* Mega Pack */}
              <div className="border border-gray-200 rounded-2xl p-6 flex flex-col items-center text-center transition-all duration-300 hover:shadow-lg hover:border-accent/50">
                <h4 className="text-xl font-bold text-neutral">Mega Pack</h4>
                <span className="text-4xl font-extrabold text-neutral mt-2">800 Tokens</span>
                <p className="text-3xl font-bold text-accent my-4">€100</p>
                <button className="w-full text-center px-6 py-3 border border-transparent text-base font-bold rounded-lg text-white bg-accent hover:bg-pink-700 transition-transform transform hover:scale-105 shadow-md hover:shadow-accent/40">
                  Purchase Pack
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
