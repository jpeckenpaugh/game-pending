import { drops, enemies, game } from "./state.js";
import { addBurst } from "./effects.js";
import { groundAt } from "./terrain.js";

export function spawnEnemies() {
  for (let i = 0; i < game.enemiesRemaining; i += 1) {
    const x = 420 + i * 145 + (i % 3) * 24;
    const family = enemyFamilyForIndex(i);
    const movement = enemyMovementForIndex(i);
    const radius = movement === "runner" ? 18 : 24;
    enemies.push({
      family,
      movement,
      facing: 1,
      x,
      y: groundAt(x) - radius,
      radius,
      baseX: x,
      phase: i * 0.9,
      alive: true,
    });
  }
}

function enemyFamilyForIndex(index) {
  if (index > 0 && index % 6 === 0) return "square";
  if (index > 0 && index % 5 === 0) return "triangle";
  return "circle";
}

function enemyMovementForIndex(index) {
  if (index > 0 && index % 7 === 0) return "hopper";
  if (index > 0 && index % 4 === 0) return "runner";
  return "walker";
}

export function updateEnemyPositions(dt) {
  for (const enemy of enemies) {
    if (!enemy.alive) continue;
    const previousX = enemy.x;
    if (enemy.movement === "runner") {
      enemy.phase += dt * 4.2;
      enemy.x = enemy.baseX + Math.sin(enemy.phase) * 46;
      enemy.y = groundAt(enemy.x) - enemy.radius;
      updateFacing(enemy, previousX);
      continue;
    }

    if (enemy.movement === "hopper") {
      enemy.phase += dt * 3;
      enemy.x = enemy.baseX + Math.sin(enemy.phase * 0.7) * 24;
      enemy.y = groundAt(enemy.x) - enemy.radius - Math.max(0, Math.sin(enemy.phase)) * 36;
      updateFacing(enemy, previousX);
      continue;
    }

    enemy.phase += dt * 2.2;
    enemy.x = enemy.baseX + Math.sin(enemy.phase) * 28;
    enemy.y = groundAt(enemy.x) - enemy.radius;
    updateFacing(enemy, previousX);
  }
}

function updateFacing(enemy, previousX) {
  const dx = enemy.x - previousX;
  if (Math.abs(dx) > 0.01) enemy.facing = dx > 0 ? 1 : -1;
}

export function defeatEnemy(enemy) {
  if (!enemy.alive) return;
  enemy.alive = false;
  game.enemiesRemaining -= 1;
  drops.push({ x: enemy.x, y: enemy.y, amount: 2, bob: 0 });
  addBurst(enemy.x, enemy.y, 8);
}
