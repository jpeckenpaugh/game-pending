// Owns selectable player body rendering and teleport player transform effects.
// Power-up adornments and held weapon art are delegated to playerPowerArt.js.
import { camera, ctx, customization, game, player, world } from "./state.js";
import { isDucking } from "./player.js";
import { worldToScreenX, worldToScreenY } from "./terrain.js";
import { drawBoots, drawHeldWeapon, drawRadarWatch, drawShieldAmulet, drawShieldPulse, drawSpecs } from "./playerPowerArt.js";

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

  drawOriginalPlayer();
  if (effect) ctx.restore();
}

function teleportPlayerEffect() {
  if (game.teleportPhase !== "zoomOut" && game.teleportPhase !== "zoomIn") return null;
  // Player spin/shrink mirrors the camera teleport phases managed in main.js.
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

function displayedFaceRadius(radius) {
  if (customization.face !== "emoji") return radius;
  return radius * (customization.bigHead ? 4 : 2);
}

function drawPlayerFace(x, y, radius) {
  const displayRadius = displayedFaceRadius(radius);
  const faceMode = customization.face || "classic";
  if (faceMode === "classic") {
    ctx.beginPath();
    ctx.arc(x, y, displayRadius, 0, Math.PI * 2);
    ctx.stroke();
    return;
  }

  const face = player.faceMood || "smile";
  const head = customization.head || "stick";
  drawEmojiHead(head, face, customization.faceStyle, x, y, displayRadius);
}

export function drawEmojiHead(head, face, style, x, y, radius) {
  const palette = facePalette(style);
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = Math.max(1, radius * 0.18);
  ctx.fillStyle = headFill(head, palette);
  ctx.strokeStyle = palette.stroke;
  drawHeadBase(head, x, y, radius, palette);

  ctx.lineWidth = Math.max(1, radius * 0.14);
  ctx.strokeStyle = palette.feature;
  ctx.fillStyle = palette.feature;
  const s = radius / 10;
  if (face === "angry") {
    drawAngryFace(x, y, s);
  } else if (face === "crying") {
    drawCryingFace(x, y, s, palette);
  } else if (face === "surprised") {
    drawSurprisedFace(x, y, s);
  } else if (face === "hurt") {
    drawHurtFace(x, y, s);
  } else {
    drawSmileFace(x, y, s, palette);
  }
  ctx.restore();
}

function facePalette(style) {
  if (style === "color") {
    return {
      style,
      fill: "#ffd84d",
      stroke: "#000",
      feature: "#000",
      accent: "#4b94e8",
      cheek: "#f293a6",
    };
  }

  if (style === "greyscale") {
    return {
      style,
      fill: "#d9d9d9",
      stroke: "#000",
      feature: "#000",
      accent: "#777",
      cheek: "#aaa",
    };
  }

  return {
    style: "monochrome",
    fill: "#fff",
    stroke: "#000",
    feature: "#000",
    accent: "#000",
    cheek: "",
  };
}

function headFill(head, palette) {
  if (palette.style !== "color") return palette.fill;
  if (head === "dog") return "#d79a56";
  if (head === "cat") return "#f0a64d";
  if (head === "frog") return "#8ccf68";
  if (head === "horse") return "#b8794d";
  if (head === "fish") return "#75c7e8";
  if (head === "robot") return "#c8d0d6";
  if (head === "skull") return "#fff5df";
  if (head === "alien") return "#b9dd6c";
  return palette.fill;
}

function headAccent(head, palette) {
  if (palette.style === "monochrome") return "#fff";
  if (palette.style === "greyscale") return "#f3f3f3";
  if (head === "dog") return "#f3d6a8";
  if (head === "cat") return "#ffd7a0";
  if (head === "frog") return "#b9e89a";
  if (head === "horse") return "#e4b47c";
  if (head === "fish") return "#b9eaff";
  if (head === "robot") return "#eef2f5";
  if (head === "skull") return "#fff";
  if (head === "alien") return "#e2f6a2";
  return "#ffe98a";
}

function drawHeadBase(head, x, y, radius, palette) {
  if (head === "dog") {
    drawDogHead(x, y, radius, palette);
  } else if (head === "cat") {
    drawCatHead(x, y, radius, palette);
  } else if (head === "frog") {
    drawFrogHead(x, y, radius, palette);
  } else if (head === "horse") {
    drawHorseHead(x, y, radius, palette);
  } else if (head === "fish") {
    drawFishHead(x, y, radius, palette);
  } else if (head === "robot") {
    drawRobotHead(x, y, radius, palette);
  } else if (head === "skull") {
    drawSkullHead(x, y, radius, palette);
  } else if (head === "alien") {
    drawAlienHead(x, y, radius, palette);
  } else {
    drawStickHead(x, y, radius);
  }
}

function drawStickHead(x, y, radius) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

function drawDogHead(x, y, radius, palette) {
  const accent = headAccent("dog", palette);
  ctx.fillStyle = headFill("dog", palette);
  ellipse(x - radius * 0.72, y - radius * 0.02, radius * 0.32, radius * 0.62, -0.18);
  ellipse(x + radius * 0.72, y - radius * 0.02, radius * 0.32, radius * 0.62, 0.18);
  drawStickHead(x, y, radius * 0.95);
  ctx.fillStyle = accent;
  ellipse(x, y + radius * 0.3, radius * 0.45, radius * 0.28, 0);
  ctx.fillStyle = palette.feature;
  dot(x, y + radius * 0.1, radius * 0.13);
}

function drawCatHead(x, y, radius, palette) {
  ctx.fillStyle = headFill("cat", palette);
  outlinedTriangle(x - radius * 0.62, y - radius * 0.52, x - radius * 0.3, y - radius * 1.1, x - radius * 0.04, y - radius * 0.48);
  outlinedTriangle(x + radius * 0.62, y - radius * 0.52, x + radius * 0.3, y - radius * 1.1, x + radius * 0.04, y - radius * 0.48);
  drawStickHead(x, y, radius * 0.92);
  ctx.strokeStyle = palette.feature;
  ctx.lineWidth = Math.max(1, radius * 0.1);
  line(x - radius * 0.74, y + radius * 0.08, x - radius * 1.18, y - radius * 0.02);
  line(x - radius * 0.72, y + radius * 0.26, x - radius * 1.14, y + radius * 0.32);
  line(x + radius * 0.74, y + radius * 0.08, x + radius * 1.18, y - radius * 0.02);
  line(x + radius * 0.72, y + radius * 0.26, x + radius * 1.14, y + radius * 0.32);
}

function drawFrogHead(x, y, radius, palette) {
  ctx.fillStyle = headFill("frog", palette);
  ellipse(x - radius * 0.42, y - radius * 0.74, radius * 0.3, radius * 0.28, 0);
  ellipse(x + radius * 0.42, y - radius * 0.74, radius * 0.3, radius * 0.28, 0);
  ellipse(x, y, radius * 1.04, radius * 0.82, 0);
}

function drawHorseHead(x, y, radius, palette) {
  ctx.fillStyle = headFill("horse", palette);
  outlinedTriangle(x - radius * 0.42, y - radius * 0.62, x - radius * 0.24, y - radius * 1.12, x - radius * 0.02, y - radius * 0.6);
  outlinedTriangle(x + radius * 0.42, y - radius * 0.62, x + radius * 0.24, y - radius * 1.12, x + radius * 0.02, y - radius * 0.6);
  ellipse(x, y - radius * 0.08, radius * 0.72, radius * 0.98, 0);
  ctx.fillStyle = headAccent("horse", palette);
  ellipse(x, y + radius * 0.44, radius * 0.42, radius * 0.3, 0);
  ctx.fillStyle = palette.feature;
  line(x - radius * 0.18, y - radius * 0.98, x + radius * 0.18, y - radius * 0.2);
}

function drawFishHead(x, y, radius, palette) {
  ctx.fillStyle = headFill("fish", palette);
  ellipse(x - radius * 0.14, y, radius * 0.98, radius * 0.68, 0);
  outlinedTriangle(x + radius * 0.72, y, x + radius * 1.26, y - radius * 0.48, x + radius * 1.26, y + radius * 0.48);
  ctx.fillStyle = headAccent("fish", palette);
  ctx.beginPath();
  ctx.moveTo(x - radius * 0.08, y - radius * 0.62);
  ctx.quadraticCurveTo(x + radius * 0.22, y - radius * 1.02, x + radius * 0.44, y - radius * 0.52);
  ctx.stroke();
}

function drawRobotHead(x, y, radius, palette) {
  const size = radius * 1.7;
  ctx.fillStyle = headFill("robot", palette);
  ctx.fillRect(x - size / 2, y - size / 2, size, size);
  ctx.strokeRect(x - size / 2, y - size / 2, size, size);
  ctx.fillStyle = palette.feature;
  line(x, y - size / 2, x, y - radius * 1.1);
  dot(x, y - radius * 1.15, radius * 0.12);
  ctx.fillStyle = headAccent("robot", palette);
  ctx.fillRect(x - radius * 0.58, y - radius * 0.62, radius * 1.16, radius * 0.18);
  ctx.strokeRect(x - radius * 0.58, y - radius * 0.62, radius * 1.16, radius * 0.18);
}

function drawSkullHead(x, y, radius, palette) {
  ctx.fillStyle = headFill("skull", palette);
  ctx.beginPath();
  ctx.arc(x, y - radius * 0.1, radius * 0.88, Math.PI * 0.08, Math.PI * 1.92);
  ctx.quadraticCurveTo(x + radius * 0.48, y + radius * 0.95, x, y + radius * 0.92);
  ctx.quadraticCurveTo(x - radius * 0.48, y + radius * 0.95, x - radius * 0.86, y + radius * 0.08);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = palette.feature;
  ctx.fillRect(x - radius * 0.3, y + radius * 0.72, radius * 0.18, radius * 0.22);
  ctx.fillRect(x + radius * 0.12, y + radius * 0.72, radius * 0.18, radius * 0.22);
}

function drawAlienHead(x, y, radius, palette) {
  ctx.fillStyle = headFill("alien", palette);
  ctx.beginPath();
  ctx.ellipse(x, y - radius * 0.04, radius * 0.9, radius * 1.05, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = headAccent("alien", palette);
  ellipse(x - radius * 0.48, y - radius * 0.42, radius * 0.26, radius * 0.38, -0.32);
  ellipse(x + radius * 0.48, y - radius * 0.42, radius * 0.26, radius * 0.38, 0.32);
  ctx.fillStyle = palette.feature;
}

function drawSmileFace(x, y, s, palette) {
  dot(x - 3.2 * s, y - 2.4 * s, 0.85 * s);
  dot(x + 3.2 * s, y - 2.4 * s, 0.85 * s);
  drawCheeks(x, y, s, palette);
  curve(x - 4.2 * s, y + 1.8 * s, x, y + 5.2 * s, x + 4.2 * s, y + 1.8 * s);
}

function drawAngryFace(x, y, s) {
  line(x - 5.2 * s, y - 5 * s, x - 1.4 * s, y - 3.1 * s);
  line(x + 1.4 * s, y - 3.1 * s, x + 5.2 * s, y - 5 * s);
  line(x - 4.4 * s, y - 1.4 * s, x - 1.4 * s, y - 1.4 * s);
  line(x + 1.4 * s, y - 1.4 * s, x + 4.4 * s, y - 1.4 * s);
  curve(x - 4.2 * s, y + 5 * s, x, y + 2.3 * s, x + 4.2 * s, y + 5 * s);
}

function drawCryingFace(x, y, s, palette) {
  dot(x - 3.2 * s, y - 2.4 * s, 0.82 * s);
  line(x + 2.1 * s, y - 2.2 * s, x + 4.7 * s, y - 2.2 * s);
  drawTear(x - 4.8 * s, y + 1.2 * s, s, palette);
  curve(x - 4.1 * s, y + 5 * s, x, y + 2.2 * s, x + 4.1 * s, y + 5 * s);
}

function drawSurprisedFace(x, y, s) {
  circle(x - 3.2 * s, y - 2.5 * s, 0.95 * s);
  circle(x + 3.2 * s, y - 2.5 * s, 0.95 * s);
  ctx.beginPath();
  ctx.ellipse(x, y + 3 * s, 1.8 * s, 2.4 * s, 0, 0, Math.PI * 2);
  ctx.stroke();
}

function drawHurtFace(x, y, s) {
  xEye(x - 3.3 * s, y - 2.5 * s, s);
  xEye(x + 3.3 * s, y - 2.5 * s, s);
  ctx.beginPath();
  ctx.moveTo(x - 4.4 * s, y + 3.8 * s);
  ctx.lineTo(x - 2.4 * s, y + 2.4 * s);
  ctx.lineTo(x, y + 4.2 * s);
  ctx.lineTo(x + 2.4 * s, y + 2.4 * s);
  ctx.lineTo(x + 4.4 * s, y + 3.8 * s);
  ctx.stroke();
}

function drawCheeks(x, y, s, palette) {
  if (!palette.cheek) return;
  const previousFill = ctx.fillStyle;
  ctx.fillStyle = palette.cheek;
  dot(x - 5.4 * s, y + 1.4 * s, 0.9 * s);
  dot(x + 5.4 * s, y + 1.4 * s, 0.9 * s);
  ctx.fillStyle = previousFill;
}

function drawTear(x, y, s, palette) {
  const previousFill = ctx.fillStyle;
  const previousStroke = ctx.strokeStyle;
  ctx.fillStyle = palette.accent;
  ctx.strokeStyle = palette.accent;
  ctx.beginPath();
  ctx.moveTo(x, y - 2.2 * s);
  ctx.quadraticCurveTo(x + 2 * s, y + 0.8 * s, x, y + 3 * s);
  ctx.quadraticCurveTo(x - 2 * s, y + 0.8 * s, x, y - 2.2 * s);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = previousFill;
  ctx.strokeStyle = previousStroke;
}

function dot(x, y, radius) {
  ctx.beginPath();
  ctx.arc(x, y, Math.max(1, radius), 0, Math.PI * 2);
  ctx.fill();
}

function ellipse(x, y, radiusX, radiusY, rotation) {
  ctx.beginPath();
  ctx.ellipse(x, y, Math.max(1, radiusX), Math.max(1, radiusY), rotation, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

function circle(x, y, radius) {
  ctx.beginPath();
  ctx.arc(x, y, Math.max(1, radius), 0, Math.PI * 2);
  ctx.stroke();
}

function curve(startX, startY, controlX, controlY, endX, endY) {
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.quadraticCurveTo(controlX, controlY, endX, endY);
  ctx.stroke();
}

function xEye(x, y, s) {
  line(x - 1.4 * s, y - 1.4 * s, x + 1.4 * s, y + 1.4 * s);
  line(x + 1.4 * s, y - 1.4 * s, x - 1.4 * s, y + 1.4 * s);
}

function outlinedTriangle(x1, y1, x2, y2, x3, y3) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x3, y3);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawOriginalPlayer() {
  const x = worldToScreenX(player.x);
  const y = worldToScreenY(player.y);
  const ducking = isDucking();
  const stride = Math.sin(performance.now() / 90) * (Math.abs(player.vx) / 360);
  if (shouldBlinkOut()) return;

  ctx.lineWidth = strokeWidth(3);
  if (ducking) {
    const baseHeadRadius = z(10);
    const headRadius = displayedFaceRadius(baseHeadRadius);
    const headBottomY = y - z(33);
    const headY = headBottomY - headRadius;
    const amuletX = x - z(4) * player.facing;
    const amuletY = y - z(27);
    const radarX = x - z(16) * player.facing;
    const radarY = y - z(18);
    drawShieldPulse(amuletX, amuletY);
    drawPlayerFace(x, headY, baseHeadRadius);
    drawSpecs(x, headY - headRadius * 0.08);
    line(x, headBottomY, x - z(5) * player.facing, y - z(18));
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

  const baseHeadRadius = z(10);
  const headRadius = displayedFaceRadius(baseHeadRadius);
  const headBottomY = y - z(52);
  const headY = headBottomY - headRadius;
  drawPlayerFace(x, headY, baseHeadRadius);
  drawSpecs(x, headY - headRadius * 0.08);
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
