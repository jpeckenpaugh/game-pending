// Owns enemy rendering only. Movement, AI, defeat, and suspension timers stay
// in enemies.js so this module can stay stateless and purely visual.
import { camera, ctx, customization } from "./state.js";
import { activeColorTheme, enemyThemeColor } from "./colorThemes.js";
import { drawEmojiHead } from "./playerCharacters.js";
import { worldToScreenX, worldToScreenY } from "./terrain.js";

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

export function drawEnemy(enemy) {
  if (!enemy.alive) return;
  const x = worldToScreenX(enemy.x);
  if (x < -60 || x > window.innerWidth + 60) return;
  const y = worldToScreenY(enemy.y);

  ctx.save();
  ctx.translate(x, y);
  if (enemy.suspendedFor > 0) {
    ctx.rotate(enemy.suspendedSpin || 0);
  }
  if (enemy.flashTimer > 0 && Math.floor(performance.now() / 110) % 2 === 0) {
    ctx.globalAlpha *= 0.35;
  }

  ctx.lineWidth = strokeWidth(3);
  if (enemy.family === "triangle") {
    drawTriangleEnemy(enemy, 0, 0);
  } else if (enemy.family === "square") {
    drawSquareEnemy(enemy, 0, 0);
  } else {
    drawCircleEnemy(enemy, 0, 0);
  }

  if (enemy.movement === "runner") {
    line(-z(enemy.radius + 8), z(enemy.radius + 4), z(enemy.radius + 8), z(enemy.radius + 4));
  }

  if (enemy.movement === "hopper") {
    line(-z(10), -z(enemy.radius + 8), 0, -z(enemy.radius + 2));
    line(z(10), -z(enemy.radius + 8), 0, -z(enemy.radius + 2));
  }
  ctx.restore();
}

function drawCircleEnemy(enemy, x, y) {
  if (drawCustomEnemyHead(enemy, x, y)) return;

  const fill = enemyBodyFill(enemy);
  ctx.beginPath();
  ctx.arc(x, y, z(enemy.radius), 0, Math.PI * 2);
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  ctx.stroke();

  line(x - z(8), y - z(5), x - z(2), y - z(5));
  line(x + z(2), y - z(5), x + z(8), y - z(5));
}

function drawTriangleEnemy(enemy, x, y) {
  if (drawCustomEnemyHead(enemy, x, y)) return;

  const fill = enemyBodyFill(enemy);
  ctx.beginPath();
  ctx.moveTo(x, y - z(enemy.radius));
  ctx.lineTo(x - z(enemy.radius), y + z(enemy.radius));
  ctx.lineTo(x + z(enemy.radius), y + z(enemy.radius));
  ctx.closePath();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  ctx.stroke();

  line(x - z(8), y + z(3), x - z(2), y + z(3));
  line(x + z(2), y + z(3), x + z(8), y + z(3));
}

function drawSquareEnemy(enemy, x, y) {
  if (drawCustomEnemyHead(enemy, x, y)) return;

  const fill = enemyBodyFill(enemy);
  const radius = z(enemy.radius);
  const size = radius * 2;
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fillRect(x - radius, y - radius, size, size);
  }
  ctx.strokeRect(x - radius, y - radius, size, size);
  drawSquareShield(enemy, x, y, radius);

  line(x - z(8), y - z(5), x - z(2), y - z(5));
  line(x + z(2), y - z(5), x + z(8), y - z(5));
}

function drawCustomEnemyHead(enemy, x, y) {
  const head = enemyHeadForFamily(enemy.family);
  if (head === "classic") return false;

  const fill = enemyBodyFill(enemy);
  const markerRadius = z(enemy.radius * 1.18);
  const headRadius = z(enemy.radius * 0.95);
  ctx.save();
  ctx.lineWidth = strokeWidth(2);
  if (fill) {
    ctx.globalAlpha *= 0.56;
    ctx.fillStyle = fill;
    drawFamilyMarker(enemy.family, x, y, markerRadius, true);
  } else {
    ctx.globalAlpha *= 0.42;
  }
  ctx.strokeStyle = activeColorTheme().ink;
  drawFamilyMarker(enemy.family, x, y, markerRadius);
  ctx.restore();

  drawEmojiHead(head, enemyFaceForFamily(enemy), customization.opponentFaceStyle, x, y, headRadius);
  if (enemy.family === "square") drawSquareShield(enemy, x, y, markerRadius * 0.92);
  return true;
}

function enemyBodyFill(enemy) {
  const theme = activeColorTheme();
  return enemyThemeColor(theme, enemy.colorIndex);
}

function enemyHeadForFamily(family) {
  if (family === "triangle") return customization.triangleHead || "classic";
  if (family === "square") return customization.squareHead || "classic";
  return customization.circleHead || "classic";
}

function enemyFaceForFamily(enemy) {
  if (enemy.flashTimer > 0) return "hurt";
  if (enemy.family === "triangle") return "angry";
  if (enemy.family === "square") return "surprised";
  return "smile";
}

function drawFamilyMarker(family, x, y, radius, fill = false) {
  if (family === "triangle") {
    ctx.beginPath();
    ctx.moveTo(x, y - radius);
    ctx.lineTo(x - radius, y + radius);
    ctx.lineTo(x + radius, y + radius);
    ctx.closePath();
    if (fill) ctx.fill();
    else ctx.stroke();
    return;
  }

  if (family === "square") {
    if (fill) ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    else ctx.strokeRect(x - radius, y - radius, radius * 2, radius * 2);
    return;
  }

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  if (fill) ctx.fill();
  else ctx.stroke();
}

function drawSquareShield(enemy, x, y, radius) {
  const shieldX = x + enemy.facing * (radius + z(8));
  line(shieldX, y - radius, shieldX, y + radius);
  line(shieldX, y - radius, shieldX + enemy.facing * z(8), y - radius + z(6));
  line(shieldX, y + radius, shieldX + enemy.facing * z(8), y + radius - z(6));
}
