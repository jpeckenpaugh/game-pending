import { camera, ctx, customization, drone, drops, enemies, game, particles, player, powerUps, projectiles, states, world } from "./state.js";
import { groundAt, worldToScreenX, worldToScreenY } from "./terrain.js";
import { powerUpSummary } from "./powerups.js";
import { drawPlayerCharacter } from "./playerCharacters.js";
import { drawWeapon } from "./weapons.js";

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

function drawTerrain() {
  const startX = Math.max(0, camera.x - 80);
  const endX = Math.min(world.width, camera.x + window.innerWidth + 80);
  const first = Math.floor(startX / 40) * 40;

  ctx.lineWidth = strokeWidth(3);
  ctx.beginPath();
  ctx.moveTo(worldToScreenX(first), worldToScreenY(groundAt(first)) + 0.5);
  for (let x = first + 40; x <= endX + 40; x += 40) {
    ctx.lineTo(worldToScreenX(x), worldToScreenY(groundAt(x)) + 0.5);
  }
  ctx.stroke();

  ctx.lineWidth = strokeWidth(2);
  for (let x = Math.floor(startX / 80) * 80; x < endX; x += 80) {
    const y = worldToScreenY(groundAt(x + 12) + 8);
    line(worldToScreenX(x), y, worldToScreenX(x + 22), worldToScreenY(groundAt(x + 22) + 8));
  }

  drawPlatforms();
  drawLadders();
  drawTeleports();
}

function drawPlatforms() {
  ctx.lineWidth = strokeWidth(3);
  for (const platform of world.platforms) {
    const x = worldToScreenX(platform.x);
    const x2 = worldToScreenX(platform.x + platform.width);
    const y = worldToScreenY(platform.y);
    if (x2 < -60 || x > window.innerWidth + 60) continue;
    line(x, y, x2, y);
    const hatchStart = platform.id === "cave-floor" ? x + z(12) : x + z(18);
    const hatchEnd = platform.id === "cave-floor" ? x2 - z(12) : x2;
    const hatchStep = platform.id === "cave-floor" ? z(52) : z(34);
    for (let rungX = hatchStart; rungX < hatchEnd; rungX += hatchStep) {
      line(rungX, y + z(4), rungX + z(14), y + z(13));
    }
  }
}

function drawLadders() {
  ctx.lineWidth = strokeWidth(2);
  for (const ladder of world.ladders) {
    const x = worldToScreenX(ladder.x);
    const y = worldToScreenY(ladder.y);
    const bottom = worldToScreenY(ladder.y + ladder.height);
    if (bottom < -60 || y > window.innerHeight + 60) continue;
    line(x - z(16), y, x - z(16), bottom);
    line(x + z(16), y, x + z(16), bottom);
    for (let rungY = y + z(16); rungY < bottom; rungY += z(28)) {
      line(x - z(16), rungY, x + z(16), rungY);
    }
  }
}

