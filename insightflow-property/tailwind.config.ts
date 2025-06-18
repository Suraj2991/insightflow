import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Property-focused color scheme - trustworthy navy + warm accents
        primary: {
          50: '#f0f4f8',
          100: '#d9e6f2',
          200: '#b3cce6',
          300: '#8db3d9',
          400: '#6699cc',
          500: '#4a7c99', // Main brand color - professional navy-teal
          600: '#3d6680',
          700: '#305066',
          800: '#243a4d',
          900: '#172533',
        },
        // Warm accent for actions and highlights
        accent: {
          50: '#fef3e2',
          100: '#fde4b8',
          200: '#fbd389',
          300: '#f9c55a',
          400: '#f7b92b',
          500: '#e6a523', // Warm gold for CTAs
          600: '#cc941f',
          700: '#b3821c',
          800: '#997018',
          900: '#805e15',
        },
        // Success color - property green
        success: {
          50: '#f0f9f4',
          100: '#dcf0e3',
          200: '#b8e0c7',
          300: '#94d1aa',
          400: '#70c18e',
          500: '#22c55e', // Property success green
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        }
      },
    },
  },
  plugins: [],
};
export default config;
