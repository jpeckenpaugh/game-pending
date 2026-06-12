import { customization, drone, game, powerUpPool, powerUps, projectiles, player } from "./state.js";

export function resetPowerUps() {
  powerUps.bootsLevel = 0;
  powerUps.shieldLevel = 0;
  powerUps.shieldCharges = 0;
  powerUps.shieldRecharge = 0;
  powerUps.specs = 0;
  powerUps.radar = 0;
  powerUps.droneLevel = 0;
  powerUps.droneCharges = 0;
  powerUps.droneRecharge = 0;
  drone.active = false;
  game.lastPowerUp = "";
}

export function applyStartingPowerUps() {
  powerUps.bootsLevel = Math.max(0, Math.min(5, customization.startingBootsLevel));
  powerUps.specs = customization.startingSpecs ? 1 : 0;
  powerUps.radar = customization.startingRadar ? 1 : 0;
  powerUps.shieldLevel = Math.max(0, Math.min(5, customization.startingShieldLevel));
  powerUps.shieldCharges = powerUps.shieldLevel;
  powerUps.shieldRecharge = 0;
  powerUps.droneLevel = Math.max(0, Math.min(5, customization.startingDroneLevel));
  powerUps.droneCharges = powerUps.droneLevel;
  powerUps.droneRecharge = 0;
}

export function grantRandomPowerUp() {
  const type = powerUpPool[Math.floor(Math.random() * powerUpPool.length)];

  if (type === "boots") {
    powerUps.bootsLevel = Math.min(5, powerUps.bootsLevel + 1);
    player.airJumpsRemaining = Math.max(player.airJumpsRemaining, powerUps.bootsLevel);
    game.lastPowerUp = `Boots Lv ${powerUps.bootsLevel}`;
    return game.lastPowerUp;
  }

  if (type === "shield") {
    powerUps.shieldLevel = Math.min(5, powerUps.shieldLevel + 1);
    powerUps.shieldCharges = Math.min(powerUps.shieldLevel, powerUps.shieldCharges + 1);
    powerUps.shieldRecharge = powerUps.shieldCharges < powerUps.shieldLevel ? powerUps.shieldRecharge : 0;
    game.lastPowerUp = `Shield Lv ${powerUps.shieldLevel}`;
    return game.lastPowerUp;
  }

  if (type === "drone") {
    powerUps.droneLevel = Math.min(5, powerUps.droneLevel + 1);
    powerUps.droneCharges = Math.min(powerUps.droneLevel, powerUps.droneCharges + 1);
    powerUps.droneRecharge = powerUps.droneCharges < powerUps.droneLevel ? powerUps.droneRecharge : 0;
    game.lastPowerUp = `Drone Lv ${powerUps.droneLevel}`;
    return game.lastPowerUp;
  }

  if (type === "radar") {
    powerUps.radar = 1;
    game.lastPowerUp = "Radar";
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
  if (powerUps.shieldLevel > 0) {
    powerUps.shieldCharges = powerUps.shieldLevel;
    powerUps.shieldRecharge = 0;
  }

  if (powerUps.droneLevel > 0) {
    powerUps.droneCharges = powerUps.droneLevel;
    powerUps.droneRecharge = 0;
  }
}

export function updateShieldRecharge(dt) {
  if (powerUps.shieldLevel === 0 || powerUps.shieldCharges >= powerUps.shieldLevel) {
    powerUps.shieldRecharge = 0;
    return;
  }

  powerUps.shieldRecharge += dt;
  if (powerUps.shieldRecharge >= 10) {
    powerUps.shieldCharges += 1;
    powerUps.shieldRecharge = powerUps.shieldCharges < powerUps.shieldLevel ? 0 : 0;
    game.message = "Shield recharged";
    game.messageTimer = 1.4;
  }
}

export function absorbOrTakeHit(onGameOver) {
  if (powerUps.shieldCharges > 0) {
    powerUps.shieldCharges -= 1;
    powerUps.shieldRecharge = 0;
    player.invulnerableFor = 1.3;
    player.vx = -player.facing * 260;
    game.message = "Shield blocked hit";
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
  if (powerUps.bootsLevel) active.push(`Boots ${powerUps.bootsLevel}`);
  if (powerUps.specs) active.push("Specs");
  if (powerUps.radar) active.push("Radar");
  if (powerUps.droneLevel) active.push(`Drone ${powerUps.droneCharges}/${powerUps.droneLevel}`);
  if (powerUps.shieldLevel) active.push(`Shield ${powerUps.shieldCharges}/${powerUps.shieldLevel}`);
  return active.length > 0 ? active.join("  ") : "none";
}
