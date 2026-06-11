import { enemies } from "./state.js";
import { worldToScreenX } from "./terrain.js";

export function nearestEnemy(fromX, fromY) {
  let closest = null;
  let closestDistance = Infinity;

  for (const enemy of enemies) {
    if (!enemy.alive) continue;
    const distance = Math.hypot(enemy.x - fromX, enemy.y - fromY);
    if (distance < closestDistance) {
      closest = enemy;
      closestDistance = distance;
    }
  }

  return closest;
}

export function visibleEnemy() {
  for (const enemy of enemies) {
    const screenX = worldToScreenX(enemy.x);
    if (enemy.alive && screenX > -enemy.radius && screenX < window.innerWidth + enemy.radius) {
      return enemy;
    }
  }
  return null;
}
