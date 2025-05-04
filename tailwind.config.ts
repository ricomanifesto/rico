import type { Config } from "tailwindcss";
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        "light-bg": "#f4f7f6",
        "dark-text": "#333",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        // Rest of your color configuration
      },
      // Rest of your tailwind configuration
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;