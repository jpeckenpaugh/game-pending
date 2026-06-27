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

  // Enraged red glow
  if (enemy.enraged > 0) {
    ctx.shadowColor = "#ff0000";
    ctx.shadowBlur = z(14);
  }

  ctx.lineWidth = strokeWidth(3);
  if (enemy.family === "ghost") {
    drawGhostEnemy(enemy, 0, 0);
  } else if (enemy.family === "triangle") {
    drawTriangleEnemy(enemy, 0, 0);
  } else if (enemy.family === "square") {
    drawSquareEnemy(enemy, 0, 0);
  } else if (enemy.family === "mirror") {
    drawMirrorEnemy(enemy, 0, 0);
  } else {
    drawCircleEnemy(enemy, 0, 0);
  }

  // Clear shadow after body
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;

  if (enemy.movement === "runner") {
    line(-z(enemy.radius + 8), z(enemy.radius + 4), z(enemy.radius + 8), z(enemy.radius + 4));
  }

  if (enemy.movement === "hopper") {
    line(-z(10), -z(enemy.radius + 8), 0, -z(enemy.radius + 2));
    line(z(10), -z(enemy.radius + 8), 0, -z(enemy.radius + 2));
  }

  // Philosophizing thought bubble
  if (enemy.philosophizing > 0) {
    drawPhilosophizingBubble(enemy, 0, 0);
  }

  ctx.restore();

  // Speech bubble drawn in screen space (after restore)
  if (enemy.ghostSpeechBubble) {
    drawSpeechBubble(enemy, x, y);
  }
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

function drawMirrorEnemy(enemy, x, y) {
  const r = z(enemy.radius);
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.lineTo(x + r, y);
  ctx.lineTo(x, y + r);
  ctx.lineTo(x - r, y);
  ctx.closePath();
  ctx.globalAlpha *= 0.18;
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.globalAlpha = Math.min(1, ctx.globalAlpha / 0.18);
  ctx.stroke();

  ctx.setLineDash([z(4), z(4)]);
  ctx.lineWidth = strokeWidth(1.5);
  ctx.beginPath();
  ctx.moveTo(x - r * 0.5, y - r * 0.5);
  ctx.lineTo(x + r * 0.5, y + r * 0.5);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + r * 0.5, y - r * 0.5);
  ctx.lineTo(x - r * 0.5, y + r * 0.5);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.lineWidth = strokeWidth(3);
  line(x - z(6), y - z(4), x - z(1), y - z(4));
  line(x + z(1), y - z(4), x + z(6), y - z(4));
  ctx.restore();
}

