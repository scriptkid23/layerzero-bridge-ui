import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#121212",
        'background-secondary': "#1e1e1e",
        foreground: "#e0e0e0",
        accent: "#00bcd4",
        'accent-hover': "#008c9e",
        border: "#333333",
        disabled: "#666666",
        'gray-50': '#FAFAFA',
        'gray-100': '#F5F5F5',
        'gray-200': '#EEEEEE',
        'gray-400': '#BDBDBD',
        'gray-500': '#9E9E9E',
        'gray-600': '#757575',
        'gray-700': '#616161',
        'gray-900': '#212121',
        'purple-50': '#F3E5F5',
        'purple-600': '#7B1FA2',
        'purple-700': '#6A1B9A',
        'blue-500': '#2196F3',
        'blue-600': '#1E88E5',
        'yellow-400': '#FFEB3B',
        'yellow-500': '#FBC02D',
        'green-500': '#4CAF50',
        'green-600': '#43A047',
      },
      fontFamily: {
        sans: ["Inter", "Roboto", "ui-sans-serif", "system-ui"],
      },
    },
  },
  plugins: [],
} satisfies Config;
