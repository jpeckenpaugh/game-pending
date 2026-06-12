// Owns player-attached power-up visuals: boots thrust, Specs, Shield amulet/pulse,
// Radar watch, and held weapon angle. Base body art stays in playerCharacters.js.
import { camera, ctx, customization, enemies, keys, player, powerUps, touches } from "./state.js";
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
  if (ducking) {
    drawBoot(x - z(28), y - z(8), -1);
    drawBoot(x + z(12), y - z(8), 1);
    return;
  }
  drawBoot(x - z(22), y - z(8), -1);
  drawBoot(x + z(10), y - z(8), 1);
}

function drawBoot(x, y, side) {
  drawBootThrust(x + z(7), y + z(8));
  ctx.fillRect(x, y, z(14), z(8));
  const heelX = side < 0 ? x + z(10) : x;
  ctx.fillRect(heelX, y - z(5), z(5), z(5));
}

function drawBootThrust(x, y) {
  const burstActive = player.bootsPulseTimer > 0;
  const glideActive = rocketGlideVisible();
  if (!burstActive && !glideActive) return;

  const previousAlpha = ctx.globalAlpha;
  const previousLineWidth = ctx.lineWidth;
  ctx.lineWidth = strokeWidth(1.5);

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
  ctx.lineWidth = strokeWidth(2);
  ctx.beginPath();
  ctx.arc(x - z(5), y, z(3.2), 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x + z(5), y, z(3.2), 0, Math.PI * 2);
  ctx.stroke();
  line(x - z(1.8), y, x + z(1.8), y);
}

export function drawShieldPulse(x, y) {
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

export function drawShieldAmulet(x, y) {
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

export function drawRadarWatch(x, y) {
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
