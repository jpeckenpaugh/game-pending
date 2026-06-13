// Owns Customize menu state transitions, value editing, and shared layout metrics.
// Rendering lives in menus.js; this module decides what field/action changed.
import { customization, game, states } from "./state.js";
import { startLevel } from "./level.js";
import { colorThemeTypes } from "./colorThemes.js";

const mainCustomizeFields = ["template", "colorTheme", "droneStyle", "name", "tagline", "powerUps", "playerOptions", "opponents", "level", "targetFps", "weaponType", "opponentIntelligence", "spawningLocations", "worldGeneration", "save", "cancel"];
const mainCustomizeRows = ["template", "colorTheme", "droneStyle", "name", "tagline", "powerUps", "playerOptions", "opponents", "level", "targetFps", "weaponType", "opponentIntelligence", "spawningLocations", "worldGeneration"];
const powerCustomizeFields = ["startingBootsLevel", "startingSpecs", "startingRadar", "startingShieldLevel", "startingDroneLevel", "powerBack"];
const powerCustomizeRows = ["startingBootsLevel", "startingSpecs", "startingRadar", "startingShieldLevel", "startingDroneLevel", "powerBack"];
const playerCustomizeFields = ["head", "bigHead", "face", "faceStyle", "playerBack"];
const playerCustomizeRows = ["head", "bigHead", "face", "faceStyle", "playerBack"];
const opponentCustomizeFields = ["circleHead", "triangleHead", "squareHead", "opponentFaceStyle", "opponentsBack"];
const opponentCustomizeRows = ["circleHead", "triangleHead", "squareHead", "opponentFaceStyle", "opponentsBack"];
export const customizeFields = [...mainCustomizeFields, ...powerCustomizeFields, ...playerCustomizeFields, ...opponentCustomizeFields];
const defaultName = "Game Pending";
const defaultTagline = "Name Pending";
const templateTypes = ["custom", "classic", "emojiColor", "aquatic", "farm", "robot"];
const headTypes = ["stick", "dog", "cat", "frog", "horse", "fish", "robot", "skull", "alien"];
const opponentHeadTypes = ["classic", ...headTypes];
const bigHeadTypes = [0, 1];
const faceTypes = ["classic", "emoji"];
const faceStyleTypes = ["monochrome", "greyscale", "color"];
const droneStyleTypes = ["oval", "helicopter", "satellite", "saucer"];
const weaponTypes = ["gun", "club", "wand"];
const opponentIntelligenceTypes = ["simple", "random", "bold", "shy", "mixed"];
const spawningLocationTypes = ["standard", "randomized"];
const worldGenerationTypes = ["seeded", "random"];
const targetFpsOptions = ["auto", 5, 10, 15, 30, 60, 120];
const templateControlledFields = ["head", "bigHead", "face", "faceStyle", "circleHead", "triangleHead", "squareHead", "opponentFaceStyle"];
const templateSettings = {
  classic: {
    head: "stick",
    bigHead: 0,
    face: "classic",
    faceStyle: "monochrome",
    circleHead: "classic",
    triangleHead: "classic",
    squareHead: "classic",
    opponentFaceStyle: "monochrome",
  },
  emojiColor: {
    head: "stick",
    bigHead: 0,
    face: "emoji",
    faceStyle: "color",
    circleHead: "dog",
    triangleHead: "cat",
    squareHead: "robot",
    opponentFaceStyle: "color",
  },
  aquatic: {
    head: "fish",
    bigHead: 0,
    face: "emoji",
    faceStyle: "color",
    circleHead: "fish",
    triangleHead: "frog",
    squareHead: "skull",
    opponentFaceStyle: "color",
  },
  farm: {
    head: "horse",
    bigHead: 0,
    face: "emoji",
    faceStyle: "color",
    circleHead: "dog",
    triangleHead: "cat",
    squareHead: "horse",
    opponentFaceStyle: "color",
  },
  robot: {
    head: "robot",
    bigHead: 0,
    face: "emoji",
    faceStyle: "greyscale",
    circleHead: "alien",
    triangleHead: "robot",
    squareHead: "alien",
    opponentFaceStyle: "greyscale",
  },
};

