import { game, keys, states, touches } from "./state.js";
import { activateCurrentScreen, beginNewGame } from "./level.js";
import { grantPowerUpWithFeedback } from "./powerups.js";
import { shoot } from "./projectiles.js";

export function setupInput(canvas) {
  window.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    if (["arrowleft", "arrowright", "arrowup", "arrowdown", "enter", " ", "a", "d", "g", "s", "w", "r"].includes(key)) {
      event.preventDefault();
    }
    if ((key === "enter" || key === " " || key === "r") && activateCurrentScreen()) {
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

  return activateCurrentScreen();
}
