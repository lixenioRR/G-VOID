'use client';

import { useEffect, useRef, useCallback } from 'react';
import { createPhysicsWorld, clampPlayer, PLAYER_RADIUS } from '@/engine/physics';
import { createLevelState, updateLevel } from '@/engine/levelGenerator';
import {
    checkCollisions,
    updateMines,
    scoreObstacles,
} from '@/engine/obstacles';
import { PlayerTrail } from './PlayerTrail';
import { Renderer } from './Renderer';
import { useGameStore, SKINS, TRAILS } from '@/store/gameStore';
import { hapticFeedback } from '@/lib/telegram';

const WALL_THICKNESS = 32;

interface GameCanvasProps {
    onGameOver: () => void;
    onScoreUpdate: (score: number) => void;
}

export default function GameCanvas({ onGameOver, onScoreUpdate }: GameCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rafRef    = useRef<number>(0);
    const isRunning = useRef(false);

    // ─── Stable refs for ALL values that change during gameplay ───────────────
    // These prevent useEffect from restarting the game loop when they change.
    const isPausedRef      = useRef(false);
    const hapticEnabledRef = useRef(true);
    const deathFlashRef    = useRef(0);
    // Callback refs — so changing parent callbacks never restarts the game
    const onGameOverRef    = useRef(onGameOver);
    const onScoreUpdateRef = useRef(onScoreUpdate);
    // Store action refs — Zustand actions are stable but using refs is extra safe
    const setScoreRef      = useRef<(s: number) => void>(() => {});
    const triggerDeathRef  = useRef<() => void>(() => {});
    const addCoinsRef      = useRef<(n: number) => void>(() => {});

    const {
        currentSkin,
        currentTrail,
        isPaused,
        isPlaying,
        setScore,
        triggerDeath,
        addCoins,
        hapticEnabled,
    } = useGameStore();

    // Keep all refs in sync on every render — NEVER triggers useEffect
    isPausedRef.current      = isPaused;
    hapticEnabledRef.current = hapticEnabled;
    onGameOverRef.current    = onGameOver;
    onScoreUpdateRef.current = onScoreUpdate;
    setScoreRef.current      = setScore;
    triggerDeathRef.current  = triggerDeath;
    addCoinsRef.current      = addCoins;

    const getSkinDef = useCallback(() =>
        SKINS.find((s) => s.id === currentSkin) ?? SKINS[0], [currentSkin]);
    const getTrailDef = useCallback(() =>
        TRAILS.find((t) => t.id === currentTrail) ?? TRAILS[0], [currentTrail]);

    useEffect(() => {
        if (!isPlaying) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        const resize = () => {
            canvas.width  = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        const W = canvas.width;
        const H = canvas.height;

        const physics    = createPhysicsWorld({ width: W, height: H, wallThickness: WALL_THICKNESS });
        const levelState = createLevelState();
        const trail      = new PlayerTrail(getTrailDef().color);
        const renderer   = new Renderer(ctx);

        let score          = 0;
        let gameOver       = false;
        let startTime: number | null = null;
        let showTapPrompt  = true;
        let tapPromptTimer = 3000;

        isRunning.current = true;

        const handleTap = (e: PointerEvent) => {
            e.preventDefault();
            if (gameOver || isPausedRef.current) return;
            showTapPrompt = false;
            physics.flipGravity();
            if (hapticEnabledRef.current) hapticFeedback('light');
        };
        canvas.addEventListener('pointerdown', handleTap, { passive: false });

        const loop = (timestamp: number) => {
            if (!isRunning.current) return;

            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;

            // Paused: keep alive, don't advance
            if (isPausedRef.current) {
                rafRef.current = requestAnimationFrame(loop);
                return;
            }

            const playerX = W * 0.2;
            clampPlayer(physics.player, H, WALL_THICKNESS);

            updateLevel(levelState, {
                canvasWidth:   W,
                canvasHeight:  H,
                wallThickness: WALL_THICKNESS,
                playerX,
            });

            updateMines(levelState.obstacles, elapsed);

            const hit = checkCollisions(
                levelState.obstacles,
                playerX,
                physics.player.position.y,
                PLAYER_RADIUS - 2
            );

            const newPoints = scoreObstacles(levelState.obstacles, playerX);
            if (newPoints > 0) {
                score += newPoints;
                levelState.score = score;
                // Use refs — calling store actions does NOT restart the loop
                setScoreRef.current(score);
                onScoreUpdateRef.current(score);
                if (score % 5 === 0) addCoinsRef.current(1);
            }

            if (showTapPrompt) {
                tapPromptTimer -= 16;
                if (tapPromptTimer <= 0) showTapPrompt = false;
            }

            if (deathFlashRef.current > 0) {
                deathFlashRef.current -= 0.04;
            }

            if (hit && !gameOver) {
                gameOver          = true;
                isRunning.current = false;
                deathFlashRef.current = 0.8;
                triggerDeathRef.current();
                if (hapticEnabledRef.current) hapticFeedback('heavy');

                renderer.clear(W, H);
                renderer.drawGrid(0, W, H);
                renderer.drawWalls(W, H, WALL_THICKNESS);
                renderer.drawObstacles(levelState.obstacles, WALL_THICKNESS, H);
                trail.draw(ctx);
                renderer.drawPlayer({
                    width: W, height: H, wallThickness: WALL_THICKNESS,
                    playerX,
                    playerY: physics.player.position.y,
                    playerColor: getSkinDef().color,
                    playerGlow:  getSkinDef().glowColor,
                    isGravityNormal: physics.isGravityNormal(),
                });
                renderer.drawDeathFlash(W, H, 0.6);
                physics.destroy();
                onGameOverRef.current(); // use ref — never stale, never triggers effect
                return;
            }

            // Draw frame
            renderer.clear(W, H);
            renderer.drawGrid(levelState.speed, W, H);
            renderer.drawWalls(W, H, WALL_THICKNESS);
            renderer.drawObstacles(levelState.obstacles, WALL_THICKNESS, H);

            trail.setColor(getTrailDef().color);
            trail.push(playerX, physics.player.position.y);
            trail.draw(ctx);

            renderer.drawPlayer({
                width: W, height: H, wallThickness: WALL_THICKNESS,
                playerX,
                playerY: physics.player.position.y,
                playerColor: getSkinDef().color,
                playerGlow:  getSkinDef().glowColor,
                isGravityNormal: physics.isGravityNormal(),
            });

            renderer.drawDeathFlash(W, H, Math.max(0, deathFlashRef.current));
            renderer.drawTapPrompt(W, H, showTapPrompt);

            rafRef.current = requestAnimationFrame(loop);
        };

        rafRef.current = requestAnimationFrame(loop);

        return () => {
            isRunning.current = false;
            cancelAnimationFrame(rafRef.current);
            canvas.removeEventListener('pointerdown', handleTap);
            window.removeEventListener('resize', resize);
            physics.destroy();
        };
    }, [
        // ONLY these should restart the game: starting a new game, switching skin/trail
        isPlaying,
        currentSkin,
        currentTrail,
        getSkinDef,
        getTrailDef,
        // Everything else (isPaused, hapticEnabled, onGameOver, onScoreUpdate,
        // setScore, triggerDeath, addCoins) is read via refs — NOT listed here.
    ]);

    return (
        <canvas
            ref={canvasRef}
            className="w-full h-full block touch-none select-none"
            style={{ imageRendering: 'pixelated' }}
            aria-label="G-VOID Game Canvas"
        />
    );
}
