"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useNotification } from "@/contexts/NotificationContext";
import { AnimatePresence, motion } from "framer-motion";
import {
    BarChart3,
    Bell,
    Key,
    LayoutDashboard,
    LogOut,
    LucideIcon,
    Menu as MenuIcon,
    MessageSquare,
    Search,
    Settings,
    Shield,
    Target,
    Users,
    X,
    Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { SystemAlerts } from "./system-alerts";


interface User {
  id: string;
  email: string;
  full_name?: string;
  role?: string;
  avatar_url?: string;
}

interface MenuItem {
  id: string;
  name: string;
  label: string;
  href: string;
  icon: string;
  badge?: string;
}

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
}

// Mapeo de iconos
const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Search,
  Users,
  MessageSquare,
  Settings,
  BarChart3,
  Bell,
  Zap,
  Target,
};

export default function Menu() {
  const { openPopup, closePopup, isPopupOpen, closeAllPopups } = useNotification();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const pathname = usePathname();

  const popupId = 'user-menu';
  const isUserMenuOpen = isPopupOpen(popupId);

  // Menu component rendered

  // Obtener usuario autenticado y permisos del menú
  useEffect(() => {
    // Solo obtener usuario si no estamos en páginas de auth
    if (pathname === "/login" || pathname === "/register") {
      setIsLoading(false);
      return;
    }

    const fetchUserAndPermissions = async () => {
      try {
        // Obtener usuario
        const userResponse = await fetch("/api/auth/me");
        if (userResponse.ok) {
          const userData = await userResponse.json();
          if (userData.success && userData.user) {
            setUser(userData.user);
            // User data fetched

            // Obtener permisos del menú
            const permissionsResponse = await fetch("/api/menu-permissions");
            if (permissionsResponse.ok) {
              const permissionsData = await permissionsResponse.json();
              setMenuItems(permissionsData.menuItems);
              console.log(
                "Menu - Permissions fetched:",
                permissionsData.menuItems
              );
            }
          } else {
            // No authenticated user
            setUser(null);
          }
        } else {
          // No authenticated user
          setUser(null);
        }
      } catch (error) {
        // Error fetching user or permissions
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAndPermissions();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        window.location.href = "/login";
      }
    } catch (error) {
      // Logout error
    }
  };

  const handleToggleMenu = () => {
    // Toggle menu clicked
    if (isUserMenuOpen) {
      closePopup(popupId);
    } else {
      openPopup(popupId);
    }
    // Menu state updated
  };

  const handleToggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Ocultar menú solo en login y register
  if (pathname === "/login" || pathname === "/register") {
    // Menu hidden for auth pages
    return null;
  }

  // Convertir menuItems a navItems
  const navItems: NavItem[] = menuItems.map((item) => ({
    href: item.href,
    label: item.label,
    icon: iconMap[item.icon] || LayoutDashboard,
    badge: item.badge,
  }));

  // Menu data prepared

  // Función para obtener las iniciales del usuario
  const getUserInitials = (user: User) => {
    if (user.full_name) {
      return user.full_name.charAt(0).toUpperCase();
    }
    return user.email.charAt(0).toUpperCase();
  };

  return (
    <nav className="bg-europbots-primary/95 backdrop-blur-md border-b border-europbots-secondary/20 shadow-lg sticky top-0 z-[9999]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <img
                src="/images/logo-europbots.svg"
                alt="EUROPBOTS"
                className="h-8 w-auto filter brightness-0 invert"
              />
            </Link>
          </div>

          {/* Menú de navegación principal - Desktop */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`relative px-3 py-2 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "text-europbots-secondary bg-europbots-secondary/10 border-b-2 border-europbots-secondary"
                        : "text-gray-300 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    <span className="hidden xl:inline">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Botones del lado derecho */}
          <div className="flex items-center space-x-2">
            {/* Sistema de Alertas */}
            <SystemAlerts />

            {/* Botón menú hamburguesa - Mobile/Tablet */}
            <div className="lg:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleMobileMenu}
                className="text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <MenuIcon className="h-6 w-6" />
                )}
              </Button>
            </div>

            {/* Menú de usuario */}
            {isLoading ? (
              <div className="h-9 w-9 rounded-full bg-gray-600 animate-pulse"></div>
            ) : user ? (
              <div className="relative">
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full hover:bg-white/10 transition-all duration-200"
                  onClick={handleToggleMenu}
                >
                  <Avatar className="h-9 w-9 ring-2 ring-europbots-secondary/30 hover:ring-europbots-secondary transition-all duration-200">
                    {user.avatar_url ? (
                      <AvatarImage
                        src={user.avatar_url}
                        alt={user.full_name || user.email}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                        }}
                      />
                    ) : null}
                    <AvatarFallback className="bg-europbots-secondary text-europbots-primary text-sm font-medium">
                      {getUserInitials(user)}
                    </AvatarFallback>
                  </Avatar>
                </Button>

                {/* Dropdown del usuario */}
                <AnimatePresence>
                {isUserMenuOpen && (
                    <motion.div
                      data-popup="true"
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-3 w-64 bg-europbots-primary/95 backdrop-blur-md rounded-xl shadow-lg border border-europbots-secondary/20 z-[10000]"
                    >
                    <div className="py-2">
                      <div className="px-4 py-3 border-b border-europbots-secondary/20">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm text-gray-300 truncate">
                            {user.email}
                          </p>
                          {user.role && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-europbots-secondary/20 text-europbots-secondary capitalize">
                              {user.role}
                            </span>
                          )}
                        </div>
                      </div>

                      {user.role === "admin" && (
                        <>
                          <Link
                            href="/admin"
                            className="block px-4 py-3 text-sm text-gray-300 hover:bg-white/10 hover:text-white flex items-center transition-colors duration-200"
                            onClick={() => closePopup(popupId)}
                          >
                            <Shield className="mr-3 h-4 w-4" />
                            Administration
                          </Link>
                          <Link
                            href="/admin/menu-permissions"
                            className="block px-4 py-3 text-sm text-gray-300 hover:bg-white/10 hover:text-white flex items-center transition-colors duration-200"
                            onClick={() => closePopup(popupId)}
                          >
                            <Key className="mr-3 h-4 w-4" />
                            Permisos del Menú
                          </Link>
                        </>
                      )}

                      <button
                        className="block w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 flex items-center transition-colors duration-200"
                        onClick={() => {
                          closePopup(popupId);
                          handleLogout();
                        }}
                      >
                        <LogOut className="mr-3 h-4 w-4" />
                        Se Déconnecter
                      </button>
                    </div>
                  </motion.div>
                )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-3">
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200"
                  >
                    Connexion
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    size="sm"
                    className="bg-europbots-secondary text-europbots-primary hover:bg-europbots-secondary/90 font-medium transition-all duration-200 shadow-lg hover:shadow-xl shadow-europbots-secondary/25"
                  >
                    Inscription
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Menú móvil mejorado */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="lg:hidden overflow-hidden"
            >
              <div className="px-2 pt-2 pb-3 space-y-1 bg-europbots-primary/95 backdrop-blur-md border-t border-europbots-secondary/20">
                {navItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <motion.div
                          whileTap={{ scale: 0.95 }}
                          className={`flex items-center px-3 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                            isActive
                              ? "text-europbots-secondary bg-europbots-secondary/10 border-l-4 border-europbots-secondary shadow-lg"
                              : "text-gray-300 hover:text-white hover:bg-white/10"
                          }`}
                        >
                          <Icon className="mr-3 h-5 w-5" />
                          {item.label}
                          {item.badge && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                            >
                              {item.badge}
                            </motion.span>
                          )}
                        </motion.div>
                      </Link>
                    </motion.div>
                  );
                })}

                {/* Botones de auth en móvil si no hay usuario */}
                {!user && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: navItems.length * 0.1 }}
                    className="pt-4 border-t border-europbots-secondary/20 space-y-2"
                  >
                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      <motion.div
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center px-3 py-3 rounded-xl text-base font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200"
                      >
                        Connexion
                      </motion.div>
                    </Link>
                    <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                      <motion.div
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center px-3 py-3 rounded-xl text-base font-medium bg-europbots-secondary text-europbots-primary hover:bg-europbots-secondary/90 transition-all duration-200 shadow-lg"
                      >
                        Inscription
                      </motion.div>
                    </Link>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
