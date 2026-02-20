'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useGameStore } from '@/store/gameStore';
import { SPEED_TIERS } from '@/engine/levelGenerator';

interface HUDProps {
    score: number;
    onPause: () => void;
}

// Map tier index → translation key
const TIER_KEYS = ['easy', 'normal', 'fast', 'hyper', 'void'] as const;

export default function HUD({ score, onPause }: HUDProps) {
    const t = useTranslations('hud');
    const { voidCoins, speedTier } = useGameStore();
    const prevTierRef = useRef(speedTier);
    const [tierFlash, setTierFlash] = useState(false);

    const tierInfo = SPEED_TIERS[speedTier];
    const tierLabel = t(`tiers.${TIER_KEYS[speedTier]}`);

    // Flash animation when tier changes
    useEffect(() => {
        if (prevTierRef.current !== speedTier && speedTier > 0) {
            setTierFlash(true);
            const tm = setTimeout(() => setTierFlash(false), 1200);
            prevTierRef.current = speedTier;
            return () => clearTimeout(tm);
        }
        prevTierRef.current = speedTier;
    }, [speedTier]);

    return (
        <>
            {/* HUD bar — top strip */}
            <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 pt-3 pb-2 pointer-events-none"
                 style={{ background: 'linear-gradient(to bottom, rgba(5,5,5,0.85) 0%, transparent 100%)' }}>

                {/* Left: SCORE */}
                <div className="flex flex-col items-start min-w-[80px]">
                    <span className="text-void-green/50 font-orbitron text-[8px] tracking-widest uppercase leading-none">
                        {t('score')}
                    </span>
                    <span className="font-orbitron font-black text-void-green text-xl leading-tight"
                          style={{ textShadow: '0 0 8px #36E27B' }}>
                        {String(score).padStart(5, '0')}
                    </span>
                </div>

                {/* Center: Tier badge + Pause */}
                <div className="flex flex-col items-center gap-1">
                    <div className="px-3 py-0.5 rounded-full border font-orbitron text-[8px] font-bold tracking-[0.15em] uppercase"
                         style={{
                             borderColor:     tierInfo.color,
                             color:           tierInfo.color,
                             backgroundColor: tierInfo.bgColor,
                             boxShadow:       tierFlash ? `0 0 16px ${tierInfo.color}` : `0 0 4px ${tierInfo.color}50`,
                             transform:       tierFlash ? 'scale(1.15)' : 'scale(1)',
                             transition:      'transform 0.3s ease, box-shadow 0.3s ease',
                         }}>
                        {tierLabel}
                    </div>
                    <button
                        className="pointer-events-auto w-7 h-7 flex items-center justify-center rounded border border-void-green/30 bg-void-black/60 active:scale-90 transition-transform"
                        onClick={onPause} aria-label={t('pause')}>
                        <span className="text-void-green text-[10px]">⏸</span>
                    </button>
                </div>

                {/* Right: COINS */}
                <div className="flex flex-col items-end min-w-[80px]">
                    <span className="text-void-green/50 font-orbitron text-[8px] tracking-widest uppercase leading-none">
                        {t('coins')}
                    </span>
                    <div className="flex items-center gap-1">
                        <span className="text-void-yellow text-xs leading-tight">◆</span>
                        <span className="font-orbitron font-bold text-void-yellow text-xl leading-tight"
                              style={{ textShadow: '0 0 6px #FFD700' }}>
                            {voidCoins.toLocaleString()}
                        </span>
                    </div>
                </div>
            </div>

            {/* Full-screen tier flash */}
            {tierFlash && (
                <div className="absolute inset-0 z-20 pointer-events-none"
                     style={{
                         background: `radial-gradient(ellipse at center, ${tierInfo.color}25 0%, transparent 70%)`,
                         animation: 'gvoidFadeOut 1.2s ease forwards',
                     }} />
            )}
            <style jsx>{`
                @keyframes gvoidFadeOut { 0% { opacity:1 } 100% { opacity:0 } }
            `}</style>
        </>
    );
}
