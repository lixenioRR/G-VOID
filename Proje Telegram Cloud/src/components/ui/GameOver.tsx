'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useGameStore } from '@/store/gameStore';
import { showContinueAd } from '@/lib/adsgram';
import { getUser } from '@/lib/telegram';

interface GameOverProps {
    score: number;
    onRetry: () => void;
    onMenu: () => void;
    onShare: () => void;
}

export default function GameOver({ score, onRetry, onMenu, onShare }: GameOverProps) {
    const t = useTranslations('gameOver');
    const { highScore, hasUsedContinue, useContinue } = useGameStore();
    const [adLoading, setAdLoading] = useState(false);
    const isNewRecord = score >= highScore && score > 0;

    const handleWatchAd = async () => {
        if (adLoading || hasUsedContinue) return;
        setAdLoading(true);
        try {
            const watched = await showContinueAd();
            if (watched) {
                useContinue();
                // The parent component will detect isPlaying=true and resume
            }
        } finally {
            setAdLoading(false);
        }
    };

    return (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-void-black/92 backdrop-blur-sm animate-fade-in">
            {/* Corner brackets */}
            <div className="absolute top-8 left-8 w-10 h-10 border-t-2 border-l-2 border-void-red/60" />
            <div className="absolute top-8 right-8 w-10 h-10 border-t-2 border-r-2 border-void-red/60" />
            <div className="absolute bottom-8 left-8 w-10 h-10 border-b-2 border-l-2 border-void-red/60" />
            <div className="absolute bottom-8 right-8 w-10 h-10 border-b-2 border-r-2 border-void-red/60" />

            <div className="flex flex-col items-center gap-6 px-8 w-full max-w-xs animate-slide-up">
                {/* Title */}
                <div className="flex flex-col items-center gap-1">
                    <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-void-red/60 to-transparent" />
                    <h2
                        className="font-orbitron font-black text-5xl text-void-red tracking-widest"
                        style={{ textShadow: '0 0 20px #FF3A5C' }}
                    >
                        {t('title')}
                    </h2>
                    <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-void-red/60 to-transparent" />
                </div>

                {/* Scores */}
                <div className="w-full grid grid-cols-2 gap-3">
                    <div className="flex flex-col items-center p-3 rounded border border-void-green/20 bg-void-black/60">
                        <span className="font-orbitron text-void-green/50 text-[8px] tracking-widest uppercase">
                            {t('score')}
                        </span>
                        <span
                            className="font-orbitron font-black text-void-green text-3xl"
                            style={{ textShadow: '0 0 10px #36E27B' }}
                        >
                            {String(score).padStart(5, '0')}
                        </span>
                    </div>
                    <div className="flex flex-col items-center p-3 rounded border border-void-yellow/20 bg-void-black/60 relative">
                        {isNewRecord && (
                            <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[7px] font-orbitron bg-void-yellow text-void-black px-1.5 py-0.5 rounded-sm font-bold tracking-wider">
                                NEW RECORD!
                            </span>
                        )}
                        <span className="font-orbitron text-void-yellow/50 text-[8px] tracking-widest uppercase">
                            {t('bestScore')}
                        </span>
                        <span
                            className="font-orbitron font-black text-void-yellow text-3xl"
                            style={{ textShadow: '0 0 10px #FFD700' }}
                        >
                            {String(highScore).padStart(5, '0')}
                        </span>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="w-full flex flex-col gap-2">
                    {/* Watch Ad to Continue */}
                    {!hasUsedContinue && (
                        <button
                            id="btn-watch-ad"
                            onClick={handleWatchAd}
                            disabled={adLoading}
                            className="
                w-full py-3.5 rounded border border-void-purple/50 bg-void-purple/10
                font-orbitron font-bold text-void-purple-bright text-[11px] tracking-widest uppercase
                flex items-center justify-center gap-2
                active:scale-95 transition-all duration-100
                disabled:opacity-50 disabled:cursor-not-allowed
              "
                            style={{ boxShadow: '0 0 12px rgba(155,89,182,0.3)' }}
                        >
                            {adLoading ? (
                                <>
                                    <div className="w-4 h-4 rounded-full border-2 border-void-purple-bright border-t-transparent animate-spin" />
                                    LOADING AD...
                                </>
                            ) : (
                                <>▶ {t('continueAd')}</>
                            )}
                        </button>
                    )}

                    {/* Retry */}
                    <button
                        id="btn-retry"
                        onClick={onRetry}
                        className="
              w-full py-3.5 rounded bg-void-green
              font-orbitron font-black text-void-black text-sm tracking-widest
              active:scale-95 transition-all duration-100
            "
                        style={{ boxShadow: '0 0 16px rgba(54,226,123,0.6)' }}
                    >
                        {t('retry')}
                    </button>

                    {/* Share + Menu */}
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            id="btn-share-score"
                            onClick={onShare}
                            className="
                py-3 rounded border border-void-blue/40 bg-void-blue/5
                font-orbitron text-void-blue text-[10px] tracking-widest uppercase
                active:scale-95 transition-all
              "
                        >
                            {t('share')}
                        </button>
                        <button
                            id="btn-main-menu"
                            onClick={onMenu}
                            className="
                py-3 rounded border border-void-green/20 bg-void-black/60
                font-orbitron text-void-green/60 text-[10px] tracking-widest uppercase
                active:scale-95 transition-all
              "
                        >
                            {t('menu')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
