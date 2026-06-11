import { ctx } from "./state.js";

export function drawWeapon(type, x, y, facing, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(facing * scale, scale);
  if (type === "club") {
    drawClub();
  } else if (type === "wand") {
    drawWand();
  } else {
    drawGun();
  }
  ctx.restore();
}

function drawGun() {
  ctx.fillRect(-4, -3, 10, 8);
  ctx.fillRect(2, -8, 14, 5);
}

function drawClub() {
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(12, -17);
  ctx.stroke();

  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(12, -17);
  ctx.lineTo(19, -26);
  ctx.stroke();
}

function drawWand() {
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(15, -12);
  ctx.stroke();

  ctx.fillRect(12, -15, 6, 6);
}
