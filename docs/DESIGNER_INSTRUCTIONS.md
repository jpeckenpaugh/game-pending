# Designer — Game Pending

## Context
You are the first design agent for **Game Pending**, a vanilla HTML5 Canvas side-scroller platformer. The game is currently a playable demo with stick-figure line art, procedural 3x3 arenas, 3 weapons (Gun/Club/Wand), 6 power-ups (Boots/Shield/Drone/Specs/Radar/Weapon Pickups), AI opponents with 5 behavior modes, and a customize menu.

Play the demo at `http://localhost:8000/` (serve via `python3 -m http.server 8000 -d html` from project root).

## The Ask
The PM wants creative ideas across **6 areas** to make this basic demo genuinely entertaining. For each area, propose **2-4 distinct options** with enough detail to evaluate. Be imaginative — this is a creative brief, not an engineering spec.

### 1. Level Themes & Terrain Types
Beyond the current black-and-white geometric arenas. Think about visual themes (e.g., forest, ice, volcano, cyberpunk, haunted) and mechanical terrain (e.g., ice that slides, mud that slows, conveyor belts, crumbling blocks, one-way drops, water/lava pools, moving platforms, destructible walls).

### 2. New Monster Types
Current enemies are circle/triangle/square heads with simple chase AI. Propose new monster archetypes with distinct movement patterns — **at minimum** flying enemies and burrowing enemies. Also consider chargers, snipers, shield-bearers, spawners, bosses.

### 3. 6 Additional Weapon Types
Current: Gun (straight shot), Club (thrown arc), Wand (magic projectile). Propose 6 new weapons with unique mechanics — e.g., spread shot, grenade launcher, boomerang, flame thrower, laser beam, bouncing shots, deployable turret, grappling hook.

### 4. 6 Additional Power-Ups
Current: Boots (multi-jump → glide), Shield (block → kinetic discharge), Drone (strike → homing salvos), Specs (auto-aim), Radar (enemy indicator), Weapon Pickups. Propose 6 new power-ups with tier progression (levels 1-5 basic, 6-10 secondary ability). Consider speed boost, time slow, invisibility, magnetism, cloning, phasing, etc.

### 5. Leaderboard
Propose a leaderboard system that works within vanilla JS constraints. Options could range from localStorage-based (no server) to a simple server endpoint. Consider: score calculation, persistence, display UI, per-level vs total, daily/weekly/all-time.

### 6. AI Logic for New Monsters
For the new monster types you propose in area 2, define distinct AI behaviors. Consider: patrol patterns, attack telegraphs, aggro ranges, pack coordination, phase transitions, environmental interaction.

## Deliverable
Create a single design document at `docs/design/design-brief-001.md` containing:
- One section per area with 2-4 options each
- For each option: a short description, how it changes gameplay, and rough implementation notes
- A closing **PM Recommendation** section where you state which options you'd prioritize for a Sprint-001 and why

## Constraints
- Stay within vanilla JavaScript / HTML5 Canvas — no engines, no dependencies
- Keep the line-art aesthetic compatible with the Classic black-and-white theme
- Be mindful that a future Godot port is possible — don't paint into a JS-only corner
- The game currently uses ES modules with no build step — proposals should respect that
