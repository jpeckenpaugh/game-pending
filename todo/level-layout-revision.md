# Level Layout Revision Checklist

## Phase 1 - Level Shape and Spawn

- [x] Define the new level as a 3 x 3 exploration arena instead of a single left-to-right strip.
- [x] Start the player in the center/middle area of the level.
- [x] Center the camera on the player at level start.
- [x] Keep the center area relatively safe so the player has a readable starting point.
- [x] Update level sizing so each new level expands the arena slightly instead of only extending a horizontal track.
- [x] Preserve enemy-count scaling with level progression.

## Phase 2 - Lightweight Layout Data

- [x] Add simple layout arrays to shared world state for platforms, ladders, caves, and teleports.
- [x] Keep layout data hand-authored or lightly generated for now; avoid adding a tile map system.
- [x] Build level geometry from world coordinates rather than fixed viewport pixels where possible.
- [x] Scale the arena outward per level by expanding bounds and adding more room for enemy placement.
- [x] Keep the existing terrain line as the main middle-band surface.
- [x] Add world generation settings to customization state.
- [x] Add a Customize menu field for `World Generation` with `Seeded` and `Random` options.
- [x] Use deterministic generation when `Seeded` is selected.
- [x] Use non-deterministic generation when `Random` is selected.

## Phase 3 - Platforms

- [x] Add horizontal platform collision support for the player.
- [x] Allow enemies and drops to be placed on platforms.
- [x] Render platforms with simple black-and-white canvas line art.
- [x] Make platform collision one-way from above so the player can jump up through platforms and land on top.
- [ ] Verify jumping, ducking, shooting, and stomp behavior still work on platform surfaces.

## Phase 4 - Ladders

- [x] Add ladder rectangles to level layout data.
- [x] Detect when the player is inside a ladder zone.
- [x] Add basic climbing behavior using Up/Down or W/S.
- [x] Reduce or disable gravity while actively climbing.
- [x] Let ladders connect middle ground, upper platforms, and cave areas.
- [x] Render ladders with minimal black line art.

## Phase 5 - Wrap Teleports

- [x] Add teleport zones at the far left and far right edges of the world.
- [x] Wrap the player from left edge to right edge and right edge to left edge.
- [x] Apply left/right wrapping to the player only.
- [x] Add a quick warp or popping animation when the player teleports.
- [x] Quickly scroll or snap the camera after wrapping so the teleport destination is clear.
- [x] Dampen player velocity during teleport so wrapping stays readable.
- [x] Add clear animated portal markers so the wrap points feel intentional.

## Phase 6 - Caves and Underground Areas

- [x] Add lower cave routes beneath the middle ground band.
- [x] Use platforms, ladders, and simple cave ceiling/floor line art instead of a full terrain system.
- [x] Place some enemies in underground areas.
- [x] Ensure the player can always climb back out of cave routes.
- [x] Allow falling or dropping into some cave routes.
- [x] Do not add fall damage for long drops.
- [x] Keep cave visuals readable in the black-and-white style.

## Phase 7 - Enemy Distribution

- [x] Divide enemy spawn candidates across the 3 x 3 arena regions.
- [x] Place enemies above, below, left, right, and around the center rather than only ahead of the player.
- [x] Keep early levels simple, then use larger worlds and more enemies as levels increase.
- [x] Avoid spawning enemies directly on the player at level start.
- [x] Ensure every enemy is reachable with the current platform/ladder layout.

## Phase 8 - Completion and Flow

- [x] Keep level completion based on defeating all enemies.
- [x] Keep the level-clear ammo collection sequence after the final enemy is defeated.
- [x] Make sure drops from upper platforms and caves collect cleanly during level clear.
- [x] Verify level-complete, continue, game-over, pause, and customize flows still work.

## Phase 9 - Verification

- [x] Run `for f in src/*.js; do node --check "$f" || exit 1; done`.
- [x] Serve with `python3 -m http.server 8000`.
- [x] Smoke test movement, jumping, shooting, ducking, climbing, wrapping, and level completion in browser.
- [x] Smoke test center spawn, multi-surface layout, shooting, and Customize menu in browser.
- [x] Test at desktop and narrow/mobile-sized viewports.
- [x] Check that UI text remains readable and does not overlap gameplay-critical areas.

## Bug Fix Pass

- [x] Add a solid underground/cave floor so the player cannot fall infinitely or out of the playable area.
- [x] Fix main floor collision so the player does not fall through terrain gaps or slope transitions.
- [x] Fix ladder top handling so the player can step onto the connected platform instead of falling after passing the top.
- [x] Re-run JS syntax checks after bug fixes.
- [x] Run headless collision simulation for main floor, cave floor, and ladder top behavior.
- [x] Browser smoke test floor collision, cave floor, and ladder top behavior.

