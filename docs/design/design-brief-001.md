# Design Brief 001 — Game Pending

> **Author:** Designer Agent
> **Date:** 2026-06-27
> **Status:** Draft for PM review

---

## Area 1 — Level Themes & Terrain Types

### Option 1A: Forest Canopy

**Description:** Verdant outdoor arenas with branching tree-trunk platforms, hanging vine ladders, leafy ground cover, and dappled-light sky. Trees rise from both sides forming a natural canopy.

**Gameplay changes:**
- **Mud patches** on the forest floor — player and enemies move at 60% speed while in mud
- **Vine ladders** look like dangling vines; same function as rope ladders but sway slightly
- **Falling leaves** particle effect (purely visual, low cost)
- Tree-trunk platforms are narrower than current slabs, forcing tighter movement

**Implementation notes:**
- Add `theme: "forest"` to customization / world generation
- `render.js`: `drawTerrainFill` uses a root/grass hatch pattern; tree-trunk platforms drawn as rounded vertical rectangles with branch stubs
- Mud zones: add `mudZones: [{ x, y, width, height }]` to world state; `player.js` checks overlap and applies friction multiplier of 0.4
- `colorThemes.js`: add `forest` palette (dark green/mossy ground, brown trunks, light green foliage)
- No new assets needed — all canvas primitives (arcs for tree canopy, line hatching for bark)

### Option 1B: Volcanic Cavern

**Description:** Deep red-black caves with glow from lava pools below. Platforms are obsidian slabs and cooled magma. Rising heat particles drift upward.

**Gameplay changes:**
- **Lava pools** in the cave floor — standing on them deals 1 damage per 0.5s (triggers invulnerability frame)
- **Crumbling platforms** — after standing on one for 1.5s, it shakes then breaks, dropping the player; respawns after 8s
- **Heat geysers** — periodic upward gusts that boost player and enemy jumps (visual: vertical particle burst)
- Ember particles float upward in hot zones

**Implementation notes:**
- Add `crumblingPlatforms: [{ id, x, y, width, timer }]` to world state
- `terrain.js`: `buildArenaLayout` can place 2-3 crumbling platforms per level in cave/expansion regions
- Lava: add `hazardZones` to world; collision check in `main.js` update loop similar to enemy collision but triggers damage
- Geysers: simple sine-timer activation; apply upward velocity to entities in zone
- `colorThemes.js`: `volcano` palette (dark red/orange/black, glowing yellow accents)

### Option 1C: Neon Cyberpunk

**Description:** Night-time cityscape with neon-outlined platforms, holographic billboards, and pulsing grid patterns in the sky. The line-art style is preserved but every line glows with a single accent color.

**Gameplay changes:**
- **Conveyor belts** on certain platforms — push the player (and enemies) in one direction at 140px/s
- **Holographic platforms** — phase in/out on a 2s cycle, visible 1s then invisible 1s; drawn dashed when fading
- **Electrified walls** — touching the left/right world boundaries deals damage (replaces the gentle stop)
- Data-stream particles flow horizontally across the background

**Implementation notes:**
- `world.conveyors: [{ x, y, width, direction }]` — `player.js` applies forced horizontal movement when standing on one
- `world.hologramPlatforms: [{ id, x, y, width, phase }]` — skip collision when `phase > 0.5`
- Electrified walls: check `player.x < 20 || player.x > world.width - 20` for damage
- `colorThemes.js`: `cyberpunk` palette (magenta/cyan/yellow neon on black)
- Canvas `globalCompositeOperation = "lighter"` for glow effect on platform edges

### Option 1D: Haunted Crypt

**Description:** Underground tomb with skeletal architecture, arched stone passageways, flickering torch light, cobweb-draped corners. Everything drawn with jagged, slightly irregular lines.

**Gameplay changes:**
- **Flickering lights** — visibility pulses (alpha oscillates 0.6–1.0); enemies temporarily invisible in dark phases
- **Phantom platforms** — invisible until stood upon, then they appear and last 3s before fading again
- **One-way drops** — platforms with a sloped visual that allow falling through from above but block from below
- Trapped chests that release a burst of enemies when approached

