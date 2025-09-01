"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
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

      if (!response.ok) {
        setError(data.error || "Erreur de connexion");
      } else {
        // Login successful

        // Lógica de redirección basada en el rol del usuario
        let destinationPage = "/dashboard"; // Página por defecto

        if (data.user.role === "admin") {
          // User is admin, redirecting to /admin
          destinationPage = "/admin";
        } else {
          // User is normal, redirecting to /campaign
          destinationPage = "/campaign";
        }

        // Redirecting to destination page
        router.push(destinationPage);
        router.refresh();
      }
    } catch (err) {
      setError("Erreur inattendue. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-europbots-primary font-syncopate">
          Connexion
        </h1>
        <p className="text-europbots-gray mt-2">
          Entrez vos identifiants pour accéder
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-europbots-primary font-medium">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="votre@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border-europbots-light-gray focus:border-europbots-secondary focus:ring-europbots-secondary"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="text-europbots-primary font-medium"
          >
            Mot de passe
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border-europbots-light-gray focus:border-europbots-secondary focus:ring-europbots-secondary"
          />
        </div>

        {error && (
          <div className="text-sm text-red-600 text-center bg-red-50 p-3 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <Button
          type="submit"
          className="w-full europbots-button"
          disabled={loading}
        >
          {loading ? "Connexion en cours..." : "Connexion"}
        </Button>
      </form>

      <div className="text-center">
        <p className="text-sm text-europbots-gray">
          Pas de compte ?{" "}
          <a
            href="/register"
            className="text-europbots-secondary hover:text-europbots-secondary/80 font-medium transition-colors"
          >
            Inscrivez-vous ici
          </a>
        </p>
      </div>
    </div>
  );
}
