// Owns enemy spawning, movement AI, defeat bookkeeping, and kinetic suspension state.
// Visual enemy drawing lives in enemyArt.js.
import { customization, drops, enemies, game, mirrorQueue, player, projectiles, setPlayerFaceMood, world } from "./state.js";
import { addBurst, addShatter } from "./effects.js";
import { playEnemyDefeat } from "./audio.js";
import { groundAt, nearTeleportBuffer, surfaceYAt, walkableSurfaces } from "./terrain.js";
import { ghostAdvicePool, ghostFrustratedPool } from "./data/dialogue.js";

export function spawnEnemies() {
  const spawnPoints = enemySpawnPoints();
  for (let i = 0; i < game.enemiesRemaining; i += 1) {
    const spawn = spawnPoints[i % spawnPoints.length];
    const cycle = Math.floor(i / spawnPoints.length);
    const x = Math.max(70, Math.min(spawn.maxX, spawn.x + cycle * 52));
    const family = enemyFamilyForIndex(i);
    const movement = family === "mirror" ? "mirror" : family === "ghost" ? "ghost" : enemyMovementForIndex(i);
    const radius = movement === "runner" ? 18 : movement === "mirror" ? 22 : family === "ghost" ? 20 : 24;
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
      suspendedFor: 0,
      suspendedDuration: 0,
      suspendedStartY: 0,
      suspendedBaseY: 0,
      suspendedEndY: 0,
      suspendedSpin: 0,
      flashTimer: 0,
      colorIndex: Math.floor(Math.random() * 1024),
      alive: true,
      philosophizing: 0,
      enraged: 0,
      ghostPhase: family === "ghost" ? "advice" : "",
      ghostBubbleCount: 0,
      ghostAdviceCount: 0,
      ghostFrustratedCount: 0,
      ghostDialogueIndex: 0,
      ghostDialoguePool: family === "ghost" ? shuffledPool(ghostAdvicePool) : [],
      ghostSpeechBubble: null,
      ghostBubbleTimer: 2 + Math.random() * 3,
    });
  }
}

function enemySpawnPoints() {
  const points = [];
  const grouped = { ground: [], upper: [], cave: [] };
  const safeStartHalfWidth = 280;

  // Spawn candidates come from every walkable surface so enemies naturally spread
  // across ground, upper platforms, caves, and expansion platforms.
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
  if (index > 0 && index % 8 === 0) return "mirror";
  if (index > 0 && index % 12 === 0) return "ghost";
  if (index > 0 && index % 6 === 0) return "square";
  if (index > 0 && index % 5 === 0) return "triangle";
  return "circle";
}

function shuffledPool(pool) {
  const copy = [...pool];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
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
    if (updateSuspendedEnemy(enemy, dt)) continue;

    // Decrement philosophizing / enraged timers
    if (enemy.philosophizing > 0) {
      enemy.philosophizing = Math.max(0, enemy.philosophizing - dt);
      if (enemy.philosophizing <= 0) {
        enemy.enraged = 2;
      }
      continue;
    }
    if (enemy.enraged > 0) {
      enemy.enraged = Math.max(0, enemy.enraged - dt);
    }

    if (enemy.movement === "ghost") {
      updateGhostEnemy(enemy, dt);
      continue;
    }
    if (enemy.movement === "mirror") {
      updateMirrorEnemy(enemy, dt);
      continue;
    }
    const previousX = enemy.x;
    if ((enemy.intelligence || "simple") === "simple") {
      updateSimpleEnemy(enemy, dt);
    } else if (enemy.intelligence === "random") {
      updateRandomEnemy(enemy, dt);
    } else {
      updateReactiveEnemy(enemy, dt, enemy.intelligence);
    }
    if (isInMudZone(enemy)) {
      enemy.aiSpeed *= 0.6;
    }
    updateFacing(enemy, previousX);
  }
}

