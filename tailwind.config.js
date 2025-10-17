/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        bg: "#F8FAFC",
        card: "#FFFFFF",
        border: "#E5E7EB",
        text: "#0F172A",
        subtext: "#6B7280",
        accent: "#2563EB",
        success: "#16A34A",
        warning: "#F59E0B",
        danger: "#DC2626",
      },
      borderRadius: { sm: "8px", md: "12px", lg: "16px" },
      boxShadow: { card: "0 1px 2px rgba(0,0,0,0.04)" },
    },
  },
  plugins: [],
};
