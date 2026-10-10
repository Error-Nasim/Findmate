/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#0b0f17',
        surface: '#111827',
        surfaceAlt: '#1F2937',
        border: '#374151',
        primary: '#6366F1',
        primaryLight: '#818CF8',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#F43F5E',
        textPrimary: '#F9FAFB',
        textSecondary: '#E5E7EB',
        textMuted: '#9CA3AF',
        textFaint: '#6B7280',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'slide-in-right': 'slideInRight 0.3s cubic-bezier(0.32,0.72,0,1)',
        'fade-in': 'fadeIn 0.2s ease',
        'modal-in': 'modalIn 0.25s cubic-bezier(0.32,0.72,0,1)',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(1.2)' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        modalIn: {
          '0%': { opacity: '0', transform: 'scale(0.95) translateY(12px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
