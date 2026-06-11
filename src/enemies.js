import { drops, enemies, game } from "./state.js";
import { addBurst } from "./effects.js";
import { groundAt } from "./terrain.js";

export function spawnEnemies() {
  for (let i = 0; i < game.enemiesRemaining; i += 1) {
    const x = 420 + i * 145 + (i % 3) * 24;
    const type = enemyTypeForIndex(i);
    const radius = type === "runner" ? 18 : 24;
    enemies.push({
      type,
      x,
      y: groundAt(x) - radius,
      radius,
      baseX: x,
      phase: i * 0.9,
      alive: true,
    });
  }
}

function enemyTypeForIndex(index) {
  if (index > 0 && index % 7 === 0) return "hopper";
  if (index > 0 && index % 4 === 0) return "runner";
  return "walker";
}

export function updateEnemyPositions(dt) {
  for (const enemy of enemies) {
    if (!enemy.alive) continue;
    if (enemy.type === "runner") {
      enemy.phase += dt * 4.2;
      enemy.x = enemy.baseX + Math.sin(enemy.phase) * 46;
      enemy.y = groundAt(enemy.x) - enemy.radius;
      continue;
    }

    if (enemy.type === "hopper") {
      enemy.phase += dt * 3;
      enemy.x = enemy.baseX + Math.sin(enemy.phase * 0.7) * 24;
      enemy.y = groundAt(enemy.x) - enemy.radius - Math.max(0, Math.sin(enemy.phase)) * 36;
      continue;
    }

    enemy.phase += dt * 2.2;
    enemy.x = enemy.baseX + Math.sin(enemy.phase) * 28;
    enemy.y = groundAt(enemy.x) - enemy.radius;
  }
}

export function defeatEnemy(enemy) {
  if (!enemy.alive) return;
  enemy.alive = false;
  game.enemiesRemaining -= 1;
  drops.push({ x: enemy.x, y: enemy.y, amount: 2, bob: 0 });
  addBurst(enemy.x, enemy.y, 8);
}
