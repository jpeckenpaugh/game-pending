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
- [x] Verify jumping, ducking, shooting, and stomp behavior still work on platform surfaces.

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

## Target FPS Customize Option

- [x] Add a `Target FPS` field to the Customize menu.
- [x] Default Target FPS to `Auto`.
- [x] Support `Auto`, `5`, `10`, `15`, `30`, `60`, and `120` FPS options.
- [x] Throttle rendering to the selected target FPS while preserving capped update steps.
- [x] Run syntax checks after Target FPS option.
- [x] Run headless Customize option check for Target FPS default and cycle order.
- [x] Add adaptive Auto mode that steps render FPS down under sustained load and back up after stable play.
- [x] Run syntax checks after Auto FPS option.
- [x] Run headless Customize option check for Auto FPS default and cycle order.

## Projectile Visual Polish

- [x] Render gun bullets as small squares instead of thin horizontal lines.
- [x] Run syntax checks after gun bullet visual update.

## Power-Up Artwork Polish

- [x] Add small heel squares to boot artwork.
- [x] Replace specs eye lines with glasses circles connected by a bridge.
- [x] Add simple two-panel vest artwork over the player chest when Vest is owned.
- [x] Run syntax checks after power-up artwork polish.
- [x] Replace vest box panels with thicker chest and upper-arm line overlay.
- [x] Run syntax checks after vest artwork revision.
- [x] Replace Vest power-up concept with Shield.
- [x] Draw Shield as a thin force-field bubble around the player.
- [x] Make Shield bubble thicker as shield level/charges increase.
- [x] Add a small wrist shield transmitter opposite the weapon arm.
- [x] Run syntax checks after Shield replacement.
- [x] Run headless Shield block/recharge behavior probe.
- [x] Smoke test game page after Shield replacement.
- [x] Replace full-player Shield bubble with subtle bracelet-centered pulse rings.
- [x] Run syntax checks after Shield pulse artwork revision.
- [x] Smoke test game page after Shield pulse artwork revision.
- [x] Move Shield pulse source from wrist transmitter to chest amulet.
- [x] Run syntax checks after Shield amulet artwork revision.
- [x] Smoke test game page after Shield amulet artwork revision.
- [x] Add Radar power-up to the power-up pool.
- [x] Draw Radar as an opposite-arm watch with a directional dot.
- [x] Aim Radar dot at the nearest living enemy anywhere in the world.
- [x] Run syntax checks after Radar power-up wiring.
- [x] Run headless Radar state/pool/summary check.
- [x] Smoke test game page after Radar power-up wiring.
- [x] Increase Radar directional dot size for readability.
- [x] Run syntax checks after Radar dot size revision.
- [x] Disable Specs auto-turn targeting for club throws.
- [x] Run syntax checks after club auto-turn revision.
- [x] Run headless club throw facing check with Specs owned.
- [x] Make club throws respond to held up/down direction.
- [x] Run syntax checks after directional club throw revision.
- [x] Run headless directional club throw checks.
- [x] Preserve forward club throw when crouched on the ground.
- [x] Support down club throws while airborne or climbing.
- [x] Support diagonal club throws with combined vertical and horizontal input.
- [x] Run syntax checks after expanded club direction rules.
- [x] Run headless checks for crouch, air-down, climb-down, and diagonals.
- [x] Move keyboard jump from Up/W to dedicated `J` key so Up/W can aim club throws.
- [x] Update control text and README for dedicated jump key.
- [x] Run syntax checks after dedicated jump key change.
- [x] Run headless input check for `J` jump and `W` upward club aim.
- [x] Change default keyboard jump from `J` to `Z`.
- [x] Run syntax checks after `Z` jump key change.
- [x] Run headless input check for `Z` jump and `W` upward club aim.
- [x] Change default keyboard jump from `Z` to Command/Meta.
- [x] Run syntax checks after Command jump key change.
- [x] Run headless input check for Command jump and `W` upward club aim.
- [x] Replace randomized starting power-up count with per-power Customize loadout settings.
- [x] Add starting Boots, Specs, Radar, Shield level, and Drone level Customize rows.
- [x] Apply selected starting loadout when a new game begins.
- [x] Run syntax checks after per-power starting loadout update.
- [x] Run headless Customize/loadout checks for per-power starting grants.
- [x] Smoke test Customize screen after per-power starting loadout update.
- [x] Make Boots stack to level 5.
- [x] Grant one refreshed mid-air jump per Boots level.
- [x] Pulse Boots artwork when a mid-air jump is consumed.
- [x] Cap Shield and Drone levels at 5.
- [x] Move per-power loadout controls under a Power Ups Customize submenu.
- [x] Run syntax checks after Boots levels and Power Ups submenu update.
- [x] Run headless checks for Boots mid-air jumps, caps, and submenu navigation.
- [x] Smoke test Power Ups Customize submenu after Boots level update.
- [x] Replace automatic level-clear random power grant with a three-choice power-up menu.
- [x] Draw level-clear power-up choices as three labeled boxes with icons and short descriptions.
- [x] Support keyboard and click selection for level-clear power-up choices.
- [x] Run syntax checks after level-clear power-up choice menu.
- [x] Run headless checks for level-clear power-up choices and selection.
- [x] Smoke test game page after level-clear power-up choice menu.
- [x] Tie `G` debug grant into the same three-choice power-up picker.
- [x] Let `G` on the power picker auto-grant one shown power and refresh choices.
- [x] Run syntax checks after `G` power picker update.
- [x] Run headless checks for `G` power picker open, choose, and auto-grant refresh.
- [x] Smoke test game page after `G` power picker update.
- [x] Match Drone pick-three icon to in-game drone artwork.
- [x] Run syntax checks after Drone pick-three icon update.
- [x] Run headless render check for Drone pick-three icon.
- [x] Extend manual weapon aiming directions to gun and wand.
- [x] Preserve grounded crouch/down as forward fire for gun and wand.
- [x] Keep Specs auto-aim as fallback when gun/wand are not manually aimed.
- [x] Run syntax checks after gun/wand directional aiming update.
- [x] Run headless gun/wand directional aiming checks.
- [x] Rotate held gun artwork to match manual 8-direction aim.
- [x] Run syntax checks after held gun aim artwork update.
- [x] Run headless held gun render check with directional inputs.
- [x] Smoke test game page after held gun aim artwork update.

