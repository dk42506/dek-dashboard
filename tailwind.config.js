/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // DEK Innovations Brand Colors
        primary: {
          50: '#f8f6f8',
          100: '#f1ecf1',
          200: '#e3d9e3',
          300: '#d0c0d0',
          400: '#b8a3b8',
          500: '#8B7D8B', // Main primary color
          600: '#7d6f7d',
          700: '#6B5B6B', // Primary dark
          800: '#5a4d5a',
          900: '#4a404a',
        },
        secondary: {
          50: '#fdf2f4',
          100: '#fce7ea',
          200: '#f9d0d7',
          300: '#f4aab7',
          400: '#ec7a91',
          500: '#7D4F5C', // Secondary/maroon accent
          600: '#714651',
          700: '#5e3c46',
          800: '#4f333c',
          900: '#432d35',
        },
        accent: {
          50: '#f7f6f7',
          100: '#efecef',
          200: '#dfd9df',
          300: '#c9bfc9',
          400: '#b0a0b0',
          500: '#9B8B9B', // Accent color
          600: '#8a7a8a',
          700: '#756575',
          800: '#625462',
          900: '#524652',
        },
        // Neutral colors for backgrounds and text
        gray: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'strong': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
