'use client';

export interface TelegramUser {
    id: number;
    firstName: string;
    lastName?: string;
    username?: string;
    photoUrl?: string;
    languageCode?: string;
}

let cachedUser: TelegramUser | null = null;

/**
 * Initialize Telegram Mini App SDK.
 * Must be called once on mount in the client.
 * Uses window.Telegram.WebApp directly (most compatible approach).
 */
export async function initTelegram(): Promise<TelegramUser | null> {
    if (typeof window === 'undefined') return null;

    try {
        const webApp = window.Telegram?.WebApp;

        if (webApp) {
            // Expand to full screen height
            webApp.expand?.();

            // Read user from init data
            const user = webApp.initDataUnsafe?.user;
            if (user) {
                cachedUser = {
                    id: user.id,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    username: user.username,
                    photoUrl: user.photo_url,
                    languageCode: user.language_code,
                };
                return cachedUser;
            }
        }

        // Running outside Telegram (dev mode) — return mock user
        cachedUser = {
            id: 123456789,
            firstName: 'Player',
            username: 'void_player',
            languageCode: 'en',
        };
        return cachedUser;
    } catch {
        // Silently fail — return mock user for dev
        cachedUser = {
            id: 123456789,
            firstName: 'Player',
            username: 'void_player',
            languageCode: 'en',
        };
        return cachedUser;
    }
}

export function getUser(): TelegramUser | null {
    return cachedUser;
}

/**
 * Trigger light haptic feedback on gravity flip.
 */
export function hapticFeedback(type: 'light' | 'medium' | 'heavy' = 'light'): void {
    try {
        window.Telegram?.WebApp?.HapticFeedback?.impactOccurred(type);
    } catch {
        // Silently fail outside Telegram
    }
}

/**
 * Open Telegram share sheet with referral link.
 */
export function shareReferral(userId: number): void {
    const botUsername = process.env.NEXT_PUBLIC_BOT_USERNAME ?? 'GVoidBot';
    const link = `https://t.me/${botUsername}?start=ref_${userId}`;
    const text = `🚀 Play G-VOID — the most addictive Anti-Gravity game on Telegram! Use my link and we both earn Void Coins!`;
    try {
        window.Telegram?.WebApp?.openTelegramLink?.(
            `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`
        );
    } catch {
        // Fallback: copy to clipboard
        navigator.clipboard?.writeText(link);
    }
}

/**
 * Copy referral link to clipboard and return it.
 */
export function getReferralLink(userId: number): string {
    const botUsername = process.env.NEXT_PUBLIC_BOT_USERNAME ?? 'GVoidBot';
    return `https://t.me/${botUsername}?start=ref_${userId}`;
}

/**
 * Close the mini app.
 */
export function closeMiniApp(): void {
    try {
        window.Telegram?.WebApp?.close?.();
    } catch {
        // no-op
    }
}

// Extend Window for Telegram WebApp
declare global {
    interface Window {
        Telegram?: {
            WebApp?: {
                initDataUnsafe?: {
                    user?: {
                        id: number;
                        first_name: string;
                        last_name?: string;
                        username?: string;
                        photo_url?: string;
                        language_code?: string;
                    };
                };
                expand?: () => void;
                close?: () => void;
                HapticFeedback?: {
                    impactOccurred: (style: 'light' | 'medium' | 'heavy') => void;
                };
                openTelegramLink?: (url: string) => void;
            };
        };
    }
}
