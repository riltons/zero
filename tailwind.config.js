/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#213435',
        'primary-dark': '#1a2a2b',
        accent: '#46685b',
        'accent-dark': '#385347',
        'accent-light': '#648a64',
      },
    },
  },
  plugins: [],
}
