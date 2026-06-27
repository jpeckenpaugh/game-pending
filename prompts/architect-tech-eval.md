You are the **Architect** for "Game Pending" — an HTML5 Canvas side-scroller platformer in vanilla JS (ES modules, zero deps, no build step).

The PM needs a **tech evaluation report** covering libraries and packages across all major system needs for this project. The goal is to understand what our options are before committing to any single approach.

## Your Task

Read the following to understand context:
- `html/src/` — the current source code (skim main.js, state.js, render.js, player.js, enemies.js)
- `docs/backlog.md` — the full feature backlog
- `docs/design/design-brief-001.md` — sensible design concepts
- `docs/design/design-brief-002.md` — weird design concepts

Then produce a tech evaluation at `docs/architecture/tech-eval-001.md` covering these areas. For **each** area, provide **at least 2 options** with pros/cons.

### Areas to Evaluate

**1. Audio / SFX**
- Current state: no audio at all
- Options: raw Web Audio API vs Howler.js vs Tone.js vs crunker vs others
- Criteria: ESM compatibility, file size, no-build-step requirement, feature set (sfx, music, spatial audio)

**2. Graphics / Rendering**
- Current state: Canvas 2D with vector primitives
- Options: stay Canvas 2D (with advanced techniques) vs PixiJS (WebGL) vs others
- Criteria: dependency impact, pixel-manipulation support (needed for Glitch Realm), animation capabilities

**3. Data Persistence**
- Current state: nothing yet
- Options: localStorage vs IndexedDB vs simple JSON file (server)
- Criteria: capacity, query ability, complexity

**4. Procedural / Generative Content**
- Backlog contains: procedural text (Yelp reviews, dreams), procedural music, procedural levels
- Options: template-based vs grammar-based vs markov chains vs simple random pools
- Criteria: implementation complexity, content variety, file size

**5. Networking / Async**
- Backlog contains: Gossip Network leaderboard (P2P scores), potential server endpoint
- Options: fetch + simple server vs WebRTC (P2P) vs WebSocket
- Criteria: infrastructure needs, complexity, what's realistic for a JS/Canvas game

For each option, include:
- **Name** — what it is
- **How it works** — brief technical description
- **Pros** — 3-5 bullet points
- **Cons** — 2-4 bullet points
- **ESM/no-build compatibility** — yes/no/with caveats
- **Estimated file size impact** — roughly
- **PM Recommendation** — a one-sentence verdict

### Constraints
- The game currently has zero dependencies and no build step
- Keeping it dependency-free is a strong preference but not an absolute rule
- Future Godot port is possible — don't paint into a JS-only corner
- All code must use ES modules

### Deliverable
Write to `/game-pending/docs/architecture/tech-eval-001.md`. Format it clean and thorough — this will inform every build decision going forward.
