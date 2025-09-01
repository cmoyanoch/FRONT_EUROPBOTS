import { LeadAlerts } from "@/components/lead-alerts";
import { ToastProvider } from "@/components/ui/toast-provider";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { AuthService } from "@/lib/auth";
import type { Metadata } from "next";
import { Montserrat, Red_Hat_Display, Syncopate } from "next/font/google";
import { cookies } from "next/headers";
import Menu from "../components/menu";
import "./globals.css";

// Forzar renderizado dinámico
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Fuentes oficiales de Europbots
const redHatDisplay = Red_Hat_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-red-hat",
  display: "swap",
});

const syncopate = Syncopate({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-syncopate",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EUROPBOTS",
  description: "Application web moderne avec système d'authentification",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  other: {
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  },
};

async function getUser(token: string) {
  try {
    // Getting user with token
    // Usar el servicio de autenticación directamente
    const user = await AuthService.verifyToken(token);
    // User obtained successfully
    return user;
  } catch (error) {
    console.error("Layout - Error fetching user:", error);
  }
  return null;
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Detectar cookie de autenticación
  const cookieStore = cookies();
  const token = cookieStore.get("auth-token")?.value;

  // Token from cookie

  // Obtener datos del usuario si hay token
  const user = token ? await getUser(token) : null;

  // Final user for AuthProvider

  return (
    <html
      lang="fr"
      className={`${redHatDisplay.variable} ${syncopate.variable} ${montserrat.variable}`}
    >
      <head>
        <meta
          httpEquiv="Cache-Control"
          content="no-cache, no-store, must-revalidate"
        />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
      </head>
      <body
        className={`${redHatDisplay.className} bg-europbots-primary text-europbots-text antialiased min-h-screen`}
      >
        <ToastProvider>
          <NotificationProvider>
            <div className="flex flex-col min-h-screen">
              <Menu />
              <main className="flex-1">
                {children}
              </main>
              <LeadAlerts />
            </div>
          </NotificationProvider>
        </ToastProvider>
        {/* Flowbite Script para Accordion */}
        <script src="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.2.1/flowbite.min.js"></script>
      </body>
    </html>
  );
}
