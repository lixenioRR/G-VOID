import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import './globals.css';

export const metadata: Metadata = {
    title: 'G-VOID',
    description: 'Anti-Gravity Puzzle Runner — Telegram Mini App',
    manifest: '/manifest.json',
    openGraph: {
        title: 'G-VOID',
        description: 'Gravity is a choice. Survival is a skill.',
        type: 'website',
    },
};

export const generateViewport = (): Viewport => ({
    themeColor: '#36E27B',
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
});

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const locale = await getLocale();
    const messages = await getMessages();

    return (
        <html lang={locale} className="h-full">
            <head>
                {/* eslint-disable-next-line @next/next/no-sync-scripts */}
                <script src="https://telegram.org/js/telegram-web-app.js" />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
            </head>
            <body className="h-full overflow-hidden bg-void-black">
                <NextIntlClientProvider messages={messages} locale={locale}>
                    {children}
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
