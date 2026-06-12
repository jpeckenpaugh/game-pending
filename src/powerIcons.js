// Shared power-up icon artwork for HUD slots and pick-three choice cards.
// Keep these small, monochrome, and independent from live player pose.
import { ctx } from "./state.js";

function line(x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

export function drawPowerIcon(type, x, y, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.lineWidth = 2;
  if (type === "boots") {
    ctx.fillRect(-20, 4, 16, 9);
    ctx.fillRect(-9, -2, 6, 6);
    ctx.fillRect(5, 4, 16, 9);
    ctx.fillRect(5, -2, 6, 6);
  } else if (type === "shield") {
    ctx.beginPath();
    ctx.arc(0, 0, 9, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
    ctx.stroke();
  } else if (type === "drone") {
    ctx.beginPath();
    ctx.ellipse(0, 0, 22, 10, 0, 0, Math.PI * 2);
    ctx.stroke();
    line(-9, -11, -16, -21);
    line(9, -11, 16, -21);
  } else if (type === "radar") {
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(14, -14, 5, 0, Math.PI * 2);
    ctx.fill();
  } else {
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