**Implementation notes:**
- `game.lightLevel` oscillates via sine; `render.js` applies `globalAlpha` to non-player entities
- `phantomPlatforms` behave like regular platforms but with `visible: false` until first contact, then `visibleTimer = 3`
- One-way drops: add `oneWay` flag to platforms; landing logic in `landingSurfaceAt` checks whether the player is moving downward
- `colorThemes.js`: `haunted` palette (bone-white, deep grey, dim purple)

---

## Area 2 — New Monster Types

### Option 2A: Flyer (⏢ Diamond Head)

**Description:** A diamond-shaped head with angular wings. Flies above terrain, ignores ground collision entirely. Cannot be stomped — must be shot down.

**Movement patterns:**
- Hovers at a configurable altitude (160–280px above nearest surface)
- Patrols horizontally in a figure-eight or oval path
- When player is within aggro range (500px), swoops downward in a sine-wave dive, then climbs back
- Swoop telegraph: wings tilt 30° for 0.3s before dive

**Gameplay impact:**
- Forces the player to aim upward or use Specs auto-aim
- Adds vertical threat; no safe "stand and shoot" from ground level
- Multiple flyers cross paths creating shot-timing puzzles

**Notes:**
- `enemies.js`: new `family: "diamond"` with `flying: true` flag; physics skip gravity
- Altitude computed from `groundAt(enemy.x) - enemy.flyAltitude`
- `projectiles.js`: stomp check already guards against non-boots players; add explicit `enemy.flying` skip
- Enemy art in `enemyArt.js`: diamond shape with two angled wing lines

### Option 2B: Burrower (⬠ Pentagon Head)

**Description:** A pentagon head that spends most of its time underground. Surfaces periodically to attack or reposition. Leaves a subtle dirt ripple when moving underground.

**Movement patterns:**
- **Buried phase (4s):** Moves freely underground at 80px/s. Player sees only a faint dashed outline or dirt particles.
- **Emergence telegraph (0.6s):** Dirt piles up (3 small arcs drawn at surface), then enemy pops up.
- **Active phase (2.5s):** Chases player at ground level, can be attacked.
- **Submerge telegraph (0.4s):** Sinks back down, invulnerable during descent.

**Gameplay impact:**
- Adds uncertainty — player must watch for ground disturbances
- Burrowers can flank by passing under platforms
- Rewards players who watch the terrain rather than just the enemy layer

**Notes:**
- Enemy state machine: `phase: "buried" | "emerging" | "active" | "submerging"`
- `enemies.js`: `updateBurrower()` switches phase based on timers
- Buried movement: `enemy.x += enemy.aiDirection * 80 * dt` — no gravity, passes through terrain
- Surface detection: when emerging, find `groundAt(enemy.x)` and snap to it
- `render.js` / `enemyArt.js`: draw dotted ripple line when buried, full pentagon when active

### Option 2C: Charger (▶ Arrow Head)

**Description:** Arrow-shaped head pointing in its facing direction. Stationary or slow-walking until it locks on, then charges in a straight line at high speed.

**Movement patterns:**
- **Patrol phase:** Slow wander (30px/s), or stands still facing the player
- **Lock-on telegraph (0.8s):** Screen shake (small camera offset), enemy flashes, a dotted "charge line" appears in the direction of travel
- **Charge phase:** Dashes at 500px/s for 600px or until hitting a wall. Deals 2× damage on hit. Cannot turn during charge.
- **Stun phase (1.5s):** If the charger hits a wall or another enemy, it's briefly stunned and vulnerable

**Gameplay impact:**
- High-risk, high-reward: easy to dodge but punishing if hit
- Can be baited into walls for a free kill
- Teaches the player to pay attention to telegraphs

**Notes:**
- Enemy state: `phase: "patrol" | "lock" | "charging" | "stunned"`
- `enemies.js`: `updateCharger()` — lock phase sets `enemy.chargeVx`, `enemy.chargeVx` direction; charge phase ignores normal AI and moves at fixed velocity
- Collision with terrain: check `enemy.x` against `minX`/`maxX`; on out-of-bounds, switch to stunned
- Screen shake: `game.shakeTimer = 0.3; game.shakeIntensity = 4` — applied in `render.js` camera transform

### Option 2D: Sniper (⬡ Hexagon Head)

