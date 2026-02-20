// src/lib/referral.ts
'use client';

import { db, isFirebaseReady } from './firebase';
import {
    doc, getDoc, updateDoc, increment, query,
    collection, where, getDocs,
} from 'firebase/firestore';

const REFERRAL_BONUS = 500;

/**
 * Share the current user's referral link via native share API.
 * Falls back to clipboard copy.
 */
export async function shareReferralLink(referralCode: string): Promise<void> {
    const message = `🎮 G-VOID oynuyor musun? Anti-yerçekimi runner! Davet kodum: ${referralCode}\nhttps://gvoid.app?ref=${referralCode}`;

    if (typeof navigator !== 'undefined' && navigator.share) {
        try {
            await navigator.share({ title: 'G-VOID', text: message });
            return;
        } catch {
            // Cancelled or unsupported — fallback to clipboard
        }
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(message);
    }
}

export type ReferralResult = 'ok' | 'already_used' | 'not_found' | 'own_code' | 'offline' | 'error';

/**
 * Apply a referral code. Awards REFERRAL_BONUS to both parties via Firestore.
 * Returns 'offline' if Firebase is not configured.
 */
export async function applyReferralCode(
    code: string,
    currentUid: string
): Promise<ReferralResult> {
    if (!isFirebaseReady() || !db) return 'offline';

    try {
        const currentRef  = doc(db, 'users', currentUid);
        const currentSnap = await getDoc(currentRef);
        if (!currentSnap.exists()) return 'error';

        const currentData = currentSnap.data();
        if (currentData.usedReferral) return 'already_used';

        const q    = query(collection(db, 'users'), where('referralCode', '==', code.toUpperCase()));
        const snap = await getDocs(q);
        if (snap.empty) return 'not_found';

        const ownerDoc = snap.docs[0];
        if (ownerDoc.id === currentUid) return 'own_code';

        await updateDoc(ownerDoc.ref, { coins: increment(REFERRAL_BONUS), referralCount: increment(1) });
        await updateDoc(currentRef,   { coins: increment(REFERRAL_BONUS), usedReferral: code.toUpperCase() });

        return 'ok';
    } catch (err) {
        console.error('[referral] applyReferralCode failed:', err);
        return 'error';
    }
}

export { REFERRAL_BONUS };
