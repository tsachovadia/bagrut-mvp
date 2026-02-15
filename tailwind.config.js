/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    purple: {
                        50: '#F5F3FF',
                        100: '#EDE9FE',
                        200: '#DDD6FE',
                        300: '#C4B5FD',
                        400: '#A78BFA',
                        500: '#8B5CF6',
                        DEFAULT: '#7C3AED',
                        600: '#7C3AED',
                        700: '#6D28D9',
                        800: '#5B21B6',
                        900: '#4C1D95',
                    },
                    green: {
                        100: '#ECFCCB',
                        400: '#A3E635',
                        500: '#84CC16',
                        DEFAULT: '#65A30D',
                        600: '#65A30D',
                    }
                },
                apple: {
                    gray: '#F5F5F7',
                    blue: '#0071E3',
                    dark: '#1D1D1F',
                    text: '#1D1D1F',
                    subtext: '#86868B',
                }
            },
            borderRadius: {
                'xl': '12px',
                '2xl': '18px',
                '3xl': '24px',
                '4xl': '32px',
            },
            fontFamily: {
                sans: [
                    '-apple-system',
                    'BlinkMacSystemFont',
                    '"Segoe UI"',
                    'Roboto',
                    'Helvetica',
                    'Arial',
                    'sans-serif',
                ],
            },
            boxShadow: {
                'apple': '0 4px 24px rgba(0, 0, 0, 0.04)',
                'apple-hover': '0 8px 32px rgba(0, 0, 0, 0.08)',
            },
            animation: {
                blob: 'blob 7s infinite',
                'bounce-slow': 'bounce 3s infinite',
                marquee: 'marquee 30s linear infinite',
            },
            keyframes: {
                blob: {
                    '0%': {
                        transform: 'translate(0px, 0px) scale(1)',
                    },
                    '33%': {
                        transform: 'translate(30px, -50px) scale(1.1)',
                    },
                    '66%': {
                        transform: 'translate(-20px, 20px) scale(0.9)',
                    },
                    '100%': {
                        transform: 'translate(0px, 0px) scale(1)',
                    },
                },
                marquee: {
                    '0%': { transform: 'translateX(0)' },
                    '100%': { transform: 'translateX(50%)' },
                },
            },
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
}