**Description:** A hexagon head on a thin stalk. Stationary — rooted to its spawn platform. Fires slow, high-damage projectiles at the player with a visible laser sight.

**Movement patterns:**
- **Rooted:** Does not move from its spawn position, but rotates to face the player
- **Tracking phase (1.2s):** A thin red laser line (dotted) extends from the sniper to the player's current position; it updates continuously
- **Fire:** Shoots a large, slow projectile (300px/s) along the laser line
- **Cooldown (3s):** Laser disappears, sniper recharges

**Gameplay impact:**
- Creates "zones of denial" — areas the player must pass through carefully
- Laser sight gives clear warning and teaches dodge timing
- Prioritizing snipers becomes a tactical choice

**Notes:**
- Enemy state: `phase: "tracking" | "firing" | "cooldown"`
- Laser line: `render.js` draws a dotted line from enemy to player when `phase === "tracking"` or `"firing"`
- Projectile: large radius (16px), slow speed, high damage equivalent to 2 ammo loss
- Enemy blocks (square family) can body-block sniper shots

---

## Area 3 — 6 Additional Weapon Types

### Option 3A: Shotgun (Spread Shot)

**Description:** Fires 5 pellets in a fixed 30° fan pattern. Each pellet does standard damage. Short effective range (~400px before pellets fade).

**Gameplay changes:**
- Devastating at close range (all 5 pellets can hit one large enemy)
- Weak at distance
- Ammo cost: 1 shot = 3 ammo (fires 5 pellets but uses more resources)
- Pellet spread is symmetrical and consistent (not random)

**Implementation notes:**
- `weaponType: "shotgun"` in `weapons.js`
- `projectiles.js`: `shoot()` loops 5 times, each with angle offset of `(-0.3 .. +0.3)` rad from aim direction
- Each pellet has `life: 0.4` (short range)
- Uses `velocityFromDirection` with rotated vectors
- Weapon art: short wide barrel with flared end

### Option 3B: Grenade Launcher

**Description:** Fires a large arcing projectile that explodes on contact with terrain or after 1.5s. Explosion deals area damage to all enemies within 120px.

**Gameplay changes:**
- Indirect fire — can hit enemies behind cover or on upper platforms
- Area damage clears groups
- Self-damage risk at close range (loses 2 ammo if caught in own blast)
- Slow fire rate (0.6s cooldown)

**Implementation notes:**
- Projectile has `gravity: world.gravity * 0.3` (heavy arc)
- On terrain collision or `life <= 0`, trigger `addExplosion(x, y, 120)` in `effects.js`
- Explosion loops enemies within radius and calls `defeatEnemy` for each
- Visual: large circle that expands and fades (drawn with increasing radius, decreasing alpha)
- Add `projectile.explosive: true` flag

### Option 3C: Boomerang

**Description:** Throws a curved projectile that travels outward ~500px then returns to the player. Hits enemies on both the outgoing and return path.

