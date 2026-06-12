// Owns world rendering orchestration: terrain, platforms, ladders, portals,
// drops, projectiles, drone art, particles, player, HUD, and overlays.
import { camera, ctx, drone, drops, enemies, game, particles, projectiles, states, world } from "./state.js";
import { groundAt, worldToScreenX, worldToScreenY } from "./terrain.js";
import { drawPlayerCharacter } from "./playerCharacters.js";
import { drawWeapon } from "./weapons.js";
import { drawUi } from "./hud.js";
import { drawScreenOverlay } from "./menus.js";
import { drawEnemy } from "./enemyArt.js";

function line(x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function z(value) {
  return value * camera.zoom;
}

function strokeWidth(value) {
  return Math.max(1, z(value));
}

function drawTerrain() {
  const startX = Math.max(0, camera.x - 80);
  const endX = Math.min(world.width, camera.x + window.innerWidth / camera.zoom + 80);
  const first = Math.floor(startX / 40) * 40;

  ctx.lineWidth = strokeWidth(3);
  ctx.beginPath();
  ctx.moveTo(worldToScreenX(first), worldToScreenY(groundAt(first)) + 0.5);
  for (let x = first + 40; x <= endX + 40; x += 40) {
    ctx.lineTo(worldToScreenX(x), worldToScreenY(groundAt(x)) + 0.5);
  }
  ctx.stroke();

  ctx.lineWidth = strokeWidth(2);
  for (let x = Math.floor(startX / 80) * 80; x < endX; x += 80) {
    const y = worldToScreenY(groundAt(x + 12) + 8);
    line(worldToScreenX(x), y, worldToScreenX(x + 22), worldToScreenY(groundAt(x + 22) + 8));
  }

  drawPlatforms();
  drawLadders();
  drawTeleports();
}

function drawPlatforms() {
  ctx.lineWidth = strokeWidth(3);
  for (const platform of world.platforms) {
    const x = worldToScreenX(platform.x);
    const x2 = worldToScreenX(platform.x + platform.width);
    const y = worldToScreenY(platform.y);
    if (x2 < -60 || x > window.innerWidth + 60) continue;
    line(x, y, x2, y);
    const hatchStart = platform.id === "cave-floor" ? x + z(12) : x + z(18);
    const hatchEnd = platform.id === "cave-floor" ? x2 - z(12) : x2;
    const hatchStep = platform.id === "cave-floor" ? z(52) : z(34);
    for (let rungX = hatchStart; rungX < hatchEnd; rungX += hatchStep) {
      line(rungX, y + z(4), rungX + z(14), y + z(13));
    }
  }
}

function drawLadders() {
  ctx.lineWidth = strokeWidth(2);
  for (const ladder of world.ladders) {
    const x = worldToScreenX(ladder.x);
    const y = worldToScreenY(ladder.y);
    const bottom = worldToScreenY(ladder.y + ladder.height);
    if (bottom < -60 || y > window.innerHeight + 60) continue;
    line(x - z(16), y, x - z(16), bottom);
    line(x + z(16), y, x + z(16), bottom);
    for (let rungY = y + z(16); rungY < bottom; rungY += z(28)) {
      line(x - z(16), rungY, x + z(16), rungY);
    }
  }
}

function drawTeleports() {
  ctx.lineWidth = strokeWidth(3);
  // Portal markers use a deliberately sparse, slow inner-oval flow so they read
  // as active without visually overpowering combat.
  const time = performance.now() / 1800;
  const innerOvalCount = 2;
  for (const teleport of world.teleports) {
    const x = worldToScreenX(teleport.x);
    const y = worldToScreenY(teleport.y);
    if (x < -80 || x > window.innerWidth + 80) continue;
    const centerY = y + z(teleport.height / 2);
    const radiusX = z(teleport.width / 2);
    const radiusY = z(teleport.height / 2);

    ctx.beginPath();
    ctx.ellipse(x, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
    ctx.stroke();

    const previousAlpha = ctx.globalAlpha;
    ctx.lineWidth = strokeWidth(2);
    for (let i = 0; i < innerOvalCount; i += 1) {
      const progress = (time + i / innerOvalCount) % 1;
      const scale = 0.86 - progress * 0.68;
      ctx.globalAlpha = previousAlpha * Math.max(0.08, scale * 0.85);
      ctx.beginPath();
      ctx.ellipse(x, centerY, radiusX * scale, radiusY * scale, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = previousAlpha;
    ctx.lineWidth = strokeWidth(3);
  }
}

function drawDrop(drop) {
  const x = worldToScreenX(drop.x);
  const y = worldToScreenY(drop.y) - 8 + Math.sin(drop.bob) * 4;
  if (x < -40 || x > window.innerWidth + 40) return;

  ctx.font = `${z(28)}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
  ctx.fillText("+", x - z(8), y + z(8));
  ctx.font = `${z(13)}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
  ctx.fillText("2", x + z(10), y + z(13));
}

function drawProjectile(projectile) {
  const x = worldToScreenX(projectile.x);
  const y = worldToScreenY(projectile.y);
  if (x < -80 || x > window.innerWidth + 80) return;
  if (projectile.homing) {
    ctx.lineWidth = strokeWidth(2);
    ctx.beginPath();
    ctx.arc(x, y, z(5), 0, Math.PI * 2);
    ctx.stroke();
  } else if (projectile.weaponType === "club") {
    drawWeapon("club", x, y, projectile.vx >= 0 ? 1 : -1, camera.zoom, projectile.rotation || 0);
  } else if (projectile.weaponType === "gun") {
    const size = Math.max(3, z(7));
    ctx.fillRect(x - size / 2, y - size / 2, size, size);
  } else {
    ctx.font = `${z(28)}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
    ctx.fillText("*", x - z(8), y + z(8));
  }
}

function drawDrone() {
  if (!drone.active) return;
  const x = worldToScreenX(drone.x);
  const y = worldToScreenY(drone.y);
  ctx.lineWidth = strokeWidth(2);
  ctx.beginPath();
  ctx.ellipse(x, y, z(18), z(8), 0, 0, Math.PI * 2);
  ctx.stroke();
  line(x - z(7), y - z(9), x - z(13), y - z(17));
  line(x + z(7), y - z(9), x + z(13), y - z(17));
}

function drawCollectionNotice() {
  if (game.state !== states.LEVEL_COLLECTING) return;
  ctx.font = "18px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
  ctx.textAlign = "center";
  ctx.fillText("Collecting ammo...", window.innerWidth / 2, 42);
  ctx.textAlign = "left";
}

export function draw() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  ctx.strokeStyle = "#000";
  ctx.fillStyle = "#000";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = 3;

  drawTerrain();
  for (const drop of drops) drawDrop(drop);
  for (const projectile of projectiles) drawProjectile(projectile);
  for (const enemy of enemies) drawEnemy(enemy);
  drawDrone();

  for (const particle of particles) {
    const x = worldToScreenX(particle.x);
    const y = worldToScreenY(particle.y);
    line(x - z(3), y, x + z(3), y);
    line(x, y - z(3), x, y + z(3));
  }

  drawPlayerCharacter();
  if (game.state !== states.TITLE && game.state !== states.CUSTOMIZE) drawUi();
  drawCollectionNotice();
  drawScreenOverlay();
}
