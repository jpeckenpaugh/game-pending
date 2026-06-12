import { drops, enemies, game } from "./state.js";
import { addBurst } from "./effects.js";
import { groundAt, nearTeleportBuffer, surfaceYAt, walkableSurfaces } from "./terrain.js";

export function spawnEnemies() {
  const spawnPoints = enemySpawnPoints();
  for (let i = 0; i < game.enemiesRemaining; i += 1) {
    const spawn = spawnPoints[i % spawnPoints.length];
    const cycle = Math.floor(i / spawnPoints.length);
    const x = Math.max(70, Math.min(spawn.maxX, spawn.x + cycle * 52));
    const family = enemyFamilyForIndex(i);
    const movement = enemyMovementForIndex(i);
    const radius = movement === "runner" ? 18 : 24;
    enemies.push({
      family,
      movement,
      facing: 1,
      x,
      y: spawn.y - radius,
      radius,
      baseX: x,
      surfaceId: spawn.surfaceId,
      minX: spawn.minX,
      maxX: spawn.maxX,
      phase: i * 0.9,
      alive: true,
    });
  }
}

function enemySpawnPoints() {
  const points = [];
  const safeStartHalfWidth = 280;

  for (const surface of walkableSurfaces()) {
    const width = surface.width;
    const count = Math.max(1, Math.floor(width / 260));
    for (let i = 0; i < count; i += 1) {
      const t = (i + 0.5) / count;
      const x = surface.x + width * t;
      const y = surfaceYAt(surface, x);
      if (surface.id === "ground" && Math.abs(x - groundCenter()) < safeStartHalfWidth) continue;
      if (surface.id === "ground" && nearTeleportBuffer(x, y, 220)) continue;
      points.push({
        x,
        y,
        surfaceId: surface.id,
        minX: surface.x + 24,
        maxX: surface.x + width - 24,
      });
    }
  }

  return points.length > 0 ? points : [{ x: 420, y: groundAt(420), surfaceId: "ground", minX: 60, maxX: 780 }];
}

function groundCenter() {
  return walkableSurfaces()[0].width / 2;
}

function enemyFamilyForIndex(index) {
  if (index > 0 && index % 6 === 0) return "square";
  if (index > 0 && index % 5 === 0) return "triangle";
  return "circle";
}

function enemyMovementForIndex(index) {
  if (index > 0 && index % 7 === 0) return "hopper";
  if (index > 0 && index % 4 === 0) return "runner";
  return "walker";
}

export function updateEnemyPositions(dt) {
  for (const enemy of enemies) {
    if (!enemy.alive) continue;
    const previousX = enemy.x;
    if (enemy.movement === "runner") {
      enemy.phase += dt * 4.2;
      enemy.x = clamp(enemy.baseX + Math.sin(enemy.phase) * 46, enemy.minX, enemy.maxX);
      enemy.y = surfaceHeight(enemy) - enemy.radius;
      updateFacing(enemy, previousX);
      continue;
    }

    if (enemy.movement === "hopper") {
      enemy.phase += dt * 3;
      enemy.x = clamp(enemy.baseX + Math.sin(enemy.phase * 0.7) * 24, enemy.minX, enemy.maxX);
      enemy.y = surfaceHeight(enemy) - enemy.radius - Math.max(0, Math.sin(enemy.phase)) * 36;
      updateFacing(enemy, previousX);
      continue;
    }

    enemy.phase += dt * 2.2;
    enemy.x = clamp(enemy.baseX + Math.sin(enemy.phase) * 28, enemy.minX, enemy.maxX);
    enemy.y = surfaceHeight(enemy) - enemy.radius;
    updateFacing(enemy, previousX);
  }
}

function surfaceHeight(enemy) {
  if (enemy.surfaceId === "ground") return groundAt(enemy.x);
  const surface = walkableSurfaces().find((item) => item.id === enemy.surfaceId);
  return surface ? surface.y : groundAt(enemy.x);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function updateFacing(enemy, previousX) {
  const dx = enemy.x - previousX;
  if (Math.abs(dx) > 0.01) enemy.facing = dx > 0 ? 1 : -1;
}

export function defeatEnemy(enemy) {
  if (!enemy.alive) return;
  enemy.alive = false;
  game.enemiesRemaining -= 1;
  drops.push({ x: enemy.x, y: enemy.y, amount: 2, bob: 0 });
  addBurst(enemy.x, enemy.y, 8);
}
