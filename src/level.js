import { customization, drone, drops, enemies, game, particles, player, powerUps, projectiles, states, world } from "./state.js";
import { buildTerrain, centerCameraOnPlayer } from "./terrain.js";
import { spawnEnemies } from "./enemies.js";
import { applyStartingPowerUps, grantPowerUp, powerUpChoiceOptions, rechargePowerUpsOnLevelComplete, resetPowerUps } from "./powerups.js";

export function startLevel(nextLevel) {
  game.level = nextLevel;
  customization.level = nextLevel;
  enemies.length = 0;
  projectiles.length = 0;
  drops.length = 0;
  particles.length = 0;
  drone.active = false;
  drone.phase = "idle";
  game.wrapTimer = 0;
  game.teleportPhase = "idle";
  game.teleportTimer = 0;
  game.teleportDuration = 0;
  game.teleportMoved = false;
  game.enemiesRemaining = 10 + (game.level - 1) * 4;
  world.width = Math.max(window.innerWidth * 3, 2200 + (game.level - 1) * 320 + game.enemiesRemaining * 42);
  buildTerrain();

  player.x = world.spawnX;
  player.y = world.spawnY;
  player.previousY = player.y;
  player.vx = 0;
  player.vy = 0;
  player.onGround = true;
  player.surfaceId = "ground";
  player.climbing = false;
  player.coyoteTimer = 0;
  player.jumpBuffer = 0;
  player.invulnerableFor = 1.2;
  player.airJumpsRemaining = powerUps.bootsLevel;
  player.bootsPulseTimer = 0;
  player.ammo = Math.max(player.ammo, 10);
  centerCameraOnPlayer();

  spawnEnemies();

  game.message = `Level ${game.level}`;
  game.messageTimer = 2;
  game.powerChoices = [];
  game.powerChoiceSelection = 0;
  game.powerChoiceReturnState = states.PLAYING;
}

export function beginNewGame() {
  resetPowerUps();
  player.ammo = 10;
  applyStartingPowerUps();
  startLevel(customization.level);
  game.state = states.PLAYING;
}

export function returnToTitle() {
  resetPowerUps();
  player.ammo = 10;
  startLevel(customization.level);
  game.state = states.TITLE;
  game.titleSelection = 0;
}

export function pauseGame() {
  if (game.state !== states.PLAYING) return;
  game.state = states.PAUSED;
  game.pauseSelection = 0;
}

export function resumeGame() {
  if (game.state === states.PAUSED) game.state = states.PLAYING;
}

export function continueToNextLevel() {
  player.ammo += 4;
  startLevel(game.completedLevel + 1);
  game.state = states.PLAYING;
}

export function showLevelComplete() {
  game.powerChoices = powerUpChoiceOptions(3);
  game.powerChoiceSelection = 0;
  game.powerChoiceReturnState = states.PLAYING;
  game.state = states.LEVEL_COMPLETE;
  game.message = "";
  game.messageTimer = 0;
}

export function chooseLevelPowerUp(index = game.powerChoiceSelection) {
  const choice = game.powerChoices[index];
  if (!choice) return false;
  grantPowerUp(choice.type);
  rechargePowerUpsOnLevelComplete();
  continueToNextLevel();
  return true;
}

export function showPowerChoice(returnState = states.PLAYING) {
  game.powerChoices = powerUpChoiceOptions(3);
  game.powerChoiceSelection = 0;
  game.powerChoiceReturnState = returnState;
  game.state = states.POWER_CHOICE;
  game.message = "";
  game.messageTimer = 0;
}

export function choosePowerChoice(index = game.powerChoiceSelection) {
  const choice = game.powerChoices[index];
  if (!choice) return false;
  grantPowerUp(choice.type);
  rechargePowerUpsOnLevelComplete();
  game.powerChoices = [];
  game.powerChoiceSelection = 0;
  game.state = game.powerChoiceReturnState || states.PLAYING;
  game.powerChoiceReturnState = states.PLAYING;
  return true;
}

export function grantAndRefreshPowerChoice() {
  if (game.powerChoices.length === 0) return false;
  const index = Math.floor(Math.random() * game.powerChoices.length);
  grantPowerUp(game.powerChoices[index].type);
  rechargePowerUpsOnLevelComplete();
  game.powerChoices = powerUpChoiceOptions(3);
  game.powerChoiceSelection = 0;
  game.state = states.POWER_CHOICE;
  return true;
}

export function startLevelClearCollection() {
  game.completedLevel = game.level;
  game.state = states.LEVEL_COLLECTING;
  game.levelClearTimer = drops.length > 0 ? 1.2 : 0.45;
  projectiles.length = 0;
  particles.length = 0;
  player.vx = 0;
  game.message = "";
  game.messageTimer = 0;

  for (const drop of drops) {
    drop.collecting = true;
    drop.vx = 0;
    drop.vy = 0;
  }
}

export function showGameOver() {
  game.state = states.GAME_OVER;
  game.message = "";
  game.messageTimer = 0;
}

export function activateCurrentScreen() {
  if (game.state === states.TITLE || game.state === states.GAME_OVER) {
    beginNewGame();
    return true;
  }

  if (game.state === states.LEVEL_COMPLETE) {
    chooseLevelPowerUp(game.powerChoiceSelection);
    return true;
  }

  if (game.state === states.POWER_CHOICE) {
    choosePowerChoice(game.powerChoiceSelection);
    return true;
  }

  return false;
}
