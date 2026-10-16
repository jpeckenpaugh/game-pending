# Game Pending

A small HTML5 Canvas side-scroller built with vanilla JavaScript and ES modules. The default Classic presentation is black-and-white line art, with optional color themes for the world, opponents, gear, weapons, attacks, and drone. There is no build step and no package dependency required for normal development.

## Latest browser demo

The main-branch Pages deployment runs the headless browser smoke test before publishing the site. A successful run publishes an approximately 30-second WebM app showcase—from the title screen through Customize and into active gameplay—plus all six smoke-test screenshots. A failed run does not deploy and retains its test artifacts in GitHub Actions for 14 days.

[![Open the latest gameplay demo](https://jpeckenpaugh.github.io/game-pending/demos/latest/03-game-start.png)](https://jpeckenpaugh.github.io/game-pending/demos/latest/demo.webm)

[View the title-screen screenshot](https://jpeckenpaugh.github.io/game-pending/demos/latest/01-title.png) · [View the movement screenshot](https://jpeckenpaugh.github.io/game-pending/demos/latest/04-movement.png) · [Open the WebM demo](https://jpeckenpaugh.github.io/game-pending/demos/latest/demo.webm)

## Run

From the repository root:

```sh
python3 -m http.server 8000 -d html
```

Then open:

```text
http://localhost:8000/
```

The app uses JavaScript modules, so serve it over HTTP instead of opening `index.html` directly from the filesystem.

## Browser smoke test

Run `./test-runner/run.sh` from the repository root. Docker builds and runs a separate headless Playwright 1.55.0 container with its matching Chromium version. It serves the current `html/` working tree and runs a keyboard-only smoke workflow: change the color theme, start a seeded game, move/jump/fire, then pause and resume. In parallel with those assertions, the recording showcases the full flow from initial title load through Customize and active gameplay, targeting 30 seconds total; `ffprobe` validates the finalized video is 29–32 seconds. The command exits nonzero if an assertion, browser error, or video-duration check fails.

Screenshots (`01-title.png` through `06-resumed.png`), `demo.webm`, `result.json`, and a failure screenshot when available are written to the ignored `test-artifacts/` directory, including on failed runs. The read-only test state hook and deterministic random seed are enabled only when the runner opens the game with `?test=1`.

This is a basic workflow smoke test, not comprehensive gameplay or visual-regression coverage; screenshots are evidence for inspection, not pixel-diff assertions.

## Controls

- `A` / `D` or Left / Right: move
- X: jump; hold after a Boots tier-two jump apex to rocket glide
- `W` / Up: aim upward or climb up ladders
- `S` / Down: duck, aim downward when airborne or climbing, climb down ladders, or enter a ladder from above
- Space: attack with the selected weapon
- Enter: pause / activate menu selection
- `G`: open a three-choice power-up picker while playing; pressing `G` again in that picker auto-grants one shown power and rerolls
- `R`: restart while playing or after game over

Menus support Up / Down / Left / Right / Enter. The power-up picker also supports `1`, `2`, and `3`. Customize supports Esc to cancel or leave submenus, Tab / Shift+Tab to move between fields, and Ctrl/Cmd+Enter to save.

After clearing a level, choose one of three offered power-ups before the next wave starts.

## Customize

Customize can change the game name, tagline, starting level, target FPS (`Auto`, `5`, `10`, `15`, `30`, `60`, or `120`), weapon (`Gun`, `Club`, or `Wand`), opponent behavior (`Simple`, `Random`, `Bold`, `Shy`, or `Mixed`), spawning locations (`Standard` or `Randomized`), and world generation (`Seeded` or `Random`).

Appearance settings include:

- Template presets: `Classic`, `Emoji (Color)`, `Aquatic`, `Farm`, and `Robot`. Templates currently update player and opponent head/face settings only; choosing individual head or face fields returns the template label to `Custom`.
- Color themes: `Classic`, `Natural`, `Sunset`, `Arcade`, and `Pastel`. `Classic` keeps the original black-and-white look. Colored themes apply palettes to sky, ground, underground fills, platforms, ladders, opponents, player gear, weapons, attacks, and drone art.
- Drone style: `Oval`, `Helicopter`, `Satellite`, or `Flying Saucer`. This is visual only; drone behavior comes from the Drone power-up level.
- Player submenu: head shape (`Stick`, `Dog`, `Kat`, `Frog`, `Horse`, `Fish`, `Robot`, `Skull`, or `Alien`), Bighead, face mode (`Classic` or reactive `Emoji`), and face style (`Monochrome`, `Greyscale`, or `Color`).
- Opponents submenu: separate Circle, Triangle, and Square opponent heads plus a shared opponent face style.
- Power Ups submenu: starting Boots, Shield, and Drone levels from 0-10, plus Specs and Radar on/off.

## Power Ups

- Boots levels 1-5 grant refreshed mid-air jumps. Levels 6-10 add rocket glide charge, which activates by holding `X` after reaching the apex of the current jump or mid-air jump.
- Shield levels 1-5 grant hit-blocking shield charges. Levels 6-10 add kinetic discharges that suspend, flash, and spin an enemy while preserving player motion.
- Drone levels 1-5 grant drone strike charges. Levels 6-10 add extra missile charges for rapid homing salvos.
- Specs enable ranged auto-aim when the player is not manually aiming.
- Radar points toward the nearest enemy.

The HUD keeps Level, Ammo, and Enemies in a framed top row. Active power-ups appear as icons in a framed bottom strip; leveled power-ups show `+N`, and charge-based abilities show one or more charge bars.

## World Layout

Levels are generated as expanding multi-area arenas with upper platforms, underground cave routes, ladders, and left/right wrap portals. Portal markers use a slower animated inner-oval flow, and teleporting zooms out, pans across the world, then zooms back in at the destination.

## Project Structure

- `html/index.html`: page shell and canvas
- `html/src/main.js`: game loop and high-level update flow
- `html/src/state.js`: shared mutable game state
- `html/src/render.js`: terrain, portals, projectiles, and overall draw order
- `html/src/enemyArt.js`: enemy drawing, including suspended/flash rendering
- `html/src/hud.js`: framed top HUD and bottom power-up icon/charge HUD
- `html/src/menus.js`: title, pause, customize, game-over, and power-choice overlays
- `html/src/colorThemes.js`: optional sky, terrain, material, gear, weapon, attack, drone, and opponent color palettes
- `html/src/powerIcons.js`: reusable power-up icon artwork for HUD and choice cards
- `html/src/playerCharacters.js`: selectable player renderers, face expressions, and teleport effects
- `html/src/playerPowerArt.js`: player-attached power-up visuals and held weapon drawing
- `html/src/weapons.js`: selectable weapon renderers, including Gun, Club, and Wand
- `html/src/player.js`: player movement, jumping, rocket glide, ducking, and stomp checks
- `html/src/enemies.js`: enemy creation, behavior, and kinetic suspension state
- `html/src/projectiles.js`: player attacks, directional aiming, projectile lifetimes, homing shots, and shot collisions
- `html/src/powerups.js`: power-up grants, starting loadout, tier caps, recharge, and shield effects
- `html/src/drone.js`: drone power-up behavior
- `html/src/customize.js`: Customize menu state and keyboard behavior
- `html/src/input.js`: keyboard, mouse, touch, and menu input routing
- `html/src/terrain.js`: terrain, platforms, ladders, caves, teleports, world bounds, and world/screen conversion
- `html/src/effects.js`: small visual effects
- `html/src/targeting.js`: enemy targeting helpers

## Notes

The visual style is intentionally simple: Canvas drawing primitives, crisp line art, and optional palette fills. New character art should generally be implemented as Canvas vector commands or lightweight SVG-style path data so it stays crisp and dependency-free.
