import { customization, game, states } from "./state.js";
import { startLevel } from "./level.js";

const mainCustomizeFields = ["name", "tagline", "powerUps", "level", "targetFps", "playerType", "weaponType", "opponentIntelligence", "spawningLocations", "worldGeneration", "save", "cancel"];
const mainCustomizeRows = ["name", "tagline", "powerUps", "level", "targetFps", "playerType", "weaponType", "opponentIntelligence", "spawningLocations", "worldGeneration"];
const powerCustomizeFields = ["startingBootsLevel", "startingSpecs", "startingRadar", "startingShieldLevel", "startingDroneLevel", "powerBack"];
const powerCustomizeRows = ["startingBootsLevel", "startingSpecs", "startingRadar", "startingShieldLevel", "startingDroneLevel", "powerBack"];
export const customizeFields = [...mainCustomizeFields, ...powerCustomizeFields];
const customizeRowHeight = 34;
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
  customization.customizeMenu = "main";
  customization.returnState = returnState;
  customization.savedName = customization.name;
  customization.savedTagline = customization.tagline;
  customization.savedStartingBootsLevel = customization.startingBootsLevel;
  customization.savedStartingSpecs = customization.startingSpecs;
  customization.savedStartingRadar = customization.startingRadar;
  customization.savedStartingShieldLevel = customization.startingShieldLevel;
  customization.savedStartingDroneLevel = customization.startingDroneLevel;
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
  customization.customizeMenu = "main";
  game.state = customization.returnState;
}

export function cancelCustomize() {
  customization.name = customization.savedName;
  customization.tagline = customization.savedTagline;
  customization.startingBootsLevel = customization.savedStartingBootsLevel;
  customization.startingSpecs = customization.savedStartingSpecs;
  customization.startingRadar = customization.savedStartingRadar;
  customization.startingShieldLevel = customization.savedStartingShieldLevel;
  customization.startingDroneLevel = customization.savedStartingDroneLevel;
  customization.level = customization.savedLevel;
  customization.targetFps = customization.savedTargetFps;
  customization.playerType = customization.savedPlayerType;
  customization.weaponType = customization.savedWeaponType;
  customization.opponentIntelligence = customization.savedOpponentIntelligence;
  customization.spawningLocations = customization.savedSpawningLocations;
  customization.worldGeneration = customization.savedWorldGeneration;
  customization.customizeMenu = "main";
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
  const startY = Math.max(132, window.innerHeight * 0.19);
  const rows = currentRows();
  for (let i = 0; i < rows.length; i += 1) {
    const row = {
      x: Math.max(24, window.innerWidth * 0.5 - 260),
      y: startY + i * customizeRowHeight,
      width: Math.min(520, window.innerWidth - 48),
      height: 32,
    };
    if (inside(x, y, row)) return rows[i];
  }

  if (customization.customizeMenu === "powerUps") return "";

  const buttonY = Math.max(startY + mainCustomizeRows.length * customizeRowHeight + 24, window.innerHeight - 112);
  if (inside(x, y, splitButtonRect(buttonY, "left"))) return "save";
  if (inside(x, y, splitButtonRect(buttonY, "right"))) return "cancel";
  return "";
}

export function handleCustomizeKey(event) {
  const key = event.key;
  const lower = key.toLowerCase();

  if (lower === "escape") {
    if (customization.customizeMenu === "powerUps") {
      closePowerUpsMenu();
      return true;
    }
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
    else if (customization.selectedField === "powerUps") openPowerUpsMenu();
    else if (customization.selectedField === "powerBack") closePowerUpsMenu();
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

  if (isOptionField(customization.selectedField)) {
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
  if (field === "powerUps") {
    openPowerUpsMenu();
    return;
  }
  if (field === "powerBack") {
    closePowerUpsMenu();
    return;
  }
  if (isNumberField(field)) {
    stepNumberField(field, offset);
    return;
  }
  selectRelativeOption(field, offset);
}

function selectRelativeField(offset) {
  const fields = currentFields();
  const index = fields.indexOf(customization.selectedField);
  const next = (index + offset + fields.length) % fields.length;
  customization.selectedField = fields[next];
}

function isNumberField(field) {
  return field === "level"
    || field === "startingBootsLevel"
    || field === "startingSpecs"
    || field === "startingRadar"
    || field === "startingShieldLevel"
    || field === "startingDroneLevel";
}

function numberBounds(field) {
  if (field === "level") return { min: 1, max: 99 };
  if (field === "startingBootsLevel" || field === "startingShieldLevel" || field === "startingDroneLevel") return { min: 0, max: 5 };
  return { min: 0, max: 1 };
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

function isOptionField(field) {
  return field === "playerType"
    || field === "weaponType"
    || field === "worldGeneration"
    || field === "targetFps"
    || field === "opponentIntelligence"
    || field === "spawningLocations";
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

function currentFields() {
  return customization.customizeMenu === "powerUps" ? powerCustomizeFields : mainCustomizeFields;
}

function currentRows() {
  return customization.customizeMenu === "powerUps" ? powerCustomizeRows : mainCustomizeRows;
}

function openPowerUpsMenu() {
  customization.customizeMenu = "powerUps";
  customization.selectedField = "startingBootsLevel";
}

function closePowerUpsMenu() {
  customization.customizeMenu = "main";
  customization.selectedField = "powerUps";
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
