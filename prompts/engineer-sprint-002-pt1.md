You are the **Engineer** for "Game Pending" — an HTML5 Canvas side-scroller in vanilla JS (ES modules, zero deps, no build step).

Read the full spec at `docs/architecture/sprint-002-spec.md` for technical details, then implement **Feature 1 (Question Mark Weapon) and Feature 2 (Tutorial Ghost Enemy)**.

---

### Feature 1: Question Mark Weapon

A weapon that debuffs enemies. Fires a "?" projectile. On hit, the enemy ponders for 0.8s (takes 2x damage), then enrages for 2s (2x speed, 2x damage output).

**What to change:**
- `html/src/state.js`: add `mirrorQueue` is already there — verify `enemies` array and `powerUps` are set up
- `html/src/weapons.js`: add weapon type `"question"` — ammo cost 2, cooldown 0.6s, 0 direct damage
- `html/src/enemies.js`: add `enemy.philosophizing` and `enemy.enraged` timers per enemy. On hit by question weapon, set `philosophizing = 0.8`. During `updateEnemyPositions`, if `philosophizing > 0` the enemy freezes (skip AI movement), if `enraged > 0` apply 2x speed multiplier. In `defeatEnemy` (or wherever damage is applied), double incoming damage when `philosophizing > 0`.
- `html/src/enemyArt.js`: when `enemy.philosophizing > 0`, draw a "..." thought bubble above the enemy. When `enemy.enraged > 0`, draw a red glow/outline.
- `html/src/render.js` or `html/src/enemyArt.js`: draw the "?" projectile as a glowing character.
- Wire the weapon into `html/src/projectiles.js` shoot handler — the existing weapons system should already handle it if you add `"question"` to the weapon type checks.

**Important:** The "?" projectile should have `hitEnemies: null` so it can hit any enemy (like Mirror's projectiles work).

---

### Feature 2: Tutorial Ghost Enemy

A floating ghost that gives inverted advice, gets frustrated when ignored, then attacks.

**What to change:**
- Create `html/src/data/dialogue.js` with advice pool (15+ lines) and frustrated pool (8 lines)
- `html/src/state.js`: add any required ghost state tracking
- `html/src/enemies.js`: add `"ghost"` family to `enemyFamilyForIndex` (same cadence as Mirror, every 8th enemy). Add `updateGhostEnemy()` state machine with phases: `"advice"` → `"frustrated"` → `"attack"`. During advice phase: hover above ground, follow player at a distance, display speech bubbles periodically. After 2 advice bubbles, transition to frustrated. After 2 more, transition to attack (chase like a circle enemy).
- `html/src/enemyArt.js`: draw ghost shape — translucent oval with wavy bottom edge, two eyes. Speech bubbles rendered as rounded rects with tail. Normal advice: Comic Sans-like font. Frustrated: ALL CAPS, red border.
- `html/src/render.js` or `html/src/enemyArt.js`: add speech bubble rendering layer above enemies.

**Ghost behavior specifics:**
- Hovers 160px above ground (like Mirror)
- Follows player at 120px distance in advice/frustrated phases
- Advice bubble every 4-6s, lasts 3s
- On attack phase: drops to ground, chases aggressively (use same AI as circle enemies)
- Cannot be stomped (like Mirror)
- Drops ammo when defeated

---

**Before submitting**, verify:
```sh
for f in html/src/*.js; do node --check "$f" || exit 1; done
```
