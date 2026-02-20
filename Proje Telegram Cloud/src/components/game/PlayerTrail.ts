/**
 * PlayerTrail — records and draws the player's neon trail on canvas.
 */

interface TrailPoint {
    x: number;
    y: number;
    age: number; // 0 = newest, 1 = oldest
}

const MAX_TRAIL_POINTS = 28;

export class PlayerTrail {
    private points: TrailPoint[] = [];
    private color: string;

    constructor(color: string) {
        this.color = color;
    }

    setColor(color: string): void {
        this.color = color;
    }

    push(x: number, y: number): void {
        // Only record if moved enough
        const last = this.points[0];
        if (last && Math.abs(x - last.x) < 2 && Math.abs(y - last.y) < 2) return;

        this.points.unshift({ x, y, age: 0 });
        if (this.points.length > MAX_TRAIL_POINTS) {
            this.points.pop();
        }

        // Age all points
        for (let i = 0; i < this.points.length; i++) {
            this.points[i].age = i / MAX_TRAIL_POINTS;
        }
    }

    draw(ctx: CanvasRenderingContext2D): void {
        if (this.points.length < 2) return;

        for (let i = 0; i < this.points.length - 1; i++) {
            const p = this.points[i];
            const alpha = (1 - p.age) * 0.7;
            const radius = (1 - p.age) * 8 + 2;

            ctx.beginPath();
            ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
            ctx.fillStyle = this.hexToRgba(this.color, alpha);
            ctx.fill();
        }
    }

    private hexToRgba(hex: string, alpha: number): string {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r},${g},${b},${alpha})`;
    }

    clear(): void {
        this.points = [];
    }
}
