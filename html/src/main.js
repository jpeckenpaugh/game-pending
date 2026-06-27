// Owns the main loop and high-level update order. Most domain behavior lives in
// focused modules; this file coordinates camera, phase flow, and system updates.
import { camera, canvas, ctx, customization, drops, enemies, game, player, states, updatePlayerFaceMood, world } from "./state.js";
import { draw } from "./render.js";
import { resizeCanvas, groundAt, worldContentBounds } from "./terrain.js";
import { setupInput } from "./input.js";
import { startLevel, showGameOver, showLevelComplete, startLevelClearCollection } from "./level.js";
import { updateBootsGlideRecharge, updateShieldRecharge, updateHasteRecharge, absorbOrTakeHit } from "./powerups.js";
import { updateDrone } from "./drone.js";
import { updateEnemyPositions, defeatEnemy } from "./enemies.js";
import { updateProjectiles } from "./projectiles.js";
import { applyPlayerMovement, canStomp, jumpImpulse, playerDistanceTo } from "./player.js";
import { addBurst, updateParticles } from "./effects.js";
import { initAudio } from "./audio.js";

function titleZoomForContent() {
  const contentBounds = worldContentBounds();
  const contentHeight = Math.max(1, contentBounds.bottom - contentBounds.top);
  return Math.min(1, window.innerHeight / contentHeight);
}

function update(dt) {
  if (game.messageTimer > 0) game.messageTimer -= dt;
  updatePlayerFaceMood(dt);
  if (game.wrapTimer > 0) game.wrapTimer = Math.max(0, game.wrapTimer - dt);
  if (game.teleportPhase !== "idle") {
    updateTeleport(dt);
    updateCamera(dt);
    updateParticles(dt);
    return;
  }
  updateCamera(dt);

  if (game.state === states.LEVEL_COLLECTING) {
    updateLevelClearCollection(dt);
    return;
  }

  if (game.state !== states.PLAYING) return;

  player.shootCooldown = Math.max(0, player.shootCooldown - dt);
  player.invulnerableFor = Math.max(0, player.invulnerableFor - dt);
  updateShieldRecharge(dt);
  updateBootsGlideRecharge(dt);
  updateHasteRecharge(dt);
  updateDrone(dt);

  applyPlayerMovement(dt, groundAt);
  updateProjectiles(dt);
  updateEnemyPositions(dt);

  for (const enemy of enemies) {
    if (!enemy.alive) continue;

    if (canStomp(enemy)) {
      if (enemy.family === "triangle") {
        const previousMotion = {
          vx: player.vx,
          vy: player.vy,
          onGround: player.onGround,
        };
        player.vy = -jumpImpulse() * 0.35;
        player.onGround = false;
        const hitResult = absorbOrTakeHit(showGameOver, enemy);
        if (hitResult === "kinetic") {
          player.vx = previousMotion.vx;
          player.vy = previousMotion.vy;
          player.onGround = previousMotion.onGround;
        }
        if (hitResult !== "kinetic") {
          game.message = "Pointy!";
          game.messageTimer = 1;
        }
        continue;
      }

      defeatEnemy(enemy);
      player.vy = -jumpImpulse() * 0.6;
      player.onGround = false;
      game.message = "Stomp!";
      game.messageTimer = 1;
      continue;
    }

    if (enemy.suspendedFor > 0) continue;

    if (player.invulnerableFor <= 0 && playerDistanceTo(enemy) < enemy.radius + 24) {
      absorbOrTakeHit(showGameOver, enemy);
    }
  }

  for (let i = drops.length - 1; i >= 0; i -= 1) {
    const drop = drops[i];
    drop.bob += dt * 6;
    if (playerDistanceTo(drop) < 42) {
      player.ammo += drop.amount;
      drops.splice(i, 1);
      game.message = "+2 ammo";
      game.messageTimer = 1.1;
    }
  }

  updateParticles(dt);

  if (game.enemiesRemaining === 0) {
    startLevelClearCollection();
  }
}

