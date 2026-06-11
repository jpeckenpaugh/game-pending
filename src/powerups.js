import { drone, game, powerUpPool, powerUps, projectiles, player } from "./state.js";

export function resetPowerUps() {
  powerUps.boots = 0;
  powerUps.vestLevel = 0;
  powerUps.vestCharges = 0;
  powerUps.vestRecharge = 0;
  powerUps.specs = 0;
  powerUps.droneLevel = 0;
  powerUps.droneCharges = 0;
  powerUps.droneRecharge = 0;
  drone.active = false;
  game.lastPowerUp = "";
}

export function grantRandomPowerUp() {
  const type = powerUpPool[Math.floor(Math.random() * powerUpPool.length)];

  if (type === "boots") {
    powerUps.boots = 1;
    game.lastPowerUp = "Boots";
    return game.lastPowerUp;
  }

  if (type === "vest") {
    powerUps.vestLevel += 1;
    powerUps.vestCharges = Math.min(powerUps.vestLevel, powerUps.vestCharges + 1);
    powerUps.vestRecharge = powerUps.vestCharges < powerUps.vestLevel ? powerUps.vestRecharge : 0;
    game.lastPowerUp = `Vest Lv ${powerUps.vestLevel}`;
    return game.lastPowerUp;
  }

  if (type === "drone") {
    powerUps.droneLevel += 1;
    powerUps.droneCharges = Math.min(powerUps.droneLevel, powerUps.droneCharges + 1);
    powerUps.droneRecharge = powerUps.droneCharges < powerUps.droneLevel ? powerUps.droneRecharge : 0;
    game.lastPowerUp = `Drone Lv ${powerUps.droneLevel}`;
    return game.lastPowerUp;
  }

  powerUps.specs = 1;
  game.lastPowerUp = "Specs";
  return game.lastPowerUp;
}

export function grantPowerUpWithFeedback() {
  const granted = grantRandomPowerUp();
  game.message = `Granted: ${granted}`;
  game.messageTimer = 2;
}

export function rechargePowerUpsOnLevelComplete() {
  if (powerUps.vestLevel > 0) {
    powerUps.vestCharges = powerUps.vestLevel;
    powerUps.vestRecharge = 0;
  }

  if (powerUps.droneLevel > 0) {
    powerUps.droneCharges = powerUps.droneLevel;
    powerUps.droneRecharge = 0;
  }
}

export function updateVestRecharge(dt) {
  if (powerUps.vestLevel === 0 || powerUps.vestCharges >= powerUps.vestLevel) {
    powerUps.vestRecharge = 0;
    return;
  }

  powerUps.vestRecharge += dt;
  if (powerUps.vestRecharge >= 10) {
    powerUps.vestCharges += 1;
    powerUps.vestRecharge = powerUps.vestCharges < powerUps.vestLevel ? 0 : 0;
    game.message = "Vest recharged";
    game.messageTimer = 1.4;
  }
}

export function absorbOrTakeHit(onGameOver) {
  if (powerUps.vestCharges > 0) {
    powerUps.vestCharges -= 1;
    powerUps.vestRecharge = 0;
    player.invulnerableFor = 1.3;
    player.vx = -player.facing * 260;
    game.message = "Vest blocked hit";
    game.messageTimer = 1.6;
    return;
  }

  player.ammo = Math.max(0, player.ammo - 2);
  player.invulnerableFor = 1.3;
  player.vx = -player.facing * 260;
  game.message = "Hit! Ammo lost.";
  game.messageTimer = 1.6;
  if (player.ammo === 0 && projectiles.length === 0) {
    onGameOver();
  }
}

export function powerUpSummary() {
  const active = [];
  if (powerUps.boots) active.push("Boots");
  if (powerUps.specs) active.push("Specs");
  if (powerUps.droneLevel) active.push(`Drone ${powerUps.droneCharges}/${powerUps.droneLevel}`);
  if (powerUps.vestLevel) active.push(`Vest ${powerUps.vestCharges}/${powerUps.vestLevel}`);
  return active.length > 0 ? active.join("  ") : "none";
}
