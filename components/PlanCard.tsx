import React from 'react';
import { SubscriptionCheckIcon } from './Icons';
import Tooltip from './Tooltip';

interface PlanCardProps {
    name: string;
    price: string;
    billingInfo?: string;
    description: string;
    features: string[];
    isCurrent?: boolean;
    isPopular?: boolean;
}

const PlanCard: React.FC<PlanCardProps> = ({ name, price, billingInfo, description, features, isCurrent, isPopular }) => {
    
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

export default PlanCard;