## Opponent Behavior Customize Option

- [x] Add an `Opponent Behavior` field to the Customize menu.
- [x] Default Opponent Behavior to `Mixed`.
- [x] Support `Simple`, `Random`, `Bold`, `Shy`, and `Mixed` options.
- [x] Preserve current repeated opponent movement as `Simple`.
- [x] Add randomized movement variation for `Random`.
- [x] Add near-player approach behavior for `Bold`.
- [x] Add near-player retreat behavior for `Shy`.
- [x] Randomly assign per-enemy intelligence when `Mixed` is selected.
- [x] Run syntax checks after Opponent Intelligence option.
- [x] Run headless spawn/update checks for opponent intelligence modes.
- [x] Prevent Bold/Shy enemies from snapping back to spawn patrol positions when line of sight is lost.
- [x] Make Bold/Shy detection use broader close-enough line-of-sight style checks.
- [x] Run syntax checks after Bold/Shy fallback movement fix.
- [x] Run headless check confirming Bold enemies chase, lose sight, and continue from current position.
- [x] Add simple selected-row tooltips to the Customize menu.
- [x] Run syntax checks after Customize label/default/tooltip updates.
- [x] Run headless check confirming Opponent Behavior defaults to `Mixed`.

## Spawning Locations Customize Option

- [x] Add a `Spawning Locations` field to the Customize menu.
- [x] Support `Standard` and `Randomized` spawning location options.
- [x] Make `Standard` spread early spawns across ground, upper, and cave bands instead of consuming ordered ground-first candidates.
- [x] Make `Randomized` shuffle all valid spawn locations.
- [x] Run syntax checks after Spawning Locations option.
- [x] Run headless spawn distribution checks for Standard and Randomized modes.

## Open Questions

- [x] Use a hidden deterministic seed based on current settings and level for the first implementation.
- [ ] Should the 3 x 3 layout be hand-authored for every level shape at first, or lightly generated from reusable region templates?
