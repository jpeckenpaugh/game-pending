import { customization, game, states } from "./state.js";
import { startLevel } from "./level.js";

export const customizeFields = ["name", "tagline", "startingPowerUps", "level", "targetFps", "playerType", "weaponType", "opponentIntelligence", "spawningLocations", "worldGeneration", "save", "cancel"];
const customizeRows = ["name", "tagline", "startingPowerUps", "level", "targetFps", "playerType", "weaponType", "opponentIntelligence", "spawningLocations", "worldGeneration"];
const defaultName = "Game Pending";
const defaultTagline = "Name Pending";
const playerTypes = ["original", "croc"];
const weaponTypes = ["gun", "club", "wand"];
const opponentIntelligenceTypes = ["simple", "random", "bold", "shy", "mixed"];
const spawningLocationTypes = ["standard", "randomized"];
const worldGenerationTypes = ["seeded", "random"];
const targetFpsOptions = ["auto", 5, 10, 15, 30, 60, 120];

export function openCustomize(returnState = states.TITLE) {
  game.state = states.CUSTOMIZE;
  customization.selectedField = "name";
  customization.returnState = returnState;
  customization.savedName = customization.name;
  customization.savedTagline = customization.tagline;
  customization.savedStartingPowerUps = customization.startingPowerUps;
  customization.savedLevel = customization.level;
  customization.savedTargetFps = customization.targetFps;
  customization.savedPlayerType = customization.playerType;
  customization.savedWeaponType = customization.weaponType;
  customization.savedOpponentIntelligence = customization.opponentIntelligence;
  customization.savedSpawningLocations = customization.spawningLocations;
  customization.savedWorldGeneration = customization.worldGeneration;
}

export function saveCustomize() {
  if (customization.returnState === states.TITLE || customization.returnState === states.PAUSED) {
    startLevel(customization.level);
  }
  game.state = customization.returnState;
}

export function cancelCustomize() {
  customization.name = customization.savedName;
  customization.tagline = customization.savedTagline;
  customization.startingPowerUps = customization.savedStartingPowerUps;
  customization.level = customization.savedLevel;
  customization.targetFps = customization.savedTargetFps;
  customization.playerType = customization.savedPlayerType;
  customization.weaponType = customization.savedWeaponType;
  customization.opponentIntelligence = customization.savedOpponentIntelligence;
  customization.spawningLocations = customization.savedSpawningLocations;
  customization.worldGeneration = customization.savedWorldGeneration;
  game.state = customization.returnState;
}

export function titleButtonAt(x, y) {
  const newGame = buttonRect(Math.max(220, window.innerHeight * 0.46));
  const customize = buttonRect(Math.max(282, window.innerHeight * 0.46 + 62));
  if (inside(x, y, newGame)) return "newGame";
  if (inside(x, y, customize)) return "customize";
  return "";
}

export function customizeActionAt(x, y) {
  const startY = Math.max(170, window.innerHeight * 0.28);
  const rowHeight = 42;
  for (let i = 0; i < customizeRows.length; i += 1) {
    const row = {
      x: Math.max(24, window.innerWidth * 0.5 - 260),
      y: startY + i * rowHeight,
      width: Math.min(520, window.innerWidth - 48),
      height: 32,
    };
    if (inside(x, y, row)) return customizeRows[i];
  }

  const buttonY = Math.max(618, startY + 432);
  if (inside(x, y, splitButtonRect(buttonY, "left"))) return "save";
  if (inside(x, y, splitButtonRect(buttonY, "right"))) return "cancel";
  return "";
}

