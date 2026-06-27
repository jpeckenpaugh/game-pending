You are the **Architect** for "Game Pending" — an HTML5 Canvas side-scroller in vanilla JS (ES modules, zero deps, no build step).

The PM has approved 3 features for Sprint-002. Produce a technical spec at `docs/architecture/sprint-002-spec.md` covering all three. For each, specify: what files change, what new state is needed, what drawing/rules code is required, and any dependencies between items.

## Feature 1: Question Mark Weapon

A weapon that applies a "philosophical crisis" debuff — enemies stop and think, then enrage.

**Mechanics:**
- Fires a glowing "?" projectile
- On hit: enemy stops moving for 0.8s (ponders existence), takes 2x damage during this time
- After pondering, enemy enrages for 2s (faster movement, 2x damage output)
- Ammo cost: 2 per shot
- Cooldown: 0.6s

**What to spec:**
- New weapon type `"question"` in weapons.js
- Debuff state on enemies (`enemy.philosophizing`, `enemy.enraged` timers)
- Visual: floating "?" above pondering enemies, red glow when enraged
- The enrage multiplier for damage output
- Any changes to the HUD or ammo display

## Feature 2: Tutorial Ghost Enemy

A floating ghost that gives inverted (wrong) advice, gets frustrated when ignored, and eventually attacks.

**Mechanics:**
- Spawns like the Mirror (every Nth enemy), hovers above ground
- Starts in "advice" phase: floats near player, displays speech bubbles with inverted tips
  - "Press X to fall faster" (actually jump)
  - "Stand still to dodge attacks" (actually you need to move)
  - "Collect fewer ammo drops" (actually you want ammo)
  - 15-20 lines in a dialogue pool
- After 2 advice bubbles without a reaction, enters "frustrated" phase: speech bubbles get angry (ALL CAPS, Comic Sans style)
  - "FINE, DON'T LISTEN. SEE IF I CARE."
  - "YOU'RE NOT VERY GOOD AT THIS."
  - 5-8 frustrated lines
- After 4 total bubbles, enters "attack" phase: chases the player like a normal enemy (circle family, aggressive AI)
- Constantly visible — the ghost follows the player at a distance during advice phase, then chases during attack phase

**What to spec:**
- New enemy family `"ghost"` in enemies.js with movement `"ghost"`
- `updateGhostEnemy()` state machine (advice → frustrated → attack phases)
- Dialogue pool storage — where to put the text content
- Speech bubble rendering in enemyArt.js or render.js
- Drawing: ghost shape (wavy bottom, translucent)
- Hover behavior (follows player at distance, always visible)

## Feature 3: Forest Canopy Level Theme

A visual terrain theme with mud patches and vine ladders.

**Mechanics:**
- New color theme palette `"forest"` — dark green/mossy ground, brown trunks, light green foliage
- Mud zones: areas on ground and cave surfaces where player and enemies move at 60% speed
- Vine ladders: ladders drawn as dangling vines instead of straight lines
- Falling leaf particles in the background (subtle, every few seconds)
- Tree-trunk platforms: drawn as rounded vertical rectangles with branch stubs

**What to spec:**
- New palette entry in colorThemes.js
- `mudZones` in world state — defined where mud patches go
- Friction multiplier in player.js when standing on mud
- Vine ladder rendering variation in terrain.js or render.js
- Changing `customization.colorTheme` to `"forest"` affects which terrain drawing code runs
- Tree-trunk drawing in render.js (conditional on theme)
- Leaf particle effect in effects.js (conditional on theme)

## Deliverable
Write to `docs/architecture/sprint-002-spec.md`. Cover all three features with: files to modify, new state/variables, drawing requirements, and dependency order (what must be built first).
