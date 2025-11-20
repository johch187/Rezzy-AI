import { cn } from '../../utils';
import { NavLink } from "react-router-dom";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HamburgerIcon as Menu, XCircleIcon as X } from '../Icons';

interface Links {
  label: string;
  to: string;
  icon: React.JSX.Element | React.ReactNode;
}

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined
);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

// FIX: Use React.PropsWithChildren to correctly type components that accept children via JSX.
export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: React.PropsWithChildren<{
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}>) => {
  // Changed default state to true (open by default)
  const [openState, setOpenState] = useState(true);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

// FIX: Use React.PropsWithChildren to correctly type components that accept children via JSX.
export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
}: React.PropsWithChildren<{
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}>) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = (props: React.ComponentProps<typeof motion.div>) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...(props as any)} />
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) => {
  const { open, setOpen, animate } = useSidebar();
  return (
    <motion.div
      className={cn(
        "h-full px-4 py-4 hidden md:flex md:flex-col bg-white border-r border-slate-200 w-[200px] flex-shrink-0",
        className
      )}
      animate={{
        width: animate ? (open ? "200px" : "80px") : "200px",
      }}
      // Removed onMouseEnter/onMouseLeave to disable hover behavior
      // Added onClick to expand when clicked while collapsed
      onClick={() => {
        if (!open) setOpen(true);
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const MobileSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  const { open, setOpen } = useSidebar();
  return (
    <>
      <div
        className={cn(
          "h-14 px-4 py-4 flex flex-row md:hidden items-center justify-between bg-white w-full sticky top-0 z-20 border-b border-slate-200"
        )}
        {...props}
      >
        <div className="flex justify-end z-20 w-full">
          <Menu
            className="text-slate-800 cursor-pointer"
            onClick={() => setOpen(!open)}
          />
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
              }}
              className={cn(
                "fixed h-full w-full inset-0 bg-white p-4 z-[100] flex flex-col justify-between",
                className
              )}
            >
              <div
                className="absolute right-4 top-4 z-50 text-slate-800 cursor-pointer"
                onClick={() => setOpen(!open)}
              >
                <X className="h-8 w-8" />
              </div>
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export const SidebarLink = ({
  link,
  className,
  ...props
}: {
  link: Links;
  className?: string;
} & Omit<React.ComponentProps<typeof NavLink>, "to">) => {
  const { open, animate, setOpen } = useSidebar();
  return (
    <NavLink
      to={link.to}
      onClick={(e) => {
        if (window.innerWidth < 768) { // md breakpoint
            setOpen(false);
        }
        // Prevent the parent DesktopSidebar onClick from firing and immediately reopening if we were clicking a link to navigate
        e.stopPropagation();
      }}
      className={({ isActive }) =>
        cn(
          "flex items-center justify-start gap-4 group/sidebar py-2.5 rounded-lg px-3 transition-colors duration-200",
          isActive
            ? "bg-primary text-white shadow-md"
            : "text-slate-600 hover:bg-slate-100",
          !open && "justify-center",
          className
        )
      }
      {...props}
    >
      <div className="flex-shrink-0">{link.icon}</div>
      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="text-sm font-medium whitespace-pre"
      >
        {link.label}
      </motion.span>
    </NavLink>
  );
};
