/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  // NativeWind читает системную тему автоматически
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF6B35',
          50:  '#FFF1EC',
          100: '#FFD9C8',
          200: '#FFB599',
          300: '#FF9166',
          400: '#FF6B35',
          500: '#E55A26',
          600: '#C24A1A',
          700: '#9E3B10',
          800: '#7A2D09',
          900: '#561F04',
        },
        // Адаптивные цвета — меняются по теме
        dark: {
          DEFAULT:  '#0F0F0F',
          card:     '#1A1A1A',
          elevated: '#222222',
          border:   '#2E2E2E',
        },
        light: {
          DEFAULT:  '#FFFFFF',
          card:     '#F5F5F5',
          elevated: '#EBEBEB',
          border:   '#E0E0E0',
        },
        success: '#22C55E',
        warning: '#F59E0B',
        error:   '#EF4444',
        info:    '#3B82F6',
        text: {
          dark: '#0F0F0F',
          primary:   '#0F0F0F',
          secondary: '#666666',
          muted:     '#999999',
          inverse:   '#FFFFFF',
        },
        escrow: '#8B5CF6',
      },
      fontFamily: {
        sans:      ['Manrope_400Regular', 'sans-serif'],
        medium:    ['Manrope_500Medium',  'sans-serif'],
        semibold:  ['Manrope_600SemiBold','sans-serif'],
        bold:      ['Manrope_700Bold',    'sans-serif'],
        extrabold: ['Manrope_800ExtraBold','sans-serif'],
      },
      borderRadius: {
        xl:    '16px',
        '2xl': '20px',
        '3xl': '24px',
      },
      spacing: {
        18: '72px',
        22: '88px',
      },
    },
  },
  plugins: [],
};
