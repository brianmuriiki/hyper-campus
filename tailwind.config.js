/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F7F4EC',
        'paper-raised': '#FFFFFF',
        ink: '#16213D',
        'ink-soft': '#55597A',
        highlighter: '#F4B400',
        'highlighter-soft': '#FDE9B0',
        sage: '#6B8F71',
        line: '#E3DFD1',
      },
      fontFamily: {
  display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
  body: ['"IBM Plex Sans"', 'system-ui', '-apple-system', 'sans-serif'],
},
    },
  },
  plugins: [],
}