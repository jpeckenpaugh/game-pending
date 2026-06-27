import { game } from "./state.js";

let ctx = null;

let initDone = false;

function ac() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (ctx.state === "suspended") {
    ctx.resume();
  }
  return ctx;
}

function gain(amount) {
  const g = ac().createGain();
  g.gain.value = amount * (game.sfxVolume ?? 0.5);
  g.connect(ac().destination);
  return g;
}

function noise(duration, lowpass) {
  const c = ac();
  const sampleRate = c.sampleRate;
  const length = Math.max(1, Math.floor(sampleRate * duration));
  const buffer = c.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const source = c.createBufferSource();
  source.buffer = buffer;
  const dest = lowpass !== undefined ? (() => {
    const filter = c.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = lowpass;
    source.connect(filter);
    return filter;
  })() : source;
  return { source, dest };
}

export function initAudio() {
  ac();
  initDone = true;
}

export function playJump() {
  if (!initDone) return;
  const c = ac();
  const vol = game.sfxVolume ?? 0.5;
  const g = gain(0.12 * vol);
  const o = c.createOscillator();
  o.type = "sine";
  o.frequency.setValueAtTime(200, c.currentTime);
  o.frequency.linearRampToValueAtTime(600, c.currentTime + 0.15);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.15);
  o.connect(g);
  o.start();
  o.stop(c.currentTime + 0.15);
}

export function playShoot() {
  if (!initDone) return;
  const c = ac();
  const vol = game.sfxVolume ?? 0.5;
  const { source, dest } = noise(0.1);
  const g = gain(0.07 * vol);
  dest.connect(g);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.1);
  source.start();
  source.stop(c.currentTime + 0.1);
}

export function playHit() {
  if (!initDone) return;
  const c = ac();
  const vol = game.sfxVolume ?? 0.5;
  const { source, dest } = noise(0.2, 200);
  const g = gain(0.1 * vol);
  dest.connect(g);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.2);
  source.start();
  source.stop(c.currentTime + 0.2);
}

export function playEnemyDefeat() {
  if (!initDone) return;
  const c = ac();
  const vol = game.sfxVolume ?? 0.5;
  const g = gain(0.1 * vol);
  const o = c.createOscillator();
  o.type = "square";
  o.frequency.setValueAtTime(400, c.currentTime);
  o.frequency.linearRampToValueAtTime(100, c.currentTime + 0.3);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.3);
  o.connect(g);
  o.start();
  o.stop(c.currentTime + 0.3);
}

export function playLevelComplete() {
  if (!initDone) return;
  const c = ac();
  const vol = game.sfxVolume ?? 0.5;
  const notes = [262, 330, 392];
  const noteLen = 0.12;
  for (let i = 0; i < notes.length; i++) {
    const g = gain(0.08 * vol);
    const o = c.createOscillator();
    o.type = "sine";
    o.frequency.value = notes[i];
    const start = c.currentTime + i * noteLen;
    g.gain.exponentialRampToValueAtTime(0.001, start + noteLen);
    o.connect(g);
    o.start(start);
    o.stop(start + noteLen);
  }
}

export function playMenuSelect() {
  if (!initDone) return;
  const c = ac();
  const vol = game.sfxVolume ?? 0.5;
  const g = gain(0.08 * vol);
  const o = c.createOscillator();
  o.type = "sine";
  o.frequency.value = 800;
  const duration = 1 / 800;
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
  o.connect(g);
  o.start();
  o.stop(c.currentTime + duration);
}

export function playPowerUp() {
  if (!initDone) return;
  const c = ac();
  const vol = game.sfxVolume ?? 0.5;
  const g = gain(0.1 * vol);
  const o = c.createOscillator();
  o.type = "sine";
  o.frequency.setValueAtTime(300, c.currentTime);
  o.frequency.linearRampToValueAtTime(1200, c.currentTime + 0.4);
  const vibrato = c.createOscillator();
  vibrato.frequency.value = 8;
  const vibratoGain = c.createGain();
  vibratoGain.gain.value = 30;
  vibrato.connect(vibratoGain);
  vibratoGain.connect(o.frequency);
  vibrato.start();
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.4);
  o.connect(g);
  o.start();
  o.stop(c.currentTime + 0.4);
  vibrato.stop(c.currentTime + 0.4);
}
