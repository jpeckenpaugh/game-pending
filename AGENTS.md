# Agent Notes

## Project Basics

This is a vanilla JavaScript Canvas game. Keep it dependency-free unless there is a strong reason to add tooling. The app is served directly from the repo root with:

```sh
python3 -m http.server 8000
```

Use `http://localhost:8000/` for local browser testing. Because `index.html` loads ES modules, do not rely on `file://` testing.

## Code Organization

Keep new behavior in the closest existing module:

- Terrain, portals, projectiles, and draw orchestration: `src/render.js`
- Enemy drawing: `src/enemyArt.js`
- HUD drawing: `src/hud.js`
- Menu and overlay drawing: `src/menus.js`
- Color theme palettes and labels: `src/colorThemes.js`
- Shared power-up icons: `src/powerIcons.js`
- Selectable player art: `src/playerCharacters.js`
- Player-attached power-up art and held weapon drawing: `src/playerPowerArt.js`
- Selectable weapon art: `src/weapons.js`
- Movement, jump charges, rocket glide, and stomp rules: `src/player.js`
- Enemy spawning, AI, and suspension state: `src/enemies.js`
- Projectiles, directional aiming, and shot collisions: `src/projectiles.js`
- Power-up grants, starting loadouts, tier caps, recharge, and shield effects: `src/powerups.js`
- Drone-specific behavior: `src/drone.js`
- Customize menu logic: `src/customize.js`
- Input routing: `src/input.js`
- Terrain, platforms, ladders, caves, teleports, and coordinate conversion: `src/terrain.js`
- Particles and burst effects: `src/effects.js`
- Enemy targeting helpers: `src/targeting.js`
- Shared state: `src/state.js`

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
for f in src/*.js; do node --check "$f" || exit 1; done
```

For frontend changes, also serve the app and smoke test the relevant flow in a browser when possible.
