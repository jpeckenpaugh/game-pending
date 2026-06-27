// Owns generated world geometry: terrain wave, platforms, ladders, caves,
// teleports, walkable surfaces, and world/screen coordinate conversion.
import { camera, customization, enemies, game, player, world } from "./state.js";

export function resizeCanvas(canvas, ctx) {
  const ratio = Math.max(1, window.devicePixelRatio || 1);
  canvas.width = Math.floor(window.innerWidth * ratio);
  canvas.height = Math.floor(window.innerHeight * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  const previousBaseGroundY = world.baseGroundY || Math.max(260, window.innerHeight - 86);
  world.height = Math.max(980, window.innerHeight * 3);
  world.baseGroundY = Math.max(360, world.height * 0.52);
  const groundShift = world.baseGroundY - previousBaseGroundY;
  if (world.terrain.length > 0) buildTerrain();

  if (!player.y) {
    player.y = groundAt(player.x);
  } else if (player.onGround) {
    player.y = groundAt(player.x);
  } else {
    player.y += groundShift;
  }

  for (const enemy of enemies) {
    if (enemy.surfaceId) {
      const surface = surfaceById(enemy.surfaceId);
      if (surface) enemy.y = surface.y - enemy.radius;
    } else {
      enemy.y = groundAt(enemy.x) - enemy.radius;
    }
  }

  centerCameraOnPlayer();
}

function terrainOffsetAt(index) {
  return Math.sin(index * 0.85 + game.level * 0.7) * 28
    + Math.sin(index * 0.31 + game.level * 1.4) * 18;
}

export function buildTerrain() {
  world.terrain.length = 0;
  world.platforms.length = 0;
  world.ladders.length = 0;
  world.caves.length = 0;
  world.teleports.length = 0;
  const pointCount = Math.ceil(world.width / world.terrainStep) + 2;
  const centerX = world.width / 2;
  const safeHalfWidth = 280;

  for (let i = 0; i < pointCount; i += 1) {
    const x = i * world.terrainStep;
    const protectedStart = Math.max(0, 1 - Math.abs(x - centerX) / safeHalfWidth);
    const offset = terrainOffsetAt(i) * (1 - protectedStart);
    world.terrain.push({ x, y: world.baseGroundY + offset });
  }

  buildArenaLayout();
  world.spawnX = centerX;
  world.spawnY = groundAt(world.spawnX);
}

function buildArenaLayout() {
  // The arena grows outward with level progression while preserving a safe
  // center spawn and reachable upper/cave routes.
  const levelGrowth = (game.level - 1) * 90;
  const margin = 110;
  const centerX = world.width / 2;
  const upperY = world.baseGroundY - Math.min(260, window.innerHeight * 0.42) - levelGrowth * 0.08;
  const highY = upperY - Math.min(150, window.innerHeight * 0.22);
  const caveY = world.baseGroundY + Math.min(260, window.innerHeight * 0.42) + levelGrowth * 0.08;
  const caveLowY = caveY + Math.min(120, window.innerHeight * 0.18);
  const sideOffset = Math.min(world.width * 0.28, 760 + levelGrowth);
  const platformGrowth = Math.min(240, game.level * 34);
  const upperWidth = 420 + platformGrowth;
  const caveWidth = 480 + platformGrowth;
  const rng = layoutRandom();

  const upperLeft = addPlatform("upper-left", centerX - sideOffset - upperWidth * 0.72, upperY + jitter(rng, 24), upperWidth);
  const upperCenter = addPlatform("upper-center", centerX - upperWidth / 2, highY + jitter(rng, 18), upperWidth);
  const upperRight = addPlatform("upper-right", centerX + sideOffset - upperWidth * 0.28, upperY + jitter(rng, 24), upperWidth);
  const tierY = highY - Math.min(150, window.innerHeight * 0.2) - levelGrowth * 0.04;
  const tierWidth = Math.max(300, upperWidth - 120);
  const tierLeft = addPlatform("tier-left", upperLeft.x + upperLeft.width * 0.34, tierY + jitter(rng, 16), tierWidth);
  const tierCenter = addPlatform("tier-center", upperCenter.x + upperCenter.width * 0.18, tierY - Math.min(70, levelGrowth * 0.08) + jitter(rng, 16), tierWidth);
  const tierRight = addPlatform("tier-right", upperRight.x + upperRight.width * 0.04, tierY + jitter(rng, 16), tierWidth);
  const caveLeft = addPlatform("cave-left", centerX - sideOffset - caveWidth * 0.64, caveY + jitter(rng, 18), caveWidth);
  const caveCenter = addPlatform("cave-center", centerX - caveWidth / 2, caveLowY + jitter(rng, 16), caveWidth);
  const caveRight = addPlatform("cave-right", centerX + sideOffset - caveWidth * 0.36, caveY + jitter(rng, 18), caveWidth);
  const caveFloorY = Math.min(world.height - 72, caveLowY + 170);
  const caveFloor = addPlatform("cave-floor", 0, caveFloorY, world.width);

  addLadderToTerrain(upperLeft.x + upperLeft.width * 0.55, upperLeft.y);
  addLadderToTerrain(upperRight.x + upperRight.width * 0.45, upperRight.y);
  addLadderToTerrain(upperCenter.x + upperCenter.width * 0.35, upperCenter.y);
  addLadder(upperLeft.x + upperLeft.width * 0.72, upperLeft.y, tierLeft.y);
  addLadder(upperCenter.x + upperCenter.width * 0.58, upperCenter.y, tierCenter.y);
  addLadder(upperRight.x + upperRight.width * 0.28, upperRight.y, tierRight.y);
  addLadderToTerrain(caveLeft.x + caveLeft.width * 0.55, caveLeft.y);
  addLadderToTerrain(caveRight.x + caveRight.width * 0.45, caveRight.y);
  addLadderToTerrain(caveCenter.x + caveCenter.width * 0.72, caveCenter.y);
  addLadderToTerrain(centerX - sideOffset * 0.72, caveFloor.y);
  addLadderToTerrain(centerX, caveFloor.y);
  addLadderToTerrain(centerX + sideOffset * 0.72, caveFloor.y);

  addExpansionPlatforms(centerX, sideOffset, upperY, caveY, upperWidth, caveWidth, rng);

  world.caves.push(
    { x: centerX - sideOffset - 300, y: caveLeft.y - 78, width: 520, height: 148 },
    { x: centerX - 260, y: caveCenter.y - 82, width: 520, height: 154 },
    { x: centerX + sideOffset - 240, y: caveRight.y - 78, width: 520, height: 148 }
  );

  world.teleports.push(
    makeTeleport("left", margin),
    makeTeleport("right", world.width - margin)
  );
}

function addExpansionPlatforms(centerX, sideOffset, upperY, caveY, upperWidth, caveWidth, rng) {
  const clusterCount = Math.min(4, Math.floor(game.level / 2));
  for (let i = 1; i <= clusterCount; i += 1) {
    const distance = sideOffset + i * (upperWidth * 0.45 + 130);
    for (const direction of [-1, 1]) {
      const x = centerX + direction * distance - upperWidth / 2;
      if (x < 120 || x + upperWidth > world.width - 120) continue;

      const platform = addPlatform(`upper-extra-${direction}-${i}`, x, upperY - i * 42 + jitter(rng, 18), upperWidth * 0.86);
      const high = addPlatform(`tier-extra-${direction}-${i}`, x + upperWidth * 0.18, platform.y - 130 + jitter(rng, 14), upperWidth * 0.62);
      const cave = addPlatform(`cave-extra-${direction}-${i}`, x + upperWidth * 0.08, caveY + i * 34 + jitter(rng, 18), caveWidth * 0.82);
      addLadderToTerrain(platform.x + platform.width * 0.5, platform.y);
      addLadder(platform.x + platform.width * 0.68, platform.y, high.y);
      addLadderToTerrain(cave.x + cave.width * 0.5, cave.y);
    }
  }
}

function layoutRandom() {
  if (customization.worldGeneration === "random") return Math.random;
  const loadout = [
    customization.startingBootsLevel,
    customization.startingSpecs,
    customization.startingRadar,
    customization.startingShieldLevel,
    customization.startingDroneLevel,
  ].join("|");
  let seed = hashString(`${customization.name}|${customization.tagline}|${game.level}|${loadout}`);
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

function hashString(value) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function jitter(rng, amount) {
  return (rng() - 0.5) * amount * 2;
}

function addPlatform(id, x, y, width) {
  const clampedX = Math.max(0, Math.min(world.width - width, x));
  const platform = { id, x: clampedX, y, width };
  world.platforms.push(platform);
  return platform;
}

function addLadder(x, y1, y2) {
  const top = Math.min(y1, y2);
  const bottom = Math.max(y1, y2);
  world.ladders.push({ x, y: top, width: 42, height: bottom - top });
}

function addLadderToTerrain(x, otherY) {
  addLadder(x, groundAt(x), otherY);
}

function makeTeleport(side, x) {
  const groundY = groundAt(x);
  const height = 128;
  return { side, x, y: groundY - height, width: 54, height };
}

export function groundAt(x) {
  if (world.terrain.length === 0) return world.baseGroundY;
  const clampedX = Math.max(0, Math.min(world.width, x));
  const index = Math.min(
    world.terrain.length - 2,
    Math.max(0, Math.floor(clampedX / world.terrainStep))
  );
  const left = world.terrain[index];
  const right = world.terrain[index + 1];
  const t = (clampedX - left.x) / (right.x - left.x);
  return left.y + (right.y - left.y) * t;
}

export function surfaceById(id) {
  return walkableSurfaces().find((surface) => surface.id === id);
}

export function walkableSurfaces() {
  return [
    { id: "ground", x: 0, y: null, width: world.width, terrain: true },
    ...world.platforms,
  ];
}

export function surfaceYAt(surface, x) {
  return surface.terrain ? groundAt(x) : surface.y;
}

export function landingSurfaceAt(x, previousY, currentY, wasOnGround = false, currentSurfaceId = "") {
  let best = null;
  const groundY = groundAt(x);
  if ((previousY <= groundY && currentY >= groundY) || (wasOnGround && currentSurfaceId === "ground" && Math.abs(currentY - groundY) <= 28)) {
    best = { y: groundY, surfaceId: "ground" };
  }

  // Platforms are one-way: landing only counts when crossing down onto them or
  // when already grounded on that exact surface.
  for (const platform of world.platforms) {
    if (x < platform.x - 10 || x > platform.x + platform.width + 10) continue;
    if ((previousY <= platform.y && currentY >= platform.y) || (wasOnGround && currentSurfaceId === platform.id && Math.abs(currentY - platform.y) <= 28)) {
      if (!best || platform.y < best.y) best = { y: platform.y, surfaceId: platform.id };
    }
  }

  return best;
}

export function ladderExitSurfaceAt(ladder, x, y, climbAxis) {
  if (!ladder || climbAxis === 0) return null;
  const targetY = climbAxis < 0 ? ladder.y : ladder.y + ladder.height;
  if (Math.abs(y - targetY) > 32) return null;

  return walkableSurfaces()
    .filter((surface) => (
      x >= surface.x - 18
      && x <= surface.x + surface.width + 18
      && Math.abs(surfaceYAt(surface, x) - targetY) <= 36
    ))
    .map((surface) => ({ y: surfaceYAt(surface, x), surfaceId: surface.id }))
    .sort((a, b) => Math.abs(a.y - targetY) - Math.abs(b.y - targetY))[0] || null;
}

export function ladderAt(x, y) {
  return world.ladders.find((ladder) => (
    x >= ladder.x - ladder.width / 2 - 6
    && x <= ladder.x + ladder.width / 2 + 6
    && y >= ladder.y - player.height * 0.55
    && y <= ladder.y + ladder.height + player.height * 0.25
  ));
}

export function ladderEntryAt(x, y) {
  return world.ladders.find((ladder) => (
    x >= ladder.x - ladder.width / 2 - 8
    && x <= ladder.x + ladder.width / 2 + 8
    && (Math.abs(y - ladder.y) <= 38 || Math.abs(y - (ladder.y + ladder.height)) <= 38)
  ));
}

export function teleportAt(x, y) {
  return world.teleports.find((teleport) => (
    x >= teleport.x - teleport.width / 2
    && x <= teleport.x + teleport.width / 2
    && y >= teleport.y
    && y <= teleport.y + teleport.height
  ));
}

export function oppositeTeleport(teleport) {
  return world.teleports.find((item) => item.side !== teleport.side);
}

export function nearTeleportBuffer(x, y, buffer = 180) {
  return world.teleports.some((teleport) => {
    const dx = x - teleport.x;
    const dy = y - (teleport.y + teleport.height / 2);
    return Math.hypot(dx, dy) < buffer;
  });
}

export function centerCameraOnPlayer() {
  const viewportWidth = window.innerWidth / camera.zoom;
  const viewportHeight = window.innerHeight / camera.zoom;
  camera.x = clamp(player.x - viewportWidth / 2, 0, Math.max(0, world.width - viewportWidth));
  camera.y = clamp(player.y - viewportHeight * 0.55, 0, Math.max(0, world.height - viewportHeight));
}

export function worldContentBounds() {
  let top = Infinity;
  let bottom = -Infinity;

  for (const point of world.terrain) {
    top = Math.min(top, point.y);
    bottom = Math.max(bottom, point.y);
  }

  for (const platform of world.platforms) {
    top = Math.min(top, platform.y);
    bottom = Math.max(bottom, platform.y);
  }

  for (const ladder of world.ladders) {
    top = Math.min(top, ladder.y);
    bottom = Math.max(bottom, ladder.y + ladder.height);
  }

  for (const teleport of world.teleports) {
    top = Math.min(top, teleport.y);
    bottom = Math.max(bottom, teleport.y + teleport.height);
  }

  if (!Number.isFinite(top) || !Number.isFinite(bottom)) {
    top = 0;
    bottom = world.height;
  }

  const padding = 96;
  return {
    top: Math.max(0, top - padding),
    bottom: Math.min(world.height, bottom + padding),
  };
}

export function worldToScreenY(y) {
  return (y - camera.y) * camera.zoom;
}

export function worldToScreenX(x) {
  return (x - camera.x) * camera.zoom;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
