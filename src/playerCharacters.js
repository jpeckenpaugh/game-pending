import { camera, ctx, customization, enemies, game, keys, player, powerUps, touches, world } from "./state.js";
import { isDucking } from "./player.js";
import { worldToScreenX, worldToScreenY } from "./terrain.js";
import { drawWeapon } from "./weapons.js";

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

export function drawPlayerCharacter() {
  if (game.teleportPhase === "pan") return;
  const effect = teleportPlayerEffect();
  if (effect) {
    const baseOriginX = worldToScreenX(player.x);
    const baseOriginY = worldToScreenY(player.y - player.height * 0.45);
    const originX = baseOriginX + effect.offsetX;
    const originY = baseOriginY + effect.offsetY;
    ctx.save();
    ctx.globalAlpha *= effect.alpha;
    ctx.translate(originX, originY);
    ctx.rotate(effect.rotation);
    ctx.scale(effect.scale, effect.scale);
    ctx.translate(-baseOriginX, -baseOriginY);
  }

  if (customization.playerType === "croc") {
    drawCrocPlayer();
    if (effect) ctx.restore();
    return;
  }
  drawOriginalPlayer();
  if (effect) ctx.restore();
}

function teleportPlayerEffect() {
  if (game.teleportPhase !== "zoomOut" && game.teleportPhase !== "zoomIn") return null;
  const rawProgress = game.teleportDuration > 0
    ? Math.max(0, Math.min(1, game.teleportTimer / game.teleportDuration))
    : 1;
  const progress = rawProgress * rawProgress * (3 - 2 * rawProgress);
  const spin = Math.PI * 4;
  const bodyX = player.x;
  const bodyY = player.y - player.height * 0.45;
  const portal = nearestTeleportCenter(game.teleportPhase === "zoomOut" ? game.teleportFromX : game.teleportToX);
  const portalOffsetX = portal ? worldToScreenX(portal.x) - worldToScreenX(bodyX) : 0;
  const portalOffsetY = portal ? worldToScreenY(portal.y) - worldToScreenY(bodyY) : 0;

  if (game.teleportPhase === "zoomOut") {
    return {
      alpha: 1 - progress * 0.92,
      offsetX: portalOffsetX * progress,
      offsetY: portalOffsetY * progress,
      rotation: spin * progress,
      scale: 1 - progress * 0.86,
    };
  }

  return {
    alpha: 0.08 + progress * 0.92,
    offsetX: portalOffsetX * (1 - progress),
    offsetY: portalOffsetY * (1 - progress),
    rotation: -spin * (1 - progress),
    scale: 0.14 + progress * 0.86,
  };
}

function nearestTeleportCenter(x) {
  let nearest = null;
  let nearestDistance = Infinity;
  for (const teleport of world.teleports) {
    const distance = Math.abs(teleport.x - x);
    if (distance < nearestDistance) {
      nearest = teleport;
      nearestDistance = distance;
    }
  }
  return nearest ? { x: nearest.x, y: nearest.y + nearest.height / 2 } : null;
}

function shouldBlinkOut() {
  if (game.teleportPhase !== "idle") return false;
  return player.invulnerableFor > 0 && Math.floor(performance.now() / 90) % 2 === 0;
}

function drawOriginalPlayer() {
  const x = worldToScreenX(player.x);
  const y = worldToScreenY(player.y);
  const ducking = isDucking();
  const stride = Math.sin(performance.now() / 90) * (Math.abs(player.vx) / 360);
  if (shouldBlinkOut()) return;

  ctx.lineWidth = strokeWidth(3);
  if (ducking) {
    const amuletX = x - z(4) * player.facing;
    const amuletY = y - z(27);
    const radarX = x - z(16) * player.facing;
    const radarY = y - z(18);
    drawShieldPulse(amuletX, amuletY);
    ctx.beginPath();
    ctx.arc(x, y - z(43), z(10), 0, Math.PI * 2);
    ctx.stroke();
    drawSpecs(x, y - z(44));
    line(x, y - z(33), x - z(5) * player.facing, y - z(18));
    const weaponX = x + z(22) * player.facing;
    const weaponY = y - z(24);
    line(x - z(5) * player.facing, y - z(18), weaponX, weaponY);
    drawShieldAmulet(amuletX, amuletY);
    line(x - z(5) * player.facing, y - z(18), x - z(20), y);
    line(x - z(5) * player.facing, y - z(18), x + z(18), y);
    drawRadarWatch(radarX, radarY);
    drawBoots(x, y, true);
    drawHeldWeapon(weaponX, weaponY);
    return;
  }

  ctx.beginPath();
  ctx.arc(x, y - z(62), z(10), 0, Math.PI * 2);
  ctx.stroke();
  drawSpecs(x, y - z(63));
  line(x, y - z(52), x, y - z(24));
  const amuletX = x;
  const amuletY = y - z(38);
  drawShieldPulse(amuletX, amuletY);
  drawShieldAmulet(amuletX, amuletY);
  const radarX = x - z(17) * player.facing;
  const radarY = y - z(34) + z(stride * 3);
  line(x, y - z(43), radarX, radarY);
  drawRadarWatch(radarX, radarY);
  const weaponX = x + z(22) * player.facing;
  const weaponY = y - z(38) - z(stride * 3);
  line(x, y - z(43), weaponX, weaponY);
  line(x, y - z(24), x - z(14), y);
  line(x, y - z(24), x + z(16), y - z(Math.abs(stride) * 8));
  drawBoots(x, y, false);
  drawHeldWeapon(weaponX, weaponY);
}

