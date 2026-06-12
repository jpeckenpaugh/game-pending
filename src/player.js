import { game, keys, player, powerUps, states, touches, world } from "./state.js";
import { groundAt, ladderAt, ladderEntryAt, ladderExitSurfaceAt, landingSurfaceAt, oppositeTeleport, teleportAt } from "./terrain.js";

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

function verticalAxis() {
  let axis = 0;
  if (keys.has("arrowup") || keys.has("w")) axis -= 1;
  if (keys.has("arrowdown") || keys.has("s")) axis += 1;

  for (const zone of touches.values()) {
    if (zone === "jump") axis -= 1;
    if (zone === "duck") axis += 1;
  }

  return Math.max(-1, Math.min(1, axis));
}

export function isDucking() {
  if (game.state !== states.PLAYING) return false;
  if (player.climbing) return false;
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
  player.surfaceId = "";
  player.climbing = false;
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
  const wasOnGround = player.onGround;
  const ladder = ladderAt(player.x, player.y - player.height * 0.48);
  const climbAxis = verticalAxis();
  const ladderEntry = climbAxis > 0 && wasOnGround ? ladderEntryAt(player.x, player.y) : null;
  const activeLadder = ladder || ladderEntry;
  if (activeLadder && climbAxis !== 0) {
    player.climbing = true;
    player.onGround = false;
    player.surfaceId = "";
    player.vx *= 0.65;
    player.x += (activeLadder.x - player.x) * Math.min(1, dt * 8);
    if (ladderEntry) {
      const lowerEnd = activeLadder.y + activeLadder.height;
      const upperEnd = activeLadder.y;
      const targetY = Math.abs(player.y - lowerEnd) < Math.abs(player.y - upperEnd)
        ? lowerEnd
        : upperEnd;
      if (Math.abs(player.y - targetY) > 3) {
        player.y += Math.sign(targetY - player.y) * Math.min(10, Math.abs(targetY - player.y));
      }
    }
  }

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
  if (player.climbing) {
    player.vy = climbAxis * 190;
    player.jumpBuffer = 0;
    if (!ladder || (climbAxis === 0 && !keys.has("arrowup") && !keys.has("w") && !keys.has("arrowdown") && !keys.has("s"))) {
      player.vy = 0;
    }
  } else {
    player.vy += world.gravity * dt;
  }
  player.x += player.vx * dt;
  player.y += player.vy * dt;
  wrapPlayerIfNeeded();
  player.y = Math.max(80, Math.min(world.height - 40, player.y));

  const ladderExit = player.climbing ? ladderExitSurfaceAt(activeLadder, player.x, player.y, climbAxis) : null;
  const landing = ladderExit || (player.climbing ? null : landingSurfaceAt(player.x, player.previousY, player.y, wasOnGround, player.surfaceId));
  if (landing) {
    player.y = landing.y;
    player.vy = 0;
    player.onGround = true;
    player.surfaceId = landing.surfaceId;
    player.climbing = false;
  } else {
    player.onGround = false;
    player.surfaceId = "";
    if (player.climbing && !ladderAt(player.x, player.y - player.height * 0.48)) {
      player.climbing = false;
    }
  }
}

function wrapPlayerIfNeeded() {
  const edgePadding = 28;
  player.x = Math.max(edgePadding, Math.min(world.width - edgePadding, player.x));
  if (game.teleportPhase !== "idle") return;
  if (game.wrapTimer > 0) return;

  const teleport = teleportAt(player.x, player.y - player.height * 0.5);
  if (!teleport) {
    return;
  }

  const destination = oppositeTeleport(teleport);
  if (!destination) return;

  game.wrapFromX = player.x;
  game.wrapFromY = player.y - player.height * 0.5;
  const destinationX = destination.side === "left"
    ? destination.x + destination.width / 2 + 34
    : destination.x - destination.width / 2 - 34;
  const destinationY = groundAt(destinationX);
  game.wrapToX = destinationX;
  game.wrapToY = destinationY - player.height * 0.5;
  game.teleportPhase = "zoomOut";
  game.teleportTimer = 0;
  game.teleportDuration = 0.42;
  game.teleportFromX = player.x;
  game.teleportFromY = player.y;
  game.teleportToX = destinationX;
  game.teleportToY = destinationY;
  game.teleportMoved = false;
  player.vy = 0;
  player.vx = 0;
  player.climbing = false;
  game.wrapTimer = 0.36;
}
