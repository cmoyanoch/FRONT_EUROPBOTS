"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  animated?: boolean;
}

export function Skeleton({ className, animated = true }: SkeletonProps) {
  const baseClasses = "bg-white/10 rounded-lg";
  
  if (!animated) {
    return <div className={cn(baseClasses, className)} />;
  }

  return (
    <motion.div
      className={cn(baseClasses, className)}
      animate={{
        opacity: [0.4, 0.8, 0.4],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

export function LeadCardSkeleton() {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-6">
      <div className="flex items-center space-x-4">
        <Skeleton className="w-12 h-12 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-2/3" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-2 w-16 rounded-full" />
            <Skeleton className="h-3 w-8" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function StatsCardSkeleton() {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="w-12 h-12 rounded-lg" />
      </div>
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <tr className="hover:bg-white/5 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center space-x-3">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-20" />
        </div>
      </td>
      <td className="px-6 py-4">
        <Skeleton className="h-6 w-24 rounded-full" />
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-2 w-20 rounded-full" />
          <Skeleton className="h-3 w-8" />
        </div>
      </td>
    </tr>
  );
}