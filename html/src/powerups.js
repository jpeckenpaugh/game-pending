// Owns power-up level caps, grants, recharge accounting, and shield collision
// outcomes. Runtime movement/firing is handled by player.js and drone.js.
import { customization, drone, game, powerUpPool, powerUps, projectiles, player, setPlayerFaceMood } from "./state.js";
import { groundAt, surfaceById, surfaceYAt } from "./terrain.js";
import { playPowerUp } from "./audio.js";

// Tier helpers keep levels 1-5 as primary capacity and 6-10 as secondary capacity.
export function primaryPowerLevel(level) {
  return Math.max(0, Math.min(5, level));
}

export function tierTwoLevel(level) {
  return Math.max(0, Math.min(5, level - 5));
}

export function bootsGlideMax() {
  return tierTwoLevel(powerUps.bootsLevel) * 2;
}

export function droneExtraMissileMax() {
  return tierTwoLevel(powerUps.droneLevel);
}

export function shieldKineticMax() {
  return tierTwoLevel(powerUps.shieldLevel);
}

export function resetPowerUps() {
  powerUps.bootsLevel = 0;
  powerUps.bootsGlideCharge = 0;
  powerUps.bootsGlideCooldown = 0;
  powerUps.shieldLevel = 0;
  powerUps.shieldCharges = 0;
  powerUps.shieldRecharge = 0;
  powerUps.shieldKineticCharges = 0;
  powerUps.shieldKineticRecharge = 0;
  powerUps.specs = 0;
  powerUps.radar = 0;
  powerUps.droneLevel = 0;
  powerUps.droneCharges = 0;
  powerUps.droneRecharge = 0;
  powerUps.droneExtraMissiles = 0;
  powerUps.droneExtraRecharge = 0;
  powerUps.hasteLevel = 0;
  powerUps.hasteRecharge = 0;
  powerUps.dashCharges = 0;
  powerUps.dashMaxCharges = 0;
  drone.active = false;
  drone.extraShotsRemaining = 0;
  drone.extraShotTimer = 0;
  game.lastPowerUp = "";
}

export function applyStartingPowerUps() {
  powerUps.bootsLevel = Math.max(0, Math.min(10, customization.startingBootsLevel));
  powerUps.bootsGlideCharge = bootsGlideMax();
  powerUps.bootsGlideCooldown = 0;
  powerUps.specs = customization.startingSpecs ? 1 : 0;
  powerUps.radar = customization.startingRadar ? 1 : 0;
  powerUps.shieldLevel = Math.max(0, Math.min(10, customization.startingShieldLevel));
  powerUps.shieldCharges = primaryPowerLevel(powerUps.shieldLevel);
  powerUps.shieldRecharge = 0;
  powerUps.shieldKineticCharges = shieldKineticMax();
  powerUps.shieldKineticRecharge = 0;
  powerUps.droneLevel = Math.max(0, Math.min(10, customization.startingDroneLevel));
  powerUps.droneCharges = primaryPowerLevel(powerUps.droneLevel);
  powerUps.droneRecharge = 0;
  powerUps.droneExtraMissiles = droneExtraMissileMax();
  powerUps.droneExtraRecharge = 0;
}

