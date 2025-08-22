"use client";

import { motion, MotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface AnimatedButtonProps extends Omit<MotionProps, "children"> {
  children: ReactNode;
  variant?: "default" | "outline" | "ghost" | "gradient";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export function AnimatedButton({
  children,
  variant = "default",
  size = "md",
  className,
  ...props
}: AnimatedButtonProps) {
  const baseClasses = "relative inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 overflow-hidden";
  
  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline: "border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground",
    ghost: "text-foreground hover:bg-accent hover:text-accent-foreground",
    gradient: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(baseClasses, variants[variant], sizes[size], className)}
      {...props}
    >
      <motion.div
        className="absolute inset-0 bg-white/20"
        initial={{ x: "-100%" }}
        whileHover={{ x: "100%" }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      />
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}

export function ShimmerButton({
  children,
  className,
  ...props
}: AnimatedButtonProps) {
  return (
    <motion.button
      className={cn(
        "relative inline-flex items-center justify-center px-6 py-3 font-medium text-white rounded-lg",
        "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600",
        "bg-[length:200%_100%] bg-[position:0%_0%]",
        "hover:bg-[position:100%_0%] transition-all duration-500",
        "shadow-lg hover:shadow-xl",
        className
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      <div className="absolute inset-0 rounded-lg opacity-0 hover:opacity-20 transition-opacity duration-300 bg-white" />
    </motion.button>
  );
}