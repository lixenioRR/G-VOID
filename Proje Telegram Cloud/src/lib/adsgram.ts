'use client';

/**
 * Adsgram Integration
 * Lazy-loads the Adsgram SDK and shows a rewarded ad.
 * Returns true if the user watched the ad, false otherwise.
 */

declare global {
    interface Window {
        Adsgram?: {
            init: (config: { blockId: string; debug?: boolean }) => AdsgramController;
        };
    }
}

interface AdsgramController {
    show: () => Promise<void>;
    destroy: () => void;
}

let controller: AdsgramController | null = null;

async function loadAdsgramSDK(): Promise<void> {
    return new Promise((resolve, reject) => {
        if (window.Adsgram) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://sad.adsgram.ai/js/sad.min.js';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Adsgram SDK'));
        document.head.appendChild(script);
    });
}

export async function initAdsgram(): Promise<void> {
    try {
        await loadAdsgramSDK();
        const blockId = process.env.NEXT_PUBLIC_ADSGRAM_BLOCK_ID ?? 'test-block';
        controller = window.Adsgram!.init({ blockId, debug: process.env.NODE_ENV === 'development' });
    } catch {
        console.warn('[Adsgram] Failed to initialize — ads disabled');
    }
}

/**
 * Show a rewarded continue ad.
 * @returns true if user completed / watched; false if skipped or failed
 */
export async function showContinueAd(): Promise<boolean> {
    if (!controller) {
        // Dev mode: simulate an ad that always succeeds after 1.5s
        return new Promise((resolve) => {
            setTimeout(() => resolve(true), 1500);
        });
    }

    try {
        await controller.show();
        return true;
    } catch {
        return false;
    }
}