## Teleport and Cave Access Bug Fix Pass

- [x] Allow the player to press Down while over a ladder to enter/climb downward underground.
- [x] Prevent left/right teleport from placing the player underground.
- [x] Restrict teleport activation to visible teleport zones rather than any far-left/far-right world edge position.
- [x] Add enemy-free buffer zones around teleport destinations so the player does not teleport directly onto enemies.
- [x] Re-run JS syntax checks after teleport/cave access fixes.
- [x] Run headless simulation for ladder-down entry, teleport gating, teleport destination height, and teleport enemy buffers.

## Ground Alignment Bug Fix Pass

- [x] Align ladder endpoints to actual terrain height at each ladder x-position.
- [x] Align teleport visuals and activation zones to actual terrain height at each portal x-position.
- [x] Keep underground decorative cave lines visually secondary to interactive platform surfaces.
- [x] Remove non-interactive cave decoration lines entirely.
- [x] Re-run JS syntax checks after ground alignment fixes.
- [x] Run headless simulation for ladder entry from actual sloped ground and teleport placement on actual sloped ground.

## Title Camera Perspective Pass

- [x] Show the full top-to-bottom world height during the title screen.
- [x] Zoom the camera in from the title view when gameplay starts.
- [x] Browser smoke test title framing and start-game zoom transition.
- [x] Scale world object sizes and line widths with camera zoom so zoomed-out perspective makes gameplay elements smaller.
- [x] Add minimum world stroke widths so zoomed-out components remain visible.
- [x] Frame title zoom against actual generated content bounds instead of empty world height.

## Customize Level Option

- [x] Add a `Level` field to the Customize menu.
- [x] Allow Left/Right, +/- and number keys to change the selected level.
- [x] Allow click/tap on the `Level` row to select and increment it.
- [x] Start New Game at the selected Customize level.
- [x] Apply selected level when saving Customize from Title or Pause.

## Expanded Platform Layout Pass

- [x] Add three full main-floor-to-underground ladders.
- [x] Extend above-ground and underground platform widths as the world expands.
- [x] Add second-tier upper platforms with ladder connections for multi-level climbing.
- [x] Add more platform sets as level/world size increases.
- [x] Run syntax checks after layout expansion.
- [x] Run headless layout simulation for cave ladder count and upper-tier platform reachability.

## Underground Club Bug Fix

- [x] Fix club projectile expiration so clubs can be thrown while underground.
- [x] Expire clubs only when they cross an actual walkable surface, not just the main terrain line.
- [x] Run syntax checks after club projectile fix.
- [x] Run headless simulation confirming underground club throws survive initial projectile update.

## Drone Visibility Adjustment

- [x] Move drone entry and firing pass to 25% of the current viewport height.

## Teleport Camera Transition

- [x] Replace near-instant teleport with zoom-out, pan, and zoom-in camera phases.
- [x] Keep source and destination pop effects during teleport.
- [x] Freeze gameplay updates while the teleport camera transition runs.
- [x] Reset teleport transition state when a level starts.
- [x] Clear wrap effect state after the zoom-in completes.
- [x] Run syntax checks after teleport camera transition.
- [x] Run headless simulation confirming portal contact arms the zoom-out phase and opposite ground destination.
- [x] Browser smoke test teleport zoom-out, pan, zoom-in, and player pop effects.

## Teleport Graphic Pass

- [x] Replace the portal X graphic with animated shrinking inner ovals.
- [x] Fade the inner ovals as they shrink for a simple portal flow effect.
- [x] Run syntax checks after teleport graphic update.

## Teleport Player Animation Pass

- [x] Spin, shrink, and fade the player into the source portal during teleport zoom-out.
- [x] Reverse the effect so the player spins, grows, and fades in from the destination portal.
- [x] Run syntax checks after teleport player animation update.
- [x] Remove old circle/cross pop overlay from the player during teleport.
- [x] Slow the teleport animation timing so the player enter/emerge effect is easier to read.
- [x] Run syntax checks after teleport timing and overlay cleanup.
- [x] Move the player into the source portal while spinning/shrinking/fading out.
- [x] Move the player out of the destination portal while spinning/growing/fading in.
- [x] Run syntax checks after teleport movement animation update.

## Open Questions

- [x] Use a hidden deterministic seed based on current settings and level for the first implementation.
- [ ] Should the 3 x 3 layout be hand-authored for every level shape at first, or lightly generated from reusable region templates?
