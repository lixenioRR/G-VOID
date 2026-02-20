import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
    // NOTE: 'output: export' is only needed when building for Capacitor (mobile app).
    // Uncomment it ONLY when running: npm run build → npx cap sync
    // output: 'export',
    // images: { unoptimized: true },
};

export default withNextIntl(nextConfig);
