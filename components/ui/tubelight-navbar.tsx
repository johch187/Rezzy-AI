import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../utils";

export interface NavItem {
  name: string;
  displayName: string;
  icon: React.ElementType;
}

interface TubelightNavbarProps {
  items: NavItem[];
  className?: string;
  activeTab: string;
  onTabChange: (tabName: string) => void;
  layoutId: string; // To avoid conflicts between multiple navbars
}

export function TubelightNavbar({
  items,
  className,
  activeTab,
  onTabChange,
  layoutId,
}: TubelightNavbarProps) {
  return (
    <div className={cn("relative flex justify-center my-8", className)}>
      <div className="flex items-center gap-2 bg-white/90 border border-slate-200 backdrop-blur-lg p-1 rounded-full shadow-md">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.name;

          return (
            <button
              key={item.name}
              onClick={() => onTabChange(item.name)}
              className={cn(
                "relative cursor-pointer text-sm font-semibold px-4 py-2 rounded-full transition-colors",
                "text-slate-600 hover:text-primary",
                isActive && "text-primary"
              )}
              aria-pressed={isActive}
            >
              <div className="flex items-center gap-2">
                <Icon size={16} strokeWidth={2.5} />
                <span className="hidden md:inline">{item.displayName}</span>
              </div>

              {isActive && (
                <motion.div
                  layoutId={layoutId}
                  className="absolute inset-0 w-full bg-primary/10 rounded-full -z-10"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                >
                  <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-t-full">
                  </div>
                </motion.div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