// Grants advance one power level at a time while preserving current charge state.
export function grantPowerUp(type) {
  playPowerUp();
  if (type === "boots") {
    powerUps.bootsLevel = Math.min(10, powerUps.bootsLevel + 1);
    player.airJumpsRemaining = Math.max(player.airJumpsRemaining, primaryPowerLevel(powerUps.bootsLevel));
    powerUps.bootsGlideCharge = Math.max(powerUps.bootsGlideCharge, bootsGlideMax());
    game.lastPowerUp = `Boots Lv ${powerUps.bootsLevel}`;
    return game.lastPowerUp;
  }

  if (type === "shield") {
    powerUps.shieldLevel = Math.min(10, powerUps.shieldLevel + 1);
    powerUps.shieldCharges = Math.min(primaryPowerLevel(powerUps.shieldLevel), powerUps.shieldCharges + 1);
    powerUps.shieldRecharge = powerUps.shieldCharges < primaryPowerLevel(powerUps.shieldLevel) ? powerUps.shieldRecharge : 0;
    powerUps.shieldKineticCharges = Math.min(shieldKineticMax(), powerUps.shieldKineticCharges + 1);
    game.lastPowerUp = `Shield Lv ${powerUps.shieldLevel}`;
    return game.lastPowerUp;
  }

  if (type === "drone") {
    powerUps.droneLevel = Math.min(10, powerUps.droneLevel + 1);
    powerUps.droneCharges = Math.min(primaryPowerLevel(powerUps.droneLevel), powerUps.droneCharges + 1);
    powerUps.droneRecharge = powerUps.droneCharges < primaryPowerLevel(powerUps.droneLevel) ? powerUps.droneRecharge : 0;
    powerUps.droneExtraMissiles = Math.min(droneExtraMissileMax(), powerUps.droneExtraMissiles + 1);
    game.lastPowerUp = `Drone Lv ${powerUps.droneLevel}`;
    return game.lastPowerUp;
  }

  if (type === "radar") {
    powerUps.radar = 1;
    game.lastPowerUp = "Radar";
    return game.lastPowerUp;
  }

  if (type === "haste") {
    powerUps.hasteLevel = Math.min(10, powerUps.hasteLevel + 1);
    if (powerUps.hasteLevel > 5) {
      powerUps.dashMaxCharges = powerUps.hasteLevel - 5;
      powerUps.dashCharges = Math.min(powerUps.dashMaxCharges, powerUps.dashCharges + 1);
    }
    game.lastPowerUp = `Haste Lv ${powerUps.hasteLevel}`;
    return game.lastPowerUp;
  }

  powerUps.specs = 1;
  game.lastPowerUp = "Specs";
  return game.lastPowerUp;
}

export function powerUpChoiceOptions(count = 3) {
  const eligible = shuffled(powerUpPool.filter(powerUpCanImprove));
  const fallback = shuffled(powerUpPool);
  const choices = [];

  for (const type of [...eligible, ...fallback]) {
    if (choices.some((choice) => choice.type === type)) continue;
    choices.push(powerUpInfo(type));
    if (choices.length >= count) break;
  }

  return choices;
}

function powerUpCanImprove(type) {
  if (type === "boots") return powerUps.bootsLevel < 10;
  if (type === "shield") return powerUps.shieldLevel < 10;
  if (type === "drone") return powerUps.droneLevel < 10;
  if (type === "haste") return powerUps.hasteLevel < 10;
  if (type === "specs") return !powerUps.specs;
  if (type === "radar") return !powerUps.radar;
  return true;
}

function powerUpInfo(type) {
  if (type === "boots") return { type, name: "Boots", description: powerUps.bootsLevel >= 5 ? "Adds rocket glide charge." : "Adds a mid-air jump." };
  if (type === "shield") return { type, name: "Shield", description: powerUps.shieldLevel >= 5 ? "Adds kinetic stun charge." : "Blocks one hit per charge." };
  if (type === "drone") return { type, name: "Drone", description: powerUps.droneLevel >= 5 ? "Adds extra drone missiles." : "Calls in air support." };
  if (type === "haste") return { type, name: "Haste", description: powerUps.hasteLevel >= 5 ? "Adds a forward dash with invulnerability." : "Increases movement speed." };
  if (type === "radar") return { type, name: "Radar", description: "Points to the nearest enemy." };
  return { type: "specs", name: "Specs", description: "Auto-aims ranged attacks." };
}

