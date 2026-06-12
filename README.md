# Game Pending

A small black-and-white HTML5 Canvas side-scroller built with vanilla JavaScript and ES modules. There is no build step and no package dependency required for normal development.

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
- X: jump
- `W` / Up: aim up, throw upward, or climb up ladders
- `S` / Down: duck, aim/throw downward when airborne or climbing, climb down ladders, or enter a ladder from above
- Space: attack with the selected weapon
- Enter: pause / activate menu selection
- `G`: open a three-choice power-up picker while playing; pressing `G` again there auto-grants and rerolls
- `R`: restart while playing

Menus support Up / Down / Left / Right / Enter. The Customize menu can change the game name, tagline, starting power-up loadout, level, target FPS (`Auto`, `5`, `10`, `15`, `30`, `60`, or `120`), player character, weapon, opponent behavior, spawning locations, and world generation mode (`Seeded` or `Random`). Power-up loadout settings live under the Power Ups submenu; Boots, Shield, and Drone can start up to level 10.

After clearing a level, choose one of three offered power-ups before the next wave starts.

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
- `src/powerIcons.js`: reusable power-up icon artwork for HUD and choice cards
- `src/playerCharacters.js`: selectable player renderers, including Original and Croc
- `src/playerPowerArt.js`: player-attached power-up visuals and held weapon drawing
- `src/weapons.js`: selectable weapon renderers, including Gun, Club, and Wand
- `src/player.js`: player movement, jumping, rocket glide, ducking, and stomp checks
- `src/enemies.js`: enemy creation, behavior, and kinetic suspension state
- `src/projectiles.js`: player attacks, directional aiming, homing shots, and shield collisions
- `src/powerups.js`: power-up grants, starting loadout, tier caps, recharge, and shield effects
- `src/drone.js`: drone power-up behavior
- `src/customize.js`: Customize menu state and keyboard behavior
- `src/input.js`: keyboard, mouse, touch, and menu input routing
- `src/terrain.js`: terrain, platforms, ladders, caves, teleports, world bounds, and world/screen conversion
- `src/effects.js`: small visual effects
- `src/targeting.js`: enemy targeting helpers

## Notes

The visual style is intentionally simple: black line art, filled black accents, and Canvas drawing primitives. New character art should generally be implemented as Canvas vector commands or lightweight SVG-style path data so it stays crisp and dependency-free.