function updateTeleport(dt) {
  game.teleportTimer += dt;
  if (game.teleportTimer < game.teleportDuration) return;

  // Teleport is intentionally staged: zoom out at source, pan across, move the
  // player, then zoom in at destination. Gameplay updates pause during this.
  if (game.teleportPhase === "zoomOut") {
    game.teleportPanStartX = camera.x;
    game.teleportPanStartY = camera.y;
    game.teleportPhase = "pan";
    game.teleportTimer = 0;
    game.teleportDuration = 1.05;
    return;
  }

  if (game.teleportPhase === "pan") {
    player.x = game.teleportToX;
    player.y = game.teleportToY;
    player.previousY = player.y;
    player.vx = 0;
    player.vy = 0;
    player.onGround = true;
    player.surfaceId = "ground";
    player.climbing = false;
    game.teleportMoved = true;
    game.wrapTimer = 0.36;
    game.teleportZoomInStartX = camera.x;
    game.teleportZoomInStartY = camera.y;
    game.teleportZoomInStartZoom = camera.zoom;
    game.teleportPhase = "zoomIn";
    game.teleportTimer = 0;
    game.teleportDuration = 1.05;
    return;
  }

  camera.zoom = 1;
  camera.x = clampedCameraX(game.teleportToX - window.innerWidth * 0.5, window.innerWidth);
  camera.y = clampedCameraY(game.teleportToY - window.innerHeight * 0.55, window.innerHeight);
  game.teleportPhase = "idle";
  game.teleportTimer = 0;
  game.teleportDuration = 0;
  game.wrapTimer = 0;
}

function updateCamera(dt) {
  const contentBounds = worldContentBounds();
  const contentHeight = Math.max(1, contentBounds.bottom - contentBounds.top);
  const titleZoom = titleZoomForContent();
  let zoomTarget = game.state === states.PLAYING || game.state === states.LEVEL_COLLECTING
    ? 1
    : titleZoom;
  if (game.teleportPhase === "zoomOut" || game.teleportPhase === "pan") zoomTarget = titleZoom;
  if (game.teleportPhase === "zoomIn") zoomTarget = 1;
  const cameraSpeed = game.teleportPhase !== "idle" ? 10 : (game.wrapTimer > 0 ? 28 : 8);
  if (game.teleportPhase === "zoomIn") {
    const progress = smoothstep(game.teleportDuration > 0 ? game.teleportTimer / game.teleportDuration : 1);
    camera.zoom = game.teleportZoomInStartZoom + (1 - game.teleportZoomInStartZoom) * progress;
  } else {
    camera.zoom += (zoomTarget - camera.zoom) * Math.min(1, dt * 3.2);
  }

  const viewportWidth = window.innerWidth / camera.zoom;
  const viewportHeight = window.innerHeight / camera.zoom;
  const centeredStates = [states.TITLE, states.CUSTOMIZE, states.GAME_OVER, states.LEVEL_COMPLETE, states.POWER_CHOICE, states.PAUSED];
  let targetX = centeredStates.includes(game.state)
    ? world.width / 2 - viewportWidth / 2
    : player.x - viewportWidth * 0.5;
  let targetY = centeredStates.includes(game.state)
    ? contentBounds.top + contentHeight / 2 - viewportHeight / 2
    : player.y - viewportHeight * 0.55;

  if (game.teleportPhase === "zoomOut") {
    targetX = game.teleportFromX - viewportWidth * 0.5;
    targetY = game.teleportFromY - viewportHeight * 0.55;
  } else if (game.teleportPhase === "pan") {
    // Pan and zoom-in use stored start positions so phase handoffs do not snap.
    const progress = smoothstep(game.teleportDuration > 0 ? game.teleportTimer / game.teleportDuration : 1);
    const destinationX = clampedCameraX(game.teleportToX - viewportWidth * 0.5, viewportWidth);
    const destinationY = clampedCameraY(game.teleportToY - viewportHeight * 0.55, viewportHeight);
    targetX = game.teleportPanStartX + (destinationX - game.teleportPanStartX) * progress;
    targetY = game.teleportPanStartY + (destinationY - game.teleportPanStartY) * progress;
  } else if (game.teleportPhase === "zoomIn") {
    const progress = smoothstep(game.teleportDuration > 0 ? game.teleportTimer / game.teleportDuration : 1);
    const finalViewportWidth = window.innerWidth;
    const finalViewportHeight = window.innerHeight;
    const destinationX = clampedCameraX(game.teleportToX - finalViewportWidth * 0.5, finalViewportWidth);
    const destinationY = clampedCameraY(game.teleportToY - finalViewportHeight * 0.55, finalViewportHeight);
    targetX = game.teleportZoomInStartX + (destinationX - game.teleportZoomInStartX) * progress;
    targetY = game.teleportZoomInStartY + (destinationY - game.teleportZoomInStartY) * progress;
  }

  if (game.teleportPhase === "pan" || game.teleportPhase === "zoomIn") {
    camera.x = targetX;
    camera.y = targetY;
  } else {
    camera.x += (targetX - camera.x) * Math.min(1, dt * cameraSpeed);
    camera.y += (targetY - camera.y) * Math.min(1, dt * cameraSpeed);
  }
  camera.x = clampedCameraX(camera.x, viewportWidth);
  camera.y = clampedCameraY(camera.y, viewportHeight);
}

