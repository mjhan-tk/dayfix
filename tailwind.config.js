import tdsPreset from '@thakicloud/shared/tailwind.preset';

/** @type {import('tailwindcss').Config} */
export default {
  presets: [tdsPreset],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
    './node_modules/@thakicloud/shared/dist/**/*.{js,mjs}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