function shuffled(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function rechargePowerUpsOnLevelComplete() {
  if (powerUps.shieldLevel > 0) {
    powerUps.shieldCharges = primaryPowerLevel(powerUps.shieldLevel);
    powerUps.shieldRecharge = 0;
    powerUps.shieldKineticCharges = shieldKineticMax();
    powerUps.shieldKineticRecharge = 0;
  }

  if (powerUps.droneLevel > 0) {
    powerUps.droneCharges = primaryPowerLevel(powerUps.droneLevel);
    powerUps.droneRecharge = 0;
    powerUps.droneExtraMissiles = droneExtraMissileMax();
    powerUps.droneExtraRecharge = 0;
  }

  if (powerUps.bootsLevel > 0) {
    powerUps.bootsGlideCharge = bootsGlideMax();
    powerUps.bootsGlideCooldown = 0;
  }

  if (powerUps.hasteLevel > 5) {
    powerUps.dashMaxCharges = powerUps.hasteLevel - 5;
    powerUps.dashCharges = powerUps.dashMaxCharges;
    powerUps.hasteRecharge = 0;
  }
}

// Runtime recharge for Shield's primary charge and tier-two kinetic discharge.
export function updateShieldRecharge(dt) {
  const primaryMax = primaryPowerLevel(powerUps.shieldLevel);
  if (primaryMax === 0 || powerUps.shieldCharges >= primaryMax) {
    powerUps.shieldRecharge = 0;
  } else {
    powerUps.shieldRecharge += dt;
    if (powerUps.shieldRecharge >= 10) {
      powerUps.shieldCharges += 1;
      powerUps.shieldRecharge = 0;
      game.message = "Shield recharged";
      game.messageTimer = 1.4;
    }
  }

  const kineticMax = shieldKineticMax();
  if (kineticMax === 0 || powerUps.shieldKineticCharges >= kineticMax) {
    powerUps.shieldKineticRecharge = 0;
    return;
  }

  powerUps.shieldKineticRecharge += dt;
  if (powerUps.shieldKineticRecharge >= 20) {
    powerUps.shieldKineticCharges += 1;
    powerUps.shieldKineticRecharge = 0;
    game.message = "Kinetic shield charged";
    game.messageTimer = 1.4;
  }
}

// Runtime recharge for Boots' tier-two glide resource.
export function updateBootsGlideRecharge(dt) {
  const max = bootsGlideMax();
  if (max === 0) {
    powerUps.bootsGlideCharge = 0;
    powerUps.bootsGlideCooldown = 0;
    return;
  }

  if (powerUps.bootsGlideCooldown > 0) {
    powerUps.bootsGlideCooldown = Math.max(0, powerUps.bootsGlideCooldown - dt);
    return;
  }

  powerUps.bootsGlideCharge = Math.min(max, powerUps.bootsGlideCharge + dt);
}

// Runtime recharge for Haste dash charges (1 per 8 seconds).
export function updateHasteRecharge(dt) {
  if (powerUps.hasteLevel <= 5 || powerUps.dashMaxCharges <= 0) return;
  if (powerUps.dashCharges >= powerUps.dashMaxCharges) {
    powerUps.hasteRecharge = 0;
    return;
  }
  powerUps.hasteRecharge += dt;
  if (powerUps.hasteRecharge >= 8) {
    powerUps.dashCharges = Math.min(powerUps.dashMaxCharges, powerUps.dashCharges + 1);
    powerUps.hasteRecharge = 0;
  }
}

// Shield absorption owns the collision outcome; callers handle game-over flow.
export function absorbOrTakeHit(onGameOver, enemy = null) {
  if (powerUps.shieldCharges > 0) {
    powerUps.shieldCharges -= 1;
    powerUps.shieldRecharge = 0;
    player.invulnerableFor = 1.3;
    if (enemy && powerUps.shieldKineticCharges > 0) {
      powerUps.shieldKineticCharges -= 1;
      powerUps.shieldKineticRecharge = 0;
      suspendEnemy(enemy);
      setPlayerFaceMood("surprised", 1, 5);
      game.message = "Kinetic discharge";
      game.messageTimer = 1.6;
      return "kinetic";
    }
    player.vx = -player.facing * 260;
    setPlayerFaceMood("surprised", 0.9, 4);
    game.message = "Shield blocked hit";
    game.messageTimer = 1.6;
    return "shield";
  }

  player.ammo = Math.max(0, player.ammo - 2);
  player.invulnerableFor = 1.3;
  player.vx = -player.facing * 260;
  setPlayerFaceMood("crying", 1.5, 6);
  game.message = "Hit! Ammo lost.";
  game.messageTimer = 1.6;
  if (player.ammo === 0 && projectiles.length === 0) {
    onGameOver();
  }
  return "hit";
}

function suspendEnemy(enemy) {
  const surface = enemy.surfaceId ? surfaceById(enemy.surfaceId) : null;
  const endY = (surface ? surfaceYAt(surface, enemy.x) : groundAt(enemy.x)) - enemy.radius;
  enemy.suspendedFor = 5;
  enemy.suspendedDuration = 5;
  enemy.suspendedStartY = enemy.y;
  enemy.suspendedBaseY = Math.min(enemy.y, endY) - 62;
  enemy.suspendedEndY = endY;
  enemy.suspendedSpin = 0;
  enemy.flashTimer = 5;
}
