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
  if (customization.colorTheme === "forest") {
    drawForestPlatforms(theme);
    return;
  }
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

function drawForestPlatforms(theme) {
  const trunkColor = themedColor(theme, "platform", "wood") || "#5c3d2e";
  const trunkDetail = themedColor(theme, "platform", "woodDetail") || "#8b6914";
  const canopyColor = themedColor(theme, "platform", "cement") || "#2d5016";
  const inkColor = theme.ink;

  for (const platform of world.platforms) {
    const x = worldToScreenX(platform.x);
    const x2 = worldToScreenX(platform.x + platform.width);
    const y = worldToScreenY(platform.y);
    if (x2 < -60 || x > window.innerWidth + 60) continue;

    const trunkWidth = Math.min(z(44), Math.max(z(28), (x2 - x) * 0.35));
    const trunkHeight = z(52);
    const cx = (x + x2) / 2;

    if (theme.colored) {
      ctx.fillStyle = trunkColor;
      ctx.beginPath();
      const rx = trunkWidth / 2;
      const ry = trunkHeight / 2;
      const ty = y;
      ctx.moveTo(cx - rx + z(4), ty);
      ctx.lineTo(cx + rx - z(4), ty);
      ctx.quadraticCurveTo(cx + rx, ty, cx + rx, ty + z(4));
      ctx.lineTo(cx + rx, ty + trunkHeight - z(4));
      ctx.quadraticCurveTo(cx + rx, ty + trunkHeight, cx + rx - z(4), ty + trunkHeight);
      ctx.lineTo(cx - rx + z(4), ty + trunkHeight);
      ctx.quadraticCurveTo(cx - rx, ty + trunkHeight, cx - rx, ty + trunkHeight - z(4));
      ctx.lineTo(cx - rx, ty + z(4));
      ctx.quadraticCurveTo(cx - rx, ty, cx - rx + z(4), ty);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = trunkDetail;
      ctx.lineWidth = strokeWidth(1.5);
      const stubCount = Math.max(1, Math.floor((x2 - x) / z(50)));
      for (let i = 0; i < stubCount; i++) {
        const t = (i + 0.5) / stubCount;
        const sx = x + (x2 - x) * t;
        const sy = y + trunkHeight * (0.2 + t * 0.4);
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        const dir = i % 2 === 0 ? 1 : -1;
        ctx.lineTo(sx + dir * z(14), sy - z(6));
        ctx.stroke();
      }

      ctx.fillStyle = canopyColor;
      ctx.beginPath();
      ctx.ellipse(cx, y - z(10), trunkWidth * 0.7, z(14), 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = inkColor;
      ctx.lineWidth = strokeWidth(1.5);
      ctx.stroke();
    }

    ctx.strokeStyle = inkColor;
    ctx.lineWidth = strokeWidth(2);
    line(x, y, x2, y);
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

    if (customization.colorTheme === "forest") {
      drawVineLadder(x, y, bottom, theme);
      continue;
    }

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

function drawVineLadder(x, y, bottom, theme) {
  const vineColor = themedColor(theme, "ladder", "rail") || "#228b22";
  const leafColor = themedColor(theme, "drone", "accent") || "#6b8e23";
  const inkColor = theme.ink;
  const totalHeight = bottom - y;
  if (totalHeight <= 0) return;

  ctx.lineWidth = strokeWidth(3);
  ctx.strokeStyle = vineColor;
  ctx.beginPath();
  ctx.moveTo(x, y);
  const segments = Math.max(4, Math.ceil(totalHeight / z(40)));
  for (let i = 1; i <= segments; i++) {
    const t = i / segments;
    const segY = y + totalHeight * t;
    const wobble = Math.sin(t * Math.PI * 2.5) * z(8);
    ctx.bezierCurveTo(
      x + wobble * 0.6, y + totalHeight * (t - 0.5 / segments),
      x - wobble * 0.6, segY - totalHeight * 0.05,
      x + wobble, segY
    );
  }
  ctx.stroke();

  ctx.lineWidth = strokeWidth(1.5);
  ctx.strokeStyle = inkColor;
  ctx.beginPath();
  ctx.moveTo(x, y);
  for (let i = 1; i <= segments; i++) {
    const t = i / segments;
    const segY = y + totalHeight * t;
    const wobble = Math.sin(t * Math.PI * 2.5) * z(8);
    ctx.bezierCurveTo(
      x + wobble * 0.6, y + totalHeight * (t - 0.5 / segments),
      x - wobble * 0.6, segY - totalHeight * 0.05,
      x + wobble, segY
    );
  }
  ctx.stroke();

  const leafSpacing = z(22);
  const leafCount = Math.floor(totalHeight / leafSpacing);
  for (let i = 0; i <= leafCount; i++) {
    const ly = y + i * leafSpacing;
    const lt = ly / bottom;
    const wobble = Math.sin(lt * Math.PI * 2.5) * z(8);
    const lx = x + wobble;
    const side = i % 2 === 0 ? 1 : -1;
    ctx.fillStyle = leafColor;
    ctx.beginPath();
    ctx.ellipse(lx + side * z(5), ly, z(3.5), z(2), side * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = strokeWidth(1);
    ctx.strokeStyle = inkColor;
    ctx.beginPath();
    ctx.ellipse(lx + side * z(5), ly, z(3.5), z(2), side * 0.4, 0, Math.PI * 2);
    ctx.stroke();
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
  } else if (projectile.weaponType === "question") {
    drawQuestionProjectile(x, y);
  } else {
    const fill = themedColor(theme, "attack", "magic");
    if (fill) ctx.fillStyle = fill;
    ctx.font = `${z(28)}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
    ctx.fillText("*", x - z(8), y + z(8));
  }
  ctx.restore();
}

function drawQuestionProjectile(x, y) {
  const time = performance.now() / 1000;
  const rot = Math.sin(time * 6) * 0.26;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);

  // Glow
  const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, z(16));
  glow.addColorStop(0, "rgba(255, 220, 60, 0.5)");
  glow.addColorStop(1, "rgba(255, 220, 60, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, z(16), 0, Math.PI * 2);
  ctx.fill();

  // Character
  ctx.fillStyle = "#ffd700";
  ctx.strokeStyle = "#b8860b";
  ctx.lineWidth = strokeWidth(1.5);
  ctx.font = `bold ${z(26)}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.strokeText("?", 0, 0);
  ctx.fillText("?", 0, 0);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

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

function drawMudZones(theme) {
  const mudColor = themedColor(theme, "ground", "grass") || "#3d2b1f";
  const mudHighlight = themedColor(theme, "ground", "detail") || "#5c4033";
  const inkColor = theme.ink;
  for (const zone of world.mudZones) {
    const x = worldToScreenX(zone.x);
    const y = worldToScreenY(zone.y);
    const w = z(zone.width);
    const h = z(zone.height);
    if (x + w < -40 || x > window.innerWidth + 40) continue;
    ctx.fillStyle = mudColor;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = inkColor;
    ctx.globalAlpha = 0.12;
    for (let i = 0; i < 6; i++) {
      const dx = x + w * (0.15 + (i * 0.15));
      const dy = y + h * (0.25 + (i % 3) * 0.25);
      ctx.fillRect(dx, dy, z(3), z(3));
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = mudHighlight;
    ctx.fillRect(x, y + h - z(2), w, z(2));
  }
}

function drawLeafParticle(particle, theme) {
  const x = worldToScreenX(particle.x);
  const y = worldToScreenY(particle.y);
  if (x < -30 || x > window.innerWidth + 30) return;
  const leafColor = themedColor(theme, "drone", "accent") || "#6b8e23";
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(particle.rotation || 0);
  ctx.globalAlpha = Math.min(1, (particle.life || 1) * 2);
  ctx.fillStyle = leafColor;
  ctx.beginPath();
  ctx.ellipse(0, 0, z(3), z(5), 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = theme.ink;
  ctx.lineWidth = strokeWidth(1);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, -z(4));
  ctx.lineTo(0, z(4));
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.restore();
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
  if (customization.colorTheme === "forest") drawMudZones(theme);
  ctx.strokeStyle = theme.ink;
  ctx.fillStyle = theme.ink;
  for (const drop of drops) drawDrop(drop);
  for (const projectile of projectiles) drawProjectile(projectile, theme);
  for (const enemy of enemies) drawEnemy(enemy);
  drawDrone(theme);

  for (const particle of particles) {
    if (particle.leaf) {
      drawLeafParticle(particle, theme);
      continue;
    }
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
