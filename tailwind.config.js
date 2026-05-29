/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        base: "var(--bg-base)",
        surface: "var(--bg-surface)",
        elevated: "var(--bg-elevated)",
        border: "var(--border)",
        accent: "var(--accent)",
        "accent-green": "var(--accent-green)",
        "accent-orange": "var(--accent-orange)",
        "accent-red": "var(--accent-red)",
        "text-primary": "var(--text-primary)",
        "text-muted": "var(--text-muted)",
        "text-dim": "var(--text-dim)",
      },
      fontFamily: {
        display: ["JetBrains Mono", "monospace"],
        body: ["IBM Plex Sans", "sans-serif"],
        code: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        lg: "12px",
      },
    },
  },
  plugins: [],
};
