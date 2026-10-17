You are the **Engineer** for "Game Pending" — an HTML5 Canvas side-scroller in vanilla JS (ES modules, zero deps, no build step).

## Task: Implement 3 features

Read the existing source code in `html/src/` to understand the project conventions, then implement all three features below. Keep changes minimal — don't refactor unrelated code.

---

### Feature 1: Volume Slider in Customize Menu

The audio module (`html/src/audio.js`) already respects `game.sfxVolume`. But there's no way to change it in-game.

**What to do:**
- In `html/src/state.js`, the `game.sfxVolume` already exists (default 0.5)
- In `html/src/menus.js`, add a volume slider to the customize menu
- It should live in the customize menu as a field like the existing settings (FPS, weapon, etc.)
- Use a visual slider (a line with a filled portion and a draggable indicator) drawn with Canvas primitives
- Support Left/Right arrow keys (and mouse click if the existing input system supports it) to adjust from 0 to 1.0 in 0.1 increments
- Show the current level as "Vol: 70%" or similar text
- Display a speaker icon that changes based on level (full/half/muted)
- Wire the slider into the existing customize menu save/load flow

---

### Feature 2: The Mirror Enemy

A new enemy that copies the player's last few actions. From design brief 002.

**How it works:**
- Diamond-shaped head (mirror aesthetic — drawn with reflective-looking lines)
- Spawns like other enemies but appears after a delay
- It doesn't chase the player — it REPLAYS the player's last 5 actions with a ~2 second delay
- If the player jumped, the Mirror jumps 2 seconds later at the same position
- If the player shot, the Mirror fires a projectile from the same position 2 seconds later
- If the player walked off a cliff, the Mirror follows

**Implementation:**
- In `html/src/state.js`, add a `mirrorQueue` array that stores the last 5 player actions as `{ type, timestamp, x, y, vx, vy }` objects
- In `html/src/player.js`, push to `mirrorQueue` on every frame (or throttle to every ~200ms)
- In `html/src/enemies.js`, add a new enemy family `"mirror"` with `flying: true` (it hovers like a flyer but doesn't chase)
- In `html/src/enemyArt.js`, add drawing for the Mirror — diamond shape with dashed/reflective outline (like a mirror surface)
- The Mirror's update logic: replay actions from the queue, offset by `currentTime - action.timestamp >= 2`
- When the Mirror is defeated, it shatters (visual: line fragments expanding outward) and plays a shatter sound
- The Mirror cannot be stomped (it's flying)
- The Mirror does not deal damage on contact — it's purely a "fight yourself" mechanic

---

### Feature 3: Haste Power-Up

A speed-boost power-up with dash at higher levels. From design brief 001.

**How it works:**
- Levels 1-5: +12% move speed per level (up to +60% at L5)
- Levels 6-10: Dash ability — tap X while on the ground to burst forward 200px in 0.15s, with invulnerability during dash
- Dash has 1 charge per level above 5 (L6 = 1, L7 = 2, etc.)
- Dash charges recharge at 1 per 8 seconds

**Implementation:**
- In `html/src/state.js`, add `powerUps.hasteLevel = 0` and `powerUps.dashCharges = 0` and `powerUps.dashMaxCharges = 0` to the existing powerUps object
- In `html/src/player.js`, multiply `player.speed` by `(1 + powerUps.hasteLevel * 0.12)` in the movement calculation
- Add dash: when X is tapped (not held) and on the ground and `dashCharges > 0`, set `player.dashing`, move 200px in the current direction over 0.15s, set invulnerable flag
- In `html/src/player.js`, recharge dash charges at 1 per 8s in the update loop
- In `html/src/powerups.js`, add `"haste"` to the `powerUpPool` so it appears as a level-complete choice
- In `html/src/render.js` or `html/src/hud.js`, if `hasteLevel > 0`, show a haste icon in the bottom HUD strip with level and dash charge bars
- Create the haste icon in `html/src/powerIcons.js` — a small lightning bolt or speed lines shape using Canvas primitives

---

### Verification
```sh
for f in html/src/*.js; do node --check "$f" || exit 1; done
```

### Deliverable
Modified source files. No new dependencies.
