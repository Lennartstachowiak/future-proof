/** @type {import('tailwindcss').Config} */
import theme from "./app/styles/theme";

module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: theme.colors.primary,
        status: theme.colors.status,
        neutral: theme.colors.neutral,
        background: theme.colors.background,
        text: theme.colors.text,
      },
      fontFamily: {
        sans: theme.typography.fontFamily,
        mono: theme.typography.fontFamily,
      },
      fontSize: theme.typography.fontSizes,
      fontWeight: theme.typography.fontWeights,
      lineHeight: theme.typography.lineHeights,
      spacing: theme.spacing,
      boxShadow: theme.shadows,
      borderWidth: {
        none: theme.borders.none,
        thin: theme.borders.thin,
        thick: theme.borders.thick,
      },
      borderRadius: theme.borderRadius,
      zIndex: theme.zIndices,
      backgroundImage: {
        "gradient-pink-orange": theme.colors.gradients.pinkOrange,
        "gradient-blue-cyan": theme.colors.gradients.blueCyan,
        "gradient-purple-blue": theme.colors.gradients.purpleBlue,
        "gradient-green-teal": theme.colors.gradients.greenTeal,
      },
    },
  },
  plugins: [],
};
