import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const root = process.env.GAME_ROOT || '/game';
const output = '/artifacts';
const port = 4173;
const errors = [];
let browser;
let server;
const result = { status: 'failed', startedAt: new Date().toISOString(), browser: null, steps: [], errors };
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
  result.browser = { playwright: '1.55.0', chromium: browser.version(), viewport: { width: 1024, height: 768 } };
  const page = await browser.newPage({ viewport: result.browser.viewport });
  page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
  page.on('console', message => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
  await page.goto(`http://127.0.0.1:${port}/?test=1`, { waitUntil: 'networkidle' });
  assert(await page.locator('canvas').count() === 1, 'Canvas missing');
  await snap(page, '01-title.png'); record('title loaded');
  if (process.env.TEST_FORCE_FAILURE === '1') assert(false, 'Deliberate artifact-retention check');
  await page.keyboard.press('ArrowDown'); await page.keyboard.press('Enter');
  await page.waitForFunction(() => window.__GAME_TEST__?.().state === 'customize');
  await page.keyboard.press('ArrowUp'); await page.keyboard.press('ArrowUp');
  await page.keyboard.press('ArrowRight');
  // Select Save using keyboard navigation; save is after all main customize fields.
  for (let i = 0; i < 14; i++) await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => window.__GAME_TEST__?.().state === 'title');
  assert((await page.evaluate(() => window.__GAME_TEST__())).colorTheme !== 'classic', 'Color theme did not save');
  await snap(page, '02-customized-title.png'); record('customize color theme and save');
  await page.keyboard.press('ArrowUp'); await page.keyboard.press('Enter');
  await page.waitForFunction(() => window.__GAME_TEST__?.().state === 'playing');
  assert((await page.evaluate(() => window.__GAME_TEST__())).enemies > 0, 'Gameplay HUD world did not initialize');
  await snap(page, '03-game-start.png'); record('game started');
  const beforeMove = await page.evaluate(() => window.__GAME_TEST__().playerX);
  await page.keyboard.down('d'); await page.waitForTimeout(450); await page.keyboard.up('d');
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
  assert(errors.length === 0, `Browser errors: ${errors.join('; ')}`);
  result.status = 'passed';
} catch (error) {
  result.failure = error.stack || String(error);
  errors.push(String(error));
  try { if (browser?.contexts().length) await browser.contexts()[0].pages()[0]?.screenshot({ path: path.join(output, 'failure.png'), fullPage: true }); } catch {}
} finally {
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
