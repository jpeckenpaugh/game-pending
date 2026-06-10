(function () {
  "use strict";

  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  const world = {
    width: 2800,
    groundY: 0,
    gravity: 1850,
    friction: 0.82,
  };

  const player = {
    x: 80,
    y: 0,
    vx: 0,
    vy: 0,
    width: 26,
    height: 74,
    speed: 780,
    jumpPower: 720,
    ammo: 10,
    facing: 1,
    onGround: true,
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

  let level = 1;
  let enemiesRemaining = 0;
  let message = "Arrows/WASD move, Space shoots, Up/W jumps";
  let messageTimer = 4;
  let gameOver = false;
  let lastTime = performance.now();

  function resize() {
    const ratio = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = Math.floor(window.innerWidth * ratio);
    canvas.height = Math.floor(window.innerHeight * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    world.groundY = Math.max(260, window.innerHeight - 86);
    if (!player.y) {
      player.y = world.groundY;
    } else if (player.onGround) {
      player.y = world.groundY;
    }
  }

  function startLevel(nextLevel) {
    level = nextLevel;
    enemies.length = 0;
    projectiles.length = 0;
    drops.length = 0;
    particles.length = 0;
    enemiesRemaining = 10 + (level - 1) * 4;
    world.width = Math.max(2200, 1500 + enemiesRemaining * 135);
    player.x = 80;
    player.y = world.groundY;
    player.vx = 0;
    player.vy = 0;
    player.onGround = true;
    player.invulnerableFor = 1.2;
    player.ammo = Math.max(player.ammo, 10);
    camera.x = 0;

    for (let i = 0; i < enemiesRemaining; i += 1) {
      enemies.push({
        x: 420 + i * 145 + (i % 3) * 24,
        y: world.groundY - 24,
        radius: 24,
        baseX: 420 + i * 145 + (i % 3) * 24,
        phase: i * 0.9,
        alive: true,
      });
    }

    message = `Level ${level}`;
    messageTimer = 2;
    gameOver = false;
  }

  function shoot() {
    if (player.shootCooldown > 0 || player.ammo <= 0 || gameOver) {
      return;
    }

    player.ammo -= 1;
    player.shootCooldown = 0.18;
    projectiles.push({
      x: player.x + player.facing * 24,
      y: player.y - 48,
      vx: player.facing * 760,
      life: 1.7,
    });

    if (player.ammo === 0) {
      message = "Out of ammo. Collect + drops.";
      messageTimer = 2.4;
    }
  }

  function restart() {
    player.ammo = 10;
    startLevel(1);
  }

  function circleHit(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y) <= b.radius + 7;
  }

  function playerDistanceTo(point) {
    const px = player.x;
    const py = player.y - player.height * 0.45;
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

  function wantsJump() {
    if (keys.has("arrowup") || keys.has("w")) return true;
    for (const zone of touches.values()) {
      if (zone === "jump") return true;
    }
    return false;
  }

  function update(dt) {
    if (messageTimer > 0) {
      messageTimer -= dt;
    }

    if (gameOver) {
      return;
    }

    player.shootCooldown = Math.max(0, player.shootCooldown - dt);
    player.invulnerableFor = Math.max(0, player.invulnerableFor - dt);

    const axis = inputAxis();
    if (axis !== 0) {
      player.vx += axis * player.speed * dt;
      player.facing = axis > 0 ? 1 : -1;
    } else {
      player.vx *= Math.pow(world.friction, dt * 60);
    }

    player.vx = Math.max(-360, Math.min(360, player.vx));

    if (wantsJump() && player.onGround) {
      player.vy = -player.jumpPower;
      player.onGround = false;
    }

    player.vy += world.gravity * dt;
    player.x += player.vx * dt;
    player.y += player.vy * dt;
    player.x = Math.max(36, Math.min(world.width - 36, player.x));

    if (player.y >= world.groundY) {
      player.y = world.groundY;
      player.vy = 0;
      player.onGround = true;
    }

    for (let i = projectiles.length - 1; i >= 0; i -= 1) {
      const projectile = projectiles[i];
      projectile.x += projectile.vx * dt;
      projectile.life -= dt;

      if (projectile.life <= 0 || projectile.x < 0 || projectile.x > world.width) {
        projectiles.splice(i, 1);
        continue;
      }

      for (const enemy of enemies) {
        if (!enemy.alive || !circleHit(projectile, enemy)) continue;
        enemy.alive = false;
        enemiesRemaining -= 1;
        projectiles.splice(i, 1);
        drops.push({ x: enemy.x, y: enemy.y, amount: 2, bob: 0 });
        addBurst(enemy.x, enemy.y, 8);
        break;
      }
    }

    for (const enemy of enemies) {
      if (!enemy.alive) continue;
      enemy.phase += dt * 2.2;
      enemy.x = enemy.baseX + Math.sin(enemy.phase) * 28;

      if (player.invulnerableFor <= 0 && playerDistanceTo(enemy) < enemy.radius + 24) {
        player.ammo = Math.max(0, player.ammo - 2);
        player.invulnerableFor = 1.3;
        player.vx = -player.facing * 260;
        message = "Hit! Ammo lost.";
        messageTimer = 1.6;
        if (player.ammo === 0 && projectiles.length === 0) {
          gameOver = true;
          message = "No ammo left. Press R or tap center to restart.";
          messageTimer = Infinity;
        }
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
      startLevel(level + 1);
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

  function drawStickPerson() {
    const x = worldToScreenX(player.x);
    const y = player.y;
    const stride = Math.sin(performance.now() / 90) * (Math.abs(player.vx) / 360);
    const fade = player.invulnerableFor > 0 && Math.floor(performance.now() / 90) % 2 === 0;
    if (fade) return;

    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y - 62, 10, 0, Math.PI * 2);
    ctx.stroke();
    line(x, y - 52, x, y - 24);
    line(x, y - 43, x - 17 * player.facing, y - 34 + stride * 3);
    line(x, y - 43, x + 22 * player.facing, y - 38 - stride * 3);
    line(x, y - 24, x - 14, y);
    line(x, y - 24, x + 16, y - Math.abs(stride) * 8);

    ctx.font = "22px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
    ctx.fillText("*", x + player.facing * 24, y - 38);
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
    ctx.font = "28px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
    ctx.fillText("*", x - 8, projectile.y + 8);
  }

  function drawUi() {
    ctx.setTransform(window.devicePixelRatio || 1, 0, 0, window.devicePixelRatio || 1, 0, 0);
    ctx.lineWidth = 2;
    ctx.font = "16px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
    ctx.fillText(`Ammo: ${player.ammo}`, 18, 28);
    ctx.fillText(`Level: ${level}`, 18, 52);
    ctx.fillText(`Enemies: ${enemiesRemaining}`, 18, 76);

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
      ctx.fillText("Left side: move  |  upper right: jump  |  lower right: shoot", 18, window.innerHeight - 18);
    }
  }

  function draw() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.strokeStyle = "#000";
    ctx.fillStyle = "#000";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.lineWidth = 3;
    line(0, world.groundY + 0.5, window.innerWidth, world.groundY + 0.5);

    for (let x = -camera.x % 80; x < window.innerWidth; x += 80) {
      line(x, world.groundY + 8, x + 22, world.groundY + 8);
    }

    for (const drop of drops) drawDrop(drop);
    for (const projectile of projectiles) drawProjectile(projectile);
    for (const enemy of enemies) drawEnemy(enemy);

    for (const particle of particles) {
      const x = worldToScreenX(particle.x);
      line(x - 3, particle.y, x + 3, particle.y);
      line(x, particle.y - 3, x, particle.y + 3);
    }

    drawStickPerson();
    drawUi();
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
    if (gameOver && x > window.innerWidth * 0.33 && x < window.innerWidth * 0.67) {
      restart();
      return "none";
    }
    if (x < window.innerWidth * 0.45) return "left";
    if (y < window.innerHeight * 0.48) return "jump";
    shoot();
    return "shoot";
  }

  window.addEventListener("resize", resize);

  window.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    if (["arrowleft", "arrowright", "arrowup", " ", "a", "d", "w", "r"].includes(key)) {
      event.preventDefault();
    }
    if (key === " ") shoot();
    if (key === "r") restart();
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
    if (event.button === 0) shoot();
  });

  resize();
  startLevel(1);
  requestAnimationFrame(loop);
}());
