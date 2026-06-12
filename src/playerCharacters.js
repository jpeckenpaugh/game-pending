import { camera, ctx, customization, game, player, powerUps } from "./state.js";
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
  if (customization.playerType === "croc") {
    drawCrocPlayer();
    return;
  }
  drawOriginalPlayer();
}

function shouldBlinkOut() {
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
    ctx.beginPath();
    ctx.arc(x, y - z(43), z(10), 0, Math.PI * 2);
    ctx.stroke();
    if (powerUps.specs) {
      line(x - z(8), y - z(44), x - z(2), y - z(44));
      line(x + z(2), y - z(44), x + z(8), y - z(44));
    }
    line(x, y - z(33), x - z(5) * player.facing, y - z(18));
    const weaponX = x + z(22) * player.facing;
    const weaponY = y - z(24);
    line(x - z(5) * player.facing, y - z(18), weaponX, weaponY);
    line(x - z(5) * player.facing, y - z(18), x - z(20), y);
    line(x - z(5) * player.facing, y - z(18), x + z(18), y);
    drawBoots(x, y, true);
    drawWeapon(customization.weaponType, weaponX, weaponY, player.facing, camera.zoom);
    return;
  }

  ctx.beginPath();
  ctx.arc(x, y - z(62), z(10), 0, Math.PI * 2);
  ctx.stroke();
  if (powerUps.specs) {
    line(x - z(8), y - z(63), x - z(2), y - z(63));
    line(x + z(2), y - z(63), x + z(8), y - z(63));
  }
  line(x, y - z(52), x, y - z(24));
  line(x, y - z(43), x - z(17) * player.facing, y - z(34) + z(stride * 3));
  const weaponX = x + z(22) * player.facing;
  const weaponY = y - z(38) - z(stride * 3);
  line(x, y - z(43), weaponX, weaponY);
  line(x, y - z(24), x - z(14), y);
  line(x, y - z(24), x + z(16), y - z(Math.abs(stride) * 8));
  drawBoots(x, y, false);
  drawWeapon(customization.weaponType, weaponX, weaponY, player.facing, camera.zoom);
}

function drawBoots(x, y, ducking) {
  if (!powerUps.boots) return;
  if (ducking) {
    ctx.fillRect(x - z(28), y - z(8), z(14), z(8));
    ctx.fillRect(x + z(12), y - z(8), z(14), z(8));
    return;
  }
  ctx.fillRect(x - z(22), y - z(8), z(14), z(8));
  ctx.fillRect(x + z(10), y - z(8), z(14), z(8));
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
  drawWeapon(customization.weaponType, handX, handY, player.facing, 1.35 * camera.zoom);
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
