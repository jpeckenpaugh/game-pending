import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { chromium } from 'playwright';

const root = process.env.GAME_ROOT || '/game';
const output = '/artifacts';
const port = 4173;
const targetVideoDurationMs = 30_000;
const showcaseMode = process.env.GAME_PENDING_SHOWCASE === '1';
const errors = [];
let browser;
let context;
let video;
let server;
let videoStartedAt;
const result = { status: 'failed', mode: showcaseMode ? 'showcase' : 'fast-smoke', startedAt: new Date().toISOString(), browser: null, steps: [], errors };
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const record = (step) => result.steps.push({ step, status: 'passed' });
const snap = (page, name) => page.screenshot({ path: path.join(output, name), fullPage: true });
try {
  await fs.mkdir(output, { recursive: true });
  server = http.createServer(async (req, res) => {
    try {
      const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      const file = path.resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
      assert(file.startsWith(path.resolve(root) + path.sep), 'Invalid static path');
      const data = await fs.readFile(file);
      const ext = path.extname(file);
      res.writeHead(200, { 'Content-Type': ({'.html':'text/html','.js':'text/javascript','.css':'text/css'})[ext] || 'application/octet-stream' });
      res.end(data);
    } catch { res.writeHead(404); res.end('Not found'); }
  });
  await new Promise((resolve) => server.listen(port, '0.0.0.0', resolve));
  browser = await chromium.launch({ headless: true });
  result.browser = { playwright: '1.55.0', chromium: browser.version(), viewport: { width: 1280, height: 720 } };
  context = await browser.newContext({
    viewport: result.browser.viewport,
    ...(showcaseMode ? { recordVideo: { dir: output, size: result.browser.viewport } } : {}),
  });
  if (showcaseMode) videoStartedAt = process.hrtime.bigint();
  const page = await context.newPage();
  video = showcaseMode ? page.video() : null;
  page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
  page.on('console', message => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
  await page.goto(`http://127.0.0.1:${port}/?test=1`, { waitUntil: 'networkidle' });
  assert(await page.locator('canvas').count() === 1, 'Canvas missing');
  await snap(page, '01-title.png'); record('title loaded');
  if (process.env.TEST_FORCE_FAILURE === '1') assert(false, 'Deliberate artifact-retention check');
  await page.keyboard.press('ArrowDown'); await page.keyboard.press('Enter');
  await page.waitForFunction(() => window.__GAME_TEST__?.().state === 'customize');
  await page.waitForTimeout(900);

  // Main menu begins focused on Name. Set Robot, Arcade, then the runtime
  // starting power-ups in their submenu; leave no extra starting tiers.
  for (let i = 0; i < 3; i++) await page.keyboard.press('ArrowUp');
  for (let i = 0; i < 5; i++) await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowDown');
  for (let i = 0; i < 3; i++) await page.keyboard.press('ArrowRight');
  for (let i = 0; i < 4; i++) await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => window.__GAME_TEST__?.().customizeField === 'startingBootsLevel');
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press('ArrowRight');
    if (i < 4) await page.keyboard.press('ArrowDown');
  }
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => window.__GAME_TEST__?.().customizeField === 'powerUps');
  for (let i = 0; i < 6; i++) await page.keyboard.press('ArrowDown');
  for (let i = 0; i < 2; i++) await page.keyboard.press('ArrowRight');
  for (let i = 0; i < 4; i++) await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(600);
  await snap(page, '08-customize-options.png');
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => window.__GAME_TEST__?.().state === 'title');
  const customized = await page.evaluate(() => window.__GAME_TEST__());
  assert(customized.template === 'robot', `Expected Robot template, got ${customized.template}`);
  assert(customized.colorTheme === 'arcade', `Expected Arcade theme, got ${customized.colorTheme}`);
  assert(customized.weaponType === 'wand', `Expected Wand weapon, got ${customized.weaponType}`);
  assert(JSON.stringify(customized.startingPowerUps) === JSON.stringify({ bootsLevel: 1, specs: 1, radar: 1, shieldLevel: 1, droneLevel: 1 }), 'Customize starting power-ups did not match the approved loadout');
  result.customization = {
    template: customized.template,
    colorTheme: customized.colorTheme,
    weaponType: customized.weaponType,
    startingPowerUps: customized.startingPowerUps,
  };
  await snap(page, '02-customized-title.png'); record('customize Robot, Arcade, Wand, and starting power-ups');
  await page.keyboard.press('ArrowUp'); await page.keyboard.press('Enter');
  await page.waitForFunction(() => window.__GAME_TEST__?.().state === 'playing');
  const started = await page.evaluate(() => window.__GAME_TEST__());
  assert(started.enemies > 0, 'Gameplay HUD world did not initialize');
  assert(started.weaponType === 'wand', 'New Game did not retain the Wand weapon');
  assert(started.powerUps.bootsLevel === 1 && started.powerUps.specs === 1
    && started.powerUps.radar === 1 && started.powerUps.shieldLevel === 1
    && started.powerUps.droneLevel === 1,
  `New Game did not apply every approved starting power-up: ${JSON.stringify(started.powerUps)}`);
  await snap(page, '03-game-start.png'); record('game started');

  // Ten discrete G presses: one opens the picker and nine auto-grant/reroll.
  // Enter accepts one last selected option and closes back to gameplay.
  const powerScore = (powers) => powers.bootsLevel + powers.specs + powers.radar
    + powers.shieldLevel + powers.droneLevel + powers.hasteLevel;
  const powerBeforeG = started.powerUps;
  for (let i = 0; i < 10; i++) {
    await page.keyboard.press('g');
    await page.waitForFunction(() => window.__GAME_TEST__?.().state === 'powerChoice');
    if (i === 0) await snap(page, '07-power-choice.png');
    await page.waitForTimeout(200);
  }
  const powerAfterG = await page.evaluate(() => window.__GAME_TEST__());
  assert(powerScore(powerAfterG.powerUps) > powerScore(powerBeforeG), 'G picker did not produce a meaningful power-up grant');
  assert(powerAfterG.powerChoices.length === 3, 'G picker did not refresh its three choices');
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => window.__GAME_TEST__?.().state === 'playing');
  const powerAfterEnter = await page.evaluate(() => window.__GAME_TEST__());
  assert(powerAfterEnter.powerUps.specs === 1, 'Specs was lost during runtime power selection');
  result.powerSelection = {
    gPresses: 10,
    autoGrantRerolls: 9,
    enteredWith: powerBeforeG,
    afterGPresses: powerAfterG.powerUps,
    afterEnter: powerAfterEnter.powerUps,
    finalGrant: powerAfterEnter.lastPowerUp,
  };
  record('ten G presses grant runtime powers; Enter accepts final choice');

  const beforeMove = await page.evaluate(() => window.__GAME_TEST__().playerX);
  await page.keyboard.down('ArrowRight'); await page.waitForTimeout(350); await page.keyboard.up('ArrowRight');
  await page.waitForTimeout(120);
  await page.keyboard.press('x'); await page.waitForTimeout(300);
  assert((await page.evaluate(() => window.__GAME_TEST__())).playerX > beforeMove, 'Movement did not change player position');
  await snap(page, '04-movement.png'); record('movement and jump');
  const ammo = await page.evaluate(() => window.__GAME_TEST__().ammo);
  await page.keyboard.press('Space'); await page.waitForFunction(value => window.__GAME_TEST__().ammo < value, ammo);
  await snap(page, '05-fired.png'); record('fire reduced ammo');
  await page.keyboard.press('Enter'); await page.waitForFunction(() => window.__GAME_TEST__?.().state === 'paused');
  await page.keyboard.press('ArrowDown'); await page.keyboard.press('ArrowUp');
  await page.keyboard.press('Enter'); await page.waitForFunction(() => window.__GAME_TEST__?.().state === 'playing');
  await snap(page, '06-resumed.png'); record('pause and continue');

  if (showcaseMode) {
    // Continue mostly rightward, releasing movement keys before intermittent
    // Wand shots so Specs auto-aim remains active. Never restart a Game Over.
    const activeDeadlineMs = targetVideoDurationMs - 1_500;
    let rightHeld = false;
    let showcaseShots = 0;
    let nextShotAtMs = Number(process.hrtime.bigint() - videoStartedAt) / 1e6 + 1_200;
    let nextJumpAtMs = Number(process.hrtime.bigint() - videoStartedAt) / 1e6;
    const teleportPhases = new Set();
    let endState = 'playing';
    while (Number(process.hrtime.bigint() - videoStartedAt) / 1e6 < activeDeadlineMs) {
      const observed = await page.evaluate(() => window.__GAME_TEST__());
      if (observed.teleportPhase !== 'idle') teleportPhases.add(observed.teleportPhase);
      if (observed.state === 'gameOver') {
        endState = 'gameOver';
        break;
      }
      if (observed.state === 'levelCollecting') {
        await page.waitForTimeout(180);
        continue;
      }
      if (observed.state === 'levelComplete' || observed.state === 'powerChoice') {
        await page.keyboard.press('Enter');
        await page.waitForFunction(() => window.__GAME_TEST__?.().state === 'playing');
        continue;
      }

      const elapsedMs = Number(process.hrtime.bigint() - videoStartedAt) / 1e6;
      if (elapsedMs >= nextShotAtMs) {
        if (rightHeld) {
          await page.keyboard.up('ArrowRight');
          rightHeld = false;
        }
        await page.waitForTimeout(120);
        const shotsBefore = await page.evaluate(() => window.__GAME_TEST__().ammo);
        await page.keyboard.press('Space');
        await page.waitForTimeout(200);
        const shotState = await page.evaluate(() => window.__GAME_TEST__());
        if (shotState.ammo < shotsBefore) showcaseShots += 1;
        nextShotAtMs = elapsedMs + 4_000;
        if (elapsedMs < nextJumpAtMs) nextJumpAtMs = elapsedMs;
      } else if (!rightHeld) {
        await page.keyboard.down('ArrowRight');
        rightHeld = true;
      }

      if (elapsedMs >= nextJumpAtMs && observed.teleportPhase === 'idle' && observed.playerX < observed.worldWidth - 550) {
        await page.keyboard.press('x');
        nextJumpAtMs = elapsedMs + 2_200;
      }
      await page.waitForTimeout(180);
    }
    if (rightHeld) await page.keyboard.up('ArrowRight');
    if (endState === 'gameOver') {
      while (Number(process.hrtime.bigint() - videoStartedAt) / 1e6 < activeDeadlineMs) {
        await page.waitForTimeout(200);
      }
    } else {
      endState = (await page.evaluate(() => window.__GAME_TEST__())).state;
    }
    const elapsedBeforeCloseMs = Number(process.hrtime.bigint() - videoStartedAt) / 1e6;
    const finalGameplayState = await page.evaluate(() => window.__GAME_TEST__());
    result.steps.push({ step: 'active gameplay showcase', status: 'passed', elapsedMs: Math.round(elapsedBeforeCloseMs), stateAtEnd: endState, shots: showcaseShots, playerX: finalGameplayState.playerX, teleportPhases: [...teleportPhases] });
    result.showcase = { stateAtEnd: endState, shots: showcaseShots, playerX: finalGameplayState.playerX, teleportPhases: [...teleportPhases] };
    assert(showcaseShots > 0 || endState === 'gameOver', 'Showcase did not fire any shots before ending');
    result.video = { targetDurationSeconds: targetVideoDurationMs / 1000 };
  } else {
    result.showcase = { recorded: false, galleryCaptured: false };
  }
  assert(errors.length === 0, `Browser errors: ${errors.join('; ')}`);
  result.status = 'passed';
} catch (error) {
  result.failure = error.stack || String(error);
  errors.push(String(error));
  try { if (browser?.contexts().length) await browser.contexts()[0].pages()[0]?.screenshot({ path: path.join(output, 'failure.png'), fullPage: true }); } catch {}
} finally {
  if (context) {
    try { await context.close(); } catch (error) { errors.push(`context close: ${error.message}`); }
  }
  if (video) {
    try { await video.saveAs(path.join(output, 'demo.webm')); }
    catch (error) { errors.push(`video save: ${error.message}`); }
  }
  if (videoStartedAt && await fs.stat(path.join(output, 'demo.webm')).then(() => true, () => false)) {
    try {
      const probe = spawnSync('ffprobe', [
        '-v', 'error', '-show_entries', 'format=duration',
        '-of', 'default=noprint_wrappers=1:nokey=1', path.join(output, 'demo.webm'),
      ], { encoding: 'utf8' });
      assert(probe.status === 0, `ffprobe failed: ${probe.stderr || probe.error || 'unknown error'}`);
      const durationSeconds = Number(probe.stdout.trim());
      assert(Number.isFinite(durationSeconds), `Invalid WebM duration: ${probe.stdout}`);
      result.video = { ...result.video, durationSeconds };
      if (result.status === 'passed') {
        assert(durationSeconds >= 29 && durationSeconds <= 32, `Demo duration ${durationSeconds.toFixed(2)}s outside 29-32s target`);
      }
    } catch (error) { errors.push(`video validation: ${error.message}`); }
  }
  if (showcaseMode && browser && result.status === 'passed' && errors.length === 0) {
    try { result.gallery = await capturePromotionalGallery(browser, errors); }
    catch (error) { errors.push(`gallery capture: ${error.stack || error}`); }
  }
  if (errors.length && result.status === 'passed') {
    result.status = 'failed';
    result.failure = `Browser or artifact errors: ${errors.join('; ')}`;
  }
  result.finishedAt = new Date().toISOString();
  try {
    await fs.writeFile(path.join(output, 'result.json'), JSON.stringify(result, null, 2));
    await fs.writeFile(path.join(output, 'test.log'), `${result.startedAt}\n${result.steps.map(({step,status}) => `${status}: ${step}`).join('\n')}\n${result.failure || 'No runner failure'}\n`);
  } catch (error) { console.error(error); }
  if (browser) await browser.close();
  if (server) await new Promise(resolve => server.close(resolve));
}
console.log(JSON.stringify(result, null, 2));
if (result.status !== 'passed') process.exitCode = 1;

