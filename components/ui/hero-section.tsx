import React from "react";
import { Link } from "react-router-dom";
import { Button } from "./button";
import { Badge } from "./badge";
import { ArrowRightIcon } from "lucide-react";
import { cn } from "../../utils";
import { Glow } from "./glow";

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
        "bg-background text-foreground",
        "py-12 sm:py-24 md:py-32 px-4",
        "fade-bottom overflow-hidden pb-0"
      )}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-12 pt-16 sm:gap-24">
        <div className="flex flex-col items-center gap-6 text-center sm:gap-12">
          {/* Badge */}
          {badge && (
            <Badge variant="outline" className="animate-appear gap-2">
              <span className="text-muted-foreground">{badge.text}</span>
              {badge.action.href.startsWith("/") ? (
                <Link to={badge.action.href} className="flex items-center gap-1">
                  {badge.action.text}
                  <ArrowRightIcon className="h-3 w-3" />
                </Link>
              ) : (
                <a href={badge.action.href} className="flex items-center gap-1">
                  {badge.action.text}
                  <ArrowRightIcon className="h-3 w-3" />
                </a>
              )}
            </Badge>
          )}

          {/* Title with Glow */}
          <div className="relative">
            <Glow variant="center" />
            <h1 className="relative z-10 inline-block animate-appear bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-4xl font-semibold leading-tight text-transparent drop-shadow-2xl sm:text-6xl sm:leading-tight md:text-8xl md:leading-tight">
              {title}
            </h1>
          </div>


          {/* Description */}
          <p className="text-md relative z-10 max-w-[550px] animate-appear font-medium text-muted-foreground opacity-0 delay-100 sm:text-xl">
            {description}
          </p>

          {/* Actions */}
          <div className="relative z-10 flex animate-appear justify-center gap-4 opacity-0 delay-300">
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
      </div>
    </section>
  );
}