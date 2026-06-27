You are the **Engineer** for "Game Pending". Implement **Feature 3: Forest Canopy Level Theme**.

Read `docs/architecture/sprint-002-spec.md` for the full spec, then:

**What to change:**
- `html/src/colorThemes.js`: add a `"forest"` palette — dark green/mossy ground (#3d2b1f), brown trunks (#5c3d2e), olive foliage (#6b8e23), dark sky (#1a3a1a)
- `html/src/terrain.js`: when `customization.colorTheme === "forest"`, draw vine ladders — sinuous bezier curves with small leaves at intervals (instead of straight parallel lines + rungs). Add `mudZones` support: define `world.mudZones` as an array of `{x, y, width, height}` rectangles on ground surfaces
- `html/src/render.js`: when `customization.colorTheme === "forest"`, draw platforms as tree trunks (rounded vertical rectangles with branch stubs) instead of flat bars
- `html/src/player.js`: when player is in a `mudZone`, multiply horizontal speed by 0.6
- `html/src/enemies.js`: when an enemy is in a `mudZone`, slow its movement by 0.6
- `html/src/effects.js`: when `customization.colorTheme === "forest"`, spawn falling leaf particles — 1 every 3-5s, drifting downward with horizontal wobble, max 5 on screen

**Theme toggle:** All forest-specific rendering must be conditional on `customization.colorTheme === "forest"`. Other themes should render exactly as before. The theme is selected via the existing customize menu color theme setting.

**Verify:**
```sh
for f in html/src/*.js; do node --check "$f" || exit 1; done
```
