import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                'void-black': '#050505',
                'void-green': '#36E27B',
                'void-green-dim': '#1a7a45',
                'void-purple': '#9B59B6',
                'void-purple-bright': '#C77DFF',
                'void-red': '#FF3A5C',
                'void-blue': '#00D4FF',
                'void-yellow': '#FFD700',
                'hud-bg': 'rgba(5,5,5,0.85)',
                'hud-border': 'rgba(54,226,123,0.3)',
            },
            fontFamily: {
                orbitron: ['Orbitron', 'monospace'],
                inter: ['Inter', 'sans-serif'],
            },
            animation: {
                'pulse-neon': 'pulseNeon 2s ease-in-out infinite',
                'flicker': 'flicker 0.15s infinite',
                'scan-line': 'scanLine 3s linear infinite',
                'slide-up': 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1)',
                'fade-in': 'fadeIn 0.3s ease-out',
                'glow-pulse': 'glowPulse 1.5s ease-in-out infinite',
            },
            keyframes: {
                pulseNeon: {
                    '0%, 100%': { textShadow: '0 0 4px #36E27B, 0 0 11px #36E27B, 0 0 19px #36E27B' },
                    '50%': { textShadow: '0 0 4px #36E27B, 0 0 11px #36E27B, 0 0 40px #36E27B, 0 0 80px #36E27B' },
                },
                flicker: {
                    '0%, 19%, 21%, 23%, 25%, 54%, 56%, 100%': { opacity: '1' },
                    '20%, 24%, 55%': { opacity: '0.4' },
                },
                scanLine: {
                    '0%': { transform: 'translateY(-100%)' },
                    '100%': { transform: 'translateY(100vh)' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(40px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                glowPulse: {
                    '0%, 100%': { boxShadow: '0 0 5px #36E27B, 0 0 10px #36E27B' },
                    '50%': { boxShadow: '0 0 20px #36E27B, 0 0 40px #36E27B' },
                },
            },
            backgroundImage: {
                'cyber-grid': `
          linear-gradient(rgba(54,226,123,0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(54,226,123,0.05) 1px, transparent 1px)
        `,
            },
            backgroundSize: {
                'cyber-grid': '40px 40px',
            },
        },
    },
    plugins: [],
};

export default config;
