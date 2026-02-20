// src/lib/auth.ts
'use client';

import { auth, db, isFirebaseReady } from './firebase';
import {
    GoogleAuthProvider,
    signInWithPopup,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    type User,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const provider = new GoogleAuthProvider();

export interface GVoidUser {
    uid: string;
    name: string;
    email: string | null;
    photoURL: string | null;
    isFirstLogin: boolean;
    referralCode?: string;
}

/**
 * Sign in with Google popup.
 * Returns null if Firebase is not configured or login fails.
 */
export async function signInWithGoogle(): Promise<GVoidUser | null> {
    if (!isFirebaseReady() || !auth) {
        console.warn('[auth] Firebase not configured. Add API keys to .env.local');
        return null;
    }

    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        if (!db) return null;
        const userRef = doc(db, 'users', user.uid);
        const snap    = await getDoc(userRef);

        let isFirstLogin = false;
        const referralCode = generateCode(user.uid);

        if (!snap.exists()) {
            isFirstLogin = true;
            await setDoc(userRef, {
                uid:          user.uid,
                name:         user.displayName,
                email:        user.email,
                photoURL:     user.photoURL,
                createdAt:    serverTimestamp(),
                coins:        200,
                highScore:    0,
                referralCode,
                referralCount: 0,
            });
        }

        return {
            uid:          user.uid,
            name:         user.displayName ?? 'Agent',
            email:        user.email,
            photoURL:     user.photoURL,
            isFirstLogin,
            referralCode: snap.exists() ? snap.data().referralCode : referralCode,
        };
    } catch (err) {
        console.error('[auth] signInWithGoogle failed:', err);
        return null;
    }
}

export async function signOutUser(): Promise<void> {
    if (!auth) return;
    await firebaseSignOut(auth);
}

export function onAuthChange(callback: (user: User | null) => void) {
    if (!auth) {
        callback(null);
        return () => {};
    }
    return onAuthStateChanged(auth, callback);
}

function generateCode(uid: string): string {
    return uid.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase().padEnd(6, 'X');
}
