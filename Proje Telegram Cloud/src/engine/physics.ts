import Matter from 'matter-js';

export interface PhysicsConfig {
    width: number;
    height: number;
    wallThickness: number;
}

export interface PhysicsWorld {
    engine: Matter.Engine;
    runner: Matter.Runner;
    player: Matter.Body;
    ground: Matter.Body;
    ceiling: Matter.Body;
    world: Matter.World;
    flipGravity: () => void;
    destroy: () => void;
    isGravityNormal: () => boolean;
}

const PLAYER_RADIUS = 14;
const GRAVITY_MAGNITUDE = 1.4;  // Was 2.5 — reduced for more floaty, forgiving feel
const PLAYER_HORIZONTAL_SPEED = 0; // Player is stationary; world scrolls

export function createPhysicsWorld(config: PhysicsConfig): PhysicsWorld {
    const { width, height, wallThickness } = config;

    // Create engine
    const engine = Matter.Engine.create({
        gravity: { x: 0, y: GRAVITY_MAGNITUDE },
        positionIterations: 10,
        velocityIterations: 8,
    });

    const { world } = engine;

    // Player body — fixed X, physics-driven Y
    const player = Matter.Bodies.circle(width * 0.2, height / 2, PLAYER_RADIUS, {
        restitution: 0,
        friction: 0,
        frictionAir: 0.04, // Was 0.01 — more air drag = more time to react
        label: 'player',
        collisionFilter: { category: 0x0001, mask: 0x0002 | 0x0004 },
    });

    // Ground
    const ground = Matter.Bodies.rectangle(
        width / 2,
        height - wallThickness / 2,
        width * 10,
        wallThickness,
        {
            isStatic: true,
            label: 'ground',
            collisionFilter: { category: 0x0002, mask: 0x0001 },
        }
    );

    // Ceiling
    const ceiling = Matter.Bodies.rectangle(
        width / 2,
        wallThickness / 2,
        width * 10,
        wallThickness,
        {
            isStatic: true,
            label: 'ceiling',
            collisionFilter: { category: 0x0002, mask: 0x0001 },
        }
    );

    Matter.World.add(world, [player, ground, ceiling]);

    const runner = Matter.Runner.create({ delta: 1000 / 60 });
    Matter.Runner.run(runner, engine);

    let gravityNormal = true;

    const flipGravity = () => {
        gravityNormal = !gravityNormal;
        engine.gravity.y = gravityNormal ? GRAVITY_MAGNITUDE : -GRAVITY_MAGNITUDE;
        // Gentle impulse for a snappy but not jarring flip
        const impulse = gravityNormal ? 0.006 : -0.006; // Was ±0.012
        Matter.Body.applyForce(player, player.position, { x: 0, y: impulse });
    };

    const isGravityNormal = () => gravityNormal;

    const destroy = () => {
        Matter.Runner.stop(runner);
        Matter.Engine.clear(engine);
        Matter.World.clear(world, false);
    };

    return { engine, runner, player, ground, ceiling, world, flipGravity, destroy, isGravityNormal };
}

/**
 * Clamp player Y within bounds (belt-and-suspenders besides physics walls).
 */
export function clampPlayer(player: Matter.Body, height: number, wallThickness: number): void {
    const minY = wallThickness + PLAYER_RADIUS;
    const maxY = height - wallThickness - PLAYER_RADIUS;
    if (player.position.y < minY) {
        Matter.Body.setPosition(player, { x: player.position.x, y: minY });
        Matter.Body.setVelocity(player, { x: player.velocity.x, y: 0 });
    } else if (player.position.y > maxY) {
        Matter.Body.setPosition(player, { x: player.position.x, y: maxY });
        Matter.Body.setVelocity(player, { x: player.velocity.x, y: 0 });
    }
}

export { PLAYER_RADIUS, PLAYER_HORIZONTAL_SPEED };
