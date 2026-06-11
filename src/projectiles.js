import { enemies, game, player, powerUps, projectiles, states, world } from "./state.js";
import { nearestEnemy } from "./targeting.js";
import { isDucking } from "./player.js";
import { defeatEnemy } from "./enemies.js";

export function shoot() {
  if (game.state !== states.PLAYING || player.shootCooldown > 0 || player.ammo <= 0) return;

  const ducking = isDucking();
  const shotY = player.y - (ducking ? 28 : 48);
  const velocity = shotVelocity(shotY);
  player.ammo -= 1;
  player.shootCooldown = 0.18;
  projectiles.push({
    x: player.x + player.facing * 24,
    y: shotY,
    vx: velocity.vx,
    vy: velocity.vy,
    life: 1.7,
  });

  if (player.ammo === 0) {
    game.message = "Out of ammo. Collect + drops.";
    game.messageTimer = 2.4;
  }
}

function shotVelocity(shotY) {
  const speed = 760;
  const target = powerUps.specs ? nearestEnemy(player.x, shotY) : null;
  if (!target) return { vx: player.facing * speed, vy: 0 };

  const dx = target.x - player.x;
  const dy = target.y - shotY;
  const distance = Math.max(1, Math.hypot(dx, dy));
  player.facing = dx >= 0 ? 1 : -1;
  return { vx: (dx / distance) * speed, vy: (dy / distance) * speed };
}

export function updateProjectiles(dt) {
  for (let i = projectiles.length - 1; i >= 0; i -= 1) {
    const projectile = projectiles[i];
    updateHomingProjectile(projectile);
    projectile.x += projectile.vx * dt;
    projectile.y += projectile.vy * dt;
    projectile.life -= dt;

    if (projectile.life <= 0 || projectile.x < 0 || projectile.x > world.width) {
      projectiles.splice(i, 1);
      continue;
    }

    for (const enemy of enemies) {
      if (!enemy.alive || Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y) > enemy.radius + 7) continue;
      projectiles.splice(i, 1);
      defeatEnemy(enemy);
      break;
    }
  }
}

export function updateHomingProjectile(projectile) {
  if (!projectile.homing) return;
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
