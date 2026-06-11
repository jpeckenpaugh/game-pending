# Agent Notes

## Project Basics

This is a vanilla JavaScript Canvas game. Keep it dependency-free unless there is a strong reason to add tooling. The app is served directly from the repo root with:

```sh
python3 -m http.server 8000
```

Use `http://localhost:8000/` for local browser testing. Because `index.html` loads ES modules, do not rely on `file://` testing.

## Code Organization

Keep new behavior in the closest existing module:

- Rendering and menus: `src/render.js`
- Selectable player art: `src/playerCharacters.js`
- Selectable weapon art: `src/weapons.js`
- Movement and stomp rules: `src/player.js`
- Enemy spawning/AI: `src/enemies.js`
- Projectiles and shot collisions: `src/projectiles.js`
- Power-up state and recharge: `src/powerups.js`
- Drone-specific behavior: `src/drone.js`
- Customize menu logic: `src/customize.js`
- Input routing: `src/input.js`
- Shared state: `src/state.js`

Avoid moving unrelated code while implementing a feature. The repo may already have user changes in progress, so inspect diffs before editing and do not revert unrelated modifications.

## Style

- Use ES modules and plain browser APIs.
- Keep drawing black-and-white unless the requested feature explicitly needs color.
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
