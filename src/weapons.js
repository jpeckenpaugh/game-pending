// Owns small held-weapon drawings. Projectile behavior and aiming live in
// projectiles.js; player attachment points live in playerPowerArt.js.
import { ctx } from "./state.js";
import { activeColorTheme, themedColor } from "./colorThemes.js";

export function drawWeapon(type, x, y, facing, scale = 1, rotation = 0) {
  const theme = activeColorTheme();
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(facing * scale, scale);
  ctx.rotate(rotation);
  if (type === "club") {
    drawClub(theme);
  } else if (type === "wand") {
    drawWand(theme);
  } else {
    drawGun(theme);
  }
  ctx.restore();
}

function drawGun(theme) {
  const fill = themedColor(theme, "weapon", "gun");
  if (fill) ctx.fillStyle = fill;
  ctx.fillRect(-4, -3, 10, 8);
  ctx.fillRect(2, -8, 14, 5);
  if (!fill) return;
  ctx.strokeStyle = theme.ink;
  ctx.lineWidth = 1.4;
  ctx.strokeRect(-4, -3, 10, 8);
  ctx.strokeRect(2, -8, 14, 5);
}

function drawClub(theme) {
  const fill = themedColor(theme, "weapon", "club");
  if (fill) {
    drawClubStroke(theme.ink, 7);
    drawClubStroke(fill, 4);
    return;
  }
  drawClubStroke(ctx.strokeStyle, 5);
}

function drawClubStroke(color, width) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(12, -17);
  ctx.lineTo(19, -26);
  ctx.stroke();
}

function drawWand(theme) {
  const fill = themedColor(theme, "weapon", "wand");
  if (fill) {
    drawWandStroke(theme.ink, 5);
    drawWandStroke(fill, 2.5);
  } else {
    drawWandStroke(ctx.strokeStyle, 3);
  }

  const accent = themedColor(theme, "weapon", "accent");
  if (accent) ctx.fillStyle = accent;
  ctx.fillRect(12, -15, 6, 6);
  if (accent) {
    ctx.strokeStyle = theme.ink;
    ctx.lineWidth = 1;
    ctx.strokeRect(12, -15, 6, 6);
  }
}

function drawWandStroke(color, width) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(15, -12);
  ctx.stroke();
}