**Gameplay changes:**
- Ammo-efficient — one shot can hit the same enemy twice
- Requires positioning skill to catch the return (if it hits the player, it's caught automatically)
- Can hit enemies behind the player on the return
- Passes through enemies (club-style hit tracking)

**Implementation notes:**
- Projectile has three phases: `outgoing`, `return`, `caught`
- Outgoing: travels at 600px/s in aim direction for 0.8s or until `travelDist >= 500`
- Return: lerps back to player position over 0.6s
- On player overlap during return, projectile is removed and ammo is refunded by 1
- `hitEnemies: new Set()` like club to avoid multi-hit on same pass
- Visual: curved thick line that rotates (drawn as an arc segment)

### Option 3D: Flame Thrower

**Description:** Short-range continuous stream (8 small fire particles per second) that deals damage-over-time. Range ~250px. Damage ticks once per 0.15s of contact.

**Gameplay changes:**
- Sustained damage — great for groups at close range
- No projectile to dodge — hit-scan within cone
- Ammo drains continuously while firing (4 ammo per second)
- Enemies hit catch fire visually and take 1 extra tick after stream stops

**Implementation notes:**
- `shoot()` creates a burst of 3 projectiles per call with `homing: false`, `life: 0.25`, `radius: 3`
- Each frame while holding Space, if cooldown allows, spawn flame projectiles in a 20° cone
- Projectiles move at 900px/s
- On enemy hit: `enemy.burning = true` with `enemy.burnTimer = 0.5` (damage over time handled in `updateEnemyPositions`)
- Visual: multiple small orange/red dots with slight random offset
- Can be aimed up/down

### Option 3B (Alt): Laser Beam

**Description:** Fires a thin, bright beam that travels at near-instant speed (hit-scan). Pierces through all enemies in a line. Short cooldown (0.08s).

**Gameplay changes:**
- Precision weapon — rewards good aim
- Can line up multiple enemies for multi-kill
- Low ammo efficiency (1 ammo per shot, but only hits what's in a narrow line)
- No arc or gravity — purely straight line

**Implementation notes:**
- Weapon type: `"laser"`
- On shoot, get aim direction, then raycast from player position outward
- `raycastHit(x, y, dx, dy, maxDist)`: step along line, check all enemies, return sorted list
- For each enemy in path, call `defeatEnemy`
- Visual: draw a line from player to hit point or max range, with a brief afterglow particle
- No projectile object needed — pure hit-scan

### Option 3E: Ricochet Shot

**Description:** Fires a small projectile that bounces off walls, platforms, and the ground. Up to 3 bounces. Can hit a different enemy on each bounce.

**Gameplay changes:**
- Excels in tight, enclosed arenas (caves)
- High skill ceiling — bank shots around corners
- Each bounce retains 85% speed
- Visual trajectory line in the customize/practice UI would be helpful

**Implementation notes:**
- Projectile has `bouncesRemaining: 3`
- When `landingSurfaceAt` returns a hit, reflect velocity: `vy = -vy * 0.85`; clamp to minimum speed
- When hitting world x bounds, reflect `vx = -vx * 0.85`
- Each bounce checks enemies again
- `hitEnemies` set prevents re-hit
- Gravity: very light (10% of world gravity) — stays mostly straight

### Option 3F: Deployable Turret

**Description:** Places a stationary turret at the player's current position. Turret automatically fires at the nearest enemy within 400px at 2 shots/second. Lasts 15s or until it fires 20 shots.

**Gameplay changes:**
- Area control — useful for covering a flank or protecting a position
- Ammo-efficient over time (1 ammo to deploy, then free shots)
- Can only have 1 turret active at a time; deploying a new one destroys the old
- Turret can be destroyed by enemies (3 hits)

**Implementation notes:**
- `world.turret = { active, x, y, hp, ammo, timer, target }` in state
- `updateEnemyPositions` loop also checks turret and fires if target in range
- Turret projectiles: low-damage (standard), same projectile pool but tagged `turret: true`
- Visual: small tripod with gun drawn via canvas lines
- `shoot()` with `weaponType: "turret"` places the turret at player's feet

---

## Area 4 — 6 Additional Power-Ups

### Option 4A: Haste (Speed Boost)

**Description:** Increases player movement speed and attack speed.

| Level | Effect |
|-------|--------|
| 1–5 | +12% move speed per level (up to +60% at L5) |
| 6–10 | +1 dash charge per level (L6–10). Dash: tap X + direction to burst 200px in 0.15s, i-frames during dash |

**Gameplay changes:**
- Makes the player feel more responsive and agile
- Dash adds a dodge mechanic — can phase through enemies during burst
- Combos well with Boots for aerial mobility

**Implementation notes:**
- `powerUps.hasteLevel` added to state
- `player.js`: `player.speed * (1 + powerUps.hasteLevel * 0.12)` in movement calc
- Dash: `powerUps.dashCharges`, recharge 8s each; on use, set `player.dashing = true` with 0.15s timer, override velocity, set invulnerable
- HUD: haste icon shows level and dash charge bars
- State.js: add `powerUpPool` entry `"haste"`

### Option 4B: Chrono (Time Slow)

**Description:** Slows down enemy movement and projectile speed in a radius around the player.

| Level | Effect |
|-------|--------|
| 1–5 | 12% slow per level (up to 60% at L5) within 350px |
| 6–10 | Active "Bullet Time" burst (L6–10). Tap X to freeze all enemies & projectiles for 1.5s; 30s cooldown |

**Gameplay changes:**
- Gives the player breathing room in crowded arenas
- Bullet time is a tactical nuke for sticky situations
- Changes the rhythm of combat

**Implementation notes:**
- `powerUps.chronoLevel`, `powerUps.chronoRadius = 350`
- `updateEnemyPositions` and `updateProjectiles` multiply `dt` by `chronoFactor` when enemy/projectile is within range of player
- Bullet time: `game.bulletTimeTimer = 1.5`; when > 0, all enemies get `dt = 0` and all non-player projectiles get `dt *= 0`
- FOV effect: slightly tint screen edge during bullet time
- Charged via icon in HUD

### Option 4C: Shade (Invisibility)

**Description:** Renders the player semi-transparent. Enemies lose aggro and do not actively chase. Attacking breaks invisibility for 1s.

| Level | Effect |
|-------|--------|
| 1–5 | Stealth: enemies within 300px cannot see player (passive). Manual attacks break stealth briefly |
| 6–10 | Ambush: first attack from stealth deals 3× ammo damage to the enemy (bypasses shield block). L6–10 adds +1 ambush charge per level |

**Gameplay changes:**
- Enables a stealthy playstyle
- High reward for positioning
- Ambush mechanic makes Shade + high-damage weapon (Shotgun) a devastating combo

**Implementation notes:**
- `powerUps.shadeLevel`
- `enemies.js`: in reactive AI, check `powerUps.shadeLevel > 0 && distance < 300` — skip aggro
- Visual: player alpha = 0.35 when stealthed, 1.0 for 1s after attacking
- Ambush: `player.ambushActive = true`; on next enemy hit, deal extra damage (set `enemy.ambushed = true` which makes `defeatEnemy` drop 4 ammo instead of 2)
- HUD: shade icon shows stealth status

### Option 4D: Magnet (Magnetism)

**Description:** Pulls ammo drops toward the player from an increased range.

| Level | Effect |
|-------|--------|
| 1–5 | +60px pickup range per level (up to +300px at L5) |
| 6–10 | Auto-collect: ammo drops within range are instantly collected. L6–10 adds radius growth per level |

**Gameplay changes:**
- Reduces downtime hunting for ammo
- makes the run-and-gun playstyle more viable
- Indirectly buffs ammo-hungry weapons like Shotgun and Flame Thrower

**Implementation notes:**
- `powerUps.magnetLevel`
- `main.js` drop collection loop: check `playerDistanceTo(drop) < 42 + powerUps.magnetLevel * 60`
- Auto-collect at L6+: if within range, immediately collect without proximity check
- Visual: subtle faint circle around player at max magnet range (drawn as dashed ring)
- HUD: magnet icon with level display

### Option 4E: Mirror (Clone/Decoy)

**Description:** Creates a clone of the player that draws enemy aggro and explodes after its duration.

| Level | Effect |
|-------|--------|
| 1–5 | Deploy a decoy that lasts 4s. Enemies within 400px target the decoy instead of the player |
| 6–10 | Decoy explodes on expiration, dealing 200px area damage. L6–10 adds explosion radius per level |

**Gameplay changes:**
- Crowd control — redirects enemy attention
- Decoy explosion rewards strategic placement
- Timer-based; requires planning

**Implementation notes:**
- `powerUps.mirrorLevel`, `powerUps.mirrorCharges` (L1: 1 charge, recharges 15s)
- Deploy: press X + down? Or assign to a key. Creates `world.decoy = { x, y, timer, phase }`
- Enemies: in targeting/AI, if decoy exists and is within range, target decoy instead of player
- Visual: decoy looks like player but with dashed lines and slight transparency
- Explosion: reuses `addExplosion` from grenade launcher
- HUD: mirror icon with charge indicator

### Option 4F: Ghost (Phasing)

**Description:** Allows the player to briefly phase through terrain and enemies.

| Level | Effect |
|-------|--------|
| 1–5 | Phase dodge: double-tap A/D to dodge 80px in that direction, intangible during dodge. 3s cooldown per charge |
| 6–10 | Phase walk: hold down + X to sink through thin platforms. L6–10 adds to phase dodge range |

**Gameplay changes:**
- Opens up new movement paths — drop through platforms strategically
- Dodge gives a reliable escape from corners
- High skill expression — phasing through a platform to drop onto an enemy for a stomp

**Implementation notes:**
- `powerUps.ghostLevel`, `powerUps.ghostCharges`
- Phase dodge: track double-tap timing in `input.js`; on activation, set `player.phasing = true`, move 80px, ignore collision for 0.2s
- Phase walk: when ducking on a platform and holding S, descend through it (check in `landingSurfaceAt`: if `powerUps.ghostLevel > 0` and `isDucking()` and previous platform contact, skip landing)
- Visual: player outline drawn dashed during phase, with trailing particles
- HUD: ghost icon

---

## Area 5 — Leaderboard

### Option 5A: localStorage Leaderboard

**Description:** Scores saved to `localStorage` on the player's device. No server needed. Supports up to 20 entries.

**Score calculation:**
`score = (level * 1000) + (ammoRemaining * 50) - (deaths * 200) + (enemiesKilled * 10)`

**Persistence:** `localStorage.setItem("gp_leaderboard", JSON.stringify(entries))`

**Display UI:**
- Simple overlay accessible from title screen ("Leaderboard" option)
- Shows rank, score, level reached, date
- Sortable by score (default) or level

**Pros:** Zero infrastructure, works offline, instant
**Cons:** Per-device only, no cross-device competition

**Implementation notes:**
- `html/src/leaderboard.js`: load/save functions
- `menus.js`: add leaderboard screen state and draw function
- `level.js`: on game over, collect score and prompt for name (or use customization name)
- Score per-level vs total: track total score across runs in `game.totalScore`

### Option 5B: localStorage + Share Code

**Description:** Same as 5A, but generated a alphanumeric share code that encodes the score, level, seed, and weapon. Player can share the code externally.

**Score calculation:** Same as 5A

**Share code format:** `GP-XXXX-XXXX-XXXX` where X chars encode `{score, level, seedHash}` using base36

**Display UI:**
- Game over screen shows "Share Code: GP-A3K2-B7M1-9QZ4"
- Leaderboard screen has "Import Code" option that decodes and adds to local board

**Pros:** Enables friendly competition without infrastructure; codes are short and copy-pasteable
**Cons:** Manual sharing; no automatic global board; codes can be forged

**Implementation notes:**
- `leaderboard.js`: `encodeScore(score, level, seed)` and `decodeShareCode(code)` functions
- Uses simple XOR + base36 encoding
- Code decode adds entry to local leaderboard for comparison

### Option 5C: JSON Server Endpoint

**Description:** A minimal server endpoint (a single Python/Node script or static JSON file) that accepts POST with `{name, score, level, seed}` and returns a sorted leaderboard.

**Score calculation:** Same as 5A

**Persistence:** Simple JSON file on server, read/write on each request

**Display UI:**
- Leaderboard screen fetches from server, displays top 50
- Shows "Daily", "Weekly", "All-Time" tabs filtered on server

**Pros:** True global leaderboard; time-based filtering
**Cons:** Requires a server or serverless function; adds latency; moderation needed

**Implementation notes:**
- Server script: `leaderboard-server.py` (single file, Python built-ins only)
- Endpoints: `GET /leaderboard?period=daily|weekly|alltime&limit=20`, `POST /leaderboard` with JSON body
- On client: `fetch()` in `leaderboard.js`
- Menus: add loading spinner state

### Option 5D: Daily Seed Challenge

**Description:** A fixed world seed generated from the current date. All players on a given day play the same level layout. Score is tracked locally only, but the same-seed concept enables fair comparison via share codes (Option 5B).

**Score calculation:** Same base + "time survived" bonus

**Implementation:**
- `customization.dailySeed = true` uses `Date.now()` floored to day as the world seed
- Title screen shows "Daily Challenge" as a separate option from "New Game"
- Local leaderboard has a "Daily" section that resets each day
- Share codes from daily runs can be compared since the seed is identical

**Pros:** Fair competition without a server; built-in variety; FOMO drives replay
**Cons:** No live ranking without share codes

**Implementation notes:**
- `state.js`: `game.dailySeed = Math.floor(Date.now() / 86400000)`
- `terrain.js`: use `dailySeed` instead of customization-based seed when `customization.dailyChallenge` is active
- Draw a small calendar icon on the HUD during daily runs

---

## Area 6 — AI Logic for New Monsters

All AI described here corresponds to the monsters from Area 2.

### 6A — Flyer AI (Diamond)

**State machine:**
```
PATROL → AGGRO_DIVE → CLIMB → PATROL
              ↓ (miss)
           RESET
```

**Details:**
- **Patrol:** Moves horizontally at 60px/s between `minX` and `maxX`. Altitude = `groundAt(enemy.x) - 200`. Added per-frame sine offset of 20px for natural floating.
- **Aggro trigger:** Player enters 500px horizontal range AND is on a surface within 300px vertical of the flyer's altitude.
- **Dive:** Flyer drops at 400px/s toward player's current X, reaching to `groundAt(player.x) - 40` altitude. Wings angle down.
- **Attack on dive pass:** If flyer passes within `radius + 30` of player, deals standard hit damage.
- **Climb:** After dive completes (reached low altitude or passed player X), climbs back to patrol altitude at 250px/s.
- **Multiple flyers:** Phase offset by 180° so dives alternate rather than synchronize.

**Telegraph:** 0.3s hover pause before dive, wings tilt.

**Phase transitions:**
- `diveTimer > 0.8` or `distance to player < 40` → switch to CLIMB
- `climbTimer > 0.5` or `altitude >= patrolAltitude` → switch to PATROL

### 6B — Burrower AI (Pentagon)

**State machine:**
```
BURIED → EMERGE → ACTIVE → SUBMERGE → BURIED
```

**Details:**
- **Buried:** Moves freely at 80px/s. Can pass under platforms. Moves toward a random point that is within 200px of player's last known position. Player sees only faint terrain disturbance (moving dirt particles).
- **Emerge:** Snaps to ground surface at current X. Plays 0.6s emergence animation (dirt particles + small ground deformation drawn as extra terrain lines).
- **Active:** Standard chase AI (bold) for 2.5s. Can be attacked. Moves at 90px/s.
- **Submerge:** 0.4s sink animation, becomes invulnerable. Returns to BURIED.
- **Re-emerge position:** Always different from last emerge by at least 200px.

**Aggro range:** 600px (detects player while buried), burrows toward player if within range.

**Pack coordination:** When 2+ burrowers are active, they stagger their emerge/submerge cycles so at least one is always above ground.

### 6C — Charger AI (Arrow)

**State machine:**
```
PATROL → LOCK_ON → CHARGE → STUNNED → PATROL
```

**Details:**
- **Patrol:** Slow wander at 30px/s within spawn bounds. Faces player if visible.
- **Lock-on:** Player must be within 450px and roughly same surface level. 0.8s telegraph: enemy flashes 3 times, emits directional dotted line showing charge path. Camera shakes subtly.
- **Charge:** Moves at 500px/s in the locked direction for 600px max. Ignores terrain collision (passes through other enemies). Deals standard hit damage + knockback.
- **Stunned:** If charge hits a wall (`enemy.x <= minX` or `enemy.x >= maxX`) or another enemy: 1.5s stun, enemy spins, vulnerable.
- **Miss recovery:** If charge completes 600px without hitting anything: 0.5s recovery (slow turn), return to PATROL.

**Aggro range:** 450px, line-of-sight (same surface or vertical diff < 100px).

**Environment interaction:** Charger can be baited into crumbling platforms (volcanic theme) to destroy them early, or into lava pools.

### 6D — Sniper AI (Hexagon)

**State machine:**
```
IDLE → TRACKING → FIRE → COOLDOWN → IDLE
```

**Details:**
- **Idle:** Rooted in place. Rotates to face player if player is within 800px. No other movement.
- **Tracking:** Player enters 800px range AND sniper has line-of-sight (same surface or vertical diff < 150px). Draws a laser sight line (dotted, 1px) from sniper to player for 1.2s. Line updates as player moves.
- **Fire:** Shoots a large (16px radius) projectile at 300px/s along the last laser direction. Projectile has heavy gravity (0.4× world gravity) so it arcs slightly.
- **Cooldown:** 3.5s. No laser, no tracking.
- **Sniper projectile:** Deals standard hit damage, but also knocks player back 300px.

**Telegraph:** Very clear — the laser line is visible to the player for the full 1.2s tracking phase.

**Environmental interaction:** Sniper cannot fire if a solid platform or another enemy blocks the laser line. Projectile can be body-blocked by square enemies.

### Boss AI Concept (Bonus)

For a future boss encounter (not in Sprint-001 scope), consider a **multi-phase arena guardian**:

- **Phase 1:** Charges (like Charger) across the arena floor, stops at walls, shoots 3-way spread
- **Phase 2 (70% HP):** Gains flight (like Flyer), drops homing mines on the ground
- **Phase 3 (40% HP):** Roots in center, spawns burrower minions, fires aimed laser at player
- **Phase transitions:** Brief invulnerability window, screen flash, arena shape changes

---

## PM Recommendation — Sprint-001 Priority

### Tier 1 — Highest Impact, Lowest Risk (Do First)

| Area | Option | Rationale |
|------|--------|-----------|
| **1** | **1A — Forest Canopy** | Simplest terrain theme to implement (mud patches + vine visuals). Adds immediate visual variety with minimal code changes. Palette-friendly. |
| **2** | **2A — Flyer** | The PM explicitly asked for flying enemies. Diamond head uses existing drawing primitives. Cannot be stomped, which forces interesting tactical shifts. |
| **2** | **2B — Burrower** | The PM explicitly asked for burrowing enemies. The pentagon state machine is self-contained and introduces a new "surface" dynamic. |
| **3** | **3A — Shotgun** | Straightforward spread mechanic using existing projectile infrastructure. Dramatically changes feel of combat. |
| **3** | **3C — Boomerang** | Reuses club's multi-hit tracking. Adds ammo economy depth. Fun and satisfying. |
| **4** | **4A — Haste** | Simplest new power-up mechanistically — just speed scaling + optional dash. High player satisfaction. |
| **5** | **5A — localStorage LB** | The only option that requires zero infrastructure. Immediate win for player retention. |
| **6** | **6A + 6B AI** | Directly implements AI for the new monster types chosen above. Self-contained per-enemy state machines. |

### Tier 2 — Strong Value, Moderate Complexity (Sprint-002)

| Area | Option | Rationale |
|------|--------|-----------|
| **1** | **1B — Volcanic Cavern** | Hazard zones and crumbling platforms add mechanical depth. Good second theme. |
| **3** | **3B — Grenade Launcher** | Explosion system opens up area-of-effect design for future content too. |
| **4** | **4D — Magnet** | Changes the ammo economy without complex state. Solves "no ammo" frustration. |
| **5** | **5D — Daily Seed** | Quick win that drives replayability. Uses same seed system already in place. |

### Tier 3 — Ambitious, Needs Polish (Future)

| Area | Option | Rationale |
|------|--------|-----------|
| **1** | **1C — Cyberpunk / 1D — Haunted** | More complex visuals; conveyor belts and flickering light need renderer changes. |
| **2** | **2C — Charger / 2D — Sniper** | Charger needs screen shake system; Sniper needs ranged enemy framework. Both possible but better after flyer/burrower prove the new-enemy pipeline. |
| **3** | **3D — Flame / 3E — Ricochet / 3F — Turret** | All three require new mechanics (DoT, bounce physics, deployable entities). Individually great, but scope risk for Sprint-001. |
| **4** | **4B — Chrono / 4C — Shade / 4E — Mirror / 4F — Ghost** | Each needs its own state machine and UI. Best added one per sprint after the core new-power-up pipeline is proven by Haste. |
| **5** | **5B — Share Codes / 5C — Server** | Nice to have, but 5A gives 80% of the value at 5% of the cost. |
| **6** | **6C + 6D AI** | Implement alongside the charger/sniper monster types when they're added. |

### Sprint-001 Summary

**8 features, estimated ~3–4 engineering sprints:**

1. Forest theme with mud patches
2. Flyer enemy (Diamond head)
3. Burrower enemy (Pentagon head)
4. Shotgun weapon
5. Boomerang weapon
6. Haste power-up
7. localStorage leaderboard (+ score tracking)
8. AI for Flyer and Burrower

This selection gives the PM maximum visible progress: two new enemies (including the two explicitly requested), two new weapons that feel dramatically different, a power-up that immediately changes how the game feels, a new visual theme, and a leaderboard for retention. Everything stays within vanilla JS/Canvas constraints and is Godot-port-compatible.