function drawTeleports() {
  ctx.lineWidth = strokeWidth(3);
  const time = performance.now() / 900;
  for (const teleport of world.teleports) {
    const x = worldToScreenX(teleport.x);
    const y = worldToScreenY(teleport.y);
    if (x < -80 || x > window.innerWidth + 80) continue;
    const centerY = y + z(teleport.height / 2);
    const radiusX = z(teleport.width / 2);
    const radiusY = z(teleport.height / 2);

    ctx.beginPath();
    ctx.ellipse(x, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
    ctx.stroke();

    const previousAlpha = ctx.globalAlpha;
    ctx.lineWidth = strokeWidth(2);
    for (let i = 0; i < 5; i += 1) {
      const progress = (time + i / 5) % 1;
      const scale = 0.86 - progress * 0.68;
      ctx.globalAlpha = previousAlpha * Math.max(0.08, scale * 0.85);
      ctx.beginPath();
      ctx.ellipse(x, centerY, radiusX * scale, radiusY * scale, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = previousAlpha;
    ctx.lineWidth = strokeWidth(3);
  }
}

function drawEnemy(enemy) {
  if (!enemy.alive) return;
  const x = worldToScreenX(enemy.x);
  if (x < -60 || x > window.innerWidth + 60) return;
  const y = worldToScreenY(enemy.y);

  ctx.lineWidth = strokeWidth(3);
  if (enemy.family === "triangle") {
    drawTriangleEnemy(enemy, x, y);
  } else if (enemy.family === "square") {
    drawSquareEnemy(enemy, x, y);
  } else {
    drawCircleEnemy(enemy, x, y);
  }

  if (enemy.movement === "runner") {
    line(x - z(enemy.radius + 8), y + z(enemy.radius + 4), x + z(enemy.radius + 8), y + z(enemy.radius + 4));
  }

  if (enemy.movement === "hopper") {
    line(x - z(10), y - z(enemy.radius + 8), x, y - z(enemy.radius + 2));
    line(x + z(10), y - z(enemy.radius + 8), x, y - z(enemy.radius + 2));
  }
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

function drawDrop(drop) {
  const x = worldToScreenX(drop.x);
  const y = worldToScreenY(drop.y) - 8 + Math.sin(drop.bob) * 4;
  if (x < -40 || x > window.innerWidth + 40) return;

  ctx.font = `${z(28)}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
  ctx.fillText("+", x - z(8), y + z(8));
  ctx.font = `${z(13)}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
  ctx.fillText("2", x + z(10), y + z(13));
}

function drawProjectile(projectile) {
  const x = worldToScreenX(projectile.x);
  const y = worldToScreenY(projectile.y);
  if (x < -80 || x > window.innerWidth + 80) return;
  if (projectile.homing) {
    ctx.lineWidth = strokeWidth(2);
    ctx.beginPath();
    ctx.arc(x, y, z(5), 0, Math.PI * 2);
    ctx.stroke();
  } else if (projectile.weaponType === "club") {
    drawWeapon("club", x, y, projectile.vx >= 0 ? 1 : -1, camera.zoom, projectile.rotation || 0);
  } else if (projectile.weaponType === "gun") {
    const size = Math.max(3, z(7));
    ctx.fillRect(x - size / 2, y - size / 2, size, size);
  } else {
    ctx.font = `${z(28)}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
    ctx.fillText("*", x - z(8), y + z(8));
  }
}

function drawDrone() {
  if (!drone.active) return;
  const x = worldToScreenX(drone.x);
  const y = worldToScreenY(drone.y);
  ctx.lineWidth = strokeWidth(2);
  ctx.beginPath();
  ctx.ellipse(x, y, z(18), z(8), 0, 0, Math.PI * 2);
  ctx.stroke();
  line(x - z(7), y - z(9), x - z(13), y - z(17));
  line(x + z(7), y - z(9), x + z(13), y - z(17));
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
  drawRechargeBar("Shield", powerUps.shieldLevel, powerUps.shieldCharges, powerUps.shieldRecharge, x, y + offset);
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

function drawHintLines(lines, top, font = "13px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", gap = 18) {
  ctx.font = font;
  ctx.textAlign = "center";
  for (const text of lines) {
    ctx.fillText(text, window.innerWidth / 2, top);
    top += gap;
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
    drawHintLines(
      window.innerWidth < 560
        ? ["Move: A/D or arrows", "Jump: Command  Aim/climb: W/Up S/Down", "Shoot: Space"]
        : ["Move: A/D or arrows    Jump: Command    Aim/climb: W/Up S/Down    Shoot: Space"],
      Math.max(366, window.innerHeight * 0.46 + 148),
      "14px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
      20
    );
  }

  if (game.state === states.CUSTOMIZE) {
    drawCustomizeScreen();
  }

  if (game.state === states.PAUSED) {
    drawPauseScreen();
  }

  if (game.state === states.LEVEL_COMPLETE || game.state === states.POWER_CHOICE) {
    drawLevelPowerChoiceScreen();
  }

  if (game.state === states.GAME_OVER) {
    drawCenteredText([
      { text: "OUT OF AMMO", font: "32px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", gap: 42 },
      { text: `Reached level ${game.level}`, font: "16px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", gap: 34 },
    ], Math.max(132, window.innerHeight * 0.3));
    drawButton("NEW GAME", Math.max(250, window.innerHeight * 0.54), true);
  }
}

function drawLevelPowerChoiceScreen() {
  const debugChoice = game.state === states.POWER_CHOICE;
  drawCenteredText([
    { text: debugChoice ? "CHOOSE POWER" : `LEVEL ${game.completedLevel} CLEAR`, font: "30px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", gap: 44 },
    { text: debugChoice ? "Pick one, or press G to auto-grant and reroll" : "Choose a power-up", font: "16px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", gap: 30 },
  ], Math.max(110, window.innerHeight * 0.22));

  const choices = game.powerChoices;
  const boxWidth = Math.min(168, Math.max(96, (window.innerWidth - 72) / 3));
  const gap = Math.min(24, Math.max(10, (window.innerWidth - boxWidth * 3 - 36) / 2));
  const totalWidth = boxWidth * choices.length + gap * (choices.length - 1);
  const startX = (window.innerWidth - totalWidth) / 2;
  const boxY = Math.max(190, window.innerHeight * 0.36);
  const boxHeight = 172;

  for (let i = 0; i < choices.length; i += 1) {
    const choice = choices[i];
    const x = startX + i * (boxWidth + gap);
    drawPowerChoiceBox(choice, x, boxY, boxWidth, boxHeight, i === game.powerChoiceSelection);
  }

  ctx.font = "13px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
  ctx.textAlign = "center";
  ctx.fillText("Left/Right selects. Enter chooses.", window.innerWidth / 2, boxY + boxHeight + 38);
  ctx.fillText(debugChoice ? "G auto-grants one shown power and refreshes." : "+4 ammo bonus on next level", window.innerWidth / 2, boxY + boxHeight + 58);
  ctx.textAlign = "left";
}

function drawPowerChoiceBox(choice, x, y, width, height, selected) {
  ctx.lineWidth = selected ? 4 : 2;
  ctx.strokeRect(x, y, width, height);
  drawPowerIcon(choice.type, x + width / 2, y + 46);

  ctx.textAlign = "center";
  ctx.font = "16px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
  ctx.fillText(choice.name, x + width / 2, y + 94);
  ctx.font = "12px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
  wrapCenteredText(choice.description, x + width / 2, y + 120, width - 20, 16);
  ctx.font = "11px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
  ctx.fillText(`${game.powerChoices.indexOf(choice) + 1}`, x + width - 16, y + 20);
  ctx.textAlign = "left";
}

function wrapCenteredText(text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  let lineY = y;
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && line) {
      ctx.fillText(line, x, lineY);
      line = word;
      lineY += lineHeight;
    } else {
      line = next;
    }
  }
  if (line) ctx.fillText(line, x, lineY);
}

function drawPowerIcon(type, x, y) {
  ctx.save();
  ctx.translate(x, y);
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
    { text: customization.customizeMenu === "powerUps" ? "POWER UPS" : "CUSTOMIZE", font: "30px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", gap: 42 },
    { text: customization.customizeMenu === "powerUps" ? "Starting loadout" : "Blank canvas settings", font: "15px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", gap: 28 },
  ], Math.max(90, window.innerHeight * 0.18));

  const startY = Math.max(132, window.innerHeight * 0.19);
  const rowHeight = 34;
  if (customization.customizeMenu === "powerUps") {
    drawCustomizeRow("startingBootsLevel", "Boots", levelLabel(customization.startingBootsLevel), startY);
    drawCustomizeRow("startingSpecs", "Specs", yesNoLabel(customization.startingSpecs), startY + rowHeight);
    drawCustomizeRow("startingRadar", "Radar", yesNoLabel(customization.startingRadar), startY + rowHeight * 2);
    drawCustomizeRow("startingShieldLevel", "Shield", levelLabel(customization.startingShieldLevel), startY + rowHeight * 3);
    drawCustomizeRow("startingDroneLevel", "Drone", levelLabel(customization.startingDroneLevel), startY + rowHeight * 4);
    drawCustomizeRow("powerBack", "Back", "Main Menu", startY + rowHeight * 5);
    drawHintLines(
      window.innerWidth < 620
        ? [customizeTooltip(customization.selectedField), "Left/Right changes values.", "Esc goes back."]
        : [customizeTooltip(customization.selectedField), "Use arrows to select. Left/Right changes values. Enter on Back returns. Esc goes back."],
      startY + rowHeight * 6 + 36,
      "13px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
      20
    );
    return;
  }

  drawCustomizeRow("name", "Name", customization.name || "Game Pending", startY);
  drawCustomizeRow("tagline", "Tagline", customization.tagline || "Name Pending", startY + rowHeight);
  drawCustomizeRow("powerUps", "Power Ups", powerUpLoadoutLabel(), startY + rowHeight * 2);
  drawCustomizeRow("level", "Level", String(customization.level), startY + rowHeight * 3);
  drawCustomizeRow("targetFps", "Target FPS", targetFpsLabel(customization.targetFps), startY + rowHeight * 4);
  drawCustomizeRow("playerType", "Player", playerTypeLabel(customization.playerType), startY + rowHeight * 5);
  drawCustomizeRow("weaponType", "Weapon", weaponTypeLabel(customization.weaponType), startY + rowHeight * 6);
  drawCustomizeRow("opponentIntelligence", "Opponent Behavior", opponentIntelligenceLabel(customization.opponentIntelligence), startY + rowHeight * 7);
  drawCustomizeRow("spawningLocations", "Spawning Locations", spawningLocationsLabel(customization.spawningLocations), startY + rowHeight * 8);
  drawCustomizeRow("worldGeneration", "World Generation", worldGenerationLabel(customization.worldGeneration), startY + rowHeight * 9);

  const buttonY = Math.max(startY + rowHeight * 10 + 24, window.innerHeight - 112);
  drawSplitButtons("SAVE", "CANCEL", buttonY);

  drawHintLines(
    window.innerWidth < 620
      ? [customizeTooltip(customization.selectedField), "Left/Right changes values.", "Enter saves. Esc cancels."]
      : [customizeTooltip(customization.selectedField), "Use arrows to select. Type text. Left/Right changes values. Enter activates Save/Cancel. Esc cancels."],
    buttonY + 76,
    "13px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
    20
  );
}

function playerTypeLabel(playerType) {
  return playerType === "croc" ? "Croc" : "Original";
}

function weaponTypeLabel(weaponType) {
  if (weaponType === "club") return "Club";
  if (weaponType === "wand") return "Wand";
  return "Gun";
}

function worldGenerationLabel(worldGeneration) {
  return worldGeneration === "random" ? "Random" : "Seeded";
}

function targetFpsLabel(targetFps) {
  return targetFps === "auto" ? "Auto" : String(targetFps);
}

function yesNoLabel(value) {
  return value ? "On" : "Off";
}

function levelLabel(value) {
  return value > 0 ? `Lv ${value}` : "Off";
}

function powerUpLoadoutLabel() {
  const count = [
    customization.startingBootsLevel,
    customization.startingSpecs,
    customization.startingRadar,
    customization.startingShieldLevel,
    customization.startingDroneLevel,
  ].filter(Boolean).length;
  return count > 0 ? `${count} set` : "None";
}

function opponentIntelligenceLabel(opponentIntelligence) {
  if (opponentIntelligence === "random") return "Random";
  if (opponentIntelligence === "bold") return "Bold";
  if (opponentIntelligence === "shy") return "Shy";
  if (opponentIntelligence === "mixed") return "Mixed";
  return "Simple";
}

function spawningLocationsLabel(spawningLocations) {
  return spawningLocations === "randomized" ? "Randomized" : "Standard";
}

function customizeTooltip(field) {
  if (field === "name") return "Sets the title shown on menu screens.";
  if (field === "tagline") return "Sets the subtitle shown under the title.";
  if (field === "powerUps") return "Opens starting power-up loadout settings.";
  if (field === "startingBootsLevel") return "Sets Boots level; each level grants one refreshed mid-air jump.";
  if (field === "startingSpecs") return "Starts each new game with Specs auto-aim enabled.";
  if (field === "startingRadar") return "Starts each new game with Radar direction tracking enabled.";
  if (field === "startingShieldLevel") return "Sets the starting Shield level and full charges.";
  if (field === "startingDroneLevel") return "Sets the starting Drone level and full charges.";
  if (field === "level") return "Chooses the starting level and world size.";
  if (field === "targetFps") return "Caps render rate; Auto adapts when the game gets busy.";
  if (field === "playerType") return "Changes the player character art.";
  if (field === "weaponType") return "Changes the weapon and projectile style.";
  if (field === "opponentIntelligence") return "Controls whether opponents patrol, vary, chase, retreat, or mix behaviors.";
  if (field === "spawningLocations") return "Standard spreads opponents by area; Randomized shuffles valid locations.";
  if (field === "worldGeneration") return "Seeded repeats the same layout; Random varies each run.";
  if (field === "save") return "Applies these settings.";
  if (field === "cancel") return "Restores the previous settings.";
  if (field === "powerBack") return "Returns to the main Customize menu.";
  return "Customize game settings.";
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
    const y = worldToScreenY(particle.y);
    line(x - z(3), y, x + z(3), y);
    line(x, y - z(3), x, y + z(3));
  }

  drawPlayerCharacter();
  if (game.state !== states.TITLE && game.state !== states.CUSTOMIZE) drawUi();
  drawCollectionNotice();
  drawScreenOverlay();
}
