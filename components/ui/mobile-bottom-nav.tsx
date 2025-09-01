"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
}

interface MobileBottomNavProps {
  items: NavItem[];
}

export default function MobileBottomNav({ items }: MobileBottomNavProps) {
  const pathname = usePathname();
  
  // Solo mostrar en móvil y tablet
  if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
    return null;
  }

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
    >
      <div className="bg-europbots-primary/95 backdrop-blur-md border-t border-europbots-secondary/20 px-4 py-2">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {items.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link key={item.href} href={item.href} className="flex-1">
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className={`
                    relative flex flex-col items-center justify-center py-2 px-1 rounded-lg
                    ${isActive 
                      ? 'text-europbots-secondary' 
                      : 'text-gray-400 hover:text-white'
                    }
                  `}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-europbots-secondary/10 rounded-lg"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}

                  {/* Icon with badge */}
                  <div className="relative">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-europbots-secondary' : ''}`} />
                    {item.badge && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center"
                      >
                        {item.badge}
                      </motion.div>
                    )}
                  </div>

                  {/* Label */}
                  <span className={`text-xs mt-1 font-medium ${isActive ? 'text-europbots-secondary' : ''}`}>
                    {item.label}
                  </span>

                  {/* Active dot */}
                  {isActive && (
                    <motion.div
                      layoutId="activeDot"
                      className="absolute -bottom-1 w-1 h-1 bg-europbots-secondary rounded-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}