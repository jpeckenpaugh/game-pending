import { ctx, customization, player, powerUps } from "./state.js";
import { isDucking } from "./player.js";
import { worldToScreenX } from "./terrain.js";

function line(x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

export function drawPlayerCharacter() {
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
  const y = player.y;
  const ducking = isDucking();
  const stride = Math.sin(performance.now() / 90) * (Math.abs(player.vx) / 360);
  if (shouldBlinkOut()) return;

  ctx.lineWidth = 3;
  if (ducking) {
    ctx.beginPath();
    ctx.arc(x, y - 43, 10, 0, Math.PI * 2);
    ctx.stroke();
    if (powerUps.specs) {
      line(x - 8, y - 44, x - 2, y - 44);
      line(x + 2, y - 44, x + 8, y - 44);
    }
    line(x, y - 33, x - 5 * player.facing, y - 18);
    line(x - 5 * player.facing, y - 18, x + 22 * player.facing, y - 24);
    line(x - 5 * player.facing, y - 18, x - 20, y);
    line(x - 5 * player.facing, y - 18, x + 18, y);
    drawBoots(x, y, true);
    drawGun(x + player.facing * 24, y - 25, player.facing);
    return;
  }

  ctx.beginPath();
  ctx.arc(x, y - 62, 10, 0, Math.PI * 2);
  ctx.stroke();
  if (powerUps.specs) {
    line(x - 8, y - 63, x - 2, y - 63);
    line(x + 2, y - 63, x + 8, y - 63);
  }
  line(x, y - 52, x, y - 24);
  line(x, y - 43, x - 17 * player.facing, y - 34 + stride * 3);
  line(x, y - 43, x + 22 * player.facing, y - 38 - stride * 3);
  line(x, y - 24, x - 14, y);
  line(x, y - 24, x + 16, y - Math.abs(stride) * 8);
  drawBoots(x, y, false);
  drawGun(x + player.facing * 23, y - 43, player.facing);
}

function drawGun(x, y, facing) {
  ctx.fillRect(x - 4, y - 3, 10, 8);
  const barrelX = facing === 1 ? x + 2 : x - 16;
  ctx.fillRect(barrelX, y - 8, 14, 5);
}

function drawBoots(x, y, ducking) {
  if (!powerUps.boots) return;
  if (ducking) {
    ctx.fillRect(x - 28, y - 8, 14, 8);
    ctx.fillRect(x + 12, y - 8, 14, 8);
    return;
  }
  ctx.fillRect(x - 22, y - 8, 14, 8);
  ctx.fillRect(x + 10, y - 8, 14, 8);
}

function drawCrocPlayer() {
  if (shouldBlinkOut()) return;

  const x = worldToScreenX(player.x);
  const y = player.y;
  const scale = isDucking() ? 0.29 : 0.34;
  const yScale = isDucking() ? 0.74 : 1;
  const mirror = player.facing === -1 ? 1 : -1;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(mirror * scale, scale * yScale);
  ctx.translate(-156, -300);
  ctx.lineWidth = 6;
  drawCrocBody();
  ctx.restore();
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

  ctx.save();
  ctx.translate(62, 190);
  ctx.scale(0.5, 0.5);
  ctx.translate(-62, -190);
  path("M62 190 L18 82 Q12 68 26 66 Q36 66 44 82 L78 210 Q82 222 70 224 Q62 224 58 214 Z");
  ctx.restore();

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
