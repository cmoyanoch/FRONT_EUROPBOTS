"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    BarChart3,
    Bell,
    Key,
    LayoutDashboard,
    LogOut,
    LucideIcon,
    MessageSquare,
    Search,
    Settings,
    Shield,
    Target,
    Users,
    Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

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
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const pathname = usePathname();

  console.log("Menu - Component rendered, pathname:", pathname);
  console.log("Menu - isUserMenuOpen state:", isUserMenuOpen);

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
            console.log("Menu - User fetched:", userData.user);

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
            console.log("Menu - No authenticated user");
            setUser(null);
          }
        } else {
          console.log("Menu - No authenticated user");
          setUser(null);
        }
      } catch (error) {
        console.error("Menu - Error fetching user or permissions:", error);
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
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  const handleToggleMenu = () => {
    console.log("Menu - Toggle clicked, current state:", isUserMenuOpen);
    setIsUserMenuOpen(!isUserMenuOpen);
    console.log("Menu - New state will be:", !isUserMenuOpen);
  };

  // Ocultar menú solo en login y register
  if (pathname === "/login" || pathname === "/register") {
    console.log("Menu - Hidden for auth pages");
    return null;
  }

  // Convertir menuItems a navItems
  const navItems: NavItem[] = menuItems.map((item) => ({
    href: item.href,
    label: item.label,
    icon: iconMap[item.icon] || LayoutDashboard,
    badge: item.badge,
  }));

  console.log("Menu - User data:", user);
  console.log("Menu - Nav items:", navItems);

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
            <div className="relative">
              <img
                src="/images/logo-europbots.svg"
                alt="EUROPBOTS"
                className="h-8 w-auto filter brightness-0 invert"
              />
            </div>
          </div>

          {/* Menú de navegación principal */}
          <div className="hidden md:flex items-center space-x-1">
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
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Menú de usuario */}
          <div className="flex items-center">
            {isLoading ? (
              // Loading state
              <div className="h-9 w-9 rounded-full bg-gray-600 animate-pulse"></div>
            ) : user ? (
              // Usuario autenticado - mostrar avatar
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
                          // Si la imagen falla al cargar, ocultar el AvatarImage
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
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-europbots-primary/95 backdrop-blur-md rounded-xl shadow-lg border border-europbots-secondary/20 z-[10000]">
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
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Shield className="mr-3 h-4 w-4" />
                            Administration
                          </Link>
                          <Link
                            href="/admin/menu-permissions"
                            className="block px-4 py-3 text-sm text-gray-300 hover:bg-white/10 hover:text-white flex items-center transition-colors duration-200"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Key className="mr-3 h-4 w-4" />
                            Permisos del Menú
                          </Link>
                        </>
                      )}

                      <button
                        className="block w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 flex items-center transition-colors duration-200"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          handleLogout();
                        }}
                      >
                        <LogOut className="mr-3 h-4 w-4" />
                        Se Déconnecter
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Usuario no autenticado - mostrar botones de auth
              <div className="flex items-center space-x-3">
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
      </div>
    </nav>
  );
}
