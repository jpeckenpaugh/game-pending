// Owns full-screen overlays: title, pause, game over, Customize, and power-up
// choice cards. Input hit-testing for these screens lives in input.js/customize.js.
import { ctx, customization, game, states } from "./state.js";
import { customizeButtonY, customizeRowBoxHeight, customizeRowHeight, customizeStartY } from "./customize.js";
import { colorThemeLabel } from "./colorThemes.js";
import { drawPowerIcon } from "./powerIcons.js";

export function drawScreenOverlay() {
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
        ? ["Move: A/D or arrows", "Jump: X  Aim/climb: W/Up S/Down", "Shoot: Space"]
        : ["Move: A/D or arrows    Jump: X    Aim/climb: W/Up S/Down    Shoot: Space"],
      Math.max(366, window.innerHeight * 0.46 + 148),
      "14px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
      20
    );
  }

  if (game.state === states.CUSTOMIZE) drawCustomizeScreen();
  if (game.state === states.PAUSED) drawPauseScreen();
  if (game.state === states.LEVEL_COMPLETE || game.state === states.POWER_CHOICE) drawLevelPowerChoiceScreen();

  if (game.state === states.GAME_OVER) {
    drawCenteredText([
      { text: "OUT OF AMMO", font: "32px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", gap: 42 },
      { text: `Reached level ${game.level}`, font: "16px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", gap: 34 },
    ], Math.max(132, window.innerHeight * 0.3));
    drawButton("NEW GAME", Math.max(250, window.innerHeight * 0.54), true);
  }
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
  const compact = window.innerHeight < 700;
  const veryCompact = window.innerHeight < 560;
  const titleTop = veryCompact ? 38 : compact ? 54 : Math.max(90, window.innerHeight * 0.14);
  const menuTitle = customizeMenuTitle();
  drawCenteredText([
    { text: menuTitle.title, font: `${veryCompact ? 24 : 30}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`, gap: veryCompact ? 30 : 42 },
    { text: menuTitle.subtitle, font: `${veryCompact ? 12 : 15}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`, gap: 28 },
  ], titleTop);

  const startY = customizeStartY();
  const rowHeight = customizeRowHeight();
  if (customization.customizeMenu === "powerUps") {
    drawCustomizeRow("startingBootsLevel", "Boots", levelLabel(customization.startingBootsLevel), startY);
    drawCustomizeRow("startingSpecs", "Specs", yesNoLabel(customization.startingSpecs), startY + rowHeight);
    drawCustomizeRow("startingRadar", "Radar", yesNoLabel(customization.startingRadar), startY + rowHeight * 2);
    drawCustomizeRow("startingShieldLevel", "Shield", levelLabel(customization.startingShieldLevel), startY + rowHeight * 3);
    drawCustomizeRow("startingDroneLevel", "Drone", levelLabel(customization.startingDroneLevel), startY + rowHeight * 4);
    drawCustomizeRow("powerBack", "Back", "Customize", startY + rowHeight * 5);
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

  if (customization.customizeMenu === "player") {
    drawCustomizeRow("head", "Head", headLabel(customization.head), startY);
    drawCustomizeRow("bigHead", "Bighead", yesNoLabel(customization.bigHead), startY + rowHeight);
    drawCustomizeRow("face", "Face", faceLabel(customization.face), startY + rowHeight * 2);
    drawCustomizeRow("faceStyle", "Face Style", faceStyleLabel(customization.faceStyle), startY + rowHeight * 3);
    drawCustomizeRow("playerBack", "Back", "Customize", startY + rowHeight * 4);
    drawSubmenuHint(startY, rowHeight, 5, compact);
    return;
  }

  if (customization.customizeMenu === "opponents") {
    drawCustomizeRow("circleHead", "Circle Head", headLabel(customization.circleHead), startY);
    drawCustomizeRow("triangleHead", "Triangle Head", headLabel(customization.triangleHead), startY + rowHeight);
    drawCustomizeRow("squareHead", "Square Head", headLabel(customization.squareHead), startY + rowHeight * 2);
    drawCustomizeRow("opponentFaceStyle", "Face Style", faceStyleLabel(customization.opponentFaceStyle), startY + rowHeight * 3);
    drawCustomizeRow("opponentsBack", "Back", "Customize", startY + rowHeight * 4);
    drawSubmenuHint(startY, rowHeight, 5, compact);
    return;
  }

  drawCustomizeRow("template", "Template", templateLabel(customization.template), startY);
  drawCustomizeRow("colorTheme", "Color Theme", colorThemeLabel(customization.colorTheme), startY + rowHeight);
  drawCustomizeRow("droneStyle", "Drone", droneStyleLabel(customization.droneStyle), startY + rowHeight * 2);
  drawCustomizeRow("name", "Name", customization.name || "Game Pending", startY + rowHeight * 3);
  drawCustomizeRow("tagline", "Tagline", customization.tagline || "Name Pending", startY + rowHeight * 4);
  drawCustomizeRow("powerUps", "Power Ups", powerUpLoadoutLabel(), startY + rowHeight * 5);
  drawCustomizeRow("playerOptions", "Player", playerOptionsLabel(), startY + rowHeight * 6);
  drawCustomizeRow("opponents", "Opponents", opponentsLabel(), startY + rowHeight * 7);
  drawCustomizeRow("level", "Level", String(customization.level), startY + rowHeight * 8);
  drawCustomizeRow("targetFps", "Target FPS", targetFpsLabel(customization.targetFps), startY + rowHeight * 9);
  drawCustomizeRow("weaponType", "Weapon", weaponTypeLabel(customization.weaponType), startY + rowHeight * 10);
  drawCustomizeRow("opponentIntelligence", "Opponent Behavior", opponentIntelligenceLabel(customization.opponentIntelligence), startY + rowHeight * 11);
  drawCustomizeRow("spawningLocations", "Spawning Locations", spawningLocationsLabel(customization.spawningLocations), startY + rowHeight * 12);
  drawCustomizeRow("worldGeneration", "World Generation", worldGenerationLabel(customization.worldGeneration), startY + rowHeight * 13);

  const buttonY = customizeButtonY(14);
  drawSplitButtons("SAVE", "CANCEL", buttonY);

  drawHintLines(
    window.innerWidth < 620 || compact
      ? [customizeTooltip(customization.selectedField), "Left/Right changes. Enter saves. Esc cancels."]
      : [customizeTooltip(customization.selectedField), "Use arrows to select. Type text. Left/Right changes values. Enter activates Save/Cancel. Esc cancels."],
    buttonY + 76,
    "13px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
    20
  );
}

