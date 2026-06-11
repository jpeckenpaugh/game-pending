import { camera, customization, drone, drops, enemies, game, particles, player, projectiles, states, world } from "./state.js";
import { buildTerrain, groundAt } from "./terrain.js";
import { spawnEnemies } from "./enemies.js";
import { grantRandomPowerUp, rechargePowerUpsOnLevelComplete, resetPowerUps } from "./powerups.js";

export function startLevel(nextLevel) {
  game.level = nextLevel;
  enemies.length = 0;
  projectiles.length = 0;
  drops.length = 0;
  particles.length = 0;
  drone.active = false;
  drone.phase = "idle";
  game.enemiesRemaining = 10 + (game.level - 1) * 4;
  world.width = Math.max(2200, 1500 + game.enemiesRemaining * 135);
  buildTerrain();

  player.x = 80;
  player.y = groundAt(player.x);
  player.previousY = player.y;
  player.vx = 0;
  player.vy = 0;
  player.onGround = true;
  player.coyoteTimer = 0;
  player.jumpBuffer = 0;
  player.invulnerableFor = 1.2;
  player.ammo = Math.max(player.ammo, 10);
  camera.x = 0;

  spawnEnemies();

  game.message = `Level ${game.level}`;
  game.messageTimer = 2;
}

export function beginNewGame() {
  resetPowerUps();
  player.ammo = 10;
  for (let i = 0; i < customization.startingPowerUps; i += 1) {
    grantRandomPowerUp();
  }
  startLevel(1);
  game.state = states.PLAYING;
}

export function continueToNextLevel() {
  player.ammo += 4;
  startLevel(game.completedLevel + 1);
  game.state = states.PLAYING;
}

export function showLevelComplete() {
  grantRandomPowerUp();
  rechargePowerUpsOnLevelComplete();
  game.state = states.LEVEL_COMPLETE;
  game.message = "";
  game.messageTimer = 0;
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
    continueToNextLevel();
    return true;
  }

  return false;
}
