"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "dark" | "light" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  systemTheme: "dark" | "light";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
}

export function ThemeProvider({ children, defaultTheme = "dark" }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [systemTheme, setSystemTheme] = useState<"dark" | "light">("dark");

  // Detectar el tema del sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemTheme(mediaQuery.matches ? "dark" : "light");

    const handler = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Cargar tema guardado
  useEffect(() => {
    const savedTheme = localStorage.getItem("europbots-theme") as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  // Aplicar tema
  useEffect(() => {
    const root = document.documentElement;
    const effectiveTheme = theme === "system" ? systemTheme : theme;
    
    // Remover clases anteriores
    root.classList.remove("light", "dark");
    root.classList.add(effectiveTheme);

    // Variables CSS personalizadas para EUROPBOTS
    if (effectiveTheme === "light") {
      root.style.setProperty("--bg-primary", "255 255 255");
      root.style.setProperty("--bg-secondary", "249 250 251");
      root.style.setProperty("--text-primary", "17 24 39");
      root.style.setProperty("--text-secondary", "75 85 99");
      root.style.setProperty("--europbots-primary", "249 250 251");
      root.style.setProperty("--europbots-accent", "210 255 0");
    } else {
      root.style.setProperty("--bg-primary", "15 23 42");
      root.style.setProperty("--bg-secondary", "30 41 59");
      root.style.setProperty("--text-primary", "248 250 252");
      root.style.setProperty("--text-secondary", "203 213 225");
      root.style.setProperty("--europbots-primary", "15 23 42");
      root.style.setProperty("--europbots-accent", "210 255 0");
    }

    // Guardar tema
    localStorage.setItem("europbots-theme", theme);
  }, [theme, systemTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, systemTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}