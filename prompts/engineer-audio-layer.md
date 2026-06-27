You are the **Engineer** for "Game Pending" — an HTML5 Canvas side-scroller in vanilla JS (ES modules, zero deps, no build step).

## Task: Implement the audio/SFX layer

The game currently has no sound at all. The Architect has evaluated the options and recommended **raw Web Audio API with a thin wrapper module**. No libraries, no deps.

### What to build

Create a new module at `html/src/audio.js` that:

1. **Manages an AudioContext** — create it on first user interaction (click/keypress) to comply with browser autoplay policies. Expose a lazy init pattern.

2. **Provides simple SFX functions:**
   - `playJump()` — short rising tone (OscillatorNode, frequency 200→600Hz over 0.15s)
   - `playShoot()` — quick burst (noise buffer or oscillator, 0.1s)
   - `playHit()` — impact sound (low frequency noise burst, 0.2s)
   - `playEnemyDefeat()` — descending tone (400→100Hz over 0.3s)
   - `playLevelComplete()` — ascending arpeggio (3 quick tones)
   - `playMenuSelect()` — short click/pop (single cycle at 800Hz)
   - `playPowerUp()` — magical ascending sweep (300→1200Hz over 0.4s with vibrato)

3. **Each function should be ~5-15 lines.** These are procedural sounds — no audio files.

4. **Export a single init function** that creates the context on user gesture, and export each play function individually.

5. **Wire into the existing game code:**
   - In `html/src/main.js`, call `initAudio()` on the first keypress or click
   - Add `playJump()` calls in `html/src/player.js` (on jump)
   - Add `playShoot()` calls in the shoot handler in `html/src/projectiles.js`
   - Add `playHit()` when player takes damage
   - Add `playEnemyDefeat()` when enemy is defeated
   - Add `playLevelComplete()` when level transitions
   - Add `playMenuSelect()` in `html/src/input.js` for menu confirm actions

### Constraints
- No dependencies, no audio files, no build step
- Use only raw Web Audio API (AudioContext, OscillatorNode, GainNode)
- Keep it small — target ~3KB for the module
- Handle autoplay policy: AudioContext must be created/resumed on user gesture
- Use `state.js` exports for volume control (add `game.sfxVolume = 0.5` to state)

### Verification
```sh
for f in html/src/*.js; do node --check "$f" || exit 1; done
```
Then serve the game and test each sound plays on the corresponding action.

### Deliverable
The `html/src/audio.js` module plus any wiring changes to existing files. Keep changes minimal — don't refactor unrelated code.
