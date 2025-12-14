/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "myOrage": "#dd700a",
        "myGrey": "#7c7c7c",
        "myPink": "#f6dbc2",
        "myLight": "#f0a464",
      }
    },
  },
  plugins: [],
}

