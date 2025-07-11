import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    // Clases de Europbots con modificadores de opacidad
    'bg-europbots-accent/95',
    'border-europbots-secondary/20',
    'bg-europbots-primary/10',
    'text-europbots-secondary/80',
    'hover:bg-europbots-secondary/90',
    'hover:text-europbots-secondary/80',
    // Clases básicas de Europbots
    'bg-europbots-primary',
    'bg-europbots-secondary',
    'bg-europbots-accent',
    'bg-europbots-dark',
    'bg-europbots-gray',
    'bg-europbots-light-gray',
    'text-europbots-primary',
    'text-europbots-secondary',
    'text-europbots-text',
    'text-europbots-accent',
    'text-europbots-dark',
    'text-europbots-gray',
    'border-europbots-primary',
    'border-europbots-secondary',
    'border-europbots-accent',
    'border-europbots-dark',
    'border-europbots-gray',
    'border-europbots-light-gray',
    'focus:border-europbots-secondary',
    'focus:ring-europbots-secondary',
    // Clases de gradientes
    'from-europbots-primary',
    'via-europbots-dark',
    'to-europbots-gray',
    'from-europbots-dark',
    'via-europbots-blue',
    'to-europbots-light',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta oficial de Europbots - nombres directos
        'europbots-primary': '#080808',      // Negro principal
        'europbots-secondary': '#D2FF00',    // Verde neón
        'europbots-text': '#FAFAFA',         // Blanco texto
        'europbots-accent': '#F9F9F9',       // Blanco acento
        'europbots-dark': '#222222',         // Gris oscuro
        'europbots-gray': '#454444',         // Gris medio
        'europbots-light-gray': '#DBDBDB',   // Gris claro
        // Mantener compatibilidad con nombres anteriores
        'europbots-blue': '#222222',
        'europbots-light': '#F9F9F9',
        'europbots-yellow': '#D2FF00',
        // Variables CSS para Shadcn UI
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        'red-hat': ['"Red Hat Display"', 'sans-serif'],
        'syncopate': ['Syncopate', 'sans-serif'],
        'montserrat': ['Montserrat', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      // Configuración para Shadcn UI
      container: {
        center: true,
        padding: "2rem",
        screens: {
          "2xl": "1400px",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config 