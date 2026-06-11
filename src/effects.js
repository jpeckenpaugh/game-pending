import { particles } from "./state.js";

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

export function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i -= 1) {
    const particle = particles[i];
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.life -= dt;
    if (particle.life <= 0) particles.splice(i, 1);
  }
}
