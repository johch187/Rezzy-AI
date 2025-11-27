import React, { useState } from 'react';
import PlanCard from '../components/PlanCard';
import Container from '../components/Container';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import { createCheckout } from '../services/paymentsService';

const SubscriptionPage: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const plans = {
    pro: {
      monthly: 19,
      annually: 19 * 12 * (1 - 0.17), // ~17% discount = 2 months free
    },
  };

  const startCheckout = async () => {
    setError(null);
    setLoading(true);
    try {
      const successUrl = `${window.location.origin}/account`;
      const cancelUrl = `${window.location.origin}/subscription`;
      const res = await createCheckout(successUrl, cancelUrl);
      if (res.url) {
        window.location.href = res.url;
      } else {
        throw new Error('Checkout URL missing.');
      }
    } catch (e: any) {
      setError(e?.message || 'Unable to start checkout.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12 sm:py-16">
      <Container>
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <PageHeader
            title="Choose Your Plan"
            description="Start free with 50 tokens. Upgrade for unlimited career growth."
            centered
          />

          {/* Billing Cycle Toggle */}
          <div className="flex justify-center items-center gap-4 mb-10">
            <span className={`text-sm font-medium transition-colors ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'annually' : 'monthly')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                billingCycle === 'annually' ? 'bg-primary' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  billingCycle === 'annually' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium transition-colors ${billingCycle === 'annually' ? 'text-gray-900' : 'text-gray-500'}`}>
              Annually
              <span className="ml-1.5 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                2 months free
              </span>
            </span>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Free Plan */}
            <PlanCard
              name="Free"
              price="€0"
              description="Try Keju with essential features to get started."
              features={[
                { text: "50 tokens (one-time)", included: true },
                { text: "No monthly replenishment", included: false },
                { text: "No rollover", included: false },
                { text: "Basic document templates", included: true },
                { text: "Career Coach AI", included: true },
                { text: "7-day history", included: true },
              ]}
              isCurrent
            />
            
            {/* Pro Plan */}
            <PlanCard
              name="Pro"
              price={`€${billingCycle === 'monthly' ? plans.pro.monthly : Math.round(plans.pro.annually / 12)}`}
              billingInfo={billingCycle === 'annually' ? `€${Math.round(plans.pro.annually)} billed annually` : 'per month'}
              description="Full access for serious job seekers and professionals."
              features={[
                { text: "200 tokens per month", included: true },
                { text: "Monthly replenishment", included: true },
                { text: "1 month rollover", included: true },
                { text: "All premium templates", included: true },
                { text: "Advanced Career Coach AI", included: true },
                { text: "Unlimited history", included: true },
                { text: "Priority support", included: true },
              ]}
              isPopular
              cta={
                <Button variant="primary" fullWidth onClick={startCheckout} isLoading={loading}>
                  {loading ? 'Redirecting...' : 'Upgrade to Pro'}
                </Button>
              }
            />
          </div>

          {error && (
            <p className="mt-4 text-center text-sm text-red-600">{error}</p>
          )}

          {/* Token Info */}
          <Card className="mt-12 bg-white">
            <div className="text-center max-w-2xl mx-auto">
              <h3 className="text-xl font-semibold text-gray-900">How Tokens Work</h3>
              <p className="mt-3 text-gray-600 text-sm leading-relaxed">
                Tokens are used to generate documents, analyze applications, and interact with AI features. 
                Each generation typically costs 1-3 tokens depending on complexity.
              </p>
              
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="text-2xl font-bold text-gray-900">50</div>
                  <div className="text-sm text-gray-500 mt-1">Free tokens</div>
                  <p className="text-xs text-gray-400 mt-2">One-time grant, no replenishment</p>
                </div>
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                  <div className="text-2xl font-bold text-primary">200</div>
                  <div className="text-sm text-gray-600 mt-1">Pro tokens/month</div>
                  <p className="text-xs text-gray-500 mt-2">Replenishes monthly + rollover</p>
                </div>
              </div>

              <div className="mt-8 p-4 rounded-xl bg-amber-50 border border-amber-100">
                <h4 className="font-medium text-amber-800 text-sm">Pro Rollover Benefit</h4>
                <p className="text-xs text-amber-700 mt-1">
                  Unused tokens roll over for 1 month. If you have 50 tokens left at month end, 
                  next month you'll have 250 tokens (200 new + 50 rollover).
                </p>
              </div>
            </div>
          </Card>

          {/* FAQ */}
          <div className="mt-12 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-6">Common Questions</h3>
            <div className="space-y-4">
              <details className="group bg-white rounded-xl border border-gray-200 p-4">
                <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-gray-900">
                  What happens when I run out of tokens?
                  <span className="ml-2 text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="mt-3 text-sm text-gray-600">
                  Free users can upgrade to Pro for more tokens. Pro users wait until their monthly replenishment 
                  or can contact support for additional tokens.
                </p>
              </details>
              <details className="group bg-white rounded-xl border border-gray-200 p-4">
                <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-gray-900">
                  Can I cancel anytime?
                  <span className="ml-2 text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="mt-3 text-sm text-gray-600">
                  Yes! Cancel anytime. You'll keep Pro access until the end of your billing period. 
                  After that, you'll move to the Free plan with your remaining tokens (capped at 50).
                </p>
              </details>
              <details className="group bg-white rounded-xl border border-gray-200 p-4">
                <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-gray-900">
                  How does rollover work?
                  <span className="ml-2 text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="mt-3 text-sm text-gray-600">
                  Pro users can roll over up to 200 unused tokens to the next month. 
                  This means you can accumulate up to 400 tokens maximum (200 new + 200 rollover). 
                  Free plans don't have rollover.
                </p>
              </details>
            </div>
          </div>

        </div>
      </Container>
    </div>
  );
};

export default SubscriptionPage;
