import type { Obstacle } from '@/engine/obstacles';
import { PLAYER_RADIUS } from '@/engine/physics';

const BG_COLOR = '#050505';
const WALL_COLOR = '#0a1a10';
const GRID_COLOR = 'rgba(54,226,123,0.04)';

interface DrawConfig {
    width: number;
    height: number;
    wallThickness: number;
    playerX: number;
    playerY: number;
    playerColor: string;
    playerGlow: string;
    isGravityNormal: boolean;
}

export class Renderer {
    private ctx: CanvasRenderingContext2D;
    private gridOffset = 0;

    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
    }

    /** Call once per frame before drawing anything. */
    clear(width: number, height: number): void {
        this.ctx.fillStyle = BG_COLOR;
        this.ctx.fillRect(0, 0, width, height);
    }

    /** Draw scrolling background grid. */
    drawGrid(scrollSpeed: number, width: number, height: number): void {
        this.gridOffset = (this.gridOffset + scrollSpeed) % 40;
        this.ctx.strokeStyle = GRID_COLOR;
        this.ctx.lineWidth = 1;

        this.ctx.beginPath();
        for (let x = -this.gridOffset; x < width + 40; x += 40) {
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, height);
        }
        for (let y = 0; y < height; y += 40) {
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(width, y);
        }
        this.ctx.stroke();
    }

    /** Draw top and bottom walls. */
    drawWalls(width: number, height: number, wallThickness: number): void {
        // Top wall
        this.ctx.fillStyle = WALL_COLOR;
        this.ctx.fillRect(0, 0, width, wallThickness);
        // Bottom wall
        this.ctx.fillRect(0, height - wallThickness, width, wallThickness);

        // Wall edge glow line
        this.ctx.strokeStyle = 'rgba(54,226,123,0.5)';
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.ctx.moveTo(0, wallThickness);
        this.ctx.lineTo(width, wallThickness);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(0, height - wallThickness);
        this.ctx.lineTo(width, height - wallThickness);
        this.ctx.stroke();
    }

    /** Draw all active obstacles. */
    drawObstacles(obstacles: Obstacle[], wallThickness: number, canvasHeight: number): void {
        for (const o of obstacles) {
            if (!o.active) continue;

            if (o.type === 'laser') {
                this.drawLaser(o, wallThickness, canvasHeight);
            } else if (o.type === 'mine') {
                this.drawMine(o);
            } else if (o.type === 'corridor') {
                this.drawCorridor(o, wallThickness, canvasHeight);
            }
        }
    }

    private drawLaser(o: Obstacle, wallThickness: number, canvasHeight: number): void {
        const { ctx } = this;
        const lx = o.x;
        const lw = o.width;

        // Top laser
        ctx.fillStyle = 'rgba(255,58,92,0.9)';
        ctx.fillRect(lx, wallThickness, lw, o.topY - wallThickness);

        // Bottom laser
        ctx.fillRect(lx, o.bottomY, lw, canvasHeight - wallThickness - o.bottomY);

        // Glow
        ctx.shadowColor = '#FF3A5C';
        ctx.shadowBlur = 14;
        ctx.fillStyle = '#FF3A5C';
        ctx.fillRect(lx, wallThickness, lw, o.topY - wallThickness);
        ctx.fillRect(lx, o.bottomY, lw, canvasHeight - wallThickness - o.bottomY);
        ctx.shadowBlur = 0;

        // Gap indicator line (the safe corridor)
        ctx.strokeStyle = 'rgba(54,226,123,0.15)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.moveTo(lx + lw / 2, o.topY);
        ctx.lineTo(lx + lw / 2, o.bottomY);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    private drawMine(o: Obstacle): void {
        const { ctx } = this;
        const mx = o.x;
        const my = o.mineY ?? o.topY + o.gapSize / 2;
        const r = 18;

        // Outer ring
        ctx.strokeStyle = '#FF3A5C';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#FF3A5C';
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.arc(mx, my, r, 0, Math.PI * 2);
        ctx.stroke();

        // Inner fill
        ctx.fillStyle = 'rgba(255,58,92,0.25)';
        ctx.fill();
        ctx.shadowBlur = 0;

        // Spikes (8-point star)
        const spikes = 8;
        ctx.strokeStyle = 'rgba(255,58,92,0.7)';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < spikes; i++) {
            const angle = (i / spikes) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(mx + Math.cos(angle) * r, my + Math.sin(angle) * r);
            ctx.lineTo(mx + Math.cos(angle) * (r + 8), my + Math.sin(angle) * (r + 8));
            ctx.stroke();
        }
    }

    private drawCorridor(o: Obstacle, wallThickness: number, canvasHeight: number): void {
        const { ctx } = this;
        const cx = o.x;
        const cw = o.width;

        ctx.fillStyle = 'rgba(0,212,255,0.8)';
        ctx.shadowColor = '#00D4FF';
        ctx.shadowBlur = 12;

        // Top wall
        ctx.fillRect(cx, wallThickness, cw, o.topY - wallThickness);
        // Bottom wall
        ctx.fillRect(cx, o.bottomY, cw, canvasHeight - wallThickness - o.bottomY);
        ctx.shadowBlur = 0;
    }

    /** Draw the player character. */
    drawPlayer(cfg: DrawConfig): void {
        const { ctx } = this;
        const { playerX, playerY, playerColor, playerGlow } = cfg;

        // Outer glow ring
        ctx.shadowColor = playerGlow;
        ctx.shadowBlur = 28;
        ctx.beginPath();
        ctx.arc(playerX, playerY, PLAYER_RADIUS + 4, 0, Math.PI * 2);
        ctx.strokeStyle = playerColor;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Core body
        const gradient = ctx.createRadialGradient(
            playerX - 3, playerY - 3, 2,
            playerX, playerY, PLAYER_RADIUS
        );
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.35, playerColor);
        gradient.addColorStop(1, 'rgba(0,0,0,0.4)');

        ctx.shadowColor = playerGlow;
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(playerX, playerY, PLAYER_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Gravity indicator arrow
        const arrowDir = cfg.isGravityNormal ? 1 : -1;
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.beginPath();
        ctx.moveTo(playerX, playerY + arrowDir * 6);
        ctx.lineTo(playerX - 4, playerY - arrowDir * 3);
        ctx.lineTo(playerX + 4, playerY - arrowDir * 3);
        ctx.closePath();
        ctx.fill();
    }

    /** Flash red overlay on death. */
    drawDeathFlash(width: number, height: number, alpha: number): void {
        if (alpha <= 0) return;
        this.ctx.fillStyle = `rgba(255,58,92,${alpha})`;
        this.ctx.fillRect(0, 0, width, height);
    }

    /** Draw tap prompt on first launch. */
    drawTapPrompt(width: number, height: number, visible: boolean): void {
        if (!visible) return;
        const { ctx } = this;
        ctx.fillStyle = 'rgba(54,226,123,0.7)';
        ctx.font = 'bold 14px Orbitron, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('TAP TO FLIP GRAVITY', width / 2, height / 2 + 60);

        // Animated blinking dot row
        const t = performance.now() / 500;
        for (let i = 0; i < 3; i++) {
            const alpha = 0.3 + 0.7 * Math.abs(Math.sin(t + i));
            ctx.fillStyle = `rgba(54,226,123,${alpha})`;
            ctx.beginPath();
            ctx.arc(width / 2 - 16 + i * 16, height / 2 + 80, 4, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}
