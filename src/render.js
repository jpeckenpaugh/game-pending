import { camera, ctx, customization, drone, drops, enemies, game, particles, player, powerUps, projectiles, states, world } from "./state.js";
import { groundAt, worldToScreenX } from "./terrain.js";
import { powerUpSummary } from "./powerups.js";
import { drawPlayerCharacter } from "./playerCharacters.js";

function line(x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function drawTerrain() {
  const startX = Math.max(0, camera.x - 80);
  const endX = Math.min(world.width, camera.x + window.innerWidth + 80);
  const first = Math.floor(startX / 40) * 40;

  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(worldToScreenX(first), groundAt(first) + 0.5);
  for (let x = first + 40; x <= endX + 40; x += 40) {
    ctx.lineTo(worldToScreenX(x), groundAt(x) + 0.5);
  }
  ctx.stroke();

  ctx.lineWidth = 2;
  for (let x = Math.floor(startX / 80) * 80; x < endX; x += 80) {
    const y = groundAt(x + 12) + 8;
    line(worldToScreenX(x), y, worldToScreenX(x + 22), groundAt(x + 22) + 8);
  }
}

function drawEnemy(enemy) {
  if (!enemy.alive) return;
  const x = worldToScreenX(enemy.x);
  if (x < -60 || x > window.innerWidth + 60) return;

  ctx.lineWidth = 3;
  if (enemy.family === "triangle") {
    drawTriangleEnemy(enemy, x);
  } else if (enemy.family === "square") {
    drawSquareEnemy(enemy, x);
  } else {
    drawCircleEnemy(enemy, x);
  }

  if (enemy.movement === "runner") {
    line(x - enemy.radius - 8, enemy.y + enemy.radius + 4, x + enemy.radius + 8, enemy.y + enemy.radius + 4);
  }

  if (enemy.movement === "hopper") {
    line(x - 10, enemy.y - enemy.radius - 8, x, enemy.y - enemy.radius - 2);
    line(x + 10, enemy.y - enemy.radius - 8, x, enemy.y - enemy.radius - 2);
  }
}

function drawCircleEnemy(enemy, x) {
  ctx.beginPath();
  ctx.arc(x, enemy.y, enemy.radius, 0, Math.PI * 2);
  ctx.stroke();

  line(x - 8, enemy.y - 5, x - 2, enemy.y - 5);
  line(x + 2, enemy.y - 5, x + 8, enemy.y - 5);
}

function drawTriangleEnemy(enemy, x) {
  ctx.beginPath();
  ctx.moveTo(x, enemy.y - enemy.radius);
  ctx.lineTo(x - enemy.radius, enemy.y + enemy.radius);
  ctx.lineTo(x + enemy.radius, enemy.y + enemy.radius);
  ctx.closePath();
  ctx.stroke();

  line(x - 8, enemy.y + 3, x - 2, enemy.y + 3);
  line(x + 2, enemy.y + 3, x + 8, enemy.y + 3);
}

function drawSquareEnemy(enemy, x) {
  const size = enemy.radius * 2;
  ctx.strokeRect(x - enemy.radius, enemy.y - enemy.radius, size, size);
  const shieldX = x + enemy.facing * (enemy.radius + 8);
  line(shieldX, enemy.y - enemy.radius, shieldX, enemy.y + enemy.radius);
  line(shieldX, enemy.y - enemy.radius, shieldX + enemy.facing * 8, enemy.y - enemy.radius + 6);
  line(shieldX, enemy.y + enemy.radius, shieldX + enemy.facing * 8, enemy.y + enemy.radius - 6);

  line(x - 8, enemy.y - 5, x - 2, enemy.y - 5);
  line(x + 2, enemy.y - 5, x + 8, enemy.y - 5);
}

function drawDrop(drop) {
  const x = worldToScreenX(drop.x);
  const y = drop.y - 8 + Math.sin(drop.bob) * 4;
  if (x < -40 || x > window.innerWidth + 40) return;

  ctx.font = "28px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
  ctx.fillText("+", x - 8, y + 8);
  ctx.font = "13px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
  ctx.fillText("2", x + 10, y + 13);
}

function drawProjectile(projectile) {
  const x = worldToScreenX(projectile.x);
  if (x < -20 || x > window.innerWidth + 20) return;
  if (projectile.homing) {
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, projectile.y, 5, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    ctx.font = "28px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
    ctx.fillText("*", x - 8, projectile.y + 8);
  }
}

function drawDrone() {
  if (!drone.active) return;
  const x = worldToScreenX(drone.x);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(x, drone.y, 18, 8, 0, 0, Math.PI * 2);
  ctx.stroke();
  line(x - 7, drone.y - 9, x - 13, drone.y - 17);
  line(x + 7, drone.y - 9, x + 13, drone.y - 17);
}

function drawUi() {
  ctx.setTransform(window.devicePixelRatio || 1, 0, 0, window.devicePixelRatio || 1, 0, 0);
  ctx.lineWidth = 2;
  ctx.font = "16px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
  ctx.fillText(`Ammo: ${player.ammo}`, 18, 28);
  ctx.fillText(`Level: ${game.level}`, 18, 52);
  ctx.fillText(`Enemies: ${game.enemiesRemaining}`, 18, 76);
  ctx.fillText(`Power: ${powerUpSummary()}`, 18, 124);
  drawRechargeBars(18, 138);

  const progressWidth = Math.min(260, window.innerWidth - 36);
  ctx.strokeRect(18, 92, progressWidth, 8);
  ctx.fillRect(18, 92, progressWidth * (player.x / world.width), 8);

  if (game.messageTimer > 0) {
    ctx.font = "18px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
    ctx.textAlign = "center";
    ctx.fillText(game.message, window.innerWidth / 2, 34);
    ctx.textAlign = "left";
  }

  if (window.matchMedia("(pointer: coarse)").matches) {
    ctx.font = "13px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
    ctx.fillText("Left: move  |  upper right: jump  |  lower middle: duck  |  lower right: shoot", 18, window.innerHeight - 18);
  }
}

function drawRechargeBars(x, y) {
  let offset = 0;
  offset += drawRechargeBar("Drone", powerUps.droneLevel, powerUps.droneCharges, powerUps.droneRecharge, x, y + offset);
  drawRechargeBar("Vest", powerUps.vestLevel, powerUps.vestCharges, powerUps.vestRecharge, x, y + offset);
}

function drawRechargeBar(label, levelCount, charges, recharge, x, y) {
  if (levelCount === 0 || charges >= levelCount) return 0;
  const width = 120;
  const progress = Math.max(0, Math.min(1, recharge / 10));
  ctx.font = "12px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
  ctx.fillText(label, x, y + 9);
  ctx.strokeRect(x + 50, y, width, 8);
  ctx.fillRect(x + 50, y, width * progress, 8);
  return 16;
}

function drawCenteredText(lines, top) {
  ctx.textAlign = "center";
  for (const lineItem of lines) {
    ctx.font = lineItem.font;
    ctx.fillText(lineItem.text, window.innerWidth / 2, top);
    top += lineItem.gap;
  }
  ctx.textAlign = "left";
}

function drawButton(label, y, selected = false) {
  const width = Math.min(260, window.innerWidth - 48);
  const height = 48;
  const x = (window.innerWidth - width) / 2;
  ctx.lineWidth = selected ? 4 : 2;
  ctx.strokeRect(x, y, width, height);
  ctx.font = "18px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
  ctx.textAlign = "center";
  ctx.fillText(label, window.innerWidth / 2, y + 31);
  ctx.textAlign = "left";
}

function drawScreenOverlay() {
  if (game.state === states.PLAYING || game.state === states.LEVEL_COLLECTING) return;

  ctx.fillStyle = "rgba(255, 255, 255, 0.88)";
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
  ctx.fillStyle = "#000";

  if (game.state === states.TITLE) {
    drawCenteredText([
      { text: customization.name || "Game Pending", font: "36px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", gap: 46 },
      { text: customization.tagline || "Name Pending", font: "16px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", gap: 34 },
    ], Math.max(112, window.innerHeight * 0.24));
    drawButton("NEW GAME", Math.max(220, window.innerHeight * 0.46), game.titleSelection === 0);
    drawButton("CUSTOMIZE", Math.max(282, window.innerHeight * 0.46 + 62), game.titleSelection === 1);
    drawCenteredText([
      { text: "Move: A/D or arrows    Jump: W/Up    Duck: S/Down    Shoot: Space", font: "14px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", gap: 24 },
    ], Math.max(366, window.innerHeight * 0.46 + 148));
  }

  if (game.state === states.CUSTOMIZE) {
    drawCustomizeScreen();
  }

  if (game.state === states.PAUSED) {
    drawPauseScreen();
  }

  if (game.state === states.LEVEL_COMPLETE) {
    drawCenteredText([
      { text: `LEVEL ${game.completedLevel} CLEAR`, font: "30px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", gap: 44 },
      { text: `Power-up gained: ${game.lastPowerUp}`, font: "16px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", gap: 30 },
      { text: `Next wave: ${10 + game.completedLevel * 4} enemies`, font: "16px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", gap: 30 },
      { text: "+4 ammo bonus", font: "16px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", gap: 34 },
    ], Math.max(120, window.innerHeight * 0.28));
    drawButton("CONTINUE", Math.max(260, window.innerHeight * 0.56), true);
  }

  if (game.state === states.GAME_OVER) {
    drawCenteredText([
      { text: "OUT OF AMMO", font: "32px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", gap: 42 },
      { text: `Reached level ${game.level}`, font: "16px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", gap: 34 },
    ], Math.max(132, window.innerHeight * 0.3));
    drawButton("NEW GAME", Math.max(250, window.innerHeight * 0.54), true);
  }
}

function drawPauseScreen() {
  drawCenteredText([
    { text: "PAUSED", font: "32px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", gap: 52 },
  ], Math.max(118, window.innerHeight * 0.22));

  const startY = Math.max(210, window.innerHeight * 0.38);
  drawButton("CONTINUE", startY, game.pauseSelection === 0);
  drawButton("CUSTOMIZE", startY + 62, game.pauseSelection === 1);
  drawButton("RESTART GAME", startY + 124, game.pauseSelection === 2);

  ctx.font = "13px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
  ctx.textAlign = "center";
  ctx.fillText("Use Up/Down and Enter", window.innerWidth / 2, startY + 204);
  ctx.textAlign = "left";
}

function drawCustomizeScreen() {
  drawCenteredText([
    { text: "CUSTOMIZE", font: "30px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", gap: 42 },
    { text: "Blank canvas settings", font: "15px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", gap: 28 },
  ], Math.max(90, window.innerHeight * 0.18));

  const startY = Math.max(170, window.innerHeight * 0.28);
  drawCustomizeRow("name", "Name", customization.name || "Game Pending", startY);
  drawCustomizeRow("tagline", "Tagline", customization.tagline || "Name Pending", startY + 42);
  drawCustomizeRow("startingPowerUps", "Current Power Ups", String(customization.startingPowerUps), startY + 84);
  drawCustomizeRow("playerType", "Player", playerTypeLabel(customization.playerType), startY + 126);
  drawCustomizeRow("weaponType", "Weapon", weaponTypeLabel(customization.weaponType), startY + 168);

  drawSplitButtons("SAVE", "CANCEL", Math.max(424, startY + 240));

  ctx.font = "13px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
  ctx.textAlign = "center";
  ctx.fillText("Use arrows to select. Type text. Left/Right changes values. Enter activates Save/Cancel. Esc cancels.", window.innerWidth / 2, Math.max(504, startY + 308));
  ctx.textAlign = "left";
}

function playerTypeLabel(playerType) {
  return playerType === "croc" ? "Croc" : "Original";
}

function weaponTypeLabel(weaponType) {
  if (weaponType === "club") return "Club";
  if (weaponType === "wand") return "Wand";
  return "Gun";
}

function drawSplitButtons(leftLabel, rightLabel, y) {
  const gap = 16;
  const totalWidth = Math.min(360, window.innerWidth - 48);
  const width = (totalWidth - gap) / 2;
  const leftX = (window.innerWidth - totalWidth) / 2;
  drawFixedButton(leftLabel, leftX, y, width, customization.selectedField === "save");
  drawFixedButton(rightLabel, leftX + width + gap, y, width, customization.selectedField === "cancel");
}

function drawFixedButton(label, x, y, width, selected = false) {
  ctx.lineWidth = selected ? 4 : 2;
  ctx.strokeRect(x, y, width, 48);
  ctx.font = "18px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
  ctx.textAlign = "center";
  ctx.fillText(label, x + width / 2, y + 31);
  ctx.textAlign = "left";
}

function drawCustomizeRow(field, label, value, y) {
  const width = Math.min(520, window.innerWidth - 48);
  const x = Math.max(24, window.innerWidth * 0.5 - 260);
  const selected = customization.selectedField === field;

  ctx.lineWidth = selected ? 3 : 1;
  ctx.strokeRect(x, y, width, 32);
  ctx.font = "15px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
  ctx.fillText(`${label}: ${value}`, x + 12, y + 21);
}

function drawCollectionNotice() {
  if (game.state !== states.LEVEL_COLLECTING) return;
  ctx.font = "18px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
  ctx.textAlign = "center";
  ctx.fillText("Collecting ammo...", window.innerWidth / 2, 42);
  ctx.textAlign = "left";
}

export function draw() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  ctx.strokeStyle = "#000";
  ctx.fillStyle = "#000";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = 3;

  drawTerrain();
  for (const drop of drops) drawDrop(drop);
  for (const projectile of projectiles) drawProjectile(projectile);
  for (const enemy of enemies) drawEnemy(enemy);
  drawDrone();

  for (const particle of particles) {
    const x = worldToScreenX(particle.x);
    line(x - 3, particle.y, x + 3, particle.y);
    line(x, particle.y - 3, x, particle.y + 3);
  }

  drawPlayerCharacter();
  drawUi();
  drawCollectionNotice();
  drawScreenOverlay();
}