function updateSuspendedEnemy(enemy, dt) {
  enemy.flashTimer = Math.max(0, (enemy.flashTimer || 0) - dt);
  if (!enemy.suspendedFor || enemy.suspendedFor <= 0) return false;
  enemy.suspendedFor = Math.max(0, enemy.suspendedFor - dt);
  enemy.suspendedSpin = (enemy.suspendedSpin || 0) + dt * Math.PI * 2.3;
  // Kinetic discharge has three visual beats: ease upward, hover/spin, ease down.
  const duration = enemy.suspendedDuration || 5;
  const elapsed = duration - enemy.suspendedFor;
  const riseDuration = 0.55;
  const fallDuration = 0.9;
  const hoverBob = Math.sin(enemy.suspendedSpin * 1.4) * 5;
  if (elapsed < riseDuration) {
    const progress = easeOut(elapsed / riseDuration);
    enemy.y = lerp(enemy.suspendedStartY || enemy.y, enemy.suspendedBaseY || enemy.y, progress);
  } else if (enemy.suspendedFor < fallDuration) {
    const progress = easeInOut(1 - enemy.suspendedFor / fallDuration);
    enemy.y = lerp(enemy.suspendedBaseY || enemy.y, enemy.suspendedEndY || enemy.y, progress);
  } else {
    enemy.y = (enemy.suspendedBaseY || enemy.y) + hoverBob;
  }
  if (enemy.suspendedFor <= 0) {
    enemy.y = enemy.suspendedEndY || enemy.y;
    enemy.suspendedDuration = 0;
    enemy.suspendedStartY = 0;
    enemy.suspendedBaseY = 0;
    enemy.suspendedEndY = 0;
  }
  return true;
}

function lerp(start, end, progress) {
  return start + (end - start) * Math.max(0, Math.min(1, progress));
}

function easeOut(value) {
  const t = Math.max(0, Math.min(1, value));
  return 1 - (1 - t) * (1 - t);
}

