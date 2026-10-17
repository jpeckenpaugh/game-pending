# Agent Notes

## Project Basics

This is a vanilla JavaScript Canvas game. Keep it dependency-free unless there is a strong reason to add tooling. The app is served from the `html/` directory:

```sh
python3 -m http.server 8000 -d html
```

Or via Docker (see `docker-compose.yml`). Use `http://localhost:8000/` for local browser testing. Because `index.html` loads ES modules, do not rely on `file://` testing.

## Code Organization

Keep new behavior in the closest existing module:

- Terrain, portals, projectiles, and draw orchestration: `html/src/render.js`
- Enemy drawing: `html/src/enemyArt.js`
- HUD drawing: `html/src/hud.js`
- Menu and overlay drawing: `html/src/menus.js`
- Color theme palettes and labels: `html/src/colorThemes.js`
- Shared power-up icons: `html/src/powerIcons.js`
- Selectable player art: `html/src/playerCharacters.js`
- Player-attached power-up art and held weapon drawing: `html/src/playerPowerArt.js`
- Selectable weapon art: `html/src/weapons.js`
- Movement, jump charges, rocket glide, and stomp rules: `html/src/player.js`
- Enemy spawning, AI, and suspension state: `html/src/enemies.js`
- Projectiles, directional aiming, and shot collisions: `html/src/projectiles.js`
- Power-up grants, starting loadouts, tier caps, recharge, and shield effects: `html/src/powerups.js`
- Drone-specific behavior: `html/src/drone.js`
- Customize menu logic: `html/src/customize.js`
- Input routing: `html/src/input.js`
- Terrain, platforms, ladders, caves, teleports, and coordinate conversion: `html/src/terrain.js`
- Particles and burst effects: `html/src/effects.js`
- Enemy targeting helpers: `html/src/targeting.js`
- Shared state: `html/src/state.js`

Avoid moving unrelated code while implementing a feature. The repo may already have user changes in progress, so inspect diffs before editing and do not revert unrelated modifications.

## Style

- Use ES modules and plain browser APIs.
- Keep new drawing compatible with the Classic black-and-white theme; when a feature needs color, add palette values in `src/colorThemes.js`.
- Drawing modules should consume the active theme instead of hard-coding preset-specific colors.
- Prefer Canvas vector drawing commands, `Path2D`, or small SVG-style path data over bitmap assets.
- Keep UI text short enough to fit on mobile and desktop.
- Use existing state objects from `src/state.js` instead of creating hidden globals.
- Keep comments sparse and useful.

## Verification

At minimum, run:

```sh
for f in html/src/*.js; do node --check "$f" || exit 1; done
```

For frontend changes, also serve the app and smoke test the relevant flow in a browser when possible.

## Showcase & Demo Media Rule (720p)

- Always render the ~30-second showcase video (`demo.webm`) and promotional gallery screenshots (`gallery/*.png`) at **720p (`1280x720`, 16:9 widescreen)** in `test-runner/runner.mjs`.
- Keep both the primary recording browser context and the gallery capture context fixed at `{ width: 1280, height: 720 }` so all generated media matches 16:9 widescreen portfolio cards and hero billboards without pillarboxing.