async function capturePromotionalGallery(activeBrowser, browserErrors) {
  const galleryDirectory = path.join(output, 'gallery');
  await fs.mkdir(galleryDirectory, { recursive: true });
  const captures = [];

  await withGalleryPage(activeBrowser, browserErrors, async (page) => {
    await saveGalleryStill(page, galleryDirectory, 'title.png');
  });
  captures.push('title.png');

  await withGalleryPage(activeBrowser, browserErrors, async (page) => {
    await configureGalleryPage(page, {
      template: 'robot', colorTheme: 'arcade', weaponType: 'wand',
      startingPowerUps: { bootsLevel: 1, specs: 1, radar: 1, shieldLevel: 1, droneLevel: 1 },
    }, async () => {
      await page.waitForTimeout(450);
      await saveGalleryStill(page, galleryDirectory, 'options.png');
    });
  });
  captures.push('options.png');

  await withGalleryPage(activeBrowser, browserErrors, async (page) => {
    await configureGalleryPage(page, {
      template: 'classic', colorTheme: 'sunset', weaponType: 'wand',
      startingPowerUps: { bootsLevel: 0, specs: 0, radar: 0, shieldLevel: 0, droneLevel: 0 },
    });
    await page.keyboard.press('g');
    await page.waitForFunction(() => window.__GAME_TEST__?.().state === 'powerChoice');
    await saveGalleryStill(page, galleryDirectory, 'choose-power.png');
  });
  captures.push('choose-power.png');

  const modes = [
    {
      name: 'original',
      config: {
        template: 'classic', colorTheme: 'classic', weaponType: 'gun',
        startingPowerUps: { bootsLevel: 0, specs: 0, radar: 0, shieldLevel: 0, droneLevel: 0 },
      },
      pose: async () => {},
    },
    {
      name: 'emoji',
      config: {
        template: 'emojiColor', colorTheme: 'pastel', weaponType: 'wand',
        startingPowerUps: { bootsLevel: 2, specs: 1, radar: 0, shieldLevel: 0, droneLevel: 0 },
      },
      pose: async (page) => {
        await page.keyboard.press('x');
        await page.waitForTimeout(220);
        await page.keyboard.press('Space');
        await page.waitForTimeout(100);
      },
    },
    {
      name: 'farm',
      config: {
        template: 'farm', colorTheme: 'natural', weaponType: 'club',
        startingPowerUps: { bootsLevel: 0, specs: 0, radar: 1, shieldLevel: 1, droneLevel: 1 },
      },
      pose: async (page) => {
        await page.keyboard.down('ArrowRight');
        await page.waitForTimeout(520);
        await page.keyboard.up('ArrowRight');
        await page.waitForTimeout(120);
      },
    },
    {
      name: 'robot',
      config: {
        template: 'robot', colorTheme: 'arcade', weaponType: 'wand',
        startingPowerUps: { bootsLevel: 1, specs: 1, radar: 1, shieldLevel: 2, droneLevel: 2 },
      },
      pose: async (page) => {
        await page.keyboard.down('ArrowRight');
        await page.waitForTimeout(360);
        await page.keyboard.up('ArrowRight');
        await page.keyboard.press('x');
        await page.waitForTimeout(220);
        await page.keyboard.press('Space');
        await page.waitForTimeout(100);
      },
    },
  ];

  for (const mode of modes) {
    await withGalleryPage(activeBrowser, browserErrors, async (page) => {
      await configureGalleryPage(page, mode.config);
      await mode.pose(page);
      const state = await page.evaluate(() => window.__GAME_TEST__());
      assert(state.state === 'playing', `${mode.name} gallery scene did not reach gameplay`);
      assert(state.template === mode.config.template, `${mode.name} gallery template mismatch`);
      assert(state.colorTheme === mode.config.colorTheme, `${mode.name} gallery theme mismatch`);
      await saveGalleryStill(page, galleryDirectory, `${mode.name}.png`);
    });
    captures.push(`${mode.name}.png`);
  }

  return { directory: 'gallery/', screenshots: captures };
}

