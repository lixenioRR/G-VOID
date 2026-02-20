'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useGameStore } from '@/store/gameStore';
import { shareReferralLink } from '@/lib/referral';
import { signOutUser } from '@/lib/auth';

interface MainMenuProps {
    onPlay: () => void;
    onLeaderboard: () => void;
    onShop: () => void;
    onSettings: () => void;
    onMissions: () => void;
}

export default function MainMenu({ onPlay, onLeaderboard, onShop, onSettings, onMissions }: MainMenuProps) {
    const t  = useTranslations('menu');
    const th = useTranslations('hud');
    const { highScore, voidCoins, user, clearUser, dailyMissions } = useGameStore();
    const [shareResult, setShareResult] = useState('');

    const pendingMissions = dailyMissions.filter((m) => m.completed && !m.claimed).length;

    const handleShare = async () => {
        const code = user?.referralCode ?? 'GVOID';
        try {
            await shareReferralLink(code);
            setShareResult(t('referral.copied'));
        } catch {
            setShareResult(t('referral.failed'));
        }
        setTimeout(() => setShareResult(''), 3000);
    };

    const handleSignOut = async () => {
        await signOutUser();
        clearUser();
    };

    return (
        <div className="relative flex flex-col items-center justify-between w-full h-full px-6 py-10 overflow-hidden select-none">
            {/* Animated scan line */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="animate-scan-line absolute w-full h-[2px] bg-void-green/10" />
            </div>
            {/* Cyber grid */}
            <div className="absolute inset-0" style={{
                backgroundImage: `linear-gradient(rgba(54,226,123,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(54,226,123,0.04) 1px, transparent 1px)`,
                backgroundSize: '40px 40px',
            }} />

            {/* Top: user profile + coins */}
            <div className="z-10 w-full flex items-center justify-between animate-fade-in">
                <div className="flex items-center gap-2">
                    {user?.photoURL ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={user.photoURL} alt="avatar"
                            className="w-8 h-8 rounded-full border border-void-green/40" />
                    ) : (
                        <div className="w-8 h-8 rounded-full border border-void-green/40 bg-void-green/10 flex items-center justify-center">
                            <span className="text-void-green text-xs font-orbitron">
                                {user ? user.name[0].toUpperCase() : '?'}
                            </span>
                        </div>
                    )}
                    <div>
                        <p className="font-orbitron text-white text-[10px] font-bold leading-none">
                            {user?.name ?? t('guest')}
                        </p>
                        {user && (
                            <button onClick={handleSignOut}
                                className="font-inter text-void-green/30 text-[8px] hover:text-void-green/60 transition-colors">
                                {t('signOut')}
                            </button>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-void-green/20 bg-void-black/60">
                    <span className="text-void-yellow text-sm">◆</span>
                    <span className="font-orbitron font-bold text-void-yellow text-sm">{voidCoins.toLocaleString()}</span>
                </div>
            </div>

            {/* Center: Logo + score */}
            <div className="z-10 flex flex-col items-center gap-4 animate-slide-up">
                <div className="relative">
                    <div className="absolute inset-0 blur-3xl opacity-40 bg-void-green rounded-full scale-150" />
                    <h1 className="relative font-orbitron font-black text-7xl tracking-tighter text-void-green animate-pulse-neon"
                        style={{ textShadow: '0 0 20px #36E27B, 0 0 60px #36E27B' }}>
                        G-VOID
                    </h1>
                </div>
                <p className="font-inter text-void-green/50 text-xs text-center italic max-w-[240px]">{t('motto')}</p>
                <div className="flex flex-col items-center gap-1 mt-2">
                    <span className="font-orbitron text-void-green/40 text-[9px] tracking-widest uppercase">{t('bestScore')}</span>
                    <span className="font-orbitron font-black text-void-green text-4xl"
                        style={{ textShadow: '0 0 10px #36E27B' }}>
                        {String(highScore).padStart(5, '0')}
                    </span>
                </div>
                <button id="btn-play" onClick={onPlay}
                    className="mt-4 px-12 py-4 font-orbitron font-black text-void-black text-lg tracking-widest bg-void-green rounded-sm relative overflow-hidden transition-all duration-150 active:scale-95 animate-glow-pulse"
                    style={{ boxShadow: '0 0 20px #36E27B, 0 0 40px rgba(54,226,123,0.4)' }}>
                    <span className="relative z-10">{t('play')}</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />
                </button>
            </div>

            {/* Bottom navigation */}
            <div className="z-10 w-full flex flex-col gap-3 animate-fade-in">
                <div className="grid grid-cols-4 gap-2">
                    {/* Missions with badge */}
                    <button id="btn-missions" onClick={onMissions}
                        className="relative flex flex-col items-center gap-1 py-3 rounded border border-void-green/20 bg-void-black/60 backdrop-blur-sm font-orbitron text-[9px] text-void-green/70 tracking-widest uppercase active:scale-95 transition-all hover:border-void-green/50">
                        {pendingMissions > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-void-green font-orbitron font-black text-void-black text-[8px] flex items-center justify-center">
                                {pendingMissions}
                            </span>
                        )}
                        <span className="text-xl">📋</span>
                        {t('missions')}
                    </button>
                    {[
                        { label: t('leaderboard'), icon: '🏆', onClick: onLeaderboard, id: 'btn-leaderboard' },
                        { label: t('shop'), icon: '🛒', onClick: onShop, id: 'btn-shop' },
                        { label: t('settings'), icon: '⚙️', onClick: onSettings, id: 'btn-settings' },
                    ].map((item) => (
                        <button key={item.id} id={item.id} onClick={item.onClick}
                            className="flex flex-col items-center gap-1 py-3 rounded border border-void-green/20 bg-void-black/60 backdrop-blur-sm font-orbitron text-[9px] text-void-green/70 tracking-widest uppercase active:scale-95 transition-all hover:border-void-green/50">
                            <span className="text-xl">{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* Referral banner */}
                <button id="btn-referral" onClick={handleShare}
                    className="w-full py-3 px-4 rounded border border-void-yellow/30 bg-void-yellow/5 flex items-center justify-between active:scale-95 transition-all">
                    <div className="flex flex-col items-start">
                        <span className="font-orbitron text-void-yellow font-bold text-[10px] tracking-widest">
                            {t('referral.button')}
                        </span>
                        <span className="font-inter text-void-yellow/60 text-[9px]">
                            {shareResult || (user?.referralCode
                                ? t('referral.code', { code: user.referralCode })
                                : t('referral.description')
                            )}
                        </span>
                    </div>
                    <span className="text-void-yellow text-xl">→</span>
                </button>
            </div>

            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-void-green/40" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-void-green/40" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-void-green/40" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-void-green/40" />
        </div>
    );
}