function customizeMenuTitle() {
  if (customization.customizeMenu === "powerUps") {
    return { title: "POWER UPS", subtitle: "Starting loadout" };
  }
  if (customization.customizeMenu === "player") {
    return { title: "PLAYER", subtitle: "Head and face" };
  }
  if (customization.customizeMenu === "opponents") {
    return { title: "OPPONENTS", subtitle: "Circle triangle square" };
  }
  return { title: "CUSTOMIZE", subtitle: "Blank canvas settings" };
}

function drawSubmenuHint(startY, rowHeight, rowCount, compact) {
  drawHintLines(
    window.innerWidth < 620 || compact
      ? [customizeTooltip(customization.selectedField), "Left/Right changes. Esc goes back."]
      : [customizeTooltip(customization.selectedField), "Use arrows to select. Left/Right changes values. Enter on Back returns. Esc goes back."],
    startY + rowHeight * rowCount + 36,
    "13px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
    20
  );
}

function templateLabel(template) {
  if (template === "classic") return "Classic";
  if (template === "emojiColor") return "Emoji (Color)";
  if (template === "aquatic") return "Aquatic";
  if (template === "farm") return "Farm";
  if (template === "robot") return "Robot";
  return "Custom";
}

function headLabel(head) {
  if (head === "classic") return "Classic";
  if (head === "dog") return "Dog";
  if (head === "cat") return "Kat";
  if (head === "frog") return "Frog";
  if (head === "horse") return "Horse";
  if (head === "fish") return "Fish";
  if (head === "robot") return "Robot";
  if (head === "skull") return "Skull";
  if (head === "alien") return "Alien";
  return "Stick";
}

