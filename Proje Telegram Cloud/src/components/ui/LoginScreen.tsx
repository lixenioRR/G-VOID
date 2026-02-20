'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { signInWithGoogle } from '@/lib/auth';
import { useGameStore } from '@/store/gameStore';

interface LoginScreenProps {
    onContinue: () => void;
}

export default function LoginScreen({ onContinue }: LoginScreenProps) {
    const t = useTranslations('login');
    const { setUser } = useGameStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGoogle = async () => {
        setLoading(true);
        setError('');
        try {
            const user = await signInWithGoogle();
            if (user) {
                setUser(
                    { uid: user.uid, name: user.name, email: user.email, photoURL: user.photoURL },
                    user.isFirstLogin
                );
                onContinue();
            } else {
                setError('Login failed. Please try again.');
            }
        } catch {
            setError('An error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const handleGuest = () => {
        setUser(null);
        onContinue();
    };

    return (
        <div className="relative flex flex-col items-center justify-between w-full h-full px-8 py-16 bg-void-black overflow-hidden select-none">
            {/* Cyber grid */}
            <div className="absolute inset-0" style={{
                backgroundImage: `linear-gradient(rgba(54,226,123,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(54,226,123,0.03) 1px, transparent 1px)`,
                backgroundSize: '40px 40px',
            }} />
            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-void-green/40" />
            <div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-void-green/40" />
            <div className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-void-green/40" />
            <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-void-green/40" />

            {/* Logo */}
            <div className="z-10 flex flex-col items-center gap-3">
                <div className="relative">
                    <div className="absolute inset-0 blur-3xl opacity-40 bg-void-green rounded-full scale-150" />
                    <h1 className="relative font-orbitron font-black text-6xl tracking-tighter text-void-green"
                        style={{ textShadow: '0 0 20px #36E27B, 0 0 60px #36E27B' }}>
                        G-VOID
                    </h1>
                </div>
                <p className="font-orbitron text-void-green/40 text-[10px] tracking-widest uppercase text-center">
                    {t('title')}
                </p>
            </div>

            {/* Auth options */}
            <div className="z-10 w-full flex flex-col gap-4">
                <div className="text-center mb-2">
                    <p className="font-orbitron text-white text-base font-bold mb-1">{t('welcome')}</p>
                    <p className="font-inter text-void-green/50 text-xs">{t('subtitle')}</p>
                </div>

                {/* First login bonus badge */}
                <div className="flex items-center justify-center gap-2 py-2 px-4 rounded border border-void-yellow/30 bg-void-yellow/5 mb-1">
                    <span className="text-void-yellow text-lg">◆</span>
                    <span className="font-orbitron text-void-yellow text-[10px] tracking-widest">{t('bonus')}</span>
                </div>

                {/* Google Sign-In */}
                <button id="btn-google-signin" onClick={handleGoogle} disabled={loading}
                    className="w-full py-4 px-6 rounded border border-void-green/40 bg-void-green/10
                               flex items-center justify-center gap-3
                               font-orbitron font-bold text-white text-sm tracking-widest
                               active:scale-95 transition-all disabled:opacity-50
                               hover:border-void-green/70 hover:bg-void-green/20"
                    style={{ boxShadow: '0 0 15px rgba(54,226,123,0.2)' }}>
                    {loading ? (
                        <div className="w-5 h-5 rounded-full border-2 border-void-green border-t-transparent animate-spin" />
                    ) : (
                        <>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                            {t('googleButton')}
                        </>
                    )}
                </button>

                {error && <p className="text-center font-inter text-red-400 text-xs">{error}</p>}

                <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-void-green/20" />
                    <span className="font-orbitron text-void-green/30 text-[9px] tracking-widest">{t('or')}</span>
                    <div className="flex-1 h-px bg-void-green/20" />
                </div>

                <button id="btn-guest" onClick={handleGuest}
                    className="w-full py-3 rounded border border-white/10 bg-transparent
                               font-orbitron text-white/50 text-xs tracking-widest uppercase
                               active:scale-95 transition-all hover:border-white/20 hover:text-white/70">
                    {t('guestButton')}
                </button>
                <p className="text-center font-inter text-white/30 text-[9px]">{t('guestNote')}</p>
            </div>
            <div />
        </div>
    );
}
