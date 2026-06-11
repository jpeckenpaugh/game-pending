import { camera, enemies, game, player, world } from "./state.js";

export function resizeCanvas(canvas, ctx) {
  const ratio = Math.max(1, window.devicePixelRatio || 1);
  canvas.width = Math.floor(window.innerWidth * ratio);
  canvas.height = Math.floor(window.innerHeight * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  world.baseGroundY = Math.max(260, window.innerHeight - 86);

  if (!player.y) {
    player.y = groundAt(player.x);
  } else if (player.onGround) {
    player.y = groundAt(player.x);
  }

  for (const enemy of enemies) {
    enemy.y = groundAt(enemy.x) - enemy.radius;
  }
}

function terrainOffsetAt(index) {
  return Math.sin(index * 0.85 + game.level * 0.7) * 28
    + Math.sin(index * 0.31 + game.level * 1.4) * 18;
}

export function buildTerrain() {
  world.terrain.length = 0;
  const pointCount = Math.ceil(world.width / world.terrainStep) + 2;

  for (let i = 0; i < pointCount; i += 1) {
    const x = i * world.terrainStep;
    const protectedStart = Math.max(0, 1 - x / 420);
    const offset = terrainOffsetAt(i) * (1 - protectedStart);
    world.terrain.push({ x, y: world.baseGroundY + offset });
  }
}

export function groundAt(x) {
  if (world.terrain.length === 0) return world.baseGroundY;
  const clampedX = Math.max(0, Math.min(world.width, x));
  const index = Math.min(
    world.terrain.length - 2,
    Math.max(0, Math.floor(clampedX / world.terrainStep))
  );
  const left = world.terrain[index];
  const right = world.terrain[index + 1];
  const t = (clampedX - left.x) / (right.x - left.x);
  return left.y + (right.y - left.y) * t;
}

export function worldToScreenX(x) {
  return x - camera.x;
}
