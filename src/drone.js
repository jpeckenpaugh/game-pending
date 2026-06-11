import { camera, drone, game, powerUps, projectiles } from "./state.js";
import { nearestEnemy, visibleEnemy } from "./targeting.js";

export function updateDrone(dt) {
  if (powerUps.droneLevel === 0) return;

  updateDroneRecharge(dt);
  startDroneRun();

  if (!drone.active) return;

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
  drone.y = 46;
  drone.targetX = camera.x + window.innerWidth * 0.5;
  drone.targetY = 92;
}

function updateDroneRecharge(dt) {
  if (powerUps.droneLevel === 0 || powerUps.droneCharges >= powerUps.droneLevel) {
    powerUps.droneRecharge = 0;
    return;
  }

  powerUps.droneRecharge += dt;
  if (powerUps.droneRecharge >= 10) {
    powerUps.droneCharges += 1;
    powerUps.droneRecharge = powerUps.droneCharges < powerUps.droneLevel ? 0 : 0;
    game.message = "Drone charged";
    game.messageTimer = 1.4;
  }
}

function fireDroneShot() {
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
  game.message = "Drone strike";
  game.messageTimer = 1.1;
}
