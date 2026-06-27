// Owns world rendering orchestration: terrain, platforms, ladders, portals,
// drops, projectiles, drone art, particles, player, HUD, and overlays.
import { camera, ctx, customization, drone, drops, enemies, game, particles, projectiles, states, world } from "./state.js";
import { activeColorTheme, themedColor } from "./colorThemes.js";
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

function drawBackground(theme) {
  if (!theme.colored) return;
  const gradient = ctx.createLinearGradient(0, 0, 0, window.innerHeight);
  gradient.addColorStop(0, theme.sky.top);
  gradient.addColorStop(1, theme.sky.bottom);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
}

function drawTerrain(theme) {
  const startX = Math.max(0, camera.x - 80);
  const endX = Math.min(world.width, camera.x + window.innerWidth / camera.zoom + 80);
  const first = Math.floor(startX / 40) * 40;

  if (theme.colored) {
    drawTerrainFill(theme, first, endX);
    drawCaveBackgrounds(theme);
    ctx.lineWidth = strokeWidth(8);
    ctx.strokeStyle = theme.ground.grass;
    traceTerrainLine(first, endX, 0);
    ctx.stroke();
  }

  ctx.lineWidth = strokeWidth(3);
  ctx.strokeStyle = theme.ink;
  traceTerrainLine(first, endX, 0.5);
  ctx.stroke();

  ctx.lineWidth = strokeWidth(2);
  ctx.strokeStyle = theme.colored ? theme.ground.detail : theme.ink;
  for (let x = Math.floor(startX / 80) * 80; x < endX; x += 80) {
    const y = worldToScreenY(groundAt(x + 12) + 8);
    line(worldToScreenX(x), y, worldToScreenX(x + 22), worldToScreenY(groundAt(x + 22) + 8));
  }

  drawPlatforms(theme);
  drawLadders(theme);
  drawTeleports(theme);
}

function traceTerrainLine(first, endX, yOffset = 0) {
  ctx.beginPath();
  ctx.moveTo(worldToScreenX(first), worldToScreenY(groundAt(first)) + yOffset);
  for (let x = first + 40; x <= endX + 40; x += 40) {
    ctx.lineTo(worldToScreenX(x), worldToScreenY(groundAt(x)) + yOffset);
  }
}

function drawTerrainFill(theme, first, endX) {
  const bottom = window.innerHeight + 80;
  ctx.fillStyle = theme.underground.fill;
  traceTerrainLine(first, endX, 0);
  ctx.lineTo(worldToScreenX(endX + 40), bottom);
  ctx.lineTo(worldToScreenX(first), bottom);
  ctx.closePath();
  ctx.fill();
}

function drawCaveBackgrounds(theme) {
  ctx.fillStyle = theme.underground.accent;
  for (const cave of world.caves) {
    const x = worldToScreenX(cave.x);
    const y = worldToScreenY(cave.y);
    const width = z(cave.width);
    const height = z(cave.height);
    if (x + width < -80 || x > window.innerWidth + 80 || y + height < -80 || y > window.innerHeight + 80) continue;
    ctx.fillRect(x, y, width, height);
  }
}

function drawPlatforms(theme) {
  for (const platform of world.platforms) {
    const x = worldToScreenX(platform.x);
    const x2 = worldToScreenX(platform.x + platform.width);
    const y = worldToScreenY(platform.y);
    if (x2 < -60 || x > window.innerWidth + 60) continue;

    const material = platformMaterial(platform, theme);
    if (theme.colored) {
      ctx.lineWidth = strokeWidth(platform.id === "cave-floor" ? 8 : 7);
      ctx.strokeStyle = material.fill;
      line(x, y, x2, y);
    }

    ctx.lineWidth = strokeWidth(3);
    ctx.strokeStyle = theme.ink;
    line(x, y, x2, y);

    ctx.lineWidth = strokeWidth(2);
    ctx.strokeStyle = material.detail;
    const hatchStart = platform.id === "cave-floor" ? x + z(12) : x + z(18);
    const hatchEnd = platform.id === "cave-floor" ? x2 - z(12) : x2;
    const hatchStep = platform.id === "cave-floor" ? z(52) : z(34);
    for (let rungX = hatchStart; rungX < hatchEnd; rungX += hatchStep) {
      line(rungX, y + z(4), rungX + z(14), y + z(13));
    }
  }
}

