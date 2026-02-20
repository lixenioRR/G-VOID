/**
 * Obstacle system for G-VOID.
 * All obstacles scroll leftward — the world moves, the player stays at ~20% x.
 * Uses a simple object pool to avoid GC pressure.
 */

export type ObstacleType = 'laser' | 'mine' | 'corridor';

export interface Obstacle {
    id: number;
    type: ObstacleType;
    /** Left edge of the obstacle in world space */
    x: number;
    /** Width of the obstacle body */
    width: number;
    /** Vertical top position (for lasers: top rect; for corridor: top wall bottom) */
    topY: number;
    /** Vertical bottom position (for lasers: bottom rect; for corridor: bottom wall top) */
    bottomY: number;
    /** Gap size between top and bottom (passable space height) */
    gapSize: number;
    /** Mine: animated Y offset */
    mineY?: number;
    mineAmplitude?: number;
    mineFrequency?: number;
    minePhase?: number;
    /** Whether obstacle has been scored (player passed it) */
    scored: boolean;
    /** Whether it's active/visible */
    active: boolean;
}

let _idCounter = 0;
const _pool: Obstacle[] = [];

function acquireObstacle(): Obstacle {
    const inactive = _pool.find((o) => !o.active);
    if (inactive) {
        inactive.active = true;
        inactive.scored = false;
        return inactive;
    }
    const fresh: Obstacle = {
        id: _idCounter++,
        type: 'laser',
        x: 0,
        width: 20,
        topY: 0,
        bottomY: 0,
        gapSize: 0,
        scored: false,
        active: true,
    };
    _pool.push(fresh);
    return fresh;
}

export function releaseObstacle(o: Obstacle): void {
    o.active = false;
}

export function clearPool(): void {
    _pool.length = 0;
}

interface SpawnConfig {
    canvasHeight: number;
    wallThickness: number;
    spawnX: number;
    score: number;
}

/**
 * Difficulty scaling:
 * - Gap shrinks from 280px to 140px as score grows (was 220→100)
 * - Mine probability increases after score 20 (was 10)
 * - Corridor appears after score 50 (was 30)
 */
function getDifficulty(score: number): { gap: number; type: ObstacleType } {
    // Gap starts at 280px wide, floors at 140px — much more forgiving early on
    const gap = Math.max(140, 280 - score * 1.2);
    let type: ObstacleType;
    const r = Math.random();
    if (score < 20) {
        // First 20 points: only lasers (was 10)
        type = 'laser';
    } else if (score < 50) {
        // Score 20-50: lasers + occasional mines (was 10-30)
        type = r < 0.70 ? 'laser' : 'mine';
    } else {
        // Score 50+: full mix (was 30+)
        if (r < 0.4) type = 'laser';
        else if (r < 0.75) type = 'mine';
        else type = 'corridor';
    }
    return { gap, type };
}

export function spawnObstacle(config: SpawnConfig): Obstacle {
    const { canvasHeight, wallThickness, spawnX, score } = config;
    const { gap, type } = getDifficulty(score);

    const playableHeight = canvasHeight - wallThickness * 2;
    const topY = wallThickness + Math.random() * (playableHeight - gap);
    const bottomY = topY + gap;

    const o = acquireObstacle();
    o.type = type;
    o.x = spawnX;
    o.topY = topY;
    o.bottomY = bottomY;
    o.gapSize = gap;
    o.width = type === 'corridor' ? 40 : type === 'laser' ? 12 : 0;

    if (type === 'mine') {
        o.mineY = topY + gap / 2;
        o.mineAmplitude = (gap / 2) * 0.55;
        o.mineFrequency = 1.2 + Math.random() * 0.8;
        o.minePhase = Math.random() * Math.PI * 2;
    }

    return o;
}

/**
 * Scroll all active obstacles leftward by `dx`.
 * Returns obstacles that have gone off-screen (x < -200).
 */
export function scrollObstacles(obstacles: Obstacle[], dx: number): Obstacle[] {
    const offScreen: Obstacle[] = [];
    for (const o of obstacles) {
        if (!o.active) continue;
        o.x -= dx;
        if (o.x < -200) {
            offScreen.push(o);
        }
    }
    return offScreen;
}

/**
 * Update mine Y positions based on time.
 */
export function updateMines(obstacles: Obstacle[], timeMs: number): void {
    for (const o of obstacles) {
        if (!o.active || o.type !== 'mine') continue;
        const t = timeMs / 1000;
        o.mineY =
            o.topY +
            o.gapSize / 2 +
            Math.sin(t * (o.mineFrequency ?? 1) * Math.PI * 2 + (o.minePhase ?? 0)) *
            (o.mineAmplitude ?? 40);
    }
}

/**
 * Check collision between player circle and all active obstacles.
 * Returns true if any collision.
 */
export function checkCollisions(
    obstacles: Obstacle[],
    playerX: number,
    playerY: number,
    playerRadius: number
): boolean {
    for (const o of obstacles) {
        if (!o.active) continue;

        if (o.type === 'laser') {
            // Top laser rect: from wallThickness to o.topY
            // Bottom laser rect: from o.bottomY to canvasHeight - wallThickness
            const laserLeft = o.x;
            const laserRight = o.x + o.width;
            if (playerX + playerRadius > laserLeft && playerX - playerRadius < laserRight) {
                // Top hit
                if (playerY - playerRadius < o.topY) return true;
                // Bottom hit
                if (playerY + playerRadius > o.bottomY) return true;
            }
        } else if (o.type === 'mine') {
            const mineX = o.x;
            const mineY = o.mineY ?? o.topY + o.gapSize / 2;
            const mineRadius = 18;
            const dx = playerX - mineX;
            const dy = playerY - mineY;
            if (dx * dx + dy * dy < (playerRadius + mineRadius) ** 2) return true;
        } else if (o.type === 'corridor') {
            const left = o.x;
            const right = o.x + o.width;
            if (playerX + playerRadius > left && playerX - playerRadius < right) {
                if (playerY - playerRadius < o.topY) return true;
                if (playerY + playerRadius > o.bottomY) return true;
            }
        }
    }
    return false;
}

/**
 * Mark obstacles as scored if player has passed them.
 * Returns count of newly scored obstacles.
 */
export function scoreObstacles(obstacles: Obstacle[], playerX: number): number {
    let count = 0;
    for (const o of obstacles) {
        if (!o.active || o.scored) continue;
        if (playerX > o.x + o.width) {
            o.scored = true;
            count++;
        }
    }
    return count;
}
