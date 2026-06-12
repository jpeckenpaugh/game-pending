// Owns enemy rendering only. Movement, AI, defeat, and suspension timers stay
// in enemies.js so this module can stay stateless and purely visual.
import { camera, ctx } from "./state.js";
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
  ctx.beginPath();
  ctx.arc(x, y, z(enemy.radius), 0, Math.PI * 2);
  ctx.stroke();

  line(x - z(8), y - z(5), x - z(2), y - z(5));
  line(x + z(2), y - z(5), x + z(8), y - z(5));
}

function drawTriangleEnemy(enemy, x, y) {
  ctx.beginPath();
  ctx.moveTo(x, y - z(enemy.radius));
  ctx.lineTo(x - z(enemy.radius), y + z(enemy.radius));
  ctx.lineTo(x + z(enemy.radius), y + z(enemy.radius));
  ctx.closePath();
  ctx.stroke();

  line(x - z(8), y + z(3), x - z(2), y + z(3));
  line(x + z(2), y + z(3), x + z(8), y + z(3));
}

function drawSquareEnemy(enemy, x, y) {
  const radius = z(enemy.radius);
  const size = radius * 2;
  ctx.strokeRect(x - radius, y - radius, size, size);
  const shieldX = x + enemy.facing * z(enemy.radius + 8);
  line(shieldX, y - radius, shieldX, y + radius);
  line(shieldX, y - radius, shieldX + enemy.facing * z(8), y - radius + z(6));
  line(shieldX, y + radius, shieldX + enemy.facing * z(8), y + radius - z(6));

  line(x - z(8), y - z(5), x - z(2), y - z(5));
  line(x + z(2), y - z(5), x + z(8), y - z(5));
}
