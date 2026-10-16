# Game Pending — First Browser Test Runner POC

## Purpose

Build a small, repeatable browser test runner that lets an AI coding agent launch the game, execute a basic keyboard-driven smoke workflow, inspect the result, and retain useful evidence without needing a human-operated desktop or frontier hardware.

This is a proof of concept, not a general-purpose test framework or a full QA suite. Prefer a headless browser. A visible desktop/VNC session is not required for the initial POC.

## POC outcome

From the repository, one documented command should:

1. Build or start an isolated test-runner container using a dedicated test entry point (not the existing development Compose service).
2. Serve the current `html/` game over HTTP from the test-runner container.
3. Launch a pinned Playwright/Chromium browser in headless mode.
4. Run one deterministic, keyboard-only smoke scenario.
5. Save screenshots, an approximately 30-second WebM app showcase, and browser diagnostics to a host-accessible artifact directory.
6. Exit nonzero on a failed assertion or browser/runtime error, and zero on success.

The runner must work on ordinary developer/CI machines and must not depend on a physical display, VNC, GPU, or credentials. Keep the existing development Docker service focused on its current purpose; prefer a separate test-runner image/service.

## Proposed first workflow

Use the existing keyboard navigation and gameplay controls. Customize the Robot template, Arcade Color Theme, Wand weapon, and starting Boots/Specs/Radar/Shield/Drone loadout (levels 1 / on / on / 1 / 1). Start a new game, then use ten discrete G presses over about two seconds: the first opens the picker, the next nine grant and reroll. Enter grants the currently selected final option and returns to gameplay. Do not set extra starting power-ups.

1. Open the locally served game and wait for the title screen.
2. Capture `01-title.png`.
3. Open Customize using keyboard navigation.
4. Set Robot, Arcade, Wand, and the approved starting power-ups; capture `08-customize-options.png`, save, and verify return to the title screen.
5. Capture `02-customized-title.png`.
6. Start a new game and verify the gameplay HUD is present.
7. Capture `03-game-start.png`.
8. Assert that all five approved starting power-ups are active. Open the G picker, capture `07-power-choice.png`, issue nine more discrete G taps, and press Enter to accept the final choice.
9. Tap/hold right briefly, release it before firing so Specs auto-aim is available, and jump; capture `04-movement.png`.
10. Fire at least one Wand shot and assert ammo decreases; capture `05-fired.png`.
11. Pause with Enter, navigate to Continue in the pause menu, activate it with Enter, and verify return to gameplay; capture `06-resumed.png`.
12. Continue generally rightward with intermittent shots and jumps until the approximately 30-second total recording deadline. If Game Over occurs, do not restart; preserve it in the video and report the final state.

Avoid asserting that a particular shot hits an enemy or that the player survives a fixed duration: those outcomes may depend on timing, enemy behavior, and viewport. The POC should test the input-to-observable-response path, not require the agent to win.

## Suggested implementation shape

- Use Playwright with its bundled/pinned Chromium and headless mode.
- Use a small Node-based runner in a dedicated `test-runner/` directory; install dependencies only in the test-runner image/package scope, not in the game runtime.
- Prefer a single isolated test-runner container that serves the checked-out `html/` directory and runs Playwright against it. Provide a simple documented command/script; do not extend the existing development Compose service, which has separate development responsibilities and mounts credentials/data.
- Pin the Playwright package and use its matching Chromium version/image. Record browser and runner version metadata in the test output. Avoid pinning unrelated host details unless needed for reproducibility.
- Keep the first scenario readable and explicit. It can be a short Playwright script; do not build a generic YAML scenario language until there is a concrete need for multiple workflows.
- Use keyboard input for menus and gameplay. Use Playwright locator/keyboard APIs rather than desktop-level key injection.
- Fix the viewport and use seeded world generation for repeatable scenario setup. Record browser/version metadata to make screenshots comparable; do not require exact pixel equality.
- Mount an output directory at `test-artifacts/` so screenshots and reports survive container exit. Add it to `.gitignore` so generated artifacts are not committed by default.
- Preserve failure evidence: screenshots, console errors, page errors, test log, and a concise machine-readable result (JSON or JUnit XML if readily supported).
- Record the browser context with Playwright's native `recordVideo` support starting with the first page load. Include the title, Customize/options, game start, and active gameplay in a total video runtime target of 29–32 seconds. Close the context to finalize `demo.webm`, measure its duration with `ffprobe`, and retain the video where available on failure.
- After finalizing the demo context, capture title, options, Choose Power, and Original/Emoji/Farm/Robot promotional stills in separate non-recording browser contexts. Use the existing keyboard Customize flow with distinct deterministic mode configurations and starting loadouts; save these separately under `test-artifacts/gallery/`.
- Add a timeout and clean shutdown for the server/browser so failed tests do not leave processes running.

