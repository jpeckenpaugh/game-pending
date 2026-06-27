// Owns player-fired projectiles, weapon aiming, projectile lifetime, and shot
// collision with enemies. Drone missiles share the homing update path here.
import { customization, enemies, game, keys, player, powerUps, projectiles, setPlayerFaceMood, states, touches, world } from "./state.js";
import { nearestEnemy } from "./targeting.js";
import { isDucking, markMirrorShot } from "./player.js";
import { defeatEnemy } from "./enemies.js";
import { landingSurfaceAt } from "./terrain.js";
import { playShoot } from "./audio.js";

export function shoot() {
  if (game.state !== states.PLAYING || player.shootCooldown > 0) return;
  const weaponType = customization.weaponType;
  const ammoCost = weaponAmmoCost(weaponType);
  if (player.ammo < ammoCost) return;

  const ducking = isDucking();
  const shotY = player.y - (ducking ? 28 : 48);
  const velocity = shotVelocity(shotY, weaponType);
  player.ammo -= ammoCost;
  player.shootCooldown = weaponCooldown(weaponType);
  setPlayerFaceMood("angry", 0.55, 2);
  projectiles.push({
    x: player.x + player.facing * 24,
    y: shotY,
    vx: velocity.vx,
    vy: velocity.vy,
    weaponType,
    gravity: weaponType === "club" ? world.gravity * 0.18 : 0,
    rotation: 0,
    hitEnemies: weaponType === "club" ? new Set() : null,
    life: projectileLife(weaponType),
    radius: projectileRadius(weaponType),
  });

  if (player.ammo === 0) {
    game.message = "Out of ammo. Collect + drops.";
    game.messageTimer = 2.4;
  }
  playShoot();
  markMirrorShot();
}

function shotVelocity(shotY, weaponType) {
  const speed = weaponType === "gun" ? 3040 : weaponType === "question" ? 600 : 760;
  if (weaponType === "club") return clubVelocity();

  const direction = weaponAimDirection();
  if (direction) return velocityFromDirection(direction, speed);
  if (groundedDownAimSuppressed()) return { vx: player.facing * speed, vy: 0 };

  const target = powerUps.specs ? nearestEnemy(player.x, shotY) : null;
  if (!target) return { vx: player.facing * speed, vy: 0 };

  const dx = target.x - player.x;
  const dy = target.y - shotY;
  const distance = Math.max(1, Math.hypot(dx, dy));
  player.facing = dx >= 0 ? 1 : -1;
  return { vx: (dx / distance) * speed, vy: (dy / distance) * speed };
}

function clubVelocity() {
  const direction = weaponAimDirection();
  if (!direction) return { vx: player.facing * 700, vy: -90 };

  return velocityFromDirection(direction, 700);
}

function velocityFromDirection(direction, speed) {
  const distance = Math.max(1, Math.hypot(direction.x, direction.y));
  if (direction.x !== 0) player.facing = direction.x > 0 ? 1 : -1;
  return { vx: (direction.x / distance) * speed, vy: (direction.y / distance) * speed };
}

function weaponAimDirection() {
  // Manual aim has priority over Specs auto-aim. This keeps Up/Down meaningful
  // for all weapons now that jump is on X.
  const x = weaponAimHorizontalAxis();
  const y = weaponAimVerticalAxis();
  if (x === 0 && y === 0) return null;
  return { x, y };
}

function weaponAimHorizontalAxis() {
  let axis = 0;
  if (keys.has("arrowleft") || keys.has("a")) axis -= 1;
  if (keys.has("arrowright") || keys.has("d")) axis += 1;

  for (const zone of touches.values()) {
    if (zone === "left") axis -= 1;
    if (zone === "right") axis += 1;
  }

  return Math.max(-1, Math.min(1, axis));
}

function weaponAimVerticalAxis() {
  let axis = 0;
  if (keys.has("arrowup") || keys.has("w")) axis -= 1;
  if (keys.has("arrowdown") || keys.has("s")) axis += 1;

  for (const zone of touches.values()) {
    if (zone === "jump") axis -= 1;
    if (zone === "duck") axis += 1;
  }

  if (axis > 0 && isDucking()) return 0;
  return Math.max(-1, Math.min(1, axis));
}

function groundedDownAimSuppressed() {
  if (!isDucking()) return false;
  if (keys.has("arrowdown") || keys.has("s")) return true;
  for (const zone of touches.values()) {
    if (zone === "duck") return true;
  }
  return false;
}

