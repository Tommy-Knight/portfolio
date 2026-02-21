import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    '!./_archive/**',
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['var(--font-ibm-mono)', 'IBM Plex Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
