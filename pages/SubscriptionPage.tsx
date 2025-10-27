import React, { useState } from 'react';
import { SubscriptionCheckIcon } from '../components/Icons';

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
        <div className="max-w-4xl mx-auto">
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
              Annually <span className="hidden sm:inline-block text-sm text-green-600 font-semibold">(Save 22%)</span>
            </span>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {/* Basic Plan */}
            <PlanCard
              name="Basic"
              price="Free"
              description="Perfect for getting started and handling occasional applications."
              features={["5 document generations per week", "Standard AI model"]}
              isCurrent
            />

            {/* Premium Plan */}
            <PlanCard
              name="Premium"
              price={`€${billingCycle === 'monthly' ? plans.premium.monthly : (plans.premium.annually / 12).toFixed(2)}`}
              billingInfo={billingCycle === 'annually' ? `Billed €${plans.premium.annually} annually` : undefined}
              description="Unlock your full potential for a more demanding job search."
              features={["70 document generations per week", "Access to advanced \"Thinking Mode\" AI", "Priority support"]}
              isPopular
            />

            {/* The Crew Plan */}
            <PlanCard
              name="The Crew"
              price={`€${billingCycle === 'monthly' ? plans.crew.monthly : (plans.crew.annually / 12).toFixed(2)}`}
              billingInfo={billingCycle === 'annually' ? `Billed €${plans.crew.annually} annually` : undefined}
              description="Collaborate and succeed together with your team or support group."
              features={["All Premium features", "For up to 5 users", "Ideal for groups, families, or colleagues"]}
            />
          </div>

          {/* Boost Applications Section */}
          <div className="mt-20 text-center bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-gray-200">
            <h3 className="text-3xl font-bold text-neutral">Need a Quick Boost?</h3>
            <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
              Purchase a one-time pack of tokens for extra document generations. They never expire and there's no subscription required.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4 max-w-lg mx-auto">
                <select 
                  value={selectedPack}
                  onChange={(e) => setSelectedPack(e.target.value)}
                  className="w-full sm:w-auto flex-grow block pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md shadow-sm"
                >
                    <option value="20">20 Generations Pack - €5</option>
                    <option value="50">50 Generations Pack - €10</option>
                </select>
                <button className="w-full sm:w-auto flex-shrink-0 text-center px-6 py-3 border border-transparent text-sm font-bold rounded-lg text-white bg-accent hover:bg-pink-700 transition-transform transform hover:scale-105 shadow-md hover:shadow-accent/40">
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