function easeInOut(value) {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
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

function updateMirrorEnemy(enemy, dt) {
  const now = performance.now() / 1000;
  const replayDelay = 2;
  let targetEntry = null;

  const hoverY = groundAt(enemy.x) - 160;

  for (let i = mirrorQueue.length - 1; i >= 0; i -= 1) {
    if (now - mirrorQueue[i].timestamp >= replayDelay) {
      targetEntry = mirrorQueue[i];
      break;
    }
  }

  if (!targetEntry) {
    const dx = player.x - enemy.x;
    const dy = hoverY - enemy.y;
    const dist = Math.hypot(dx, dy);
    if (dist > 4) {
      enemy.x += (dx / dist) * 120 * dt;
      enemy.y += (dy / dist) * 80 * dt;
    }
    enemy.phase += dt * 2;
    return;
  }

  const targetX = targetEntry.x;
  const targetY = hoverY;
  const dx = targetX - enemy.x;
  const dy = targetY - enemy.y;
  const dist = Math.hypot(dx, dy);
  const speed = 320;

  if (dist > 4) {
    enemy.x += (dx / dist) * speed * dt;
    enemy.y += (dy / dist) * speed * dt;
  }

  enemy.facing = dx > 0 ? 1 : dx < 0 ? -1 : enemy.facing;

  if (targetEntry.jumped) {
    enemy.y -= 60;
  }

  if (targetEntry.shot && (!enemy.shotCooldown || enemy.shotCooldown <= 0)) {
    const shotY = enemy.y;
    projectiles.push({
      x: enemy.x + enemy.facing * 24,
      y: shotY,
      vx: enemy.facing * 3040,
      vy: 0,
      weaponType: "gun",
      gravity: 0,
      rotation: 0,
      hitEnemies: null,
      life: null,
      radius: 4,
    });
    enemy.shotCooldown = 0.4;
  }

  enemy.y = Math.min(enemy.y, hoverY);

  if (enemy.shotCooldown > 0) enemy.shotCooldown -= dt;
  enemy.phase += dt * 2.5;
}

function updateGhostEnemy(enemy, dt) {
  const hoverY = groundAt(enemy.x) - 160;
  enemy.phase += dt * 2;

  if (enemy.ghostPhase === "advice" || enemy.ghostPhase === "frustrated") {
    const dx = player.x - enemy.x;
    const dy = hoverY - enemy.y;
    const followDir = Math.sign(dx) || 1;
    const targetX = player.x - followDir * 120;
    const moveDx = targetX - enemy.x;

    if (Math.abs(moveDx) > 4) {
      enemy.x += Math.sign(moveDx) * 80 * dt;
    }
    if (Math.abs(dy) > 4) {
      enemy.y += Math.sign(dy) * 60 * dt;
    }

    enemy.facing = dx > 0 ? 1 : -1;

    // Update speech bubble timer
    enemy.ghostBubbleTimer -= dt;
    if (enemy.ghostBubbleTimer <= 0) {
      showGhostBubble(enemy);
      const interval = enemy.ghostPhase === "advice" ? 5 : 3.5;
      enemy.ghostBubbleTimer = interval + Math.random() * 1;
    }

    // Update existing speech bubble fade
    if (enemy.ghostSpeechBubble) {
      enemy.ghostSpeechBubble.timer -= dt;
      if (enemy.ghostSpeechBubble.timer <= -0.5) {
        enemy.ghostSpeechBubble = null;
      }
    }
  } else if (enemy.ghostPhase === "attack") {
    // Chase aggressively like a reactive circle enemy
    const dx = player.x - enemy.x;
    const direction = Math.sign(dx) || enemy.facing || 1;
    const speed = 140;
    const previousX = enemy.x;
    enemy.x = clamp(enemy.x + direction * speed * dt, enemy.minX, enemy.maxX);
    enemy.y = surfaceHeight(enemy) - enemy.radius;
    updateFacing(enemy, previousX);

    // Update existing speech bubble fade
    if (enemy.ghostSpeechBubble) {
      enemy.ghostSpeechBubble.timer -= dt;
      if (enemy.ghostSpeechBubble.timer <= -0.5) {
        enemy.ghostSpeechBubble = null;
      }
    }
  }
}

function showGhostBubble(enemy) {
  const pool = enemy.ghostPhase === "frustrated" ? ghostFrustratedPool : enemy.ghostDialoguePool;
  const text = pool[enemy.ghostDialogueIndex % pool.length];
  enemy.ghostDialogueIndex += 1;
  enemy.ghostBubbleCount += 1;
  enemy.ghostSpeechBubble = { text, timer: 3, angry: enemy.ghostPhase === "frustrated" };

  if (enemy.ghostPhase === "advice") {
    enemy.ghostAdviceCount += 1;
    if (enemy.ghostAdviceCount >= 2) {
      enemy.ghostPhase = "frustrated";
      enemy.ghostDialoguePool = shuffledPool(ghostFrustratedPool);
      enemy.ghostDialogueIndex = 0;
    }
  } else if (enemy.ghostPhase === "frustrated") {
    enemy.ghostFrustratedCount += 1;
    if (enemy.ghostFrustratedCount >= 2) {
      enemy.ghostPhase = "attack";
      enemy.ghostSpeechBubble = null;
    }
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

function isInMudZone(enemy) {
  if (world.mudZones.length === 0) return false;
  if (enemy.surfaceId !== "ground") return false;
  for (const zone of world.mudZones) {
    if (enemy.x > zone.x && enemy.x < zone.x + zone.width
      && enemy.y >= zone.y - 4 && enemy.y <= zone.y + zone.height + 4) {
      return true;
    }
  }
  return false;
}

export function defeatEnemy(enemy) {
  if (!enemy.alive) return;
  enemy.alive = false;
  setPlayerFaceMood("angry", 0.6, 2);
  game.enemiesRemaining -= 1;
  if (enemy.family === "mirror") {
    addShatter(enemy.x, enemy.y, 12);
    playEnemyDefeat();
    return;
  }
  drops.push({ x: enemy.x, y: enemy.y, amount: 2, bob: 0 });
  addBurst(enemy.x, enemy.y, 8);
  playEnemyDefeat();
}
