// Owns small transient particles used by impacts, defeats, and pickups.
// Effects are stored as shared state and rendered by render.js.
import { particles, camera } from "./state.js";
import { customization } from "./state.js";

export function addBurst(x, y, count) {
  for (let i = 0; i < count; i += 1) {
    particles.push({
      x,
      y,
      vx: Math.cos(i * 1.7) * (45 + i * 8),
      vy: Math.sin(i * 1.7) * (45 + i * 8),
      life: 0.4,
    });
  }
}

export function addShatter(x, y, count) {
  for (let i = 0; i < count; i += 1) {
    const angle = (i / count) * Math.PI * 2;
    const speed = 80 + Math.random() * 120;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.6,
      shatter: true,
    });
  }
}

export function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i -= 1) {
    const particle = particles[i];
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.life -= dt;
    if (particle.leaf) {
      particle.wobblePhase = (particle.wobblePhase || 0) + dt * 3;
      particle.x += Math.sin(particle.wobblePhase) * 20 * dt;
      particle.rotation = (particle.rotation || 0) + particle.rotSpeed * dt;
    }
    if (particle.life <= 0) particles.splice(i, 1);
  }
  if (customization.colorTheme === "forest") updateLeafParticles(dt);
}

let leafSpawnTimer = 0;

function updateLeafParticles(dt) {
  const leafCount = particles.filter((p) => p.leaf).length;
  if (leafCount >= 5) return;
  leafSpawnTimer -= dt;
  if (leafSpawnTimer > 0) return;
  leafSpawnTimer = 3 + Math.random() * 2;

  const viewportWidth = window.innerWidth;
  const spawnX = (camera.x || 0) + Math.random() * (viewportWidth || 800);
  particles.push({
    x: spawnX,
    y: -20,
    vx: 0,
    vy: 50 + Math.random() * 30,
    life: 4 + Math.random() * 2,
    leaf: true,
    rotation: Math.random() * Math.PI * 2,
    rotSpeed: 0.5 + Math.random() * 0.5,
    wobblePhase: Math.random() * Math.PI * 2,
  });
}