## Assertions and observability

Initially, assert what can be observed robustly:

- The page loads and the Canvas exists.
- Keyboard menu actions reach Customize and return to the title screen.
- Starting a game displays the Level/Ammo/Enemies HUD.
- A Wand shot with directional keys released reduces ammo while Specs is active.
- Customize saved the requested template, theme, weapon, and starting loadout; the runtime G sequence added a meaningful power-up grant.
- The seven promotional stills use the requested mode/template/theme pairings and show distinct screens/scenes; treat them as visual showcase assets, not pixel-comparison tests.
- Pause/resume transitions produce the expected visible state.
- No uncaught page errors occur.

Canvas content is not exposed as normal DOM text, so Playwright cannot query the HUD as ordinary page text. Use screenshots as visual evidence, not brittle OCR/pixel assertions. If reliable pass/fail assertions for game state (including ammo) cannot be made from browser-visible behavior, add a minimal read-only test adapter (e.g. a test-only `window` hook reporting state, ammo, and enemy count). Gate the seam to test mode/build so it is unavailable in normal production use. Avoid adding it preemptively if the assertions can be made robustly without it.

Screenshot comparison should initially be for human/agent inspection, not strict pixel-diff pass/fail. Fonts, antialiasing, and browser rendering can make exact image comparisons noisy.

## Non-goals for the first POC

- VNC/noVNC, a Linux desktop environment, or manual remote control.
- Mouse-coordinate automation; current workflows can be keyboard-only.
- Full end-to-end campaign completion or autonomous gameplay strategy.
- Pixel-perfect visual regression thresholds.
- A general scenario DSL, test authoring UI, or test management system.
- Changes to game mechanics solely to make the POC pass, without a separately agreed product/testability rationale.

## Acceptance criteria

- A new developer/agent can follow one documented command without a pre-existing browser or desktop session; the test container is separate from the existing development service.
- The run uses the current working tree's game files and a real browser engine with pinned Playwright/Chromium versions.
- A successful run emits all eight named screenshots and a clear success result; the video begins on the title and runs 29–32 seconds.
- A deliberately broken assertion or page error causes a nonzero exit and retains failure artifacts.
- The runner shuts down cleanly and does not modify game source or leave generated files tracked.
- The test command and artifact locations are documented in the README or a dedicated test-runner section.

## Decisions to resolve before implementation

These decisions are approved for the POC:

- Use a dedicated `test-runner/` directory and an isolated single-container test entry point; do not reuse or expand the development Compose service.
- Write artifacts to ignored `test-artifacts/`.
- Change the Color Theme in Customize.
- Pin Playwright and its corresponding Chromium version; record versions.
- Fix the viewport and seeded world generation, but avoid exact screenshot matching.
- Explicitly navigate to and activate Continue to resume from pause.
- Run the smoke test in the existing Pages workflow before publishing; do not create a separate Pages deployment workflow.
- Use screenshots for visual inspection. Add a minimal read-only, test-mode-gated state hook only if robust behavioral assertions otherwise cannot be made.
- In the existing Pages workflow, run the smoke test before Pages upload/deployment; on failure retain test artifacts in Actions for 14 days and do not publish.
- On success, publish the eight diagnostic screenshots and seven promotional stills plus the approximately 30-second WebM showcase alongside the game, without committing generated media. Serve the stills through the responsive `demos/gallery.html` page.
- Keep WebM as the recording format; use no external recorder or conversion unless an observed playback problem requires revisiting the decision.

CI execution is part of this approved follow-up: the existing Pages deployment is gated on the headless smoke test, while its artifacts are uploaded even after failure.
