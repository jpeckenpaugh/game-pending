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
- `W` / Up: jump or climb up ladders
- `S` / Down: duck, climb down ladders, or enter a ladder from above
- Space: shoot
- Enter: pause / activate menu selection
- `G`: grant a random power-up while playing
- `R`: restart while playing

Menus support Up / Down / Left / Right / Enter. The Customize menu can change the game name, tagline, starting power-up count, level, player character, weapon, and world generation mode (`Seeded` or `Random`).

## Project Structure

- `index.html`: page shell and canvas
- `src/main.js`: game loop and high-level update flow
- `src/state.js`: shared mutable game state
- `src/render.js`: terrain, enemies, UI, menus, and overall draw order
- `src/playerCharacters.js`: selectable player renderers, including Original and Croc
- `src/weapons.js`: selectable weapon renderers, including Gun, Club, and Wand
- `src/player.js`: player movement, jumping, ducking, and stomp checks
- `src/enemies.js`: enemy creation and behavior
- `src/projectiles.js`: player shots, homing shots, and shield collisions
- `src/powerups.js`: power-up grants, recharge, and HUD text
- `src/drone.js`: drone power-up behavior
- `src/customize.js`: Customize menu state and keyboard behavior
- `src/input.js`: keyboard, mouse, touch, and menu input routing
- `src/terrain.js`: terrain, platforms, ladders, caves, teleports, world bounds, and world/screen conversion
- `src/effects.js`: small visual effects
- `src/targeting.js`: enemy targeting helpers

## Notes

The visual style is intentionally simple: black line art, filled black accents, and Canvas drawing primitives. New character art should generally be implemented as Canvas vector commands or lightweight SVG-style path data so it stays crisp and dependency-free.