function faceLabel(face) {
  if (face === "emoji") return "Emoji";
  return "Classic";
}

function faceStyleLabel(faceStyle) {
  if (faceStyle === "greyscale") return "Greyscale";
  if (faceStyle === "color") return "Color";
  return "Monochrome";
}

function droneStyleLabel(droneStyle) {
  if (droneStyle === "helicopter") return "Helicopter";
  if (droneStyle === "satellite") return "Satellite";
  if (droneStyle === "saucer") return "Flying Saucer";
  return "Oval";
}

function playerOptionsLabel() {
  if (customization.face !== "emoji") return "Classic";
  const size = customization.bigHead ? " Bighead" : "";
  return `${headLabel(customization.head)} Emoji${size}`;
}

function opponentsLabel() {
  const heads = [customization.circleHead, customization.triangleHead, customization.squareHead];
  if (heads.every((head) => head === "classic")) return "Classic";
  return heads.map(headLabel).join("/");
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
  if (field === "template") return "Applies a preset bundle of player and opponent faces.";
  if (field === "colorTheme") return "Changes world, opponent, gear, weapon, attack, and drone colors.";
  if (field === "droneStyle") return "Changes the Drone power-up aircraft silhouette.";
  if (field === "name") return "Sets the title shown on menu screens.";
  if (field === "tagline") return "Sets the subtitle shown under the title.";
  if (field === "powerUps") return "Opens starting power-up loadout settings.";
  if (field === "playerOptions") return "Opens player head, Bighead, face, and style settings.";
  if (field === "opponents") return "Opens opponent head and face style settings.";
  if (field === "startingBootsLevel") return "Sets Boots level; early levels add jumps, later levels add glide.";
  if (field === "startingSpecs") return "Starts each new game with Specs auto-aim enabled.";
  if (field === "startingRadar") return "Starts each new game with Radar direction tracking enabled.";
  if (field === "startingShieldLevel") return "Sets the starting Shield level and full charges.";
  if (field === "startingDroneLevel") return "Sets the starting Drone level and full charges.";
  if (field === "level") return "Chooses the starting level and world size.";
  if (field === "targetFps") return "Caps render rate; Auto adapts when the game gets busy.";
  if (field === "head") return "Chooses the emoji-style head shape.";
  if (field === "bigHead") return "Doubles emoji-style heads again.";
  if (field === "face") return "Enables reactive emoji-style player expressions.";
  if (field === "faceStyle") return "Changes emoji-style faces between line, grey, and color.";
  if (field === "circleHead") return "Chooses the Circle opponent head.";
  if (field === "triangleHead") return "Chooses the Triangle opponent head.";
  if (field === "squareHead") return "Chooses the Square opponent head.";
  if (field === "opponentFaceStyle") return "Changes opponent faces between line, grey, and color.";
  if (field === "weaponType") return "Changes the weapon and projectile style.";
  if (field === "opponentIntelligence") return "Controls whether opponents patrol, vary, chase, retreat, or mix behaviors.";
  if (field === "spawningLocations") return "Standard spreads opponents by area; Randomized shuffles valid locations.";
  if (field === "worldGeneration") return "Seeded repeats the same layout; Random varies each run.";
  if (field === "save") return "Applies these settings.";
  if (field === "cancel") return "Restores the previous settings.";
  if (field === "powerBack") return "Returns to the main Customize menu.";
  if (field === "playerBack") return "Returns to the main Customize menu.";
  if (field === "opponentsBack") return "Returns to the main Customize menu.";
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
  const rowHeight = customizeRowHeight();
  const boxHeight = customizeRowBoxHeight();
  const fontSize = rowHeight < 28 ? 12 : rowHeight < 34 ? 13 : 15;

  ctx.lineWidth = selected ? 3 : 1;
  ctx.strokeRect(x, y, width, boxHeight);
  ctx.font = `${fontSize}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
  ctx.fillText(`${label}: ${value}`, x + 12, y + Math.max(16, boxHeight * 0.68));
}