export function handleCustomizeKey(event) {
  const key = event.key;
  const lower = key.toLowerCase();

  if (lower === "escape") {
    cancelCustomize();
    return true;
  }

  if ((event.metaKey || event.ctrlKey) && lower === "enter") {
    saveCustomize();
    return true;
  }

  if ((event.metaKey || event.ctrlKey) && lower === "a" && isTextField()) {
    setSelectedText("");
    return true;
  }

  if (lower === "tab") {
    selectRelativeField(event.shiftKey ? -1 : 1);
    return true;
  }

  if (lower === "arrowup") {
    selectRelativeField(-1);
    return true;
  }

  if (lower === "arrowdown") {
    selectRelativeField(1);
    return true;
  }

  if (lower === "enter") {
    if (customization.selectedField === "save") saveCustomize();
    else if (customization.selectedField === "cancel") cancelCustomize();
    else selectRelativeField(1);
    return true;
  }

  if (customization.selectedField === "save" || customization.selectedField === "cancel") {
    if (lower === "arrowleft" || lower === "arrowright") {
      customization.selectedField = customization.selectedField === "save" ? "cancel" : "save";
      return true;
    }
    return false;
  }

  if (isNumberField(customization.selectedField)) {
    if (lower === "arrowleft" || key === "-") {
      stepNumberField(customization.selectedField, -1);
      return true;
    }
    if (lower === "arrowright" || key === "+" || key === "=") {
      stepNumberField(customization.selectedField, 1);
      return true;
    }
    if (/^[0-9]$/.test(key)) {
      const { min, max } = numberBounds(customization.selectedField);
      const current = customization[customization.selectedField];
      const next = current >= 10 ? Number(key) : current * 10 + Number(key);
      customization[customization.selectedField] = Math.max(min, Math.min(max, next));
      return true;
    }
    return false;
  }

  if (customization.selectedField === "playerType" || customization.selectedField === "weaponType" || customization.selectedField === "worldGeneration" || customization.selectedField === "targetFps" || customization.selectedField === "opponentIntelligence" || customization.selectedField === "spawningLocations") {
    if (lower === "arrowleft") {
      selectRelativeOption(customization.selectedField, -1);
      return true;
    }
    if (lower === "arrowright" || lower === " ") {
      selectRelativeOption(customization.selectedField, 1);
      return true;
    }
    return false;
  }

  if (lower === "backspace") {
    setSelectedText(getSelectedText().slice(0, -1));
    return true;
  }

  if (key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
    const current = getSelectedText();
    const next = selectedTextIsDefault() ? key : current + key;
    setSelectedText(next.slice(0, 28));
    return true;
  }

  return false;
}

export function selectCustomizeField(field) {
  if (customizeFields.includes(field)) customization.selectedField = field;
}

export function cycleCustomizeOption(field, offset = 1) {
  if (isNumberField(field)) {
    stepNumberField(field, offset);
    return;
  }
  selectRelativeOption(field, offset);
}

function selectRelativeField(offset) {
  const index = customizeFields.indexOf(customization.selectedField);
  const next = (index + offset + customizeFields.length) % customizeFields.length;
  customization.selectedField = customizeFields[next];
}

function isNumberField(field) {
  return field === "startingPowerUps" || field === "level";
}

function numberBounds(field) {
  return field === "level"
    ? { min: 1, max: 99 }
    : { min: 0, max: 20 };
}

function stepNumberField(field, offset) {
  const { min, max } = numberBounds(field);
  customization[field] = Math.max(min, Math.min(max, customization[field] + offset));
}

function selectRelativeOption(field, offset) {
  const options = optionSetForField(field);
  const current = customization[field];
  const index = options.indexOf(current);
  const next = (index + offset + options.length) % options.length;
  customization[field] = options[next];
}

function optionSetForField(field) {
  if (field === "weaponType") return weaponTypes;
  if (field === "opponentIntelligence") return opponentIntelligenceTypes;
  if (field === "spawningLocations") return spawningLocationTypes;
  if (field === "worldGeneration") return worldGenerationTypes;
  if (field === "targetFps") return targetFpsOptions;
  return playerTypes;
}

function getSelectedText() {
  return customization.selectedField === "tagline"
    ? customization.tagline
    : customization.name;
}

function isTextField() {
  return customization.selectedField === "name" || customization.selectedField === "tagline";
}

function selectedTextIsDefault() {
  return (customization.selectedField === "name" && customization.name === defaultName)
    || (customization.selectedField === "tagline" && customization.tagline === defaultTagline);
}

function setSelectedText(value) {
  if (customization.selectedField === "tagline") {
    customization.tagline = value;
  } else {
    customization.name = value;
  }
}

function splitButtonRect(y, side) {
  const gap = 16;
  const totalWidth = Math.min(360, window.innerWidth - 48);
  const width = (totalWidth - gap) / 2;
  const leftX = (window.innerWidth - totalWidth) / 2;
  return {
    x: side === "left" ? leftX : leftX + width + gap,
    y,
    width,
    height: 48,
  };
}

function buttonRect(y) {
  const width = Math.min(260, window.innerWidth - 48);
  return {
    x: (window.innerWidth - width) / 2,
    y,
    width,
    height: 48,
  };
}

function inside(x, y, rect) {
  return x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height;
}