function drawBoots(x, y, ducking) {
  if (!powerUps.boots) return;
  if (ducking) {
    drawBoot(x - z(28), y - z(8), -1);
    drawBoot(x + z(12), y - z(8), 1);
    return;
  }
  drawBoot(x - z(22), y - z(8), -1);
  drawBoot(x + z(10), y - z(8), 1);
}

function drawBoot(x, y, side) {
  ctx.fillRect(x, y, z(14), z(8));
  const heelX = side < 0 ? x + z(10) : x;
  ctx.fillRect(heelX, y - z(5), z(5), z(5));
}

function drawSpecs(x, y) {
  if (!powerUps.specs) return;
  ctx.lineWidth = strokeWidth(2);
  ctx.beginPath();
  ctx.arc(x - z(5), y, z(3.2), 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x + z(5), y, z(3.2), 0, Math.PI * 2);
  ctx.stroke();
  line(x - z(1.8), y, x + z(1.8), y);
}

function drawShieldPulse(x, y) {
  if (powerUps.shieldLevel === 0) return;
  const previousAlpha = ctx.globalAlpha;
  const previousLineWidth = ctx.lineWidth;
  const chargeRatio = powerUps.shieldLevel > 0 ? powerUps.shieldCharges / powerUps.shieldLevel : 0;
  const time = performance.now() / 2200;
  const ringCount = 3;
  ctx.lineWidth = strokeWidth(1 + Math.min(2, powerUps.shieldLevel * 0.25 + powerUps.shieldCharges * 0.2));
  for (let i = 0; i < ringCount; i += 1) {
    const progress = (time + i / ringCount) % 1;
    const radius = z(8 + progress * 34);
    const fade = (1 - progress) * (0.12 + chargeRatio * 0.22);
    ctx.globalAlpha = previousAlpha * fade;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = previousAlpha;
  ctx.lineWidth = previousLineWidth;
}

function drawShieldAmulet(x, y) {
  if (powerUps.shieldLevel === 0) return;
  const previousLineWidth = ctx.lineWidth;
  ctx.lineWidth = strokeWidth(2);
  line(x - z(5), y - z(8), x, y - z(3));
  line(x + z(5), y - z(8), x, y - z(3));
  ctx.beginPath();
  ctx.arc(x, y, z(4.5), 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y, z(1.5), 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = previousLineWidth;
}

function drawRadarWatch(x, y) {
  if (!powerUps.radar) return;
  const previousLineWidth = ctx.lineWidth;
  const radius = z(6);
  ctx.lineWidth = strokeWidth(1.6);
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();

  const target = nearestRadarTarget();
  if (target) {
    const angle = Math.atan2(target.y - player.y, target.x - player.x);
    const dotRadius = z(5);
    const dotX = x + Math.cos(angle) * radius;
    const dotY = y + Math.sin(angle) * radius;
    ctx.beginPath();
    ctx.arc(dotX, dotY, dotRadius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.lineWidth = previousLineWidth;
}

function drawHeldWeapon(x, y, scale = camera.zoom) {
  const aim = customization.weaponType === "gun" ? heldWeaponAim() : null;
  drawWeapon(customization.weaponType, x, y, aim?.facing ?? player.facing, scale, aim?.rotation ?? 0);
}

function heldWeaponAim() {
  const direction = heldWeaponAimDirection();
  if (!direction) return null;
  const facing = direction.x === 0 ? player.facing : direction.x > 0 ? 1 : -1;
  return {
    facing,
    rotation: Math.atan2(direction.y, Math.abs(direction.x)),
  };
}

function heldWeaponAimDirection() {
  const x = heldWeaponHorizontalAxis();
  const y = heldWeaponVerticalAxis();
  if (x === 0 && y === 0) return null;
  return { x, y };
}

function heldWeaponHorizontalAxis() {
  let axis = 0;
  if (keys.has("arrowleft") || keys.has("a")) axis -= 1;
  if (keys.has("arrowright") || keys.has("d")) axis += 1;

  for (const zone of touches.values()) {
    if (zone === "left") axis -= 1;
    if (zone === "right") axis += 1;
  }

  return Math.max(-1, Math.min(1, axis));
}

function heldWeaponVerticalAxis() {
  let axis = 0;
  if (keys.has("arrowup") || keys.has("w")) axis -= 1;
  if (keys.has("arrowdown") || keys.has("s")) axis += 1;

  for (const zone of touches.values()) {
    if (zone === "jump") axis -= 1;
    if (zone === "duck") axis += 1;
  }

  if (axis > 0 && isDucking()) return 0;
  return Math.max(-1, Math.min(1, axis));
}

function nearestRadarTarget() {
  let nearest = null;
  let nearestDistanceSq = Infinity;
  for (const enemy of enemies) {
    if (!enemy.alive) continue;
    const dx = enemy.x - player.x;
    const dy = enemy.y - player.y;
    const distanceSq = dx * dx + dy * dy;
    if (distanceSq < nearestDistanceSq) {
      nearest = enemy;
      nearestDistanceSq = distanceSq;
    }
  }
  return nearest;
}

function drawCrocPlayer() {
  if (shouldBlinkOut()) return;

  const x = worldToScreenX(player.x);
  const y = worldToScreenY(player.y);
  const scale = (isDucking() ? 0.29 : 0.34) * camera.zoom;
  const yScale = isDucking() ? 0.74 : 1;
  const mirror = player.facing === -1 ? 1 : -1;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(mirror * scale, scale * yScale);
  ctx.translate(-156, -300);
  ctx.lineWidth = 6;
  drawCrocBody();
  ctx.restore();

  const handX = x + mirror * scale * (62 - 156);
  const handY = y + scale * yScale * (190 - 300);
  drawHeldWeapon(handX, handY, 1.35 * camera.zoom);
}

function drawCrocBody() {
  ctx.save();
  ctx.fillStyle = "#000";
  ctx.strokeStyle = "#000";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.save();
  ctx.translate(156, 128);
  ctx.scale(0.5, 0.5);
  ctx.translate(-156, -128);
  drawCrocHead();
  ctx.restore();

  line(156, 128, 156, 206);
  path("M156 156 L210 198");
  path("M156 206 Q196 246 290 238");
  path("M156 206 Q210 254 300 236");
  path("M156 146 L116 174 L62 190");
  path("M156 156 L206 194 L222 238");
  path("M156 206 L104 260 L102 286");
  path("M156 206 L126 274 L148 292");

  filledTriangle(160, 206, 178, 198, 174, 218);
  filledTriangle(184, 224, 202, 216, 198, 238);
  filledTriangle(210, 238, 226, 228, 226, 250);
  filledTriangle(238, 246, 252, 232, 258, 258);
  filledTriangle(270, 246, 282, 232, 290, 258);

  ctx.fillRect(88, 278, 34, 20);
  ctx.fillRect(72, 290, 52, 10);
  filledPath("M142 270 L164 298 L116 298 L116 292 L132 292 L124 276 Z");
  ctx.restore();
}

function drawCrocHead() {
  path("M140 24 L174 24 L186 34 L210 42 L224 58 L226 92 L218 112 L204 128 L180 138 L152 136");
  path("M140 34 L40 66 L28 80 L30 98 L136 98 L158 82 L178 82 L202 96");
  path("M36 100 L56 112 L150 126 L178 126");
  path("M40 78 Q48 70 56 74");
  path("M150 42 Q164 34 188 40");
  path("M150 58 Q166 46 184 58 Q168 72 150 58");
  path("M166 50 Q162 60 166 70");
  path("M194 42 L206 56");

  filledTriangle(66, 100, 76, 100, 72, 110);
  filledTriangle(92, 100, 102, 100, 97, 114);
  filledTriangle(120, 100, 132, 100, 126, 116);
  filledTriangle(150, 98, 162, 98, 156, 118);
}

function path(data) {
  ctx.stroke(new Path2D(data));
}

function filledPath(data) {
  ctx.fill(new Path2D(data));
}

function filledTriangle(x1, y1, x2, y2, x3, y3) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x3, y3);
  ctx.closePath();
  ctx.fill();
}
