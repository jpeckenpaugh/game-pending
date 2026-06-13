# Game Pending

A small HTML5 Canvas side-scroller built with vanilla JavaScript and ES modules. The default Classic presentation is black-and-white line art, with optional color themes for the world, opponents, gear, weapons, attacks, and drone. There is no build step and no package dependency required for normal development.

## Run

From the repository root:

```sh
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000/
```

The app uses JavaScript modules, so serve it over HTTP instead of opening `index.html` directly from the filesystem.

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

- `index.html`: page shell and canvas
- `src/main.js`: game loop and high-level update flow
- `src/state.js`: shared mutable game state
- `src/render.js`: terrain, portals, projectiles, and overall draw order
- `src/enemyArt.js`: enemy drawing, including suspended/flash rendering
- `src/hud.js`: framed top HUD and bottom power-up icon/charge HUD
- `src/menus.js`: title, pause, customize, game-over, and power-choice overlays
- `src/colorThemes.js`: optional sky, terrain, material, gear, weapon, attack, drone, and opponent color palettes
- `src/powerIcons.js`: reusable power-up icon artwork for HUD and choice cards
- `src/playerCharacters.js`: selectable player renderers, face expressions, and teleport effects
- `src/playerPowerArt.js`: player-attached power-up visuals and held weapon drawing
- `src/weapons.js`: selectable weapon renderers, including Gun, Club, and Wand
- `src/player.js`: player movement, jumping, rocket glide, ducking, and stomp checks
- `src/enemies.js`: enemy creation, behavior, and kinetic suspension state
- `src/projectiles.js`: player attacks, directional aiming, projectile lifetimes, homing shots, and shot collisions
- `src/powerups.js`: power-up grants, starting loadout, tier caps, recharge, and shield effects
- `src/drone.js`: drone power-up behavior
- `src/customize.js`: Customize menu state and keyboard behavior
- `src/input.js`: keyboard, mouse, touch, and menu input routing
- `src/terrain.js`: terrain, platforms, ladders, caves, teleports, world bounds, and world/screen conversion
- `src/effects.js`: small visual effects
- `src/targeting.js`: enemy targeting helpers

## Notes

The visual style is intentionally simple: Canvas drawing primitives, crisp line art, and optional palette fills. New character art should generally be implemented as Canvas vector commands or lightweight SVG-style path data so it stays crisp and dependency-free.
