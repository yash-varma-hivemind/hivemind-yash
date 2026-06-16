/** @type {import('postcss-load-config').Config} */
/* Tailwind v4 uses a PostCSS plugin. Drop this at apps/web/postcss.config.mjs */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
