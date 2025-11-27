import React from 'react';
import Tooltip from './Tooltip';

type FeatureItem = string | { text: string; included: boolean };

interface PlanCardProps {
    name: string;
    price: string;
    billingInfo?: string;
    description: string;
    features: FeatureItem[];
    isCurrent?: boolean;
    isPopular?: boolean;
    cta?: React.ReactNode;
}

const CheckIcon: React.FC<{ className?: string }> = ({ className = "" }) => (
    <svg className={`h-5 w-5 text-primary flex-shrink-0 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

const XIcon: React.FC<{ className?: string }> = ({ className = "" }) => (
    <svg className={`h-5 w-5 text-gray-300 flex-shrink-0 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const PlanCard: React.FC<PlanCardProps> = ({ name, price, billingInfo, description, features, isCurrent, isPopular, cta }) => {
    
    const cardClasses = isPopular 
      ? "border-2 border-primary ring-4 ring-primary/10 bg-white" 
      : "border border-gray-200 bg-white";

    return (
      <div className={`rounded-2xl p-6 flex flex-col relative transition-all duration-300 hover:shadow-lg ${cardClasses}`}>
        {isPopular && (
          <span className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-medium px-3 py-1 rounded-full">
            Recommended
          </span>
        )}
        
        <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
        
        <div className="mt-3 flex items-baseline gap-1">
          <span className="text-4xl font-bold tracking-tight text-gray-900">{price}</span>
          {price !== '€0' && <span className="text-sm text-gray-500">{billingInfo || '/month'}</span>}
        </div>

        <p className="mt-4 text-sm text-gray-600">{description}</p>
        
        <ul className="mt-6 space-y-3 flex-grow">
          {features.map((feature, index) => {
            const isObject = typeof feature === 'object';
            const text = isObject ? feature.text : feature;
            const included = isObject ? feature.included : true;
            
            // Check for tooltip patterns
            const tooltipMatch = text.match(/^(.+?)\s*\((.+)\)$/);
            
            return (
              <li key={index} className={`flex items-start gap-3 text-sm ${included ? 'text-gray-700' : 'text-gray-400'}`}>
                {included ? <CheckIcon /> : <XIcon />}
                <span className={!included ? 'line-through' : ''}>
                  {tooltipMatch ? (
                    <Tooltip text={tooltipMatch[2]}>{tooltipMatch[1]}</Tooltip>
                  ) : (
                    text
                  )}
                </span>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 pt-4 border-t border-gray-100">
          {cta ? (
            cta
          ) : isCurrent ? (
            <div className="w-full text-center px-4 py-2.5 text-sm font-medium rounded-lg text-gray-500 bg-gray-100">
              Current Plan
            </div>
          ) : (
            <button className="w-full px-4 py-2.5 text-sm font-medium rounded-lg text-white bg-gray-900 hover:bg-gray-800 transition-colors">
              Get Started
            </button>
          )}
        </div>
      </div>
    );
};

export default PlanCard;
