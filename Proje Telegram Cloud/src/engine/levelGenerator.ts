import { spawnObstacle, scrollObstacles, type Obstacle } from './obstacles';

export interface LevelState {
    obstacles: Obstacle[];
    worldX: number;
    nextSpawnX: number;
    speed: number; // px per frame at 60fps
    score: number;
    speedTier: SpeedTier;
}

export type SpeedTier = 0 | 1 | 2 | 3 | 4;

// Tier thresholds and properties
export const SPEED_TIERS = [
    { tier: 0, label: 'EASY',   minScore: 0,  speed: 2.0, color: '#36E27B', bgColor: 'rgba(54,226,123,0.15)' },
    { tier: 1, label: 'NORMAL', minScore: 10, speed: 2.8, color: '#00D4FF', bgColor: 'rgba(0,212,255,0.15)' },
    { tier: 2, label: 'FAST',   minScore: 25, speed: 3.6, color: '#FFD700', bgColor: 'rgba(255,215,0,0.15)' },
    { tier: 3, label: 'HYPER',  minScore: 50, speed: 4.6, color: '#FF6B00', bgColor: 'rgba(255,107,0,0.15)' },
    { tier: 4, label: '⚠ VOID', minScore: 80, speed: 5.8, color: '#FF3A5C', bgColor: 'rgba(255,58,92,0.20)' },
] as const;

export function getTierForScore(score: number): SpeedTier {
    if (score >= 80) return 4;
    if (score >= 50) return 3;
    if (score >= 25) return 2;
    if (score >= 10) return 1;
    return 0;
}

export function getSpeedForScore(score: number): number {
    const tier = getTierForScore(score);
    return SPEED_TIERS[tier].speed;
}

export function createLevelState(): LevelState {
    return {
        obstacles: [],
        worldX: 0,
        nextSpawnX: 900, // First obstacle appears after 900px — gives player time to orient
        speed: SPEED_TIERS[0].speed,
        score: 0,
        speedTier: 0,
    };
}

interface UpdateConfig {
    canvasWidth: number;
    canvasHeight: number;
    wallThickness: number;
    playerX: number;
}

/**
 * Advance the level by one frame.
 * Handles spawning, scrolling, and recycling off-screen obstacles.
 * Returns the updated state (mutates in place for performance).
 */
export function updateLevel(state: LevelState, config: UpdateConfig): LevelState {
    const { canvasWidth, canvasHeight, wallThickness } = config;

    // Update speed and tier based on score
    const newTier = getTierForScore(state.score);
    const speed = getSpeedForScore(state.score);
    state.speed = speed;
    state.speedTier = newTier;
    state.worldX += speed;

    // Scroll existing obstacles
    const offScreen = scrollObstacles(state.obstacles, speed);
    for (const o of offScreen) {
        o.active = false;
    }

    // Spawn new obstacle when player approaches nextSpawnX
    if (state.worldX >= state.nextSpawnX) {
        const newObstacle = spawnObstacle({
            canvasHeight,
            wallThickness,
            spawnX: canvasWidth + 60,
            score: state.score,
        });
        state.obstacles.push(newObstacle);

        // Dynamic gap between obstacles: narrower at higher scores
        const progressRatio = Math.min(1, state.score / 100);
        const gapDist = 500 - (500 - 340) * progressRatio;
        state.nextSpawnX = state.worldX + gapDist;
    }

    // Clean up inactive obstacles
    state.obstacles = state.obstacles.filter((o) => o.active);

    return state;
}

export function resetLevel(): LevelState {
    return createLevelState();
}

// Keep for backward compat
export function getSpeedMultiplier(score: number): number {
    return getSpeedForScore(score);
}
