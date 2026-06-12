// Owns the in-game HUD: top status row, world progress, messages, touch hint,
// and bottom power-up icon/charge strip. Menu overlays live in menus.js.
import { ctx, game, player, powerUps, world } from "./state.js";
import { bootsGlideMax, droneExtraMissileMax, primaryPowerLevel, shieldKineticMax } from "./powerups.js";
import { drawPowerIcon } from "./powerIcons.js";

export function drawUi() {
  ctx.setTransform(window.devicePixelRatio || 1, 0, 0, window.devicePixelRatio || 1, 0, 0);
  drawHeaderHud();
  drawPowerHud();

  const progressWidth = Math.min(260, window.innerWidth - 36);
  ctx.strokeRect(18, 92, progressWidth, 8);
  ctx.fillRect(18, 92, progressWidth * (player.x / world.width), 8);

  if (game.messageTimer > 0) {
    ctx.font = "18px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
    ctx.textAlign = "center";
    ctx.fillText(game.message, window.innerWidth / 2, 72);
    ctx.textAlign = "left";
  }

  if (window.matchMedia("(pointer: coarse)").matches) {
    ctx.font = "13px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
    const hintY = activePowerSlots().length > 0 ? window.innerHeight - 92 : window.innerHeight - 18;
    ctx.fillText("Left: move  |  upper right: jump  |  lower middle: duck  |  lower right: shoot", 18, hintY);
  }
}

function drawHeaderHud() {
  const margin = 12;
  const width = window.innerWidth - margin * 2;
  const height = 36;
  ctx.save();
  ctx.fillStyle = "rgba(255, 255, 255, 0.84)";
  ctx.fillRect(margin, 10, width, height);
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  ctx.strokeRect(margin, 10, width, height);
  ctx.fillStyle = "#000";
  ctx.font = "16px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
  ctx.textAlign = "left";
  ctx.fillText(`Level ${game.level}`, margin + 12, 33);
  ctx.textAlign = "center";
  ctx.fillText(`Ammo ${player.ammo}`, window.innerWidth / 2, 33);
  ctx.textAlign = "right";
  ctx.fillText(`Enemies ${game.enemiesRemaining}`, margin + width - 12, 33);
  ctx.textAlign = "left";
  ctx.restore();
}

function drawPowerHud() {
  const slots = activePowerSlots();
  if (slots.length === 0) return;
  const slotWidth = 62;
  const slotHeight = slots.some((slot) => slot.charges?.length > 1) ? 66 : 54;
  const gap = 12;
  const totalWidth = slots.length * slotWidth + (slots.length - 1) * gap;
  const x = (window.innerWidth - totalWidth) / 2;
  const y = window.innerHeight - slotHeight - 14;
  const framePadding = 8;

  ctx.save();
  ctx.fillStyle = "rgba(255, 255, 255, 0.84)";
  ctx.fillRect(x - framePadding, y - framePadding, totalWidth + framePadding * 2, slotHeight + framePadding * 2);
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  ctx.strokeRect(x - framePadding, y - framePadding, totalWidth + framePadding * 2, slotHeight + framePadding * 2);
  ctx.fillStyle = "#000";

  for (let i = 0; i < slots.length; i += 1) {
    const slotX = x + i * (slotWidth + gap);
    drawPowerHudSlot(slots[i], slotX, y, slotWidth, slotHeight);
  }
  ctx.restore();
}

function activePowerSlots() {
  const slots = [];
  // Charge arrays render as stacked bars. Primary resources stay first; tier-two
  // resources, when unlocked, sit directly underneath the same power icon.
  if (powerUps.bootsLevel) {
    slots.push({
      type: "boots",
      level: powerUps.bootsLevel,
      charges: [
        primaryPowerLevel(powerUps.bootsLevel) > 0 ? player.airJumpsRemaining / primaryPowerLevel(powerUps.bootsLevel) : null,
        bootsGlideMax() > 0 ? powerUps.bootsGlideCharge / bootsGlideMax() : null,
      ].filter((charge) => charge != null),
    });
  }
  if (powerUps.specs) slots.push({ type: "specs" });
  if (powerUps.radar) slots.push({ type: "radar" });
  if (powerUps.shieldLevel) {
    slots.push({
      type: "shield",
      level: powerUps.shieldLevel,
      charges: [
        smoothChargeRatio(primaryPowerLevel(powerUps.shieldLevel), powerUps.shieldCharges, powerUps.shieldRecharge, 10),
        smoothChargeRatio(shieldKineticMax(), powerUps.shieldKineticCharges, powerUps.shieldKineticRecharge, 20),
      ].filter((charge) => charge != null),
    });
  }
  if (powerUps.droneLevel) {
    slots.push({
      type: "drone",
      level: powerUps.droneLevel,
      charges: [
        smoothChargeRatio(primaryPowerLevel(powerUps.droneLevel), powerUps.droneCharges, powerUps.droneRecharge, 10),
        smoothChargeRatio(droneExtraMissileMax(), powerUps.droneExtraMissiles, powerUps.droneExtraRecharge, 5),
      ].filter((charge) => charge != null),
    });
  }
  return slots;
}

function smoothChargeRatio(level, charges, recharge, rechargeTime) {
  if (level <= 0) return null;
  const partial = charges < level ? Math.min(1, recharge / rechargeTime) : 0;
  return Math.max(0, Math.min(1, (charges + partial) / level));
}

function drawPowerHudSlot(slot, x, y, width, height) {
  drawPowerIcon(slot.type, x + width / 2, y + 22, 0.72);
  if (slot.level) {
    ctx.font = "12px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
    ctx.textAlign = "left";
    ctx.fillText(`+${slot.level}`, x + width - 18, y + 16);
  }
  const charges = slot.charges || (slot.charge != null ? [slot.charge] : []);
  for (let i = 0; i < charges.length; i += 1) {
    const barX = x + 8;
    const barY = y + height - 10 + i * 7 - (charges.length - 1) * 7;
    const barWidth = width - 16;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(barX, barY, barWidth, 5);
    ctx.fillRect(barX, barY, barWidth * Math.max(0, Math.min(1, charges[i])), 5);
  }
}
