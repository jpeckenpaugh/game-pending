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
5. Save screenshots and browser diagnostics to a host-accessible artifact directory.
6. Exit nonzero on a failed assertion or browser/runtime error, and zero on success.

The runner must work on ordinary developer/CI machines and must not depend on a physical display, VNC, GPU, or credentials. Keep the existing development Docker service focused on its current purpose; prefer a separate test-runner image/service.

## Proposed first workflow

Use the existing keyboard navigation and gameplay controls. Repository inspection confirmed the title-to-Customize route and that the Customize appearance fields are keyboard-editable. Change the Color Theme for the first POC; it is a concise, visible change. Confirm exact key sequencing against `html/src/input.js` and `html/src/customize.js` during implementation.

1. Open the locally served game and wait for the title screen.
2. Capture `01-title.png`.
3. Open Customize using keyboard navigation.
4. Change the Color Theme, save, and verify return to the title screen.
5. Capture `02-customized-title.png`.
6. Start a new game and verify the gameplay HUD is present.
7. Capture `03-game-start.png`.
8. Exercise movement and jump with keyboard inputs; capture `04-movement.png`.
9. Fire at least one shot and assert ammo decreases; capture `05-fired.png`.
10. Pause with Enter, navigate to Continue in the pause menu, activate it with Enter, and verify return to gameplay.
11. Capture `06-resumed.png` and finish with a structured pass/fail summary.

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
- Add a timeout and clean shutdown for the server/browser so failed tests do not leave processes running.

## Assertions and observability

Initially, assert what can be observed robustly:

- The page loads and the Canvas exists.
- Keyboard menu actions reach Customize and return to the title screen.
- Starting a game displays the Level/Ammo/Enemies HUD.
- A shot reduces ammo.
- Pause/resume transitions produce the expected visible state.
- No uncaught page errors occur.

Canvas content is not exposed as normal DOM text, so Playwright cannot query the HUD as ordinary page text. Use screenshots as visual evidence, not brittle OCR/pixel assertions. If reliable pass/fail assertions for game state (including ammo) cannot be made from browser-visible behavior, add a minimal read-only test adapter (e.g. a test-only `window` hook reporting state, ammo, and enemy count). Gate the seam to test mode/build so it is unavailable in normal production use. Avoid adding it preemptively if the assertions can be made robustly without it.

Screenshot comparison should initially be for human/agent inspection, not strict pixel-diff pass/fail. Fonts, antialiasing, and browser rendering can make exact image comparisons noisy.

## Non-goals for the first POC

- VNC/noVNC, a Linux desktop environment, or manual remote control.
- Mouse-coordinate automation; current workflows can be keyboard-only.
- Cross-browser, mobile-device, or GPU compatibility matrices.
- Full end-to-end campaign completion or autonomous gameplay strategy.
- Pixel-perfect visual regression thresholds.
- A general scenario DSL, test authoring UI, or test management system.
- GitHub Actions/CI integration in this initial POC; establish the local/agent run and artifacts first, then consider CI separately.
- Changes to game mechanics solely to make the POC pass, without a separately agreed product/testability rationale.

## Acceptance criteria

- A new developer/agent can follow one documented command without a pre-existing browser or desktop session; the test container is separate from the existing development service.
- The run uses the current working tree's game files and a real browser engine with pinned Playwright/Chromium versions.
- A successful run emits all named screenshots and a clear success result.
- A deliberately broken assertion or page error causes a nonzero exit and retains failure artifacts.
- The runner shuts down cleanly and does not modify game source or leave generated files tracked.
- The test command and artifact locations are documented in the README or a dedicated test-runner section once implemented. CI integration remains out of scope for this POC.

## Decisions to resolve before implementation

These decisions are approved for the POC:

- Use a dedicated `test-runner/` directory and an isolated single-container test entry point; do not reuse or expand the development Compose service.
- Write artifacts to ignored `test-artifacts/`.
- Change the Color Theme in Customize.
- Pin Playwright and its corresponding Chromium version; record versions.
- Fix the viewport and seeded world generation, but avoid exact screenshot matching.
- Explicitly navigate to and activate Continue to resume from pause.
- Keep CI integration out of scope until local/agent execution is established.
- Use screenshots for visual inspection. Add a minimal read-only, test-mode-gated state hook only if robust behavioral assertions otherwise cannot be made.

Before implementation, the engineer should do a final sanity check of this plan against the repository and report any remaining blocker or contradiction. No implementation should begin until the PM explicitly green-lights it.
