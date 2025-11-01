import React, { useState } from 'react';
import { SubscriptionCheckIcon, QuestionMarkCircleIcon } from '../components/Icons';

const Tooltip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => (
    <span className="inline-flex items-center">
        {children}
        <span className="relative group/tooltip cursor-help ml-1">
            <QuestionMarkCircleIcon />
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-800 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-300 pointer-events-none z-50 text-left">
                {text}
                <svg className="absolute text-slate-800 h-2 w-4 left-1/2 -translate-x-1/2 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon className="fill-current" points="0,0 127.5,127.5 255,0"/></svg>
            </span>
        </span>
    </span>
);

const SubscriptionPage: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');

  const plans = {
    associate: {
      monthly: 15,
      annually: 15 * 12 * (1 - 0.10), // 10% discount
    },
    senior: {
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
      ? "border-2 border-brand-blue ring-4 ring-blue-100 bg-white" 
      : "border border-slate-200 bg-white";
    
    const buttonClasses = isCurrent
      ? "w-full text-center px-4 py-3 border border-slate-300 text-sm font-bold rounded-lg text-slate-500 bg-slate-100 cursor-default"
      : isPopular
      ? "w-full text-center px-4 py-3 border border-transparent text-base font-bold rounded-lg text-white bg-brand-blue hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg hover:shadow-brand-blue/50"
      : "w-full text-center px-4 py-3 border border-transparent text-base font-bold rounded-lg text-white bg-slate-900 hover:bg-slate-800 transition-transform transform hover:scale-105";

    return (
      <div className={`rounded-2xl p-8 flex flex-col relative transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${cardClasses}`}>
        {isPopular && <span className="absolute top-0 -translate-y-1/2 bg-brand-blue text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-md">Most Popular</span>}
        
        <h3 className="text-2xl font-bold text-slate-900">{name}</h3>
        
        <div className="mt-4 text-slate-500 flex items-baseline gap-x-2">
          <span className="text-5xl font-extrabold tracking-tight text-slate-900">{price}</span>
          {price !== 'Free' && <span>/ month</span>}
        </div>
        {billingInfo && <p className="text-sm text-slate-500 mt-1">{billingInfo}</p>}

        <p className="mt-6 text-slate-700 min-h-12">{description}</p>
        
        <ul className="mt-8 space-y-4 text-slate-700">
          {features.map((feature, index) => {
            const creditRolloverMatch = feature.match(/^(Credit rollovers)\s*\((.*)\)/);
            
            if (creditRolloverMatch) {
              const mainText = creditRolloverMatch[1];
              const tooltipText = creditRolloverMatch[2];
              return (
                <li key={index} className="flex items-start">
                  <SubscriptionCheckIcon />
                  <span className="ml-3">
                    <Tooltip text={tooltipText}>{mainText}</Tooltip>
                  </span>
                </li>
              );
            }

            const isStartingTokens = feature.toLowerCase().includes('starting tokens');
            if (feature.toLowerCase().includes('token') && !isStartingTokens) {
                return (
                    <li key={index} className="flex items-start">
                        <SubscriptionCheckIcon />
                        <span className="ml-3">
                            <Tooltip text="Each resume or cover letter generation costs 1 token.">
                                {feature}
                            </Tooltip>
                        </span>
                    </li>
                );
            }
            
            return (
              <li key={index} className="flex items-start">
                <SubscriptionCheckIcon />
                <span className="ml-3">{feature}</span>
              </li>
            );
          })}
        </ul>

        <div className="mt-auto pt-8">
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
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">Find the Perfect Plan</h1>
            <p className="mt-4 text-xl text-slate-500">
              Start for free, and unlock powerful features when you're ready.
            </p>
          </div>

          {/* Billing Cycle Toggle */}
          <div className="flex justify-center items-center space-x-4 mb-12">
            <span className={`font-medium transition-colors ${billingCycle === 'monthly' ? 'text-brand-blue' : 'text-slate-500'}`}>Monthly</span>
            <label htmlFor="billing-toggle" className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="billing-toggle"
                className="sr-only peer"
                checked={billingCycle === 'annually'}
                onChange={() => setBillingCycle(prev => prev === 'monthly' ? 'annually' : 'monthly')}
              />
              <div className="w-14 h-8 bg-slate-200 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-offset-2 peer-focus:ring-offset-base-200 peer-focus:ring-brand-blue peer-checked:bg-brand-blue transition-colors"></div>
              <div className="absolute top-1 left-1 bg-white border-slate-300 border rounded-full h-6 w-6 peer-checked:translate-x-full transition-transform"></div>
            </label>
            <span className={`font-medium transition-colors ${billingCycle === 'annually' ? 'text-brand-blue' : 'text-slate-500'}`}>
              Annually <span className="hidden sm:inline-block text-sm text-green-600 font-semibold">(Save 10%)</span>
            </span>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            {/* Intern Plan */}
            <PlanCard
              name="Intern plan"
              price="Free"
              description="Perfect for trying out the core features of the AI."
              features={[
                "Access basic templates",
                "5 starting tokens to create the first batch and try the product."
              ]}
              isCurrent
            />
            
            {/* Associate Plan */}
            <PlanCard
              name="Associate plan"
              price={`€${billingCycle === 'monthly' ? plans.associate.monthly : (plans.associate.annually / 12).toFixed(2)}`}
              billingInfo={billingCycle === 'annually' ? `Billed €${plans.associate.annually.toFixed(2)} annually` : undefined}
              description="Ideal for active job seekers who need more power and flexibility."
              features={[
                "40 tokens per month",
                "Access to all templates",
                "Credit rollovers (Credits roll over for 1 month on monthly plans, or until the end of your annual plan.)",
                "Extended history & storage (1 month)"
              ]}
              isPopular
            />
            
            {/* Senior Plan */}
            <PlanCard
              name="Senior plan"
              price={`€${billingCycle === 'monthly' ? plans.senior.monthly : (plans.senior.annually / 12).toFixed(2)}`}
              billingInfo={billingCycle === 'annually' ? `Billed €${plans.senior.annually.toFixed(2)} annually` : undefined}
              description="The ultimate toolkit for professionals who want to stand out."
              features={[
                "100 tokens per month",
                "Access to all templates",
                "Credit rollovers (Credits roll over for 1 month on monthly plans, or until the end of your annual plan.)",
                "Extended history & storage (6 months)",
              ]}
            />
          </div>

          {/* Boost Applications Section */}
          <div className="mt-20 text-center bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-slate-200">
            <h3 className="text-3xl font-bold text-slate-900">Need a Quick Boost?</h3>
            <p className="mt-3 text-slate-700 max-w-2xl mx-auto">
              Purchase a one-time pack of tokens for extra document generations. They never expire and there's no subscription required.
            </p>
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
              {/* Boost Pack */}
              <div className="border border-slate-200 rounded-2xl p-6 flex flex-col items-center text-center transition-all duration-300 hover:shadow-lg hover:border-brand-blue/50">
                <h4 className="text-xl font-bold text-slate-900">Boost Pack</h4>
                <span className="text-4xl font-extrabold text-slate-900 mt-2">20 Tokens</span>
                <p className="text-3xl font-bold text-brand-blue my-4">€10</p>
                <button className="w-full text-center px-6 py-3 border border-transparent text-base font-bold rounded-lg text-white bg-brand-blue hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-md hover:shadow-brand-blue/40">
                  Purchase Pack
                </button>
              </div>
              {/* Power Pack */}
              <div className="border border-slate-200 rounded-2xl p-6 flex flex-col items-center text-center transition-all duration-300 hover:shadow-lg hover:border-brand-blue/50">
                <h4 className="text-xl font-bold text-slate-900">Power Pack</h4>
                <span className="text-4xl font-extrabold text-slate-900 mt-2">50 Tokens</span>
                <p className="text-3xl font-bold text-brand-blue my-4">€20</p>
                <button className="w-full text-center px-6 py-3 border border-transparent text-base font-bold rounded-lg text-white bg-brand-blue hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-md hover:shadow-brand-blue/40">
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