// Owns Drone runtime behavior: charge/recharge, fly-in/fly-out, and missile firing.
// Drone art is drawn in render.js; missile homing is updated in projectiles.js.
import { camera, drone, game, powerUps, projectiles } from "./state.js";
import { nearestEnemy, visibleEnemy } from "./targeting.js";
import { droneExtraMissileMax, primaryPowerLevel } from "./powerups.js";

export function updateDrone(dt) {
  if (powerUps.droneLevel === 0) return;

  updateDroneRecharge(dt);
  startDroneRun();

  if (!drone.active) return;
  updateExtraDroneShots(dt);

  const dx = drone.targetX - drone.x;
  const dy = drone.targetY - drone.y;
  const distance = Math.hypot(dx, dy);
  const speed = 520;

  if (distance <= 12) {
    if (drone.phase === "entering") {
      fireDroneShot();
      drone.phase = "exiting";
      drone.targetX = drone.direction === 1
        ? camera.x + window.innerWidth + 58
        : camera.x - 58;
      drone.targetY = 54;
      return;
    }

    drone.active = false;
    drone.phase = "idle";
    return;
  }

  drone.x += (dx / Math.max(1, distance)) * speed * dt;
  drone.y += (dy / Math.max(1, distance)) * speed * dt;
}

function startDroneRun() {
  if (drone.active || powerUps.droneCharges <= 0 || !visibleEnemy()) return;

  powerUps.droneCharges -= 1;
  powerUps.droneRecharge = 0;
  drone.active = true;
  drone.phase = "entering";
  drone.direction = Math.random() < 0.5 ? 1 : -1;
  drone.x = drone.direction === 1
    ? camera.x - 48
    : camera.x + window.innerWidth + 48;
  drone.y = camera.y + window.innerHeight * 0.25;
  drone.targetX = camera.x + window.innerWidth * 0.5;
  drone.targetY = camera.y + window.innerHeight * 0.25;
  drone.extraShotsRemaining = 0;
  drone.extraShotTimer = 0;
}

function updateDroneRecharge(dt) {
  const primaryMax = primaryPowerLevel(powerUps.droneLevel);
  if (primaryMax === 0 || powerUps.droneCharges >= primaryMax) {
    powerUps.droneRecharge = 0;
  } else {
    powerUps.droneRecharge += dt;
    if (powerUps.droneRecharge >= 10) {
      powerUps.droneCharges += 1;
      powerUps.droneRecharge = 0;
      game.message = "Drone charged";
      game.messageTimer = 1.4;
    }
  }

  const extraMax = droneExtraMissileMax();
  if (extraMax === 0 || powerUps.droneExtraMissiles >= extraMax) {
    powerUps.droneExtraRecharge = 0;
    return;
  }

  powerUps.droneExtraRecharge += dt;
  if (powerUps.droneExtraRecharge >= 5) {
    powerUps.droneExtraMissiles += 1;
    powerUps.droneExtraRecharge = 0;
    game.message = "Extra missile charged";
    game.messageTimer = 1.4;
  }
}

function fireDroneShot() {
  fireDroneMissile();
  // Tier two Drone spends a shared extra missile bank and releases a short salvo.
  // Each delayed missile picks a fresh nearest target when fired.
  const extraCount = Math.min(powerUps.droneExtraMissiles, 1 + Math.floor(Math.random() * 3));
  if (extraCount > 0) {
    powerUps.droneExtraMissiles -= extraCount;
    powerUps.droneExtraRecharge = 0;
    drone.extraShotsRemaining = extraCount;
    drone.extraShotTimer = 0.14;
  }
  game.message = extraCount > 0 ? "Drone salvo" : "Drone strike";
  game.messageTimer = 1.1;
}

function updateExtraDroneShots(dt) {
  if (drone.extraShotsRemaining <= 0) return;
  drone.extraShotTimer -= dt;
  while (drone.extraShotsRemaining > 0 && drone.extraShotTimer <= 0) {
    fireDroneMissile();
    drone.extraShotsRemaining -= 1;
    drone.extraShotTimer += 0.14;
  }
}

function fireDroneMissile() {
  const target = nearestEnemy(drone.x, drone.y);
  if (!target) return;

  projectiles.push({
    x: drone.x,
    y: drone.y,
    vx: 0,
    vy: 0,
    speed: 620,
    life: 4,
    homing: true,
    target,
  });
}