function platformMaterial(platform, theme) {
  if (!theme.colored) return { fill: theme.ink, detail: theme.ink };
  const cement = platform.id.includes("cave");
  return cement
    ? { fill: theme.platform.cement, detail: theme.platform.cementDetail }
    : { fill: theme.platform.wood, detail: theme.platform.woodDetail };
}

function drawLadders(theme) {
  for (const ladder of world.ladders) {
    const x = worldToScreenX(ladder.x);
    const y = worldToScreenY(ladder.y);
    const bottom = worldToScreenY(ladder.y + ladder.height);
    if (bottom < -60 || y > window.innerHeight + 60) continue;

    if (theme.colored) {
      ctx.lineWidth = strokeWidth(5);
      ctx.strokeStyle = theme.ladder.rail;
      line(x - z(16), y, x - z(16), bottom);
      line(x + z(16), y, x + z(16), bottom);
      ctx.strokeStyle = theme.ladder.rung;
      for (let rungY = y + z(16); rungY < bottom; rungY += z(28)) {
        line(x - z(16), rungY, x + z(16), rungY);
      }
    }

    ctx.lineWidth = strokeWidth(2);
    ctx.strokeStyle = theme.ink;
    line(x - z(16), y, x - z(16), bottom);
    line(x + z(16), y, x + z(16), bottom);
    for (let rungY = y + z(16); rungY < bottom; rungY += z(28)) {
      line(x - z(16), rungY, x + z(16), rungY);
    }
  }
}

