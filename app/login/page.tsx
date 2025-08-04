"use client";

import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();

  // Verificar si hay mensaje de éxito en la URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const message = urlParams.get("message");
      if (message === "password-reset-success") {
        setSuccessMessage(
          "Mot de passe mis à jour avec succès ! Vous pouvez maintenant vous connecter avec votre nouveau mot de passe."
        );
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Login exitoso

        // Lógica de redirección basada en el rol del usuario
        let destinationPage = "/dashboard"; // Página por defecto

        if (data.user.role === "admin") {
          // Usuario es admin, redirigiendo a /admin
          destinationPage = "/admin";
        } else {
          // Usuario es normal, redirigiendo a /campaign
          destinationPage = "/campaign";
        }

        // Redirigiendo a la página correspondiente
        router.push(destinationPage);
      } else {
        setError(data.error || "Erreur lors de la connexion");
      }
    } catch (error) {
      setError("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-europbots-primary">
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-europbots-secondary/20 p-8 shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <Image
              src="/images/logo-europbots.svg"
              alt="EUROPBOTS Logo"
              width={200}
              height={80}
              className="h-16 w-auto mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-white">Connexion</h1>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {successMessage && (
              <div className="bg-green-500/20 border border-green-500/30 text-green-300 px-4 py-3 rounded-lg text-sm">
                {successMessage}
              </div>
            )}

            {error && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Adresse E-mail
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-3 bg-white/10 border border-europbots-secondary/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-europbots-secondary focus:border-transparent backdrop-blur-sm"
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Mot de Passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-12 py-3 bg-white/10 border border-europbots-secondary/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-europbots-secondary focus:border-transparent backdrop-blur-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-europbots-secondary bg-white/10 border-europbots-secondary/20 rounded focus:ring-europbots-secondary focus:ring-2"
                />
                <span className="ml-2 text-sm text-gray-300">
                  Se souvenir de moi
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-europbots-secondary text-europbots-primary font-bold py-3 px-4 rounded-lg hover:bg-europbots-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Connexion en cours..." : "Se Connecter"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