function clampedCameraX(x, viewportWidth) {
  const max = world.width - viewportWidth;
  if (max < 0) return max / 2;
  return Math.max(0, Math.min(max, x));
}

function clampedCameraY(y, viewportHeight) {
  const max = world.height - viewportHeight;
  if (max < 0) return max / 2;
  return Math.max(0, Math.min(max, y));
}

function smoothstep(value) {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
}

function updateLevelClearCollection(dt) {
  const target = { x: player.x, y: player.y - 42 };
  game.levelClearTimer -= dt;

  for (let i = drops.length - 1; i >= 0; i -= 1) {
    const drop = drops[i];
    const dx = target.x - drop.x;
    const dy = target.y - drop.y;
    const distance = Math.hypot(dx, dy);
    const speed = Math.max(260, distance * 5.5);

    drop.bob += dt * 10;
    if (distance < 12) {
      player.ammo += drop.amount;
      addBurst(target.x, target.y, 5);
      drops.splice(i, 1);
      continue;
    }

    drop.x += (dx / Math.max(1, distance)) * speed * dt;
    drop.y += (dy / Math.max(1, distance)) * speed * dt;
  }

  updateParticles(dt);

  if (drops.length === 0 && game.levelClearTimer <= 0) {
    showLevelComplete();
  }
}

const fpsSteps = [5, 10, 15, 30, 60, 120];

function selectedTargetFps() {
  return customization.targetFps === "auto"
    ? game.autoTargetFps
    : Number(customization.targetFps) || 60;
}

function tuneAutoFps(elapsed, frameInterval, workMs) {
  if (customization.targetFps !== "auto") {
    game.autoFramePressure = 0;
    game.autoStableFor = 0;
    return;
  }

  const overloaded = elapsed > frameInterval * 1.45 || workMs > frameInterval * 0.9;
  if (overloaded) {
    game.autoFramePressure += 1;
    game.autoStableFor = 0;
  } else {
    game.autoFramePressure = Math.max(0, game.autoFramePressure - 1);
    game.autoStableFor += elapsed / 1000;
  }

  const currentIndex = fpsSteps.indexOf(game.autoTargetFps);
  if (game.autoFramePressure >= 8 && currentIndex > 0) {
    game.autoTargetFps = fpsSteps[currentIndex - 1];
    game.autoFramePressure = 0;
    game.autoStableFor = 0;
  } else if (game.autoStableFor >= 6 && currentIndex < fpsSteps.length - 1) {
    game.autoTargetFps = fpsSteps[currentIndex + 1];
    game.autoFramePressure = 0;
    game.autoStableFor = 0;
  }
}

function loop(now) {
  const targetFps = selectedTargetFps();
  const frameInterval = 1000 / targetFps;
  const elapsed = now - game.lastTime;
  if (elapsed < frameInterval) {
    requestAnimationFrame(loop);
    return;
  }

  let dt = Math.min(0.25, elapsed / 1000);
  game.lastTime = now;
  const workStart = performance.now();
  while (dt > 0) {
    const step = Math.min(0.033, dt);
    update(step);
    dt -= step;
  }
  draw();
  tuneAutoFps(elapsed, frameInterval, performance.now() - workStart);
  requestAnimationFrame(loop);
}

function initOnGesture() {
  initAudio();
  window.removeEventListener("keydown", initOnGesture);
  window.removeEventListener("mousedown", initOnGesture);
  window.removeEventListener("touchstart", initOnGesture);
}
window.addEventListener("keydown", initOnGesture);
window.addEventListener("mousedown", initOnGesture);
window.addEventListener("touchstart", initOnGesture);

window.addEventListener("resize", () => resizeCanvas(canvas, ctx));
setupInput(canvas);
resizeCanvas(canvas, ctx);
startLevel(1);
camera.zoom = titleZoomForContent();
requestAnimationFrame(loop);
