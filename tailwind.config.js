/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0a0a0a',
          2: '#111111',
          3: '#161616',
          4: '#1e1e1e',
          5: '#282828',
        },
        gold: {
          DEFAULT: '#c9a84c',
          light: '#e8c97a',
          dim: '#7a5f28',
        },
        zinc: {
          DEFAULT: '#777777',
          light: '#aaaaaa',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Impact', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        condensed: ['var(--font-condensed)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