export function customizeRowHeight() {
  if (window.innerHeight < 560) return 22;
  if (window.innerHeight < 700) return 26;
  if (window.innerHeight < 760) return 30;
  return 34;
}

export function customizeRowBoxHeight() {
  return Math.min(32, customizeRowHeight() - 2);
}

export function customizeStartY() {
  if (window.innerHeight < 560) return 78;
  if (window.innerHeight < 700) return 96;
  if (window.innerHeight < 760) return 152;
  return Math.max(152, window.innerHeight * 0.2);
}

export function customizeButtonY(rowCount) {
  const compact = window.innerHeight < 700;
  const afterRows = customizeStartY() + rowCount * customizeRowHeight() + (compact ? 10 : 24);
  const bottomY = window.innerHeight - (window.innerHeight < 560 ? 56 : compact ? 78 : 112);
  return Math.min(bottomY, afterRows);
}

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
  customization.savedTemplate = customization.template;
  customization.savedColorTheme = customization.colorTheme;
  customization.savedDroneStyle = customization.droneStyle;
  customization.savedHead = customization.head;
  customization.savedBigHead = customization.bigHead;
  customization.savedFace = customization.face;
  customization.savedFaceStyle = customization.faceStyle;
  customization.savedCircleHead = customization.circleHead;
  customization.savedTriangleHead = customization.triangleHead;
  customization.savedSquareHead = customization.squareHead;
  customization.savedOpponentFaceStyle = customization.opponentFaceStyle;
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
  customization.template = customization.savedTemplate;
  customization.colorTheme = customization.savedColorTheme;
  customization.droneStyle = customization.savedDroneStyle;
  customization.head = customization.savedHead;
  customization.bigHead = customization.savedBigHead;
  customization.face = customization.savedFace;
  customization.faceStyle = customization.savedFaceStyle;
  customization.circleHead = customization.savedCircleHead;
  customization.triangleHead = customization.savedTriangleHead;
  customization.squareHead = customization.savedSquareHead;
  customization.opponentFaceStyle = customization.savedOpponentFaceStyle;
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
  const startY = customizeStartY();
  const rowHeight = customizeRowHeight();
  const rowBoxHeight = customizeRowBoxHeight();
  const rows = currentRows();
  for (let i = 0; i < rows.length; i += 1) {
    const row = {
      x: Math.max(24, window.innerWidth * 0.5 - 260),
      y: startY + i * rowHeight,
      width: Math.min(520, window.innerWidth - 48),
      height: rowBoxHeight,
    };
    if (inside(x, y, row)) return rows[i];
  }

  if (customization.customizeMenu !== "main") return "";

  const buttonY = customizeButtonY(mainCustomizeRows.length);
  if (inside(x, y, splitButtonRect(buttonY, "left"))) return "save";
  if (inside(x, y, splitButtonRect(buttonY, "right"))) return "cancel";
  return "";
}

