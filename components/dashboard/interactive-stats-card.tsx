"use client";

import { motion } from "framer-motion";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { useState } from "react";

interface InteractiveStatsCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  color: string;
  adminOnly?: boolean;
  onClick?: () => void;
  details?: {
    label: string;
    value: string;
  }[];
}

export default function InteractiveStatsCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  color,
  adminOnly = false,
  onClick,
  details = []
}: InteractiveStatsCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const getTrendIcon = () => {
    return changeType === 'positive' ? TrendingUp : TrendingDown;
  };

  const getTrendColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-green-400';
      case 'negative':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const handleClick = () => {
    if (details.length > 0) {
      setIsExpanded(!isExpanded);
    }
    if (onClick) {
      onClick();
    }
  };

  const TrendIcon = getTrendIcon();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ 
        y: -8, 
        boxShadow: "0 25px 50px -12px rgba(210, 255, 0, 0.15)",
        transition: { duration: 0.2 }
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={handleClick}
      className={`
        bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-6 
        transition-all duration-300 cursor-pointer
        ${isHovered ? 'bg-white/20 border-europbots-secondary/40' : 'hover:bg-white/15'}
        ${details.length > 0 ? 'cursor-pointer' : ''}
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <motion.p 
            className="text-sm font-medium text-gray-300"
            animate={{ color: isHovered ? '#FAFAFA' : '#D1D5DB' }}
          >
            {title}
          </motion.p>
          
          <motion.p 
            className="text-2xl font-bold text-white mt-1"
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {value}
          </motion.p>
          
          <div className="flex items-center mt-2">
            <motion.div
              animate={{ scale: isHovered ? 1.1 : 1 }}
              className={`flex items-center ${getTrendColor()}`}
            >
              <TrendIcon className="w-4 h-4 mr-1" />
              <span className="text-sm font-medium">{change}</span>
            </motion.div>
            <span className="text-sm text-gray-400 ml-1">vs mois précédent</span>
          </div>
        </div>

        <motion.div 
          className={`${color} p-3 rounded-lg`}
          animate={{ 
            scale: isHovered ? 1.1 : 1,
            rotate: isHovered ? 5 : 0 
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Icon className="w-6 h-6 text-white" />
        </motion.div>
      </div>

      {/* Detalles expandibles */}
      <motion.div
        initial={false}
        animate={{ 
          height: isExpanded ? "auto" : 0,
          opacity: isExpanded ? 1 : 0 
        }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        {details.length > 0 && (
          <div className="mt-4 pt-4 border-t border-europbots-secondary/20">
            <div className="grid grid-cols-2 gap-3">
              {details.map((detail, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ 
                    opacity: isExpanded ? 1 : 0,
                    x: isExpanded ? 0 : -10 
                  }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <p className="text-xs text-gray-400">{detail.label}</p>
                  <p className="text-sm font-medium text-white">{detail.value}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Indicador de expansión */}
      {details.length > 0 && (
        <motion.div 
          className="flex justify-center mt-3"
          animate={{ rotate: isExpanded ? 180 : 0 }}
        >
          <div className="w-4 h-1 bg-europbots-secondary/40 rounded-full" />
        </motion.div>
      )}
    </motion.div>
  );
}