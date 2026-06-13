/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
       animation: {
      'slide-up': 'slideUp 0.3s ease',
    },
      colors: {
        brand: {
          deep: "#120a2e",
          primary: "#4a08e6",
          light: "#a78bfa",
          //Pour la page winner chapel
          winnersRed: "#ED1C24",
          winnersGold: "#FFD700",
          winnersNavy: "#002147",

          softGray: "#F8F9FA",
        },
      },
      keyframes: {
        slideInLeft: {
        from: { transform: 'translateX(-100%)' },
        to:   { transform: 'translateX(0)' },
      },
         slideUp: {
        from: { transform: 'translateX(-50%) translateY(60px)', opacity: '0' },
        to:   { transform: 'translateX(-50%) translateY(0)',    opacity: '1' },
      },
        crossfade: {
          // On évite le 100% d'opacité pour ne pas assombrir le texte
          // On ajoute un léger scale pour un effet de mouvement "divin"
          "0%, 100%": {
            opacity: "0",
            transform: "scale(1.1)"
          },
          "20%, 80%": {
            opacity: "0.6", // Plafonné à 30% pour la clarté
            transform: "scale(1)"
          },
        },
        // Optionnel : petite animation pour faire apparaître les cartes en douceur
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        }
      },
      animation: {
       
        crossfade: "crossfade 16s ease-in-out infinite",
        fadeInUp: "fadeInUp 0.5s ease-out forwards",
        'slideInLeft': 'slideInLeft 0.22s ease',
      },
      backdropBlur: {
        xs: "2px",
      }
    },
  },
  plugins: [
    require("tailwind-scrollbar-hide"),
  ],
};