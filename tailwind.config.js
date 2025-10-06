/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--color_primario, #439E3A)", // si var no existe usa #439E3A
        secondary: "var(--color_secundario, #7DD177)",
        tertiary: "var(--color_terciario, #CBFFC7)",
      },
    },
  },
  plugins: [],
};
