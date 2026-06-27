# Sprint-002 Technical Spec — Game Pending

> **Target**: Engineers
> **Source**: Design Brief 002 (PM-approved features)
> **Status**: Ready for implementation

---

## Assumed Codebase Structure (from Sprint-001)

Since Sprint-001 delivers the core game skeleton, this spec assumes the following files exist:

```
src/
├── game.js              # Main game loop, state machine
├── player.js            # Player physics, input, health
├── weapons.js           # Weapon definitions, projectile logic
├── enemies.js           # Enemy families, movement AI, spawn rules
├── enemyArt.js          # Enemy sprite/drawing functions
├── render.js            # World rendering, camera, layers
├── terrain.js           # Platform/tile drawing, collision geometry
├── colorThemes.js       # Palette definitions per theme
├── effects.js           # Particles, screen shake, visual FX
├── hud.js               # Health bar, ammo display, score
├── world.js             # World state: platforms, zones, pickups
└── data/
    └── dialogue.js      # Text pools for enemies (future use)
```

---

## Feature 1: Question Mark Weapon

### Overview

A weapon that applies a "philosophical crisis" debuff — enemies stop to ponder, then enrage. Functions as a setup tool, not a damage dealer.

### Files to Modify

| File | Change |
|------|--------|
| `src/weapons.js` | Add `"question"` weapon type definition |
| `src/enemies.js` | Add debuff timers and damage multiplier logic to enemy hit processing |
| `src/enemyArt.js` | Add floating "?" and red glow rendering for debuffed enemies |
| `src/hud.js` | No changes required (ammo display already generic) |
| `src/game.js` | Wire weapon cooldown into update loop |

### New State

#### Weapon definition in `weapons.js`

```js
{
  type: "question",
  name: "Question Mark",
  ammoCost: 2,
  cooldown: 600, // ms
  damage: 0,     // no direct damage
  projectileSpeed: 5,
  projectileLifetime: 1200, // ms
  debuffDuration: 800,      // ms — pondering phase
  enrageDuration: 2000,     // ms — enrage phase
  damageMultiplierDuringPonder: 2,
  enrageSpeedMultiplier: 2,
  enrageDamageMultiplier: 2
}
```

#### Enemy debuff state (added per enemy instance)

```js
enemy.philosophizing = 0    // countdown timer in ms; >0 = pondering
enemy.enraged = 0           // countdown timer in ms; >0 = enrage active
```

### Drawing Requirements

#### Projectile (`enemyArt.js` or `render.js`)

- Glowing "?" character drawn with `ctx.font` and `ctx.fillText`
- Subtle radial gradient glow behind the character (gold/yellow hue)
- Slight rotation oscillation as it travels (±15° sinusoidal)

#### Pondering enemy (`enemyArt.js`)

- Floating `"..."` thought bubble above enemy head
- Thought bubble: small rounded rect with 3 trailing circles (standard comic style)
- Inside bubble: rotating tiny "?" marks (2–3 chars cycling)
- Enemy sprite: slight vertical bob (pause animation) — not fully static

#### Enraged enemy (`enemyArt.js`)

- Red outer glow applied via `ctx.shadowColor = '#ff0000'` and `ctx.shadowBlur = 12`
- Enemy sprite tinted red via `ctx.globalCompositeOperation = 'source-atop'` or `ctx.filter = 'hue-rotate(180deg)'`
- No thought bubble during enrage

### Logic Rules

#### On projectile hit (`enemies.js` — `processHit(enemy, weapon)`)

```
1. Set enemy.philosophizing = weapon.debuffDuration
2. Set enemy.enraged = 0  (clear any existing enrage)
3. Apply zero direct damage (weapon.damage === 0)
```

#### During update loop (`enemies.js` — `updateEnemy(enemy, dt)`)

```
IF enemy.philosophizing > 0:
  - Decrement timer by dt
  - Freeze enemy movement (skip AI movement code)
  - Skip enemy attack logic
  - When timer reaches 0:
    → Set enemy.enraged = weapon.enrageDuration
    → Clear enemy.philosophizing

IF enemy.enraged > 0:
  - Decrement timer by dt
  - Apply enrageSpeedMultiplier to movement
  - Apply enrageDamageMultiplier to outgoing damage
  - When timer reaches 0:
    → Clear enemy.enraged
    → Reset to normal behavior
```

#### Damage calculation (existing hit registration)

```
incomingDamage = baseDamage
IF enemy.philosophizing > 0:
  incomingDamage *= damageMultiplierDuringPonder
```

### Dependencies

