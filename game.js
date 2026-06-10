(function () {
  "use strict";

  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  const world = {
    width: 2800,
    baseGroundY: 0,
    gravity: 1850,
    friction: 0.82,
    terrainStep: 160,
    terrain: [],
  };

  const player = {
    x: 80,
    y: 0,
    previousY: 0,
    vx: 0,
    vy: 0,
    width: 26,
    height: 74,
    speed: 780,
    jumpPower: 720,
    ammo: 10,
    facing: 1,
    onGround: true,
    coyoteTimer: 0,
    jumpBuffer: 0,
    shootCooldown: 0,
    invulnerableFor: 0,
  };

  const camera = { x: 0 };
  const keys = new Set();
  const touches = new Map();
  const projectiles = [];
  const enemies = [];
  const drops = [];
  const particles = [];
  const drone = {
    active: false,
    phase: "idle",
    direction: 1,
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
  };
  const powerUps = {
    boots: 0,
    vestLevel: 0,
    vestCharges: 0,
    vestRecharge: 0,
    specs: 0,
    droneLevel: 0,
    droneCharges: 0,
    droneRecharge: 0,
  };
  const powerUpPool = ["boots", "vest", "specs", "drone"];

  const states = {
    TITLE: "title",
    PLAYING: "playing",
    LEVEL_COMPLETE: "levelComplete",
    GAME_OVER: "gameOver",
    LEVEL_COLLECTING: "levelCollecting",
  };

  let level = 1;
  let enemiesRemaining = 0;
  let message = "Arrows/WASD move, Space shoots, Up/W jumps";
  let messageTimer = 4;
  let gameState = states.TITLE;
  let completedLevel = 0;
  let levelClearTimer = 0;
  let lastPowerUp = "";
  let lastTime = performance.now();
  let jumpRequested = false;

  function resize() {
    const ratio = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = Math.floor(window.innerWidth * ratio);
    canvas.height = Math.floor(window.innerHeight * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    world.baseGroundY = Math.max(260, window.innerHeight - 86);
    if (!player.y) {
      player.y = groundAt(player.x);
    } else if (player.onGround) {
      player.y = groundAt(player.x);
    }

    for (const enemy of enemies) {
      enemy.y = groundAt(enemy.x) - enemy.radius;
    }
  }

  function terrainOffsetAt(index) {
    return Math.sin(index * 0.85 + level * 0.7) * 28
      + Math.sin(index * 0.31 + level * 1.4) * 18;
  }

  function buildTerrain() {
    world.terrain.length = 0;
    const pointCount = Math.ceil(world.width / world.terrainStep) + 2;

    for (let i = 0; i < pointCount; i += 1) {
      const x = i * world.terrainStep;
      const protectedStart = Math.max(0, 1 - x / 420);
      const offset = terrainOffsetAt(i) * (1 - protectedStart);
      world.terrain.push({
        x,
        y: world.baseGroundY + offset,
      });
    }
  }

  function groundAt(x) {
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

  function startLevel(nextLevel) {
    level = nextLevel;
    enemies.length = 0;
    projectiles.length = 0;
    drops.length = 0;
    particles.length = 0;
    drone.active = false;
    enemiesRemaining = 10 + (level - 1) * 4;
    world.width = Math.max(2200, 1500 + enemiesRemaining * 135);
    buildTerrain();
    player.x = 80;
    player.y = groundAt(player.x);
    player.previousY = player.y;
    player.vx = 0;
    player.vy = 0;
    player.onGround = true;
    player.coyoteTimer = 0;
    player.jumpBuffer = 0;
    player.invulnerableFor = 1.2;
    player.ammo = Math.max(player.ammo, 10);
    camera.x = 0;

    for (let i = 0; i < enemiesRemaining; i += 1) {
      const x = 420 + i * 145 + (i % 3) * 24;
      enemies.push({
        x,
        y: groundAt(x) - 24,
        radius: 24,
        baseX: x,
        phase: i * 0.9,
        alive: true,
      });
    }

    message = `Level ${level}`;
    messageTimer = 2;
  }

  function shoot() {
    if (gameState !== states.PLAYING || player.shootCooldown > 0 || player.ammo <= 0) {
      return;
    }

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
      message = "Out of ammo. Collect + drops.";
      messageTimer = 2.4;
    }
  }

  function beginNewGame() {
    resetPowerUps();
    player.ammo = 10;
    startLevel(1);
    gameState = states.PLAYING;
  }

  function continueToNextLevel() {
    player.ammo += 4;
    startLevel(completedLevel + 1);
    gameState = states.PLAYING;
  }

  function showLevelComplete() {
    grantRandomPowerUp();
    rechargePowerUpsOnLevelComplete();
    gameState = states.LEVEL_COMPLETE;
    message = "";
    messageTimer = 0;
  }

  function rechargePowerUpsOnLevelComplete() {
    if (powerUps.vestLevel > 0) {
      powerUps.vestCharges = powerUps.vestLevel;
      powerUps.vestRecharge = 0;
    }

    if (powerUps.droneLevel > 0) {
      powerUps.droneCharges = powerUps.droneLevel;
      powerUps.droneRecharge = 0;
    }
  }

  function startLevelClearCollection() {
    completedLevel = level;
    gameState = states.LEVEL_COLLECTING;
    levelClearTimer = drops.length > 0 ? 1.2 : 0.45;
    projectiles.length = 0;
    particles.length = 0;
    player.vx = 0;
    message = "";
    messageTimer = 0;

    if (drops.length === 0) {
      return;
    }

    for (const drop of drops) {
      drop.collecting = true;
      drop.vx = 0;
      drop.vy = 0;
    }
  }

  function showGameOver() {
    gameState = states.GAME_OVER;
    message = "";
    messageTimer = 0;
  }

  function resetPowerUps() {
    powerUps.boots = 0;
    powerUps.vestLevel = 0;
    powerUps.vestCharges = 0;
    powerUps.vestRecharge = 0;
    powerUps.specs = 0;
    powerUps.droneLevel = 0;
    powerUps.droneCharges = 0;
    powerUps.droneRecharge = 0;
    drone.active = false;
    lastPowerUp = "";
  }

  function grantRandomPowerUp() {
    const type = powerUpPool[Math.floor(Math.random() * powerUpPool.length)];

    if (type === "boots") {
      powerUps.boots = 1;
      lastPowerUp = "Boots";
      return lastPowerUp;
    }

    if (type === "vest") {
      powerUps.vestLevel += 1;
      powerUps.vestCharges = Math.min(powerUps.vestLevel, powerUps.vestCharges + 1);
      powerUps.vestRecharge = powerUps.vestCharges < powerUps.vestLevel ? powerUps.vestRecharge : 0;
      lastPowerUp = `Vest Lv ${powerUps.vestLevel}`;
      return lastPowerUp;
    }

    if (type === "drone") {
      powerUps.droneLevel += 1;
      powerUps.droneCharges = Math.min(powerUps.droneLevel, powerUps.droneCharges + 1);
      powerUps.droneRecharge = powerUps.droneCharges < powerUps.droneLevel ? powerUps.droneRecharge : 0;
      lastPowerUp = `Drone Lv ${powerUps.droneLevel}`;
      return lastPowerUp;
    }

    powerUps.specs = 1;
    lastPowerUp = "Specs";
    return lastPowerUp;
  }

  function grantPowerUpWithFeedback() {
    if (gameState !== states.PLAYING) return;
    const granted = grantRandomPowerUp();
    message = `Granted: ${granted}`;
    messageTimer = 2;
  }

  function nearestEnemy(fromX, fromY) {
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

  function visibleEnemy() {
    for (const enemy of enemies) {
      const screenX = worldToScreenX(enemy.x);
      if (enemy.alive && screenX > -enemy.radius && screenX < window.innerWidth + enemy.radius) {
        return enemy;
      }
    }
    return null;
  }

  function shotVelocity(shotY) {
    const speed = 760;
    const target = powerUps.specs ? nearestEnemy(player.x, shotY) : null;

    if (!target) {
      return { vx: player.facing * speed, vy: 0 };
    }

    const dx = target.x - player.x;
    const dy = target.y - shotY;
    const distance = Math.max(1, Math.hypot(dx, dy));
    player.facing = dx >= 0 ? 1 : -1;

    return {
      vx: (dx / distance) * speed,
      vy: (dy / distance) * speed,
    };
  }

  function startDroneRun() {
    if (drone.active || powerUps.droneCharges <= 0 || !visibleEnemy()) return;

    powerUps.droneCharges -= 1;
    powerUps.droneRecharge = 0;
    drone.active = true;
    drone.phase = "entering";
    drone.direction = Math.random() < 0.5 ? 1 : -1;
    drone.x = drone.direction === 1
      ? camera.x - 48
      : camera.x + window.innerWidth + 48;
    drone.y = 46;
    drone.targetX = camera.x + window.innerWidth * 0.5;
    drone.targetY = 92;
  }

  function updateDroneRecharge(dt) {
    if (powerUps.droneLevel === 0 || powerUps.droneCharges >= powerUps.droneLevel) {
      powerUps.droneRecharge = 0;
      return;
    }

    powerUps.droneRecharge += dt;
    if (powerUps.droneRecharge >= 10) {
      powerUps.droneCharges += 1;
      powerUps.droneRecharge = powerUps.droneCharges < powerUps.droneLevel ? 0 : 0;
      message = "Drone charged";
      messageTimer = 1.4;
    }
  }

  function updateDrone(dt) {
    if (powerUps.droneLevel === 0) return;

    updateDroneRecharge(dt);
    startDroneRun();

    if (!drone.active) return;

    const dx = drone.targetX - drone.x;
    const dy = drone.targetY - drone.y;
    const distance = Math.hypot(dx, dy);
    const speed = 520;

    if (distance <= 12) {
      if (drone.phase === "entering") {
        fireDroneShot();
        drone.phase = "exiting";
        drone.targetX = drone.direction === 1
          ? camera.x + window.innerWidth + 58
          : camera.x - 58;
        drone.targetY = 54;
        return;
      }

      drone.active = false;
      drone.phase = "idle";
      return;
    }

    drone.x += (dx / Math.max(1, distance)) * speed * dt;
    drone.y += (dy / Math.max(1, distance)) * speed * dt;
  }

  function fireDroneShot() {
    const target = nearestEnemy(drone.x, drone.y);
    if (!target) return;

    projectiles.push({
      x: drone.x,
      y: drone.y,
      vx: 0,
      vy: 0,
      speed: 620,
      life: 4,
      homing: true,
      target,
    });
    message = "Drone strike";
    messageTimer = 1.1;
  }

  function updateHomingProjectile(projectile) {
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

  function activateCurrentScreen() {
    if (gameState === states.TITLE || gameState === states.GAME_OVER) {
      beginNewGame();
      return true;
    }

    if (gameState === states.LEVEL_COMPLETE) {
      continueToNextLevel();
      return true;
    }

    return false;
  }

  function handleMenuAction(x, y) {
    if (gameState === states.PLAYING) return false;

    const buttonWidth = Math.min(260, window.innerWidth - 48);
    const buttonX = (window.innerWidth - buttonWidth) / 2;
    let buttonY = Math.max(220, window.innerHeight * 0.46);

    if (gameState === states.LEVEL_COMPLETE) {
      buttonY = Math.max(260, window.innerHeight * 0.56);
    } else if (gameState === states.GAME_OVER) {
      buttonY = Math.max(250, window.innerHeight * 0.54);
    }

    const insideButton = x >= buttonX && x <= buttonX + buttonWidth
      && y >= buttonY && y <= buttonY + 48;
    if (!insideButton) return false;

    return activateCurrentScreen();
  }

  function circleHit(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y) <= b.radius + 7;
  }

  function defeatEnemy(enemy) {
    if (!enemy.alive) return;
    enemy.alive = false;
    enemiesRemaining -= 1;
    drops.push({ x: enemy.x, y: enemy.y, amount: 2, bob: 0 });
    addBurst(enemy.x, enemy.y, 8);
  }

  function playerDistanceTo(point) {
    const px = player.x;
    const py = player.y - player.height * (isDucking() ? 0.25 : 0.45);
    return Math.hypot(px - point.x, py - point.y);
  }

  function addBurst(x, y, count) {
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

  function inputAxis() {
    let axis = 0;
    if (keys.has("arrowleft") || keys.has("a")) axis -= 1;
    if (keys.has("arrowright") || keys.has("d")) axis += 1;

    for (const zone of touches.values()) {
      if (zone === "left") axis -= 1;
      if (zone === "right") axis += 1;
    }

    return Math.max(-1, Math.min(1, axis));
  }

  function isDucking() {
    if (gameState !== states.PLAYING) return false;
    if (!player.onGround) return false;
    if (keys.has("arrowdown") || keys.has("s")) return true;
    for (const zone of touches.values()) {
      if (zone === "duck") return true;
    }
    return false;
  }

  function jump() {
    player.vy = -jumpImpulse();
    player.onGround = false;
    player.coyoteTimer = 0;
    player.jumpBuffer = 0;
  }

  function jumpImpulse() {
    return player.jumpPower * (powerUps.boots ? Math.SQRT2 : 1);
  }

  function canStomp(enemy) {
    if (!powerUps.boots || player.vy <= 160) return false;
    const enemyTop = enemy.y - enemy.radius;
    const previousFeet = player.previousY;
    const currentFeet = player.y;
    const crossedHead = previousFeet <= enemyTop + 4 && currentFeet >= enemyTop - 2;
    const nearEnemyHead = currentFeet <= enemy.y - enemy.radius * 0.2;
    const horizontallyCentered = Math.abs(player.x - enemy.x) <= enemy.radius * 0.72;
    return crossedHead && nearEnemyHead && horizontallyCentered;
  }

  function updateVestRecharge(dt) {
    if (powerUps.vestLevel === 0 || powerUps.vestCharges >= powerUps.vestLevel) {
      powerUps.vestRecharge = 0;
      return;
    }

    powerUps.vestRecharge += dt;
    if (powerUps.vestRecharge >= 10) {
      powerUps.vestCharges += 1;
      powerUps.vestRecharge = powerUps.vestCharges < powerUps.vestLevel ? 0 : 0;
      message = "Vest recharged";
      messageTimer = 1.4;
    }
  }

  function absorbOrTakeHit() {
    if (powerUps.vestCharges > 0) {
      powerUps.vestCharges -= 1;
      powerUps.vestRecharge = 0;
      player.invulnerableFor = 1.3;
      player.vx = -player.facing * 260;
      message = "Vest blocked hit";
      messageTimer = 1.6;
      return;
    }

    player.ammo = Math.max(0, player.ammo - 2);
    player.invulnerableFor = 1.3;
    player.vx = -player.facing * 260;
    message = "Hit! Ammo lost.";
    messageTimer = 1.6;
    if (player.ammo === 0 && projectiles.length === 0) {
      showGameOver();
    }
  }

  function update(dt) {
    if (messageTimer > 0) {
      messageTimer -= dt;
    }

    if (gameState === states.LEVEL_COLLECTING) {
      updateLevelClearCollection(dt);
      return;
    }

    if (gameState !== states.PLAYING) {
      return;
    }

    player.shootCooldown = Math.max(0, player.shootCooldown - dt);
    player.invulnerableFor = Math.max(0, player.invulnerableFor - dt);
    updateVestRecharge(dt);
    updateDrone(dt);

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

    if (jumpRequested) {
      player.jumpBuffer = 0.12;
      jumpRequested = false;
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
        if (!enemy.alive || !circleHit(projectile, enemy)) continue;
        projectiles.splice(i, 1);
        defeatEnemy(enemy);
        break;
      }
    }

    for (const enemy of enemies) {
      if (!enemy.alive) continue;
      enemy.phase += dt * 2.2;
      enemy.x = enemy.baseX + Math.sin(enemy.phase) * 28;
      enemy.y = groundAt(enemy.x) - enemy.radius;

      if (canStomp(enemy)) {
        defeatEnemy(enemy);
        player.vy = -jumpImpulse() * 0.6;
        player.onGround = false;
        message = "Stomp!";
        messageTimer = 1;
        continue;
      }

      if (player.invulnerableFor <= 0 && playerDistanceTo(enemy) < enemy.radius + 24) {
        absorbOrTakeHit();
      }
    }

    for (let i = drops.length - 1; i >= 0; i -= 1) {
      const drop = drops[i];
      drop.bob += dt * 6;
      if (playerDistanceTo(drop) < 42) {
        player.ammo += drop.amount;
        drops.splice(i, 1);
        message = "+2 ammo";
        messageTimer = 1.1;
      }
    }

    for (let i = particles.length - 1; i >= 0; i -= 1) {
      const particle = particles[i];
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.life -= dt;
      if (particle.life <= 0) particles.splice(i, 1);
    }

    camera.x += (player.x - window.innerWidth * 0.35 - camera.x) * Math.min(1, dt * 8);
    camera.x = Math.max(0, Math.min(world.width - window.innerWidth, camera.x));

    if (enemiesRemaining === 0) {
      startLevelClearCollection();
    }
  }

  function updateLevelClearCollection(dt) {
    const target = { x: player.x, y: player.y - 42 };
    levelClearTimer -= dt;

    for (let i = drops.length - 1; i >= 0; i -= 1) {
      const drop = drops[i];
      const dx = target.x - drop.x;
      const dy = target.y - drop.y;
      const distance = Math.hypot(dx, dy);
      const speed = Math.max(260, distance * 5.5);

      drop.bob += dt * 10;
      if (distance < 12) {
        player.ammo += drop.amount;
        addBurst(target.x, target.y, 5);
        drops.splice(i, 1);
        continue;
      }

      drop.x += (dx / Math.max(1, distance)) * speed * dt;
      drop.y += (dy / Math.max(1, distance)) * speed * dt;
    }

    for (let i = particles.length - 1; i >= 0; i -= 1) {
      const particle = particles[i];
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.life -= dt;
      if (particle.life <= 0) particles.splice(i, 1);
    }

    if (drops.length === 0 && levelClearTimer <= 0) {
      showLevelComplete();
    }
  }

  function worldToScreenX(x) {
    return x - camera.x;
  }

  function line(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  function drawTerrain() {
    const startX = Math.max(0, camera.x - 80);
    const endX = Math.min(world.width, camera.x + window.innerWidth + 80);
    const first = Math.floor(startX / 40) * 40;

    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(worldToScreenX(first), groundAt(first) + 0.5);
    for (let x = first + 40; x <= endX + 40; x += 40) {
      ctx.lineTo(worldToScreenX(x), groundAt(x) + 0.5);
    }
    ctx.stroke();

    ctx.lineWidth = 2;
    for (let x = Math.floor(startX / 80) * 80; x < endX; x += 80) {
      const y = groundAt(x + 12) + 8;
      line(worldToScreenX(x), y, worldToScreenX(x + 22), groundAt(x + 22) + 8);
    }
  }

  function drawStickPerson() {
    const x = worldToScreenX(player.x);
    const y = player.y;
    const ducking = isDucking();
    const stride = Math.sin(performance.now() / 90) * (Math.abs(player.vx) / 360);
    const fade = player.invulnerableFor > 0 && Math.floor(performance.now() / 90) % 2 === 0;
    if (fade) return;

    ctx.lineWidth = 3;
    if (ducking) {
      ctx.beginPath();
      ctx.arc(x, y - 43, 10, 0, Math.PI * 2);
      ctx.stroke();
      if (powerUps.specs) {
        line(x - 8, y - 44, x - 2, y - 44);
        line(x + 2, y - 44, x + 8, y - 44);
      }
      line(x, y - 33, x - 5 * player.facing, y - 18);
      line(x - 5 * player.facing, y - 18, x + 22 * player.facing, y - 24);
      line(x - 5 * player.facing, y - 18, x - 20, y);
      line(x - 5 * player.facing, y - 18, x + 18, y);
      drawBoots(x, y, true);

      ctx.font = "22px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
      ctx.fillText("*", x + player.facing * 26, y - 20);
      return;
    }

    ctx.beginPath();
    ctx.arc(x, y - 62, 10, 0, Math.PI * 2);
    ctx.stroke();
    if (powerUps.specs) {
      line(x - 8, y - 63, x - 2, y - 63);
      line(x + 2, y - 63, x + 8, y - 63);
    }
    line(x, y - 52, x, y - 24);
    line(x, y - 43, x - 17 * player.facing, y - 34 + stride * 3);
    line(x, y - 43, x + 22 * player.facing, y - 38 - stride * 3);
    line(x, y - 24, x - 14, y);
    line(x, y - 24, x + 16, y - Math.abs(stride) * 8);
    drawBoots(x, y, false);

    ctx.font = "22px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
    ctx.fillText("*", x + player.facing * 24, y - 38);
  }

  function drawBoots(x, y, ducking) {
    if (!powerUps.boots) return;

    ctx.lineWidth = 2;
    if (ducking) {
      ctx.fillRect(x - 28, y - 8, 14, 8);
      ctx.fillRect(x + 12, y - 8, 14, 8);
      return;
    }

    ctx.fillRect(x - 22, y - 8, 14, 8);
    ctx.fillRect(x + 10, y - 8, 14, 8);
  }

  function drawEnemy(enemy) {
    if (!enemy.alive) return;
    const x = worldToScreenX(enemy.x);
    if (x < -60 || x > window.innerWidth + 60) return;

    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, enemy.y, enemy.radius, 0, Math.PI * 2);
    ctx.stroke();
    line(x - 8, enemy.y - 5, x - 2, enemy.y - 5);
    line(x + 2, enemy.y - 5, x + 8, enemy.y - 5);
  }

  function drawDrop(drop) {
    const x = worldToScreenX(drop.x);
    const y = drop.y - 8 + Math.sin(drop.bob) * 4;
    if (x < -40 || x > window.innerWidth + 40) return;

    ctx.font = "28px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
    ctx.fillText("+", x - 8, y + 8);
    ctx.font = "13px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
    ctx.fillText("2", x + 10, y + 13);
  }

  function drawProjectile(projectile) {
    const x = worldToScreenX(projectile.x);
    if (x < -20 || x > window.innerWidth + 20) return;
    if (projectile.homing) {
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, projectile.y, 5, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.font = "28px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
      ctx.fillText("*", x - 8, projectile.y + 8);
    }
  }

  function drawDrone() {
    if (!drone.active) return;

    const x = worldToScreenX(drone.x);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(x, drone.y, 18, 8, 0, 0, Math.PI * 2);
    ctx.stroke();
    line(x - 7, drone.y - 9, x - 13, drone.y - 17);
    line(x + 7, drone.y - 9, x + 13, drone.y - 17);
  }

  function drawUi() {
    ctx.setTransform(window.devicePixelRatio || 1, 0, 0, window.devicePixelRatio || 1, 0, 0);
    ctx.lineWidth = 2;
    ctx.font = "16px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
    ctx.fillText(`Ammo: ${player.ammo}`, 18, 28);
    ctx.fillText(`Level: ${level}`, 18, 52);
    ctx.fillText(`Enemies: ${enemiesRemaining}`, 18, 76);
    ctx.fillText(`Power: ${powerUpSummary()}`, 18, 124);
    drawRechargeBars(18, 138);

    const progressWidth = Math.min(260, window.innerWidth - 36);
    ctx.strokeRect(18, 92, progressWidth, 8);
    ctx.fillRect(18, 92, progressWidth * (player.x / world.width), 8);

    if (messageTimer > 0) {
      ctx.font = "18px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
      ctx.textAlign = "center";
      ctx.fillText(message, window.innerWidth / 2, 34);
      ctx.textAlign = "left";
    }

    if (window.matchMedia("(pointer: coarse)").matches) {
      ctx.font = "13px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
      ctx.fillText("Left: move  |  upper right: jump  |  lower middle: duck  |  lower right: shoot", 18, window.innerHeight - 18);
    }
  }

  function powerUpSummary() {
    const active = [];
    if (powerUps.boots) active.push("Boots");
    if (powerUps.specs) active.push("Specs");
    if (powerUps.droneLevel) {
      active.push(`Drone ${powerUps.droneCharges}/${powerUps.droneLevel}`);
    }
    if (powerUps.vestLevel) {
      active.push(`Vest ${powerUps.vestCharges}/${powerUps.vestLevel}`);
    }
    return active.length > 0 ? active.join("  ") : "none";
  }

  function drawRechargeBars(x, y) {
    let offset = 0;
    offset += drawRechargeBar("Drone", powerUps.droneLevel, powerUps.droneCharges, powerUps.droneRecharge, x, y + offset);
    drawRechargeBar("Vest", powerUps.vestLevel, powerUps.vestCharges, powerUps.vestRecharge, x, y + offset);
  }

  function drawRechargeBar(label, levelCount, charges, recharge, x, y) {
    if (levelCount === 0 || charges >= levelCount) return 0;

    const width = 120;
    const progress = Math.max(0, Math.min(1, recharge / 10));
    ctx.font = "12px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
    ctx.fillText(label, x, y + 9);
    ctx.strokeRect(x + 50, y, width, 8);
    ctx.fillRect(x + 50, y, width * progress, 8);
    return 16;
  }

  function drawCenteredText(lines, top) {
    ctx.textAlign = "center";
    for (const line of lines) {
      ctx.font = line.font;
      ctx.fillText(line.text, window.innerWidth / 2, top);
      top += line.gap;
    }
    ctx.textAlign = "left";
  }

  function drawButton(label, y) {
    const width = Math.min(260, window.innerWidth - 48);
    const height = 48;
    const x = (window.innerWidth - width) / 2;

    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
    ctx.font = "18px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
    ctx.textAlign = "center";
    ctx.fillText(label, window.innerWidth / 2, y + 31);
    ctx.textAlign = "left";

    return { x, y, width, height };
  }

  function drawScreenOverlay() {
    if (gameState === states.PLAYING || gameState === states.LEVEL_COLLECTING) return;

    ctx.fillStyle = "rgba(255, 255, 255, 0.88)";
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.fillStyle = "#000";

    if (gameState === states.TITLE) {
      drawCenteredText([
        { text: "LINE RUNNER", font: "36px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", gap: 46 },
        { text: "Stick figure vs. circle patrols", font: "16px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", gap: 34 },
      ], Math.max(112, window.innerHeight * 0.24));
      drawButton("NEW GAME", Math.max(220, window.innerHeight * 0.46));
      drawCenteredText([
        { text: "Move: A/D or arrows    Jump: W/Up    Duck: S/Down    Shoot: Space", font: "14px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", gap: 24 },
      ], Math.max(300, window.innerHeight * 0.46 + 86));
    }

    if (gameState === states.LEVEL_COMPLETE) {
      drawCenteredText([
        { text: `LEVEL ${completedLevel} CLEAR`, font: "30px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", gap: 44 },
        { text: `Power-up gained: ${lastPowerUp}`, font: "16px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", gap: 30 },
        { text: `Next wave: ${10 + completedLevel * 4} enemies`, font: "16px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", gap: 30 },
        { text: "+4 ammo bonus", font: "16px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", gap: 34 },
      ], Math.max(120, window.innerHeight * 0.28));
      drawButton("CONTINUE", Math.max(260, window.innerHeight * 0.56));
    }

    if (gameState === states.GAME_OVER) {
      drawCenteredText([
        { text: "OUT OF AMMO", font: "32px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", gap: 42 },
        { text: `Reached level ${level}`, font: "16px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", gap: 34 },
      ], Math.max(132, window.innerHeight * 0.3));
      drawButton("NEW GAME", Math.max(250, window.innerHeight * 0.54));
    }
  }

  function drawCollectionNotice() {
    if (gameState !== states.LEVEL_COLLECTING) return;

    ctx.font = "18px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
    ctx.textAlign = "center";
    ctx.fillText("Collecting ammo...", window.innerWidth / 2, 42);
    ctx.textAlign = "left";
  }

  function draw() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.strokeStyle = "#000";
    ctx.fillStyle = "#000";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.lineWidth = 3;
    drawTerrain();

    for (const drop of drops) drawDrop(drop);
    for (const projectile of projectiles) drawProjectile(projectile);
    for (const enemy of enemies) drawEnemy(enemy);
    drawDrone();

    for (const particle of particles) {
      const x = worldToScreenX(particle.x);
      line(x - 3, particle.y, x + 3, particle.y);
      line(x, particle.y - 3, x, particle.y + 3);
    }

    drawStickPerson();
    drawUi();
    drawCollectionNotice();
    drawScreenOverlay();
  }

  function loop(now) {
    const dt = Math.min(0.033, (now - lastTime) / 1000);
    lastTime = now;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  function touchZone(touch) {
    const x = touch.clientX;
    const y = touch.clientY;
    if (handleMenuAction(x, y)) {
      return "none";
    }
    if (x < window.innerWidth * 0.45) return "left";
    if (y < window.innerHeight * 0.48) {
      jumpRequested = true;
      return "jump";
    }
    if (x < window.innerWidth * 0.72) return "duck";
    shoot();
    return "shoot";
  }

  window.addEventListener("resize", resize);

  window.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    if (["arrowleft", "arrowright", "arrowup", "arrowdown", "enter", " ", "a", "d", "g", "s", "w", "r"].includes(key)) {
      event.preventDefault();
    }
    if ((key === "enter" || key === " " || key === "r") && activateCurrentScreen()) {
      keys.add(key);
      return;
    }
    if ((key === "arrowup" || key === "w") && !keys.has(key)) jumpRequested = true;
    if (key === "g" && !keys.has(key)) grantPowerUpWithFeedback();
    if (key === " ") shoot();
    if (key === "r" && gameState === states.PLAYING) beginNewGame();
    keys.add(key);
  });

  window.addEventListener("keyup", (event) => {
    keys.delete(event.key.toLowerCase());
  });

  canvas.addEventListener("touchstart", (event) => {
    event.preventDefault();
    for (const touch of event.changedTouches) {
      touches.set(touch.identifier, touchZone(touch));
    }
  }, { passive: false });

  canvas.addEventListener("touchmove", (event) => {
    event.preventDefault();
    for (const touch of event.changedTouches) {
      touches.set(touch.identifier, touchZone(touch));
    }
  }, { passive: false });

  canvas.addEventListener("touchend", (event) => {
    event.preventDefault();
    for (const touch of event.changedTouches) {
      touches.delete(touch.identifier);
    }
  }, { passive: false });

  canvas.addEventListener("mousedown", (event) => {
    if (handleMenuAction(event.clientX, event.clientY)) return;
    if (event.button === 0) shoot();
  });

  resize();
  startLevel(1);
  requestAnimationFrame(loop);
}());