function drawGhostEnemy(enemy, x, y) {
  const r = z(enemy.radius);
  const bob = Math.sin(enemy.phase * 1.4) * z(6);
  const gy = y + bob;

  ctx.save();
  ctx.globalAlpha *= 0.6;

  // Body: oval with wavy bottom
  ctx.beginPath();
  ctx.ellipse(x, gy, r, r * 1.2, 0, Math.PI, 0, true);
  // Wavy bottom edge
  const waveCount = 4;
  const waveWidth = (r * 2) / waveCount;
  for (let i = 0; i <= waveCount; i += 1) {
    const wx = x - r + waveWidth * i;
    const wy = gy + Math.sin(i * Math.PI) * z(5) + z(6);
    if (i === 0) {
      ctx.lineTo(wx, wy);
    } else {
      const cpx = wx - waveWidth * 0.5;
      const cpy = gy + (i % 2 === 0 ? z(10) : z(2));
      ctx.quadraticCurveTo(cpx, cpy, wx, wy);
    }
  }
  ctx.closePath();

  const fill = enemyBodyFill(enemy);
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  ctx.stroke();

  ctx.globalAlpha = Math.min(1, ctx.globalAlpha / 0.6);

  // Eyes
  const eyeSpacing = z(6);
  const eyeY = gy - z(4);
  ctx.fillStyle = activeColorTheme().ink;
  ctx.beginPath();
  ctx.ellipse(x - eyeSpacing, eyeY, z(3), z(4), 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + eyeSpacing, eyeY, z(3), z(4), 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawPhilosophizingBubble(enemy, x, y) {
  const bubbleY = y - z(enemy.radius + 22);
  const bubbleW = z(36);
  const bubbleH = z(18);
  const cycle = Math.floor(performance.now() / 250) % 3;
  const dots = ".".repeat(cycle + 1);

  ctx.save();
  ctx.globalAlpha = 0.85;
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = activeColorTheme().ink;
  ctx.lineWidth = strokeWidth(1.5);

  // Rounded rect
  const rx = x - bubbleW / 2;
  const ry = bubbleY - bubbleH / 2;
  const cr = z(5);
  ctx.beginPath();
  ctx.moveTo(rx + cr, ry);
  ctx.lineTo(rx + bubbleW - cr, ry);
  ctx.arcTo(rx + bubbleW, ry, rx + bubbleW, ry + cr, cr);
  ctx.lineTo(rx + bubbleW, ry + bubbleH - cr);
  ctx.arcTo(rx + bubbleW, ry + bubbleH, rx + bubbleW - cr, ry + bubbleH, cr);
  ctx.lineTo(rx + cr, ry + bubbleH);
  ctx.arcTo(rx, ry + bubbleH, rx, ry + bubbleH - cr, cr);
  ctx.lineTo(rx, ry + cr);
  ctx.arcTo(rx, ry, rx + cr, ry, cr);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Tail circles
  const tailX = x;
  const tailY = bubbleY + bubbleH / 2 + z(4);
  ctx.beginPath();
  ctx.arc(tailX, tailY, z(3), 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(tailX + z(3), tailY + z(5), z(2), 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Dots text
  ctx.fillStyle = activeColorTheme().ink;
  ctx.font = `bold ${z(12)}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(dots, x, bubbleY);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  ctx.restore();
}

function drawSpeechBubble(enemy, screenX, screenY) {
  const bubble = enemy.ghostSpeechBubble;
  if (!bubble) return;

  const text = bubble.text;
  const angry = bubble.angry;
  const alpha = bubble.timer > 0 ? 1 : Math.max(0, 1 + bubble.timer * 2);

  ctx.save();
  ctx.globalAlpha *= alpha;

  // Measure text
  const fontSize = angry ? z(13) : z(12);
  const font = angry
    ? `bold ${fontSize}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`
    : `${fontSize}px "Comic Sans MS", cursive, ui-monospace, sans-serif`;
  ctx.font = font;
  const metrics = ctx.measureText(text);
  const textWidth = Math.min(metrics.width, z(200));
  const padding = z(8);
  const bubbleW = textWidth + padding * 2;
  const bubbleH = fontSize + padding * 2;
  const bx = screenX - bubbleW / 2;
  const by = screenY - z(enemy.radius + 50) - bubbleH;

  // Rounded rect
  const cr = z(6);
  ctx.beginPath();
  ctx.moveTo(bx + cr, by);
  ctx.lineTo(bx + bubbleW - cr, by);
  ctx.arcTo(bx + bubbleW, by, bx + bubbleW, by + cr, cr);
  ctx.lineTo(bx + bubbleW, by + bubbleH - cr);
  ctx.arcTo(bx + bubbleW, by + bubbleH, bx + bubbleW - cr, by + bubbleH, cr);
  ctx.lineTo(bx + cr, by + bubbleH);
  ctx.arcTo(bx, by + bubbleH, bx, by + bubbleH - cr, cr);
  ctx.lineTo(bx, by + cr);
  ctx.arcTo(bx, by, bx + cr, by, cr);
  ctx.closePath();

  // Fill and border
  ctx.fillStyle = angry ? "#fff0f0" : "#fff";
  ctx.fill();
  ctx.lineWidth = strokeWidth(angry ? 2.5 : 1.5);
  ctx.strokeStyle = angry ? "#e00" : activeColorTheme().ink;
  ctx.stroke();

  // Tail
  const tailX = screenX;
  const tailTop = by + bubbleH;
  ctx.beginPath();
  ctx.moveTo(tailX - z(5), tailTop - z(1));
  ctx.lineTo(tailX, tailTop + z(8));
  ctx.lineTo(tailX + z(5), tailTop - z(1));
  ctx.closePath();
  ctx.fillStyle = angry ? "#fff0f0" : "#fff";
  ctx.fill();
  ctx.lineWidth = strokeWidth(angry ? 2.5 : 1.5);
  ctx.strokeStyle = angry ? "#e00" : activeColorTheme().ink;
  ctx.beginPath();
  ctx.moveTo(tailX - z(5), tailTop);
  ctx.lineTo(tailX, tailTop + z(8));
  ctx.lineTo(tailX + z(5), tailTop);
  ctx.stroke();

  // Text
  ctx.fillStyle = angry ? "#c00" : activeColorTheme().ink;
  ctx.font = font;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const displayText = angry ? text.toUpperCase() : text;
  // Truncate if too long
  const maxChars = Math.floor((bubbleW - padding * 2) / (fontSize * 0.55));
  const truncated = displayText.length > maxChars ? displayText.slice(0, maxChars - 1) + "..." : displayText;
  ctx.fillText(truncated, bx + bubbleW / 2, by + bubbleH / 2);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  ctx.restore();
}
