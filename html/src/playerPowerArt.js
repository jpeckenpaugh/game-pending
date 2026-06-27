// Owns player-attached power-up visuals: boots thrust, Specs, Shield amulet/pulse,
// Radar watch, and held weapon angle. Base body art stays in playerCharacters.js.
import { camera, ctx, customization, enemies, keys, player, powerUps, touches } from "./state.js";
import { activeColorTheme, themedColor } from "./colorThemes.js";
import { isDucking } from "./player.js";
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

export function drawBoots(x, y, ducking) {
  if (!powerUps.bootsLevel) return;
  const theme = activeColorTheme();
  if (ducking) {
    drawBoot(x - z(28), y - z(8), -1, theme);
    drawBoot(x + z(12), y - z(8), 1, theme);
    return;
  }
  drawBoot(x - z(22), y - z(8), -1, theme);
  drawBoot(x + z(10), y - z(8), 1, theme);
}

function drawBoot(x, y, side, theme) {
  drawBootThrust(x + z(7), y + z(8), theme);
  const fill = themedColor(theme, "gear", "boots");
  ctx.save();
  if (fill) ctx.fillStyle = fill;
  ctx.fillRect(x, y, z(14), z(8));
  const heelX = side < 0 ? x + z(10) : x;
  ctx.fillRect(heelX, y - z(5), z(5), z(5));
  if (fill) {
    ctx.strokeStyle = theme.ink;
    ctx.lineWidth = strokeWidth(1.4);
    ctx.strokeRect(x, y, z(14), z(8));
    ctx.strokeRect(heelX, y - z(5), z(5), z(5));
  }
  ctx.restore();
}

function drawBootThrust(x, y, theme) {
  const burstActive = player.bootsPulseTimer > 0;
  const glideActive = rocketGlideVisible();
  if (!burstActive && !glideActive) return;

  const previousAlpha = ctx.globalAlpha;
  const previousLineWidth = ctx.lineWidth;
  ctx.lineWidth = strokeWidth(1.5);
  ctx.strokeStyle = themedColor(theme, "gear", "thrust") || ctx.strokeStyle;

  // Mid-air jumps use a stronger one-shot thrust; glide uses a softer loop.
  if (player.bootsPulseTimer > 0) {
    drawBootThrustOval(x, y, 1 - player.bootsPulseTimer / 0.28, 0.72, previousAlpha);
  }

  if (glideActive) {
    const time = performance.now() / 1200;
    drawBootThrustOval(x, y, time % 1, 0.24, previousAlpha);
    drawBootThrustOval(x, y, (time + 0.5) % 1, 0.16, previousAlpha);
  }

  ctx.globalAlpha = previousAlpha;
  ctx.lineWidth = previousLineWidth;
}

function drawBootThrustOval(x, y, progress, alpha, baseAlpha) {
  const clamped = Math.max(0, Math.min(1, progress));
  const centerY = y + z(5 + clamped * 24);
  const radiusX = z(3.5 + clamped * 7);
  const radiusY = z(1.6 + clamped * 5);
  ctx.globalAlpha = baseAlpha * alpha * (1 - clamped);
  ctx.beginPath();
  ctx.ellipse(x, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
  ctx.stroke();
}

function rocketGlideVisible() {
  if (powerUps.bootsLevel <= 5 || powerUps.bootsGlideCharge <= 0) return false;
  if (player.onGround || player.climbing || player.vy < 0) return false;
  if (keys.has("x")) return true;
  for (const zone of touches.values()) {
    if (zone === "jump") return true;
  }
  return false;
}

export function drawSpecs(x, y) {
  if (!powerUps.specs) return;
  const theme = activeColorTheme();
  ctx.save();
  ctx.strokeStyle = themedColor(theme, "gear", "specs") || ctx.strokeStyle;
  ctx.lineWidth = strokeWidth(2);
  ctx.beginPath();
  ctx.arc(x - z(5), y, z(3.2), 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x + z(5), y, z(3.2), 0, Math.PI * 2);
  ctx.stroke();
  line(x - z(1.8), y, x + z(1.8), y);
  ctx.restore();
}

export function drawShieldPulse(x, y) {
  if (powerUps.shieldLevel === 0) return;
  const theme = activeColorTheme();
  const previousAlpha = ctx.globalAlpha;
  const previousLineWidth = ctx.lineWidth;
  const previousStroke = ctx.strokeStyle;
  const chargeRatio = powerUps.shieldLevel > 0 ? powerUps.shieldCharges / powerUps.shieldLevel : 0;
  const time = performance.now() / 2200;
  const ringCount = 3;
  ctx.lineWidth = strokeWidth(1 + Math.min(2, powerUps.shieldLevel * 0.25 + powerUps.shieldCharges * 0.2));
  ctx.strokeStyle = themedColor(theme, "gear", "shield") || ctx.strokeStyle;
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
  ctx.strokeStyle = previousStroke;
}

export function drawShieldAmulet(x, y) {
  if (powerUps.shieldLevel === 0) return;
  const theme = activeColorTheme();
  const previousLineWidth = ctx.lineWidth;
  const previousFill = ctx.fillStyle;
  const previousStroke = ctx.strokeStyle;
  ctx.lineWidth = strokeWidth(2);
  ctx.strokeStyle = theme.ink;
  const vestFill = themedColor(theme, "gear", "vest");
  const shieldFill = themedColor(theme, "gear", "shield");
  if (vestFill) {
    ctx.fillStyle = vestFill;
    ctx.beginPath();
    ctx.moveTo(x, y - z(10));
    ctx.lineTo(x + z(7), y - z(2));
    ctx.lineTo(x, y + z(9));
    ctx.lineTo(x - z(7), y - z(2));
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  line(x - z(5), y - z(8), x, y - z(3));
  line(x + z(5), y - z(8), x, y - z(3));
  if (shieldFill) ctx.fillStyle = shieldFill;
  ctx.beginPath();
  ctx.arc(x, y, z(4.5), 0, Math.PI * 2);
  if (shieldFill) ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y, z(1.5), 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = previousLineWidth;
  ctx.fillStyle = previousFill;
  ctx.strokeStyle = previousStroke;
}

export function drawRadarWatch(x, y) {
  if (!powerUps.radar) return;
  const theme = activeColorTheme();
  const previousLineWidth = ctx.lineWidth;
  const previousFill = ctx.fillStyle;
  const previousStroke = ctx.strokeStyle;
  const radius = z(6);
  ctx.lineWidth = strokeWidth(1.6);
  ctx.strokeStyle = themedColor(theme, "gear", "radar") || ctx.strokeStyle;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();

  const target = nearestRadarTarget();
  if (target) {
    const angle = Math.atan2(target.y - player.y, target.x - player.x);
    const dotRadius = z(5);
    const dotX = x + Math.cos(angle) * radius;
    const dotY = y + Math.sin(angle) * radius;
    ctx.fillStyle = themedColor(theme, "gear", "radar") || ctx.fillStyle;
    ctx.beginPath();
    ctx.arc(dotX, dotY, dotRadius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.lineWidth = previousLineWidth;
  ctx.fillStyle = previousFill;
  ctx.strokeStyle = previousStroke;
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

export function drawHeldWeapon(x, y, scale = camera.zoom) {
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