- **Weapon system must exist** from Sprint-001 (weapon definitions, cooldown logic, projectile spawning)
- **Enemy hit processing** must already have a `processHit()` or equivalent function
- **HUD ammo display** already generic — no changes needed

---

## Feature 2: Tutorial Ghost Enemy

### Overview

A floating ghost enemy with a 3-phase state machine: advice → frustrated → attack. Gives inverted (wrong) tips, gets angry when ignored, then chases the player.

### Files to Modify

| File | Change |
|------|--------|
| `src/enemies.js` | Add `"ghost"` family, spawn logic, state machine |
| `src/enemyArt.js` | Ghost shape rendering (wavy bottom, translucent) |
| `src/render.js` | Speech bubble rendering layer (above enemies) |
| `src/data/dialogue.js` | New file — dialogue pools for advice and frustrated phases |
| `src/game.js` | Spawn trigger (every Nth enemy, like Mirror) |

### New State

#### Enemy family definition in `enemies.js`

```js
{
  family: "ghost",
  movement: "ghost",
  health: 3,
  damage: 1,
  speed: 1.5,
  hoverHeight: 60,        // px above ground
  followDistance: 120,    // px from player during advice phase
  advicePhaseMaxBubbles: 2,
  frustratedPhaseMaxBubbles: 2,
  attackPhaseSpeed: 2.5,
  spawnWeight: 0.1        // ~10% chance per eligible spawn
}
```

#### Per-instance state

```js
enemy.phase = "advice"           // "advice" | "frustrated" | "attack"
enemy.bubbleCount = 0            // total speech bubbles shown
enemy.adviceBubbleCount = 0      // bubbles shown in advice phase
enemy.frustratedBubbleCount = 0  // bubbles shown in frustrated phase
enemy.dialogueIndex = 0          // current index into dialogue pool
enemy.dialoguePool = []          // shuffled array of dialogue lines
enemy.speechBubble = null        // { text, timer, x, y, angry: bool }
```

### Drawing Requirements

#### Ghost shape (`enemyArt.js`)

```
- Body: semi-transparent white/blue oval (globalAlpha = 0.6)
- Bottom edge: wavy sine curve (3–4 bumps) instead of flat
- Two small oval eyes (dark)
- Optional: graduation cap (small square + rectangle on top)
- Hover: vertical sine oscillation (±8px, ~1Hz)
```

#### Speech bubble (`render.js`)

```
- Rounded rectangle with tail pointing to ghost
- Normal phase: white fill, Comic Sans-like font (ctx.font = "14px Comic Sans MS, cursive, sans-serif")
- Frustrated phase: red border, ALL CAPS text, slightly larger font
- Timer-based: appears for 3s, then fades out over 0.5s
- Position: above ghost, offset by -40px Y
```

### Dialogue Pools (`data/dialogue.js`)

#### Advice pool (15–20 lines)

```js
export const ghostAdvicePool = [
  "Press X to fall faster",
  "Stand still to dodge attacks",
  "Collect fewer ammo drops",
  "Jump into the spikes, they're safe",
  "The red enemy is friendly, high five it",
  "Dodge left is always wrong",
  "Don't pick up that health pack",
  "Shooting backwards does more damage",
  "The floor is lava... wait, no it isn't",
  "Crouch under the low ceiling",
  "Always stay near the edge",
  "The boss is scared of you, rush in",
  "Ignore your health bar, it's fake",
  "Walls are just suggestions",
  "Gravity works differently here"
];
```

#### Frustrated pool (5–8 lines)

```js
export const ghostFrustratedPool = [
  "FINE, DON'T LISTEN. SEE IF I CARE.",
  "YOU'RE NOT VERY GOOD AT THIS.",
  "I'VE BEEN TRYING TO HELP, BUT OKAY.",
  "MAYBE TRY ACTUALLY LISTENING FOR ONCE.",
  "I'M NOT MAD, I'M JUST DISAPPOINTED.",
  "WHY DO I EVEN BOTHER?",
  "FINE. DIE THEN. SEE IF I CARE.",
  "YOU'RE GOING TO REGRET IGNORING ME."
];
```

### Logic Rules — State Machine

#### `updateGhostEnemy(enemy, player, dt)`