function drawTeleports(theme) {
  ctx.lineWidth = strokeWidth(3);
  ctx.strokeStyle = theme.ink;
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

function drawProjectile(projectile, theme) {
  const x = worldToScreenX(projectile.x);
  const y = worldToScreenY(projectile.y);
  if (x < -80 || x > window.innerWidth + 80) return;
  ctx.save();
  if (projectile.homing) {
    const fill = themedColor(theme, "attack", "missile");
    ctx.lineWidth = strokeWidth(2);
    ctx.beginPath();
    ctx.arc(x, y, z(5), 0, Math.PI * 2);
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    ctx.stroke();
  } else if (projectile.weaponType === "club") {
    drawWeapon("club", x, y, projectile.vx >= 0 ? 1 : -1, camera.zoom, projectile.rotation || 0);
  } else if (projectile.weaponType === "gun") {
    const fill = themedColor(theme, "attack", "bullet");
    const size = Math.max(3, z(7));
    if (fill) ctx.fillStyle = fill;
    ctx.fillRect(x - size / 2, y - size / 2, size, size);
  } else {
    const fill = themedColor(theme, "attack", "magic");
    if (fill) ctx.fillStyle = fill;
    ctx.font = `${z(28)}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
    ctx.fillText("*", x - z(8), y + z(8));
  }
  ctx.restore();
}

function drawDrone(theme) {
  if (!drone.active) return;
  const x = worldToScreenX(drone.x);
  const y = worldToScreenY(drone.y);
  const style = customization.droneStyle || "oval";

  ctx.save();
  ctx.lineWidth = strokeWidth(2);
  ctx.strokeStyle = theme.ink;
  ctx.fillStyle = themedColor(theme, "drone", "body") || theme.ink;
  if (style === "helicopter") {
    drawHelicopterDrone(x, y, theme);
  } else if (style === "satellite") {
    drawSatelliteDrone(x, y, theme);
  } else if (style === "saucer") {
    drawSaucerDrone(x, y, theme);
  } else {
    drawOvalDrone(x, y, theme);
  }
  ctx.restore();
}

function fillIfColored(theme) {
  if (!theme.colored) return;
  ctx.fill();
}

function strokeEllipse(x, y, radiusX, radiusY, rotation = 0) {
  ctx.beginPath();
  ctx.ellipse(x, y, radiusX, radiusY, rotation, 0, Math.PI * 2);
  ctx.stroke();
}

function drawOvalDrone(x, y, theme) {
  ctx.beginPath();
  ctx.ellipse(x, y, z(18), z(8), 0, 0, Math.PI * 2);
  fillIfColored(theme);
  ctx.stroke();
  line(x - z(7), y - z(9), x - z(13), y - z(17));
  line(x + z(7), y - z(9), x + z(13), y - z(17));
}

function drawHelicopterDrone(x, y, theme) {
  const facing = drone.direction || 1;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(facing, 1);
  ctx.fillStyle = themedColor(theme, "drone", "body") || theme.ink;
  ctx.beginPath();
  ctx.ellipse(0, 0, z(18), z(8), 0, 0, Math.PI * 2);
  fillIfColored(theme);
  ctx.stroke();
  line(-z(18), 0, -z(34), -z(5));
  strokeEllipse(-z(38), -z(5), z(4), z(4));
  ctx.strokeStyle = themedColor(theme, "drone", "rotor") || theme.ink;
  line(-z(24), -z(16), z(24), -z(16));
  line(0, -z(8), 0, -z(16));
  ctx.fillStyle = themedColor(theme, "drone", "accent") || theme.ink;
  ctx.beginPath();
  ctx.arc(z(8), -z(1), z(3), 0, Math.PI * 2);
  fillIfColored(theme);
  ctx.stroke();
  ctx.restore();
}

function drawSatelliteDrone(x, y, theme) {
  const body = z(16);
  const panelWidth = z(16);
  const panelHeight = z(12);
  ctx.fillStyle = themedColor(theme, "drone", "body") || theme.ink;
  if (theme.colored) ctx.fillRect(x - body / 2, y - body / 2, body, body);
  ctx.strokeRect(x - body / 2, y - body / 2, body, body);

  ctx.fillStyle = themedColor(theme, "drone", "accent") || theme.ink;
  if (theme.colored) {
    ctx.fillRect(x - body / 2 - panelWidth - z(4), y - panelHeight / 2, panelWidth, panelHeight);
    ctx.fillRect(x + body / 2 + z(4), y - panelHeight / 2, panelWidth, panelHeight);
  }
  ctx.strokeRect(x - body / 2 - panelWidth - z(4), y - panelHeight / 2, panelWidth, panelHeight);
  ctx.strokeRect(x + body / 2 + z(4), y - panelHeight / 2, panelWidth, panelHeight);
  line(x - body / 2, y, x - body / 2 - z(4), y);
  line(x + body / 2, y, x + body / 2 + z(4), y);
  line(x, y - body / 2, x + z(8), y - body);
  strokeEllipse(x + z(10), y - body - z(2), z(3.5), z(3.5));
}

function drawSaucerDrone(x, y, theme) {
  ctx.fillStyle = themedColor(theme, "drone", "body") || theme.ink;
  ctx.beginPath();
  ctx.ellipse(x, y + z(2), z(24), z(8), 0, 0, Math.PI * 2);
  fillIfColored(theme);
  ctx.stroke();

  ctx.fillStyle = themedColor(theme, "drone", "accent") || theme.ink;
  ctx.beginPath();
  ctx.ellipse(x, y - z(4), z(11), z(8), 0, Math.PI, Math.PI * 2);
  if (theme.colored) ctx.fill();
  ctx.stroke();

  const beam = themedColor(theme, "drone", "beam");
  if (beam) {
    const previousAlpha = ctx.globalAlpha;
    ctx.globalAlpha *= 0.34;
    ctx.fillStyle = beam;
    ctx.beginPath();
    ctx.moveTo(x - z(9), y + z(8));
    ctx.lineTo(x + z(9), y + z(8));
    ctx.lineTo(x + z(18), y + z(28));
    ctx.lineTo(x - z(18), y + z(28));
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = previousAlpha;
  }
}

function drawCollectionNotice() {
  if (game.state !== states.LEVEL_COLLECTING) return;
  ctx.font = "18px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
  ctx.textAlign = "center";
  ctx.fillText("Collecting ammo...", window.innerWidth / 2, 42);
  ctx.textAlign = "left";
}

export function draw() {
  const theme = activeColorTheme();
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  drawBackground(theme);
  ctx.strokeStyle = theme.ink;
  ctx.fillStyle = theme.ink;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = 3;

  drawTerrain(theme);
  ctx.strokeStyle = theme.ink;
  ctx.fillStyle = theme.ink;
  for (const drop of drops) drawDrop(drop);
  for (const projectile of projectiles) drawProjectile(projectile, theme);
  for (const enemy of enemies) drawEnemy(enemy);
  drawDrone(theme);

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
