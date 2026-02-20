'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useGameStore } from '@/store/gameStore';
import { SPEED_TIERS, getTierForScore } from '@/engine/levelGenerator';

const GameCanvas = dynamic(() => import('@/components/game/GameCanvas'), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center w-full h-full bg-void-black">
            <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-void-green border-t-transparent animate-spin" />
                <span className="font-orbitron text-void-green/60 text-[10px] tracking-widest">LOADING VOID...</span>
            </div>
        </div>
    ),
});

import HUD from '@/components/ui/HUD';
import MainMenu from '@/components/ui/MainMenu';
import GameOver from '@/components/ui/GameOver';
import Leaderboard from '@/components/ui/Leaderboard';
import Shop from '@/components/ui/Shop';
import Settings from '@/components/ui/Settings';
import LoginScreen from '@/components/ui/LoginScreen';
import DailyMissions from '@/components/ui/DailyMissions';

type Screen = 'login' | 'menu' | 'game' | 'gameover' | 'leaderboard' | 'shop' | 'settings' | 'missions';

export default function Home() {
    const [screen, setScreen] = useState<Screen>('login');
    const [liveScore, setLiveScore] = useState(0);
    const scoreRef = useRef(0);

    const {
        startGame, pauseGame, resumeGame, resetGame,
        isPlaying, isPaused, isDead, hasUsedContinue,
        setSpeedTier, progressMission, setMissionProgress,
        highScore, checkAndResetMissions,
    } = useGameStore();

    // Check daily missions reset on app open
    useEffect(() => {
        checkAndResetMissions();
    }, [checkAndResetMissions]);

    // Detect "continue after ad" flow
    useEffect(() => {
        if (isDead === false && screen === 'gameover' && hasUsedContinue) {
            setScreen('game');
        }
    }, [isDead, screen, hasUsedContinue]);

    const handleLoginDone = useCallback(() => {
        setScreen('menu');
    }, []);

    const handlePlay = useCallback(() => {
        scoreRef.current = 0;
        setLiveScore(0);
        startGame();
        setScreen('game');
        // Mission: play today
        progressMission('play_today', 1);
        // Mission: play 3 times
        progressMission('play_3_times', 1);
    }, [startGame, progressMission]);

    const handleGameOver = useCallback(() => {
        const finalScore = scoreRef.current;
        // Mission: score milestones
        setMissionProgress('score_25', finalScore >= 25 ? 1 : 0);
        setMissionProgress('score_50', finalScore >= 50 ? 1 : 0);
        setMissionProgress('score_100', finalScore >= 100 ? 1 : 0);
        // Mission: reach hyper tier
        if (getTierForScore(finalScore) >= 3) {
            setMissionProgress('reach_hyper', 1);
        }
        // Mission: beat record
        if (finalScore > highScore) {
            setMissionProgress('beat_record', 1);
        }
        setScreen('gameover');
    }, [setMissionProgress, highScore]);

    const handleScoreUpdate = useCallback((s: number) => {
        scoreRef.current = s;
        setLiveScore(s);

        // Update speed tier in store for HUD badge
        const tier = getTierForScore(s);
        setSpeedTier(tier);
    }, [setSpeedTier]);

    const handleRetry = useCallback(() => {
        resetGame();
        handlePlay();
    }, [resetGame, handlePlay]);

    const handleMenu = useCallback(() => {
        resetGame();
        setScreen('menu');
        setLiveScore(0);
    }, [resetGame]);

    const handlePause = useCallback(() => {
        if (isPaused) resumeGame();
        else pauseGame();
    }, [isPaused, pauseGame, resumeGame]);

    return (
        <main
            className="relative w-full h-full overflow-hidden bg-void-black"
            style={{ maxWidth: '430px', margin: '0 auto' }}
        >
            {/* Login screen */}
            {screen === 'login' && <LoginScreen onContinue={handleLoginDone} />}

            {/* Game canvas (kept mounted during game/gameover for physics) */}
            {(screen === 'game' || screen === 'gameover') && (
                <div className="absolute inset-0">
                    <GameCanvas onGameOver={handleGameOver} onScoreUpdate={handleScoreUpdate} />
                    {screen === 'game' && isPlaying && (
                        <HUD score={liveScore} onPause={handlePause} />
                    )}
                    {isPaused && screen === 'game' && (
                        <div
                            className="absolute inset-0 z-30 flex items-center justify-center bg-void-black/70 backdrop-blur-sm"
                            onClick={handlePause}
                        >
                            <div className="flex flex-col items-center gap-4">
                                <span className="font-orbitron font-black text-void-green text-4xl" style={{ textShadow: '0 0 20px #36E27B' }}>
                                    PAUSED
                                </span>
                                <span className="font-orbitron text-void-green/50 text-xs tracking-widest">TAP TO RESUME</span>
                            </div>
                        </div>
                    )}
                    {screen === 'gameover' && (
                        <GameOver
                            score={scoreRef.current}
                            onRetry={handleRetry}
                            onMenu={handleMenu}
                            onShare={() => {}}
                        />
                    )}
                </div>
            )}

            {/* Non-game screens */}
            {screen === 'menu' && (
                <MainMenu
                    onPlay={handlePlay}
                    onLeaderboard={() => setScreen('leaderboard')}
                    onShop={() => setScreen('shop')}
                    onSettings={() => setScreen('settings')}
                    onMissions={() => setScreen('missions')}
                />
            )}
            {screen === 'leaderboard' && <Leaderboard onBack={() => setScreen('menu')} />}
            {screen === 'shop' && <Shop onBack={() => setScreen('menu')} />}
            {screen === 'settings' && <Settings onBack={() => setScreen('menu')} />}

            {/* Daily missions overlay */}
            {screen === 'missions' && <DailyMissions onClose={() => setScreen('menu')} />}
        </main>
    );
}