function projectileLife(weaponType) {
  if (weaponType === "gun") return null;
  if (weaponType === "question") return 1.2;
  return weaponType === "club" ? 3 : 1.7;
}

function projectileRadius(weaponType) {
  if (weaponType === "club") return 15;
  if (weaponType === "gun") return 4;
  if (weaponType === "question") return 10;
  return 7;
}

function weaponAmmoCost(weaponType) {
  if (weaponType === "question") return 2;
  return 1;
}

function weaponCooldown(weaponType) {
  if (weaponType === "question") return 0.6;
  return 0.18;
}

export function updateProjectiles(dt) {
  for (let i = projectiles.length - 1; i >= 0; i -= 1) {
    const projectile = projectiles[i];
    projectile.weaponType ||= "wand";
    projectile.radius ??= 7;
    projectile.rotation ??= 0;

    updateHomingProjectile(projectile);
    projectile.previousX = projectile.x;
    projectile.previousY = projectile.y;
    projectile.vy += (projectile.gravity || 0) * dt;
    projectile.x += projectile.vx * dt;
    projectile.y += projectile.vy * dt;
    if (projectile.weaponType === "club") {
      projectile.rotation += Math.sign(projectile.vx || player.facing) * dt * 12;
    }
    if (projectile.life != null) projectile.life -= dt;

    if (isExpired(projectile)) {
      projectiles.splice(i, 1);
      continue;
    }

    for (let enemyIndex = 0; enemyIndex < enemies.length; enemyIndex += 1) {
      const enemy = enemies[enemyIndex];
      if (projectile.hitEnemies?.has(enemyIndex)) continue;
      if (!enemy.alive || projectileDistanceToEnemy(projectile, enemy) > enemy.radius + projectile.radius) continue;
      if (blocksProjectile(enemy, projectile)) {
        game.message = "Blocked!";
        game.messageTimer = 0.8;
        if (projectile.weaponType !== "club") projectiles.splice(i, 1);
        break;
      }
      if (projectile.weaponType === "question") {
        enemy.philosophizing = 0.8;
        enemy.enraged = 0;
        enemy.flashTimer = 0.3;
        projectiles.splice(i, 1);
        break;
      }
      defeatEnemy(enemy);
      if (projectile.weaponType === "club") {
        projectile.hitEnemies.add(enemyIndex);
        continue;
      }
      projectiles.splice(i, 1);
      break;
    }
  }
}

function projectileDistanceToEnemy(projectile, enemy) {
  const x1 = projectile.previousX ?? projectile.x;
  const y1 = projectile.previousY ?? projectile.y;
  const x2 = projectile.x;
  const y2 = projectile.y;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared === 0) return Math.hypot(enemy.x - x2, enemy.y - y2);

  const t = Math.max(0, Math.min(1, ((enemy.x - x1) * dx + (enemy.y - y1) * dy) / lengthSquared));
  const closestX = x1 + dx * t;
  const closestY = y1 + dy * t;
  return Math.hypot(enemy.x - closestX, enemy.y - closestY);
}

function isExpired(projectile) {
  if (projectile.life != null && projectile.life <= 0) return true;
  if (projectile.x < -80 || projectile.x > world.width + 80) return true;
  if (projectile.weaponType === "club" && landingSurfaceAt(projectile.x, projectile.previousY ?? projectile.y, projectile.y)) return true;
  return projectile.y > world.height + 220;
}

function blocksProjectile(enemy, projectile) {
  if (enemy.family !== "square") return false;
  const projectileIsOnShieldSide = (projectile.x - enemy.x) * enemy.facing > 0;
  const projectileTravelsIntoShield = projectile.vx * enemy.facing < 0;
  return projectileIsOnShieldSide && projectileTravelsIntoShield;
}

export function updateHomingProjectile(projectile) {
  if (!projectile.homing) return;
  // Homing shots retarget when their current target dies, which lets Drone
  // salvos chain through multiple enemies.
  if (!projectile.target || !projectile.target.alive) {
    projectile.target = nearestEnemy(projectile.x, projectile.y);
  }

  if (!projectile.target) {
    projectile.vx *= 0.98;
    projectile.vy *= 0.98;
    return;
  }

  const dx = projectile.target.x - projectile.x;
  const dy = projectile.target.y - projectile.y;
  const distance = Math.max(1, Math.hypot(dx, dy));
  const speed = projectile.speed || 620;
  projectile.vx = (dx / distance) * speed;
  projectile.vy = (dy / distance) * speed;
}
