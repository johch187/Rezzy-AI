import React from "react";
import { Link } from "react-router-dom";
import { Button } from "./button";
import { Badge } from "./badge";
import { ArrowRightIcon } from "lucide-react";
import { cn } from "../../utils";

interface HeroAction {
  text: string;
  href: string;
  icon?: React.ReactNode;
  variant?: "default" | "secondary" | "outline" | "destructive" | "ghost" | "link";
}

interface HeroProps {
  badge?: {
    text: string;
    action: {
      text: string;
      href: string;
    };
  };
  title: string;
  description: string;
  actions: HeroAction[];
}

export function HeroSection({
  badge,
  title,
  description,
  actions,
}: HeroProps) {
  return (
    <section
      className={cn(
        "bg-white text-gray-900",
        "py-16 sm:py-24 md:py-32 px-4",
        "fade-bottom overflow-hidden"
      )}
    >
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-8 text-center">
        {/* Badge */}
        {badge && (
          <Badge variant="outline" className="gap-2 py-1.5 px-3 animate-fade-in">
            <span className="text-gray-500 text-sm">{badge.text}</span>
            {badge.action.href.startsWith("/") ? (
              <Link 
                to={badge.action.href} 
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-900 text-xs font-medium text-white hover:bg-gray-800 transition-colors"
              >
                {badge.action.text}
                <ArrowRightIcon className="h-3 w-3" />
              </Link>
            ) : (
              <a 
                href={badge.action.href} 
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-900 text-xs font-medium text-white hover:bg-gray-800 transition-colors"
              >
                {badge.action.text}
                <ArrowRightIcon className="h-3 w-3" />
              </a>
            )}
          </Badge>
        )}

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-gray-900 text-balance animate-fade-up">
          {title}
        </h1>

        {/* Description */}
        <p className="text-lg sm:text-xl text-gray-500 max-w-2xl text-balance animate-fade-up" style={{ animationDelay: '100ms' }}>
          {description}
        </p>

        {/* Actions */}
        <div className="flex flex-wrap justify-center gap-3 animate-fade-up" style={{ animationDelay: '200ms' }}>
          {actions.map((action, index) => {
            const isInternalLink = action.href.startsWith("/");
            
            if (isInternalLink) {
              return (
                <Button key={index} variant={action.variant} size="lg" asChild>
                  <Link to={action.href} className="flex items-center gap-2">
                    {action.icon}
                    {action.text}
                  </Link>
                </Button>
              );
            }

            return (
              <Button key={index} variant={action.variant} size="lg" asChild>
                <a href={action.href} className="flex items-center gap-2">
                  {action.icon}
                  {action.text}
                </a>
              </Button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
