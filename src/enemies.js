import { customization, drops, enemies, game, player } from "./state.js";
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
      intelligence: intelligenceForEnemy(i),
      aiDirection: Math.random() < 0.5 ? -1 : 1,
      aiSpeed: 40 + Math.random() * 45,
      aiTimer: 0.4 + Math.random() * 1.2,
      aiJumpPhase: Math.random() * Math.PI * 2,
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
  const grouped = { ground: [], upper: [], cave: [] };
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
      const point = {
        x,
        y,
        surfaceId: surface.id,
        minX: surface.x + 24,
        maxX: surface.x + width - 24,
      };
      points.push(point);
      grouped[spawnBandForSurface(surface.id)].push(point);
    }
  }

  if (points.length === 0) return [{ x: 420, y: groundAt(420), surfaceId: "ground", minX: 60, maxX: 780 }];
  return customization.spawningLocations === "randomized"
    ? shuffled(points)
    : spreadSpawnPoints(grouped, points);
}

function groundCenter() {
  return walkableSurfaces()[0].width / 2;
}

function spawnBandForSurface(surfaceId) {
  if (surfaceId === "ground") return "ground";
  return surfaceId.includes("cave") ? "cave" : "upper";
}

function spreadSpawnPoints(grouped, fallback) {
  const bands = ["ground", "upper", "cave"];
  const spread = [];
  const cursors = { ground: 0, upper: 0, cave: 0 };
  let added = true;

  while (added) {
    added = false;
    for (const band of bands) {
      const group = grouped[band];
      if (cursors[band] >= group.length) continue;
      spread.push(group[cursors[band]]);
      cursors[band] += 1;
      added = true;
    }
  }

  return spread.length > 0 ? spread : fallback;
}

function shuffled(points) {
  const copy = [...points];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
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

function intelligenceForEnemy() {
  if (customization.opponentIntelligence !== "mixed") return customization.opponentIntelligence;
  const options = ["simple", "random", "bold", "shy"];
  return options[Math.floor(Math.random() * options.length)];
}

export function updateEnemyPositions(dt) {
  for (const enemy of enemies) {
    if (!enemy.alive) continue;
    const previousX = enemy.x;
    if ((enemy.intelligence || "simple") === "simple") {
      updateSimpleEnemy(enemy, dt);
    } else if (enemy.intelligence === "random") {
      updateRandomEnemy(enemy, dt);
    } else {
      updateReactiveEnemy(enemy, dt, enemy.intelligence);
    }
    updateFacing(enemy, previousX);
  }
}

function updateSimpleEnemy(enemy, dt) {
  if (enemy.movement === "runner") {
    enemy.phase += dt * 4.2;
    enemy.x = clamp(enemy.baseX + Math.sin(enemy.phase) * 46, enemy.minX, enemy.maxX);
    enemy.y = surfaceHeight(enemy) - enemy.radius;
    return;
  }

  if (enemy.movement === "hopper") {
    enemy.phase += dt * 3;
    enemy.x = clamp(enemy.baseX + Math.sin(enemy.phase * 0.7) * 24, enemy.minX, enemy.maxX);
    enemy.y = surfaceHeight(enemy) - enemy.radius - Math.max(0, Math.sin(enemy.phase)) * 36;
    return;
  }

  enemy.phase += dt * 2.2;
  enemy.x = clamp(enemy.baseX + Math.sin(enemy.phase) * 28, enemy.minX, enemy.maxX);
  enemy.y = surfaceHeight(enemy) - enemy.radius;
}

function updateRandomEnemy(enemy, dt) {
  enemy.aiTimer -= dt;
  if (enemy.aiTimer <= 0) {
    enemy.aiTimer = 0.18 + Math.random() * 1.1;
    enemy.aiDirection = Math.random() < 0.25 ? 0 : (Math.random() < 0.5 ? -1 : 1);
    enemy.aiSpeed = 20 + Math.random() * (enemy.movement === "runner" ? 120 : 80);
    enemy.aiJumpPhase = Math.random() * Math.PI * 2;
  }

  enemy.phase += dt * (2.5 + enemy.aiSpeed / 45);
  enemy.x = clamp(enemy.x + enemy.aiDirection * enemy.aiSpeed * dt, enemy.minX, enemy.maxX);
  const jumpHeight = enemy.movement === "hopper" || Math.random() < 0.012 ? 42 : 18;
  enemy.y = surfaceHeight(enemy) - enemy.radius - Math.max(0, Math.sin(enemy.phase + enemy.aiJumpPhase)) * jumpHeight;
}

function updateReactiveEnemy(enemy, dt, intelligence) {
  const dx = player.x - enemy.x;
  const playerCenterY = player.y - player.height * 0.5;
  const dy = Math.abs(playerCenterY - enemy.y);
  const sameSurface = player.surfaceId && player.surfaceId === enemy.surfaceId;
  const canSeePlayer = Math.abs(dx) < 650 && (sameSurface || dy < 220);
  if (!canSeePlayer) {
    updateSimpleEnemyFromCurrent(enemy, dt);
    return;
  }

  const direction = Math.sign(dx) || enemy.facing || 1;
  const intent = intelligence === "shy" ? -direction : direction;
  const speed = enemy.movement === "runner" ? 112 : 72;
  enemy.phase += dt * (enemy.movement === "hopper" ? 3.2 : 2.4);
  enemy.x = clamp(enemy.x + intent * speed * dt, enemy.minX, enemy.maxX);
  const hop = enemy.movement === "hopper" ? Math.max(0, Math.sin(enemy.phase)) * 34 : 0;
  enemy.y = surfaceHeight(enemy) - enemy.radius - hop;
}

function updateSimpleEnemyFromCurrent(enemy, dt) {
  enemy.phase += dt * (enemy.movement === "runner" ? 4.2 : enemy.movement === "hopper" ? 3 : 2.2);
  const speed = enemy.movement === "runner" ? 56 : enemy.movement === "hopper" ? 34 : 28;
  const direction = Math.cos(enemy.phase) >= 0 ? 1 : -1;
  enemy.x = clamp(enemy.x + direction * speed * dt, enemy.minX, enemy.maxX);
  const hop = enemy.movement === "hopper" ? Math.max(0, Math.sin(enemy.phase)) * 36 : 0;
  enemy.y = surfaceHeight(enemy) - enemy.radius - hop;
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
