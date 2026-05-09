// tailwind.config.js
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#F2EFE9",
        foreground: "#141210",
        accent: "#C26D5C",
        "accent-light": "#E8B4A8",
        muted: "#9A8880",
        cream: "#F2EFE9",
        ink: "#141210",
      },
      fontFamily: {
        serif: ["PlayfairDisplay_600SemiBold"],
        sans: ["Inter_400Regular"],
      },
    },
  },
  plugins: [],
};