async function withGalleryPage(activeBrowser, browserErrors, capture) {
  const galleryContext = await activeBrowser.newContext({ viewport: { width: 1280, height: 720 } });
  try {
    const page = await galleryContext.newPage();
    page.on('pageerror', error => browserErrors.push(`gallery pageerror: ${error.message}`));
    page.on('console', message => {
      if (message.type() === 'error') browserErrors.push(`gallery console: ${message.text()}`);
    });
    await page.goto(`http://127.0.0.1:${port}/?test=1`, { waitUntil: 'networkidle' });
    assert(await page.locator('canvas').count() === 1, 'Gallery page canvas missing');
    await page.waitForFunction(() => window.__GAME_TEST__?.().state === 'title');
    await capture(page);
  } finally {
    await galleryContext.close();
  }
}

async function configureGalleryPage(page, config, beforeSave = null) {
  const templateSteps = { classic: 1, emojiColor: 2, farm: 4, robot: 5 }[config.template];
  const themeSteps = { classic: 0, natural: 1, sunset: 2, arcade: 3, pastel: 4, forest: 5 }[config.colorTheme];
  const weaponSteps = { gun: 0, club: 1, wand: 2, question: 3 }[config.weaponType];
  assert(templateSteps !== undefined, `Unknown gallery template: ${config.template}`);
  assert(themeSteps !== undefined, `Unknown gallery theme: ${config.colorTheme}`);
  assert(weaponSteps !== undefined, `Unknown gallery weapon: ${config.weaponType}`);

  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => window.__GAME_TEST__?.().state === 'customize');
  for (let i = 0; i < 3; i++) await page.keyboard.press('ArrowUp');
  for (let i = 0; i < templateSteps; i++) await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowDown');
  for (let i = 0; i < themeSteps; i++) await page.keyboard.press('ArrowRight');
  for (let i = 0; i < 4; i++) await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => window.__GAME_TEST__?.().customizeField === 'startingBootsLevel');

  const powerValues = [
    config.startingPowerUps.bootsLevel,
    config.startingPowerUps.specs,
    config.startingPowerUps.radar,
    config.startingPowerUps.shieldLevel,
    config.startingPowerUps.droneLevel,
  ];
  for (let i = 0; i < powerValues.length; i++) {
    for (let level = 0; level < powerValues[i]; level++) await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowDown');
  }
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => window.__GAME_TEST__?.().customizeField === 'powerUps');
  for (let i = 0; i < 6; i++) await page.keyboard.press('ArrowDown');
  for (let i = 0; i < weaponSteps; i++) await page.keyboard.press('ArrowRight');
  for (let i = 0; i < 4; i++) await page.keyboard.press('ArrowDown');
  const configured = await page.evaluate(() => window.__GAME_TEST__());
  assert(configured.template === config.template, `Failed to configure ${config.template} template`);
  assert(configured.colorTheme === config.colorTheme, `Failed to configure ${config.colorTheme} theme`);
  assert(configured.weaponType === config.weaponType, `Failed to configure ${config.weaponType} weapon`);
  assert(JSON.stringify(configured.startingPowerUps) === JSON.stringify(config.startingPowerUps), 'Gallery starting power-up configuration mismatch');
  if (beforeSave) await beforeSave();

  await page.keyboard.press('Enter');
  await page.waitForFunction(() => window.__GAME_TEST__?.().state === 'title');
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => window.__GAME_TEST__?.().state === 'playing');
  await page.waitForTimeout(1_350);
  const started = await page.evaluate(() => window.__GAME_TEST__());
  assert(started.template === config.template && started.colorTheme === config.colorTheme, 'Gallery game setup changed after New Game');
  assert(started.enemies > 0, 'Gallery gameplay scene has no enemies');
}

async function saveGalleryStill(page, galleryDirectory, filename) {
  await page.screenshot({ path: path.join(galleryDirectory, filename), fullPage: true });
}
