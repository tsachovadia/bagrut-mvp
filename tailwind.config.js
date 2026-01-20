/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
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
            },
        },
    },
    plugins: [],
}
