// Shared power-up icon artwork for HUD slots and pick-three choice cards.
// Keep these small and independent from live player pose.
import { ctx, customization } from "./state.js";
import { activeColorTheme, themedColor } from "./colorThemes.js";

function line(x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

export function drawPowerIcon(type, x, y, scale = 1) {
  const theme = activeColorTheme();
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.lineWidth = 2;
  ctx.strokeStyle = theme.ink;
  if (type === "boots") {
    const fill = themedColor(theme, "gear", "boots");
    if (fill) ctx.fillStyle = fill;
    ctx.fillRect(-20, 4, 16, 9);
    ctx.fillRect(-9, -2, 6, 6);
    ctx.fillRect(5, 4, 16, 9);
    ctx.fillRect(5, -2, 6, 6);
    if (fill) {
      ctx.strokeRect(-20, 4, 16, 9);
      ctx.strokeRect(-9, -2, 6, 6);
      ctx.strokeRect(5, 4, 16, 9);
      ctx.strokeRect(5, -2, 6, 6);
    }
  } else if (type === "shield") {
    ctx.strokeStyle = themedColor(theme, "gear", "shield") || theme.ink;
    ctx.beginPath();
    ctx.arc(0, 0, 9, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
    ctx.stroke();
  } else if (type === "drone") {
    drawDroneIcon(theme);
  } else if (type === "radar") {
    ctx.strokeStyle = themedColor(theme, "gear", "radar") || theme.ink;
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = themedColor(theme, "gear", "radar") || ctx.fillStyle;
    ctx.beginPath();
    ctx.arc(14, -14, 5, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === "haste") {
    ctx.strokeStyle = themedColor(theme, "gear", "radar") || theme.ink;
    ctx.beginPath();
    ctx.moveTo(-4, -18);
    ctx.lineTo(6, -18);
    ctx.lineTo(2, -4);
    ctx.lineTo(10, -4);
    ctx.lineTo(-2, 18);
    ctx.lineTo(2, 4);
    ctx.lineTo(-6, 4);
    ctx.closePath();
    ctx.stroke();
  } else {
    ctx.strokeStyle = themedColor(theme, "gear", "specs") || theme.ink;
    ctx.beginPath();
    ctx.arc(-8, 0, 7, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(8, 0, 7, 0, Math.PI * 2);
    ctx.stroke();
    line(-1.5, 0, 1.5, 0);
  }
  ctx.restore();
}

function fillIfColored(theme) {
  if (theme.colored) ctx.fill();
}

function drawDroneIcon(theme) {
  const fill = themedColor(theme, "drone", "body");
  if (fill) ctx.fillStyle = fill;
  const style = customization.droneStyle || "oval";
  if (style === "helicopter") {
    ctx.beginPath();
    ctx.ellipse(0, 0, 19, 8, 0, 0, Math.PI * 2);
    fillIfColored(theme);
    ctx.stroke();
    line(-18, 0, -34, -5);
    ctx.beginPath();
    ctx.arc(-38, -5, 4, 0, Math.PI * 2);
    ctx.stroke();
    line(-24, -17, 24, -17);
    line(0, -8, 0, -17);
    return;
  }

  if (style === "satellite") {
    if (fill) ctx.fillRect(-8, -8, 16, 16);
    ctx.strokeRect(-8, -8, 16, 16);
    const accent = themedColor(theme, "drone", "accent");
    if (accent) ctx.fillStyle = accent;
    if (accent) {
      ctx.fillRect(-30, -7, 16, 14);
      ctx.fillRect(14, -7, 16, 14);
    }
    ctx.strokeRect(-30, -7, 16, 14);
    ctx.strokeRect(14, -7, 16, 14);
    line(-14, 0, -8, 0);
    line(8, 0, 14, 0);
    line(0, -8, 9, -18);
    return;
  }

  if (style === "saucer") {
    ctx.beginPath();
    ctx.ellipse(0, 3, 26, 9, 0, 0, Math.PI * 2);
    fillIfColored(theme);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(0, -3, 11, 8, 0, Math.PI, Math.PI * 2);
    if (theme.colored) ctx.fill();
    ctx.stroke();
    return;
  }

  ctx.beginPath();
  ctx.ellipse(0, 0, 22, 10, 0, 0, Math.PI * 2);
  fillIfColored(theme);
  ctx.stroke();
  line(-9, -11, -16, -21);
  line(9, -11, 16, -21);
}
