import { game, keys, states, touches } from "./state.js";
import { beginNewGame, continueToNextLevel, pauseGame, resumeGame, returnToTitle } from "./level.js";
import { grantPowerUpWithFeedback } from "./powerups.js";
import { shoot } from "./projectiles.js";
import { cancelCustomize, customizeActionAt, handleCustomizeKey, openCustomize, saveCustomize, selectCustomizeField, titleButtonAt } from "./customize.js";

export function setupInput(canvas) {
  window.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    if (game.state === states.CUSTOMIZE) {
      event.preventDefault();
      handleCustomizeKey(event);
      return;
    }

    if (["arrowleft", "arrowright", "arrowup", "arrowdown", "enter", " ", "a", "d", "g", "s", "w", "r"].includes(key)) {
      event.preventDefault();
    }

    if (handleMenuKey(key)) {
      keys.add(key);
      return;
    }

    if (key === "enter" && game.state === states.PLAYING) {
      pauseGame();
      keys.add(key);
      return;
    }

    if ((key === "arrowup" || key === "w") && !keys.has(key)) game.jumpRequested = true;
    if (key === "g" && !keys.has(key) && game.state === states.PLAYING) grantPowerUpWithFeedback();
    if (key === " ") shoot();
    if (key === "r" && game.state === states.PLAYING) beginNewGame();
    keys.add(key);
  });

  window.addEventListener("keyup", (event) => {
    keys.delete(event.key.toLowerCase());
  });

  canvas.addEventListener("touchstart", (event) => {
    event.preventDefault();
    for (const touch of event.changedTouches) {
      touches.set(touch.identifier, touchZone(touch));
    }
  }, { passive: false });

  canvas.addEventListener("touchmove", (event) => {
    event.preventDefault();
    for (const touch of event.changedTouches) {
      touches.set(touch.identifier, touchZone(touch));
    }
  }, { passive: false });

  canvas.addEventListener("touchend", (event) => {
    event.preventDefault();
    for (const touch of event.changedTouches) {
      touches.delete(touch.identifier);
    }
  }, { passive: false });

  canvas.addEventListener("mousedown", (event) => {
    if (handleMenuAction(event.clientX, event.clientY)) return;
    if (event.button === 0) shoot();
  });
}

function touchZone(touch) {
  const x = touch.clientX;
  const y = touch.clientY;
  if (handleMenuAction(x, y)) return "none";
  if (x < window.innerWidth * 0.45) return "left";
  if (y < window.innerHeight * 0.48) {
    game.jumpRequested = true;
    return "jump";
  }
  if (x < window.innerWidth * 0.72) return "duck";
  shoot();
  return "shoot";
}

function handleMenuAction(x, y) {
  if (game.state === states.PLAYING) return false;

  if (game.state === states.TITLE) {
    const action = titleButtonAt(x, y);
    if (action === "newGame") return activateTitleSelection(0);
    if (action === "customize") return activateTitleSelection(1);
    return false;
  }

  if (game.state === states.CUSTOMIZE) {
    const action = customizeActionAt(x, y);
    if (action === "save") {
      saveCustomize();
      return true;
    }
    if (action === "cancel") {
      cancelCustomize();
      return true;
    }
    if (action) {
      selectCustomizeField(action);
      return true;
    }
    return false;
  }

  if (game.state === states.PAUSED) {
    const action = pauseButtonAt(x, y);
    if (action === "continue") return activatePauseSelection(0);
    if (action === "customize") return activatePauseSelection(1);
    if (action === "restart") return activatePauseSelection(2);
    return false;
  }

  const buttonWidth = Math.min(260, window.innerWidth - 48);
  const buttonX = (window.innerWidth - buttonWidth) / 2;
  let buttonY = Math.max(220, window.innerHeight * 0.46);

  if (game.state === states.LEVEL_COMPLETE) {
    buttonY = Math.max(260, window.innerHeight * 0.56);
  } else if (game.state === states.GAME_OVER) {
    buttonY = Math.max(250, window.innerHeight * 0.54);
  }

  const insideButton = x >= buttonX && x <= buttonX + buttonWidth
    && y >= buttonY && y <= buttonY + 48;
  if (!insideButton) return false;

  if (game.state === states.LEVEL_COMPLETE) {
    continueToNextLevel();
    return true;
  }
  if (game.state === states.GAME_OVER) {
    beginNewGame();
    return true;
  }
  return false;
}

function handleMenuKey(key) {
  if (game.state === states.TITLE) {
    if (key === "arrowup" || key === "w") {
      game.titleSelection = (game.titleSelection + 1) % 2;
      return true;
    }
    if (key === "arrowdown" || key === "s") {
      game.titleSelection = (game.titleSelection + 1) % 2;
      return true;
    }
    if (key === "enter" || key === " ") return activateTitleSelection(game.titleSelection);
  }

  if (game.state === states.PAUSED) {
    if (key === "arrowup" || key === "w") {
      game.pauseSelection = (game.pauseSelection + 2) % 3;
      return true;
    }
    if (key === "arrowdown" || key === "s") {
      game.pauseSelection = (game.pauseSelection + 1) % 3;
      return true;
    }
    if (key === "enter" || key === " ") return activatePauseSelection(game.pauseSelection);
  }

  if (game.state === states.LEVEL_COMPLETE && (key === "enter" || key === " ")) {
    continueToNextLevel();
    return true;
  }

  if (game.state === states.GAME_OVER && (key === "enter" || key === " " || key === "r")) {
    beginNewGame();
    return true;
  }

  return false;
}

function activateTitleSelection(selection) {
  game.titleSelection = selection;
  if (selection === 0) {
    beginNewGame();
  } else {
    openCustomize(states.TITLE);
  }
  return true;
}

function activatePauseSelection(selection) {
  game.pauseSelection = selection;
  if (selection === 0) {
    resumeGame();
  } else if (selection === 1) {
    openCustomize(states.PAUSED);
  } else {
    returnToTitle();
  }
  return true;
}

function pauseButtonAt(x, y) {
  const startY = Math.max(210, window.innerHeight * 0.38);
  if (insideButton(x, y, startY)) return "continue";
  if (insideButton(x, y, startY + 62)) return "customize";
  if (insideButton(x, y, startY + 124)) return "restart";
  return "";
}

function insideButton(x, y, buttonY) {
  const buttonWidth = Math.min(260, window.innerWidth - 48);
  const buttonX = (window.innerWidth - buttonWidth) / 2;
  return x >= buttonX && x <= buttonX + buttonWidth
    && y >= buttonY && y <= buttonY + 48;
}
