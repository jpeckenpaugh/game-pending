import { customization, game, states } from "./state.js";

export const customizeFields = ["name", "tagline", "startingPowerUps", "save", "cancel"];
const defaultName = "Game Pending";
const defaultTagline = "Name Pending";

export function openCustomize(returnState = states.TITLE) {
  game.state = states.CUSTOMIZE;
  customization.selectedField = "name";
  customization.returnState = returnState;
  customization.savedName = customization.name;
  customization.savedTagline = customization.tagline;
  customization.savedStartingPowerUps = customization.startingPowerUps;
}

export function saveCustomize() {
  game.state = customization.returnState;
}

export function cancelCustomize() {
  customization.name = customization.savedName;
  customization.tagline = customization.savedTagline;
  customization.startingPowerUps = customization.savedStartingPowerUps;
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
  for (let i = 0; i < customizeFields.length; i += 1) {
    const row = {
      x: Math.max(24, window.innerWidth * 0.5 - 260),
      y: startY + i * rowHeight,
      width: Math.min(520, window.innerWidth - 48),
      height: 32,
    };
    if (inside(x, y, row)) return customizeFields[i];
  }

  const buttonY = Math.max(340, startY + 156);
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

  if (customization.selectedField === "startingPowerUps") {
    if (lower === "arrowleft" || key === "-") {
      customization.startingPowerUps = Math.max(0, customization.startingPowerUps - 1);
      return true;
    }
    if (lower === "arrowright" || key === "+" || key === "=") {
      customization.startingPowerUps = Math.min(20, customization.startingPowerUps + 1);
      return true;
    }
    if (/^[0-9]$/.test(key)) {
      customization.startingPowerUps = Math.min(20, Number(key));
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

function selectRelativeField(offset) {
  const index = customizeFields.indexOf(customization.selectedField);
  const next = (index + offset + customizeFields.length) % customizeFields.length;
  customization.selectedField = customizeFields[next];
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
