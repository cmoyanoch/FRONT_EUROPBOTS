"use client";

import { motion } from "framer-motion";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { value: "light" as const, icon: Sun, label: "Light" },
    { value: "dark" as const, icon: Moon, label: "Dark" },
    { value: "system" as const, icon: Monitor, label: "System" },
  ];

  return (
    <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-lg p-1 border border-europbots-secondary/20">
      {themes.map((themeOption) => {
        const Icon = themeOption.icon;
        const isActive = theme === themeOption.value;

        return (
          <motion.button
            key={themeOption.value}
            onClick={() => setTheme(themeOption.value)}
            className={`
              relative flex items-center justify-center p-2 rounded-md transition-all duration-200
              ${isActive 
                ? 'text-europbots-secondary' 
                : 'text-gray-400 hover:text-white'
              }
            `}
            whileTap={{ scale: 0.95 }}
          >
            {/* Active background */}
            {isActive && (
              <motion.div
                layoutId="activeTheme"
                className="absolute inset-0 bg-europbots-secondary/10 rounded-md"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            
            {/* Icon */}
            <Icon className={`w-4 h-4 relative z-10 ${isActive ? 'text-europbots-secondary' : ''}`} />
            
            {/* Tooltip - Hidden on mobile */}
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none hidden sm:block">
              {themeOption.label}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}