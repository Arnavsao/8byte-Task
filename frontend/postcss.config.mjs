/**
 * PostCSS config for Tailwind CSS v4.
 * Next.js runs this when using webpack (next dev --webpack / next build --webpack).
 * @see https://tailwindcss.com/docs/installation/install-as-postcss-plugin
 */
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};

export default config;
