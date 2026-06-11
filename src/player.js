import { game, keys, player, powerUps, states, touches, world } from "./state.js";

export function inputAxis() {
  let axis = 0;
  if (keys.has("arrowleft") || keys.has("a")) axis -= 1;
  if (keys.has("arrowright") || keys.has("d")) axis += 1;

  for (const zone of touches.values()) {
    if (zone === "left") axis -= 1;
    if (zone === "right") axis += 1;
  }

  return Math.max(-1, Math.min(1, axis));
}

export function isDucking() {
  if (game.state !== states.PLAYING) return false;
  if (!player.onGround) return false;
  if (keys.has("arrowdown") || keys.has("s")) return true;
  for (const zone of touches.values()) {
    if (zone === "duck") return true;
  }
  return false;
}

export function jump() {
  player.vy = -jumpImpulse();
  player.onGround = false;
  player.coyoteTimer = 0;
  player.jumpBuffer = 0;
}

export function jumpImpulse() {
  return player.jumpPower * (powerUps.boots ? Math.SQRT2 : 1);
}

export function canStomp(enemy) {
  if (!powerUps.boots || player.vy <= 160) return false;
  const enemyTop = enemy.y - enemy.radius;
  const previousFeet = player.previousY;
  const currentFeet = player.y;
  const crossedHead = previousFeet <= enemyTop + 4 && currentFeet >= enemyTop - 2;
  const nearEnemyHead = currentFeet <= enemy.y - enemy.radius * 0.2;
  const horizontallyCentered = Math.abs(player.x - enemy.x) <= enemy.radius * 0.72;
  return crossedHead && nearEnemyHead && horizontallyCentered;
}

export function playerDistanceTo(point) {
  const px = player.x;
  const py = player.y - player.height * (isDucking() ? 0.25 : 0.45);
  return Math.hypot(px - point.x, py - point.y);
}

export function applyPlayerMovement(dt, groundAt) {
  const ducking = isDucking();
  const axis = inputAxis();
  if (axis !== 0) {
    player.vx += axis * player.speed * (ducking ? 0.45 : 1) * dt;
    player.facing = axis > 0 ? 1 : -1;
  } else {
    player.vx *= Math.pow(world.friction, dt * 60);
  }

  const maxSpeed = ducking ? 145 : 360;
  player.vx = Math.max(-maxSpeed, Math.min(maxSpeed, player.vx));

  if (game.jumpRequested) {
    player.jumpBuffer = 0.12;
    game.jumpRequested = false;
  } else {
    player.jumpBuffer = Math.max(0, player.jumpBuffer - dt);
  }

  if (player.onGround) {
    player.coyoteTimer = 0.09;
  } else {
    player.coyoteTimer = Math.max(0, player.coyoteTimer - dt);
  }

  if (!ducking && player.jumpBuffer > 0 && (player.onGround || player.coyoteTimer > 0)) {
    jump();
  }

  player.previousY = player.y;
  player.vy += world.gravity * dt;
  player.x += player.vx * dt;
  player.y += player.vy * dt;
  player.x = Math.max(36, Math.min(world.width - 36, player.x));

  const groundY = groundAt(player.x);
  if (player.y >= groundY) {
    player.y = groundY;
    player.vy = 0;
    player.onGround = true;
  } else {
    player.onGround = false;
  }
}
