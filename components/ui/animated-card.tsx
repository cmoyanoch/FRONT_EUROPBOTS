"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
  tap?: boolean;
}

export default function AnimatedCard({ 
  children, 
  className = "", 
  delay = 0,
  hover = true,
  tap = true 
}: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        delay,
        ease: [0.25, 0.46, 0.45, 0.94] 
      }}
      whileHover={hover ? { 
        y: -4, 
        boxShadow: "0 25px 50px -12px rgba(210, 255, 0, 0.15)",
        transition: { duration: 0.2 }
      } : undefined}
      whileTap={tap ? { scale: 0.98 } : undefined}
      className={className}
    >
      {children}
    </motion.div>
  );
}