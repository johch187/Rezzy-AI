import React, { useState } from 'react';
import PlanCard from '../components/PlanCard';

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