```
PHASE: ADVICE
  - Hover above ground at hoverHeight
  - Follow player at followDistance (horizontal only, smooth interpolation)
  - Every 4–6 seconds, display a speech bubble with advicePool[dialogueIndex % pool.length]
  - Increment bubbleCount and adviceBubbleCount
  - If adviceBubbleCount >= advicePhaseMaxBubbles:
    → Transition to "frustrated"
    → Shuffle dialoguePool for frustrated lines

PHASE: FRUSTRATED
  - Continue hovering and following
  - Display frustrated lines in ALL CAPS
  - Every 3–4 seconds, display a frustrated speech bubble
  - Increment bubbleCount and frustratedBubbleCount
  - If bubbleCount >= (advicePhaseMaxBubbles + frustratedPhaseMaxBubbles):
    → Transition to "attack"

PHASE: ATTACK
  - Drop to ground level
  - Chase player aggressively (circle family AI)
  - Attack on contact (melee)
  - No more speech bubbles
```

#### Spawn trigger (`game.js`)

```
- Ghost spawns on the same cadence as the Mirror enemy
- Spawn check: enemyCounter % spawnInterval === 0
- Ghost replaces the normal enemy for that spawn (not additive)
- Max 1 ghost alive at a time
```

### Dependencies

- **Enemy family system** must exist from Sprint-001 (family definitions, movement types)
- **Circle AI** must exist from Sprint-001 (aggressive chase behavior)
- **`data/dialogue.js`** is a new file — no existing dependencies
- **Speech bubble rendering** is additive to `render.js` — no conflicts

---

## Feature 3: Forest Canopy Level Theme

### Overview

A visual terrain theme with mud zones, vine ladders, falling leaf particles, and tree-trunk platforms. Controlled by the `customization.colorTheme` setting.

### Files to Modify

| File | Change |
|------|--------|
| `src/colorThemes.js` | Add `"forest"` palette entry |
| `src/world.js` | Add `mudZones` array to world state |
| `src/player.js` | Apply friction multiplier when on mud |
| `src/enemies.js` | Apply friction multiplier when enemies on mud |
| `src/terrain.js` | Vine ladder rendering variation |
| `src/render.js` | Tree-trunk platform drawing, conditional on theme |
| `src/effects.js` | Leaf particle effect, conditional on theme |

### New State

#### Palette in `colorThemes.js`

```js
forest: {
  ground: "#3d2b1f",        // dark brown mud
  groundAccent: "#5c4033",  // lighter mud
  platform: "#2d5016",      // dark green moss
  platformAccent: "#4a7c28", // light green foliage
  trunk: "#5c3d2e",         // brown bark
  trunkAccent: "#8b6914",   // lighter bark
  leaf: "#6b8e23",          // olive green
  leafAccent: "#9acd32",    // yellow-green
  sky: "#1a3a1a",           // dark forest canopy
  vine: "#228b22",          // forest green
  mud: "#3d2b1f",           // same as ground
  mudHighlight: "#5c4033",
  text: "#f0e68c",          // khaki for readability
  textShadow: "#1a1a0a"
}
```

#### Mud zones in `world.js`

```js
world.mudZones = [
  { x: 500, y: 0, width: 120, height: 40 },   // top-left mud patch
  { x: 1200, y: 80, width: 80, height: 30 },   // elevated mud
  // ... more defined per level layout
]
```

#### Friction constant

```js
const MUD_FRICTION = 0.6;  // 60% speed on mud
```

### Drawing Requirements

#### Tree-trunk platforms (`render.js`)

```
IF colorTheme === "forest":
  - Platform drawn as rounded vertical rectangle (not flat bar)
  - Width: 30–50px (varies per platform)
  - Height: platform height * 1.5
  - Bark texture: 2–3 horizontal lines (branch stubs)
  - Crown: oval canopy of leaves above platform
  - Color: trunk + trunkAccent palette colors
ELSE:
  - Draw platforms normally (flat colored bars)
```

#### Vine ladders (`terrain.js`)

```
IF colorTheme === "forest":
  - Instead of straight vertical lines (standard ladder)
  - Draw as sinuous vine: ctx.beginPath() with bezierCurveTo
  - Small leaves attached at intervals (every 20px)
  - Color: vine palette color
  - Width: 4px stroke + leaf sprites
ELSE:
  - Draw standard ladder (two parallel lines with rungs)
```

#### Mud zones (`terrain.js` or `render.js`)

```
IF colorTheme === "forest":
  - Draw mud patches as ground-level rectangles
  - Color: mud + mudHighlight
  - Subtle darker speckle pattern (5–10 small dots per zone)
  - Slight depression effect: darker at bottom edge
```

#### Leaf particles (`effects.js`)

```
IF colorTheme === "forest":
  - Spawn 1 leaf particle every 3–5 seconds
  - Leaf: small rotated ellipse (4×6px) with leaf color
  - Motion: drift downward with slight horizontal wobble (sine wave)
  - Rotation: slow spin (0.5–1 rad/s)
  - Lifetime: 4–6 seconds, fade out in last 1s
  - Spawn position: random X across visible screen, Y = -10 (above viewport)
  - Max particles: 5 on screen at once
```

### Logic Rules

#### Player mud friction (`player.js`)

```
IF world.mudZones.length > 0:
  FOR EACH zone in world.mudZones:
    IF player.x > zone.x AND player.x < zone.x + zone.width
       AND player.y is within zone.y range:
      Apply MUD_FRICTION to horizontal movement:
        player.vx *= MUD_FRICTION
        player.moveSpeed *= MUD_FRICTION
      Break (only one mud zone at a time)

IF NOT on mud:
  Restore normal moveSpeed
```

#### Enemy mud friction (`enemies.js`)

```
FOR EACH enemy:
  IF enemy touches a mudZone:
    enemy.speed *= MUD_FRICTION
```

### Dependencies

- **Color theme system** must exist from Sprint-001 (`customization.colorTheme`)
- **World state** must already support zone arrays
- **Particle system** must exist from Sprint-001 (for leaf FX)
- **Player movement** must already have a `moveSpeed` property
- **Theme is purely additive** — all rendering changes are conditional on `colorTheme === "forest"` and won't affect existing themes

---

## Dependency Order (Build Sequence)

### Phase 1: Foundation (no inter-feature deps)

1. **Color theme `"forest"` palette** — pure data, no logic
2. **`data/dialogue.js`** — pure data, no logic
3. **Mud zone world state** — extend `world.js` schema
4. **Enemy debuff timers** — extend enemy instance state

### Phase 2: Feature 1 — Question Mark Weapon

Depends on: Phase 1 step 4 (enemy debuff state)
1. Add weapon definition to `weapons.js`
2. Add debuff processing to `enemies.js` `processHit()`
3. Add debuff timer decrement to `enemies.js` `updateEnemy()`
4. Add damage multiplier to hit calculation
5. Add projectile rendering to `enemyArt.js`
6. Add ponder/enrage visual effects to `enemyArt.js`
7. Test: fire weapon, verify ponder → enrage cycle

### Phase 3: Feature 2 — Tutorial Ghost Enemy

Depends on: Phase 1 step 2 (dialogue data)
1. Add `"ghost"` family to `enemies.js`
2. Implement `updateGhostEnemy()` state machine
3. Implement ghost movement AI (hover + follow)
4. Add ghost shape drawing to `enemyArt.js`
5. Add speech bubble rendering to `render.js`
6. Wire spawn trigger to `game.js`
7. Test: spawn ghost, verify phase transitions

### Phase 4: Feature 3 — Forest Canopy Theme

Depends on: Phase 1 steps 1, 3 (palette, mud zones)
1. Add `"forest"` palette to `colorThemes.js`
2. Add `mudZones` support to `world.js`
3. Add mud friction to `player.js`
4. Add mud friction to `enemies.js`
5. Add tree-trunk platform rendering to `render.js`
6. Add vine ladder rendering to `terrain.js`
7. Add leaf particle effect to `effects.js`
8. Test: set theme to `"forest"`, verify all visuals and mud physics

### Cross-Feature Interactions

| Interaction | Resolution |
|---|---|
| Ghost on mud | Ghost hovers — mud doesn't affect it (ground-based only) |
| Ghost hit by Question Mark | Ghost enters ponder state, takes 2x damage, enrages, then continues attack phase if alive |
| Ghost in forest theme | Ghost renders with ghost art (translucent) — theme doesn't affect ghost visuals |
| Question weapon ammo + forest | No interaction — ammo is player-side, not theme-dependent |

---

## Open Questions

1. **Ghost spawn cadence**: Same as Mirror? The design brief says "every Nth enemy" but doesn't specify N. Recommend: same interval as Mirror for Sprint-002, tune later.

2. **Question weapon ammo regeneration**: Design brief says "regenerates slowly" but the PM spec says 2 ammo per shot with no mention of regen. Recommend: ammo is fixed (no regen) for Sprint-002, regen can be added in Sprint-003.

3. **Mud zone authoring**: How are mud zones defined per level? Options: (a) hardcoded in level data, (b) placed in a level editor, (c) procedurally generated. Recommend: hardcoded in `world.js` level data for Sprint-002.

4. **Leaf particle performance**: 5 particles max, 1 spawned every 3–5s. Should be negligible. If performance is a concern, reduce max to 3.

5. **Ghost dialogue pool ownership**: The design brief says 50+ inverted advice lines, but the PM spec says 15–20 for advice + 5–8 frustrated. Recommend: start with 15 advice + 8 frustrated (PM spec), expand to 50+ in later sprints.

---

*End of Sprint-002 Spec*
