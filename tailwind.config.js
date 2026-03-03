/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        card: "hsl(var(--card) / <alpha-value>)",
        "card-foreground": "hsl(var(--card-foreground) / <alpha-value>)",
        primary: "hsl(var(--primary) / <alpha-value>)",
        "primary-foreground": "hsl(var(--primary-foreground) / <alpha-value>)",
        secondary: "hsl(var(--secondary) / <alpha-value>)",
        "secondary-foreground": "hsl(var(--secondary-foreground) / <alpha-value>)",
        accent: "hsl(var(--accent) / <alpha-value>)",
        "accent-foreground": "hsl(var(--accent-foreground) / <alpha-value>)",
        border: "hsl(var(--border) / <alpha-value>)",
        "border-foreground": "hsl(var(--border-foreground) / <alpha-value>)",
        dark: "#0c0b12",
        "dark-900": "#0a0a0f",
        "dark-800": "#121222",
        neonPink: "#f442ff",
        neonCyan: "#4ef3ff",
        neonBlue: "#4db9ff",
        cardBorderFrom: "#f442ff",
        cardBorderTo: "#4ef3ff",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "Inter", "system-ui", "sans-serif"],
        body: ["'Inter'", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 25px rgba(244, 66, 255, 0.25)",
        "glow-strong": "0 0 40px rgba(244, 66, 255, 0.35), 0 0 60px rgba(78, 243, 255, 0.25)",
      },
      backgroundImage: {
        "hero-gradient": "radial-gradient(circle at 20% 20%, rgba(244,66,255,0.20), transparent 25%), radial-gradient(circle at 80% 10%, rgba(78,243,255,0.15), transparent 30%), linear-gradient(180deg, #0f0c1d 0%, #0a0a10 60%, #090910 100%)",
        "card-border": "linear-gradient(135deg, rgba(244,66,255,0.7), rgba(78,243,255,0.7))",
        "modal-bg": "linear-gradient(180deg, rgba(20,20,30,0.92) 0%, rgba(12,12,20,0.95) 80%)",
      },
    },
  },
  plugins: [],
}