export function handleCustomizeKey(event) {
  const key = event.key;
  const lower = key.toLowerCase();

  if (lower === "escape") {
    if (customization.customizeMenu !== "main") {
      closeCurrentSubmenu();
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
    else if (customization.selectedField === "playerOptions") openPlayerMenu();
    else if (customization.selectedField === "opponents") openOpponentsMenu();
    else if (customization.selectedField === "powerBack") closePowerUpsMenu();
    else if (customization.selectedField === "playerBack") closePlayerMenu();
    else if (customization.selectedField === "opponentsBack") closeOpponentsMenu();
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

  if (isTextField() && lower === "backspace") {
    setSelectedText(getSelectedText().slice(0, -1));
    return true;
  }

  if (isTextField() && key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
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
  if (field === "playerOptions") {
    openPlayerMenu();
    return;
  }
  if (field === "opponents") {
    openOpponentsMenu();
    return;
  }
  if (field === "powerBack") {
    closePowerUpsMenu();
    return;
  }
  if (field === "playerBack") {
    closePlayerMenu();
    return;
  }
  if (field === "opponentsBack") {
    closeOpponentsMenu();
    return;
  }
  if (isNumberField(field)) {
    stepNumberField(field, offset);
    return;
  }
  if (!isOptionField(field)) return;
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
  if (field === "startingBootsLevel" || field === "startingShieldLevel" || field === "startingDroneLevel") return { min: 0, max: 10 };
  return { min: 0, max: 1 };
}

function stepNumberField(field, offset) {
  const { min, max } = numberBounds(field);
  customization[field] = Math.max(min, Math.min(max, customization[field] + offset));
}

function selectRelativeOption(field, offset) {
  const options = optionSetForField(field);
  if (options.length === 0) return;
  const current = customization[field];
  const index = options.indexOf(current);
  const next = (index + offset + options.length) % options.length;
  if (field === "template") {
    applyTemplate(options[next]);
    return;
  }
  customization[field] = options[next];
  if (templateControlledFields.includes(field)) customization.template = "custom";
}

function isOptionField(field) {
  return field === "template"
    || field === "colorTheme"
    || field === "droneStyle"
    || field === "head"
    || field === "bigHead"
    || field === "face"
    || field === "faceStyle"
    || field === "circleHead"
    || field === "triangleHead"
    || field === "squareHead"
    || field === "opponentFaceStyle"
    || field === "weaponType"
    || field === "worldGeneration"
    || field === "targetFps"
    || field === "opponentIntelligence"
    || field === "spawningLocations";
}

function optionSetForField(field) {
  if (field === "template") return templateTypes;
  if (field === "colorTheme") return colorThemeTypes;
  if (field === "droneStyle") return droneStyleTypes;
  if (field === "head") return headTypes;
  if (field === "bigHead") return bigHeadTypes;
  if (field === "face") return faceTypes;
  if (field === "faceStyle") return faceStyleTypes;
  if (field === "circleHead" || field === "triangleHead" || field === "squareHead") return opponentHeadTypes;
  if (field === "opponentFaceStyle") return faceStyleTypes;
  if (field === "weaponType") return weaponTypes;
  if (field === "opponentIntelligence") return opponentIntelligenceTypes;
  if (field === "spawningLocations") return spawningLocationTypes;
  if (field === "worldGeneration") return worldGenerationTypes;
  if (field === "targetFps") return targetFpsOptions;
  return [];
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
  if (customization.customizeMenu === "powerUps") return powerCustomizeFields;
  if (customization.customizeMenu === "player") return playerCustomizeFields;
  if (customization.customizeMenu === "opponents") return opponentCustomizeFields;
  return mainCustomizeFields;
}

function currentRows() {
  if (customization.customizeMenu === "powerUps") return powerCustomizeRows;
  if (customization.customizeMenu === "player") return playerCustomizeRows;
  if (customization.customizeMenu === "opponents") return opponentCustomizeRows;
  return mainCustomizeRows;
}

function openPowerUpsMenu() {
  customization.customizeMenu = "powerUps";
  customization.selectedField = "startingBootsLevel";
}

function closePowerUpsMenu() {
  customization.customizeMenu = "main";
  customization.selectedField = "powerUps";
}

function openPlayerMenu() {
  customization.customizeMenu = "player";
  customization.selectedField = "head";
}

function closePlayerMenu() {
  customization.customizeMenu = "main";
  customization.selectedField = "playerOptions";
}

function openOpponentsMenu() {
  customization.customizeMenu = "opponents";
  customization.selectedField = "circleHead";
}

function closeOpponentsMenu() {
  customization.customizeMenu = "main";
  customization.selectedField = "opponents";
}

function closeCurrentSubmenu() {
  if (customization.customizeMenu === "powerUps") closePowerUpsMenu();
  else if (customization.customizeMenu === "player") closePlayerMenu();
  else if (customization.customizeMenu === "opponents") closeOpponentsMenu();
}

function applyTemplate(template) {
  customization.template = template;
  const settings = templateSettings[template];
  if (!settings) return;
  for (const [field, value] of Object.entries(settings)) {
    customization[field] = value;
  }
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
