"use client";

import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/toast-provider";
import FuturisticBackground from "@/components/futuristic-background";
import AnimatedCard from "@/components/ui/animated-card";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();
  const { showSuccess, showError, showWarning, showInfo } = useToast();

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
        showSuccess("Connexion réussie!", `Bienvenue ${data.user.full_name || data.user.email}`);

        // Lógica de redirección basada en el rol del usuario
        let destinationPage = "/"; // Página por defecto

        if (data.user.role === "admin") {
          destinationPage = "/admin";
        } else {
          destinationPage = "/campaign";
        }

        // Redirigiendo a la página correspondiente
        setTimeout(() => router.push(destinationPage), 1000);
      } else {
        const errorMsg = data.error || "Erreur lors de la connexion";
        setError(errorMsg);
        showError("Erreur de connexion", errorMsg);
      }
    } catch (error) {
      const errorMsg = "Erreur de connexion";
      setError(errorMsg);
      showError("Erreur", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-3 sm:p-4">
      <FuturisticBackground />
      <div className="w-full max-w-md relative z-10">
        <AnimatedCard className="bg-white/10 backdrop-blur-sm rounded-2xl border border-europbots-secondary/20 p-4 sm:p-6 lg:p-8 shadow-2xl" delay={0.2}>
          {/* Logo */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Image
                src="/images/logo-europbots.svg"
                alt="EUROPBOTS Logo"
                width={200}
                height={80}
                className="h-12 sm:h-16 w-auto mx-auto mb-4 filter brightness-0 invert"
              />
            </motion.div>
            <motion.h1
              className="text-xl sm:text-2xl font-bold text-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Connexion
            </motion.h1>
          </motion.div>

          {/* Formulario */}
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <AnimatePresence>
              {successMessage && (
                <motion.div
                  className="bg-green-500/20 border border-green-500/30 text-green-300 px-4 py-3 rounded-lg text-sm"
                  initial={{ opacity: 0, scale: 0.9, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {successMessage}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {error && (
                <motion.div
                  className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg text-sm"
                  initial={{ opacity: 0, scale: 0.9, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Adresse E-mail
              </label>
              <div className="relative">
                <motion.div
                  className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                  animate={{ scale: email ? 1.1 : 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Mail className="h-5 w-5 text-gray-400" />
                </motion.div>
                <motion.input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-3 bg-white/10 border border-europbots-secondary/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-europbots-secondary focus:border-transparent backdrop-blur-sm transition-all duration-200"
                  placeholder="votre@email.com"
                  whileFocus={{ scale: 1.02 }}
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Mot de Passe
              </label>
              <div className="relative">
                <motion.div
                  className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                  animate={{ scale: password ? 1.1 : 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Lock className="h-5 w-5 text-gray-400" />
                </motion.div>
                <motion.input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-12 py-3 bg-white/10 border border-europbots-secondary/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-europbots-secondary focus:border-transparent backdrop-blur-sm transition-all duration-200"
                  placeholder="••••••••"
                  whileFocus={{ scale: 1.02 }}
                />
                <motion.button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <AnimatePresence mode="wait">
                    {showPassword ? (
                      <motion.div
                        key="eyeoff"
                        initial={{ opacity: 0, rotate: 90 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0, rotate: -90 }}
                        transition={{ duration: 0.2 }}
                      >
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="eye"
                        initial={{ opacity: 0, rotate: -90 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0, rotate: 90 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>
            </motion.div>

            <motion.div
              className="flex items-center"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              <motion.label
                className="flex items-center cursor-pointer"
                whileHover={{ scale: 1.02 }}
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 text-europbots-secondary bg-white/10 border-europbots-secondary/20 rounded focus:ring-europbots-secondary focus:ring-2"
                />
                <span className="ml-2 text-sm text-gray-300">
                  Se souvenir de moi
                </span>
              </motion.label>
            </motion.div>

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full bg-europbots-secondary text-europbots-primary font-bold py-3 px-4 rounded-lg hover:bg-europbots-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              whileHover={{ scale: loading ? 1 : 1.02, y: loading ? 0 : -2 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
            >
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center space-x-2"
                  >
                    <motion.div
                      className="h-4 w-4 border-b-2 border-europbots-primary rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <span>Connexion en cours...</span>
                  </motion.div>
                ) : (
                  <motion.span
                    key="connect"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    Se Connecter
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.form>
        </AnimatedCard>
      </div>
    </div>
  );
}
