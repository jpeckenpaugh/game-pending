# Tech Evaluation — Game Pending

> **Author**: Architect
> **Status**: Draft
> **Target**: PM review before Sprint 1 kick-off
> **Scope**: Libraries and packages across all major system needs

---

## Constraints Recap

- Zero dependencies and no build step — strong preference, not absolute rule
- All code uses ES modules (`import`/`export`)
- HTML5 Canvas side-scroller platformer in vanilla JS
- Future Godot port is possible — avoid painting into a JS-only corner
- Design briefs call for: procedural text, procedural music, procedural levels, P2P score sharing, pixel manipulation (Glitch Realm), spatial audio

---

## 1. Audio / SFX

**Current state**: No audio at all.

### Option A: Raw Web Audio API

**How it works**: Direct browser API. Create `AudioContext`, load buffers via `fetch` + `decodeAudioData`, play through `AudioBufferSourceNode` or `OscillatorNode`. No library — pure browser API.

**Pros**
- Zero dependency, zero file size
- Full control over scheduling, spatialization, effects chains
- Built-in oscillator for procedural music (no audio file assets needed)
- Excellent browser support (all modern browsers)
- Perfect ESM/no-build compatibility — it's a browser API

**Cons**
- Verbose boilerplate for basic playback (10-20 lines per sound)
- No built-in sprite sheet or pooling — you build your own
- Spatial audio requires manual `PannerNode` wiring
- Cross-browser quirks with `AudioContext` resume policy (autoplay restrictions)

**ESM/no-build compatibility**: Yes — it's a native browser API.

**Estimated file size impact**: 0 bytes (built-in).

**PM Recommendation**: Start here. The procedural music and spatial audio needs in the design briefs map directly to Web Audio primitives. Add a thin wrapper module (~200 lines) for sprite playback, pooling, and spatialization. Revisit if the wrapper becomes a maintenance burden.

---

### Option B: Howler.js

**How it works**: Popular audio library (~10KB gzipped). Wraps Web Audio API with a friendlier API. Handles sprite sheets, spatial audio, format fallback (Web Audio → HTML5 Audio), and auto-suspend/resume.

**Pros**
- Mature, battle-tested (used in hundreds of games)
- Handles browser autoplay restrictions gracefully
- Sprite sheet support out of the box
- Spatial audio with `pos()` and `pan()` methods
- Good documentation and community

**Cons**
- ~10KB gzipped — significant for a zero-dep project
- No ESM-native build (UMD/CJS, needs import map or bundler shim)
- No procedural music generation — still just sample playback
- Maintains its own audio context — conflicts with custom Web Audio work
- Locks you into its playback model

**ESM/no-build compatibility**: No native ESM. Requires an import map or `<script>` tag workaround. Breaks the zero-build-step constraint.

**Estimated file size impact**: ~10KB gzipped.

**PM Recommendation**: Not recommended. The ESM compatibility gap and file size make it a poor fit for the zero-dep constraint. Its strengths (sprites, spatial) can be replicated in a thin wrapper around raw Web Audio.

---

### Option C: Tone.js

**How it works**: Comprehensive audio framework (~120KB minified). Provides synthesis, effects, sequencing, transport (BPM-based scheduling), and visualization tools. Built on Web Audio API.

**Pros**
- Incredible for procedural music — built-in synth voices, effects, and a transport system
- BPM-accurate scheduling for rhythm-game mechanics (The Musical Score level)
- Envelope, filter, and effects chains without manual wiring
- Active development, good TypeScript types
- ESM-compatible build available

**Cons**
- ~120KB minified — massive for a game that doesn't need a DAW
- Overkill for SFX playback (jump, shoot, hit)
- Steep learning curve for the transport/scheduler model
- Heavier than the entire rest of the game combined
- Locks you into Tone.js's audio graph model

**ESM/no-build compatibility**: Yes — ships an ESM bundle.

**Estimated file size impact**: ~120KB minified (~40KB gzipped). This is 10-20x the size of the game's likely JS bundle.

**PM Recommendation**: Viable only if procedural music is a hard requirement in Sprint 1. Consider a hybrid: raw Web Audio for SFX, and conditionally load Tone.js only for levels that need procedural music. Or implement a minimal scheduler (~500 lines) that covers 80% of Tone.js's transport features.

---

### Option D: Crunker

**How it works**: Lightweight Web Audio utility library (~3KB). Provides concatenation, looping, and format conversion. Minimal abstraction over Web Audio.

**Pros**
- Tiny file size (~3KB)
- ESM-native with no build step required
- Good for basic operations: concat audio buffers, loop, convert formats
- Doesn't lock you into a model — thin wrapper, easy to eject

**Cons**
- Very limited feature set — no spatial audio, no sprite sheets, no scheduling
- No procedural music support
- Small community, less documentation
- Still requires raw Web Audio for most game needs

**ESM/no-build compatibility**: Yes.

**Estimated file size impact**: ~3KB.

**PM Recommendation**: Not worth the dependency. Its value is in buffer concatenation, which is trivial to implement. A homegrown wrapper module will cover more ground.

---

## 2. Graphics / Rendering

**Current state**: Canvas 2D with vector primitives (rectangles, lines). The design briefs call for pixel manipulation (Glitch Realm: `getImageData`/`putImageData` for scanlines, color bleed, sprite tearing).

### Option A: Canvas 2D (Current) with Advanced Techniques

**How it works**: Stay on `CanvasRenderingContext2D`. Use `getImageData`/`putImageData` for pixel manipulation, `createPattern` for tiling, `globalCompositeOperation` for blend modes, `drawImage` with source rects for sprite sheets, `setTransform` for rotation/scaling.

**Pros**
- Zero dependency, zero file size
- Perfect ESM/no-build compatibility
- Full pixel-level control (Glitch Realm needs this)
- Easy to reason about — no WebGL shader language
- Godot portability: Godot's 2D renderer has a similar API surface
- Fast enough for a side-scroller with modest sprite counts

**Cons**
- No hardware acceleration — pixel manipulation (`getImageData`) is CPU-bound
- No built-in sprite batching — each `drawImage` is a separate draw call
- Limited blend modes compared to WebGL
- Performance degrades with many overlapping transparent sprites
- No built-in camera/viewport system — you manage transforms manually

**ESM/no-build compatibility**: Yes — native browser API.

**Estimated file size impact**: 0 bytes.

**PM Recommendation**: Strong default. The game's line-art aesthetic and modest entity count won't hit Canvas 2D's performance ceiling. Pixel manipulation for Glitch Realm is straightforward. If frame rate becomes an issue in profiling, the path to WebGL is open — but don't optimize prematurely.

---

### Option B: PixiJS (WebGL)

**How it works**: 2D WebGL rendering engine (~150KB minified). Provides sprite batching, texture atlases, filters (blur, color matrix, displacement), container hierarchy, and a scene graph. Falls back to Canvas 2D if WebGL unavailable.

**Pros**
- GPU-accelerated rendering — handles thousands of sprites at 60fps
- Built-in filter system: blur, color matrix, displacement maps, displacement filters — directly useful for Glitch Realm
- Texture atlas support for efficient sprite sheets
- Container hierarchy for scene management (camera, parallax layers)
- Large community, excellent documentation

**Cons**
- ~150KB minified — huge for a zero-dep project
- ESM build available but adds import complexity
- Abstracts away WebGL — debugging shader issues requires understanding WebGL anyway
- Displacement filters are expensive on mobile
- Overkill for a line-art aesthetic that doesn't need many sprites
- Godot portability: PixiJS patterns don't map to Godot's scene system

**ESM/no-build compatibility**: Yes — PixiJS v7+ ships ESM builds.

**Estimated file size impact**: ~150KB minified (~50KB gzipped). 50x the likely size of the game's own code.

**PM Recommendation**: Not recommended for Sprint 1. The line-art aesthetic and modest entity count don't justify the weight. If profiling reveals Canvas 2D bottlenecks in later sprints, PixiJS is the right upgrade path — but not before it's needed.

---

### Option C: Custom WebGL Renderer (DIY)

**How it works**: Write a thin WebGL wrapper (~500-1000 lines) that handles sprite batching, texture loading, and a basic shader pipeline. Use GLSL fragment shaders for post-processing effects.

**Pros**
- Full GPU acceleration with minimal abstraction
- Custom shaders for Glitch Realm effects (scanlines, color bleed, distortion) are trivial in GLSL
- No dependency — you own every line
- Educational — you understand exactly what the renderer does
- Godot portability: shader concepts transfer directly to Godot's shader language

**Cons**
- Significant implementation effort (1-2 weeks for a solid foundation)
- WebGL boilerplate is verbose (context setup, shader compilation, attribute binding)
- Mobile WebGL quirks (texture size limits, precision mediump)
- No community support for debugging
- You're building a mini PixiJS

**ESM/no-build compatibility**: Yes.

**Estimated file size impact**: ~15-30KB for a functional sprite batcher with post-processing.

**PM Recommendation**: Tempting but premature. The effort to build a reliable WebGL renderer exceeds the value for a line-art platformer. Revisit if Canvas 2D proves insufficient and PixiJS feels too heavy.

---

## 3. Data Persistence

**Current state**: Nothing yet. The design briefs mention procedural content, player progress, and a gossip-network leaderboard.

### Option A: localStorage

**How it works**: Browser's synchronous key-value store. `localStorage.setItem('key', JSON.stringify(data))` / `getItem`. 5-10MB limit depending on browser. Data persists across sessions for the same origin.

**Pros**
- Zero dependency, trivial API
- Synchronous reads — no async complexity
- Well-supported across all browsers
- Perfect for settings, high scores, unlocked levels
- Godot portability: Godot has equivalent `ConfigFile` / `FileAccess` APIs

**Cons**
- 5-10MB limit — tight for procedural content definitions or large save states
- Blocks the main thread on read/write (fine for small data, bad for large)
- No query capability — you load the entire blob or nothing
- No structured data — everything is strings (JSON.parse/stringify overhead)
- Not available in Web Workers (shared storage, race conditions)

**ESM/no-build compatibility**: Yes.

**Estimated file size impact**: 0 bytes.

**PM Recommendation**: Use it. localStorage is the right tool for settings, high scores, and small save states. Don't overthink this — it's the simplest solution and covers 90% of persistence needs.

---

### Option B: IndexedDB

**How it works**: Browser's async key-value/structured store. Supports indexes, transactions, and large data sets (hundreds of MB). Accessed via `IDBDatabase` API or wrappers.

**Pros**
- Large storage capacity (hundreds of MB, browser-dependent)
- Async reads/writes — no main thread blocking
- Structured queries via indexes (useful for leaderboard data)
- Available in Web Workers (background persistence)
- Handles complex data models natively

**Cons**
- Verbose, callback-heavy raw API (even the Promise wrapper is clunky)
- Transaction model is unintuitive (auto-commit semantics)
- Overkill for settings and high scores
- Godot portability: Godot doesn't have an IndexedDB equivalent — you'd need a Godot HTTP server or file-based persistence

**ESM/no-build compatibility**: Yes, but the raw API is painful. A thin wrapper is needed.

**Estimated file size impact**: 0 bytes (browser API).

**PM Recommendation**: Use only if you need to store large procedural content definitions or complex save states that exceed localStorage. For most game data, localStorage is sufficient. Consider it for the gossip network's local score cache if scores need compression or indexing.

---

### Option C: Simple JSON File (Server)

**How it works**: A lightweight backend (Express, Hono, or even a Python SimpleHTTPServer) serves and accepts JSON files. Player data is a JSON file on the server, identified by player ID.

**Pros**
- Simple mental model — read/write a file
- Shared across devices (if player has an account)
- Easy to debug (just look at the JSON file)
- Server can validate and sanitize data

**Cons**
- Requires a server — adds infrastructure complexity
- No offline play — the game needs a network connection
- Concurrency issues if multiple tabs/devices write simultaneously
- Security: client-controlled JSON files are a cheat vector
- Doesn't fit the "zero build step" philosophy — now you need a server

**ESM/no-build compatibility**: N/A — this is a server-side concern. The client uses `fetch`.

**Estimated file size impact**: 0 bytes client-side. Server infrastructure required.

**PM Recommendation**: Not recommended for Sprint 1. The gossip network leaderboard is a later feature and may not need a traditional server (see Networking section). Local persistence via localStorage is sufficient for the MVP.

---

## 4. Procedural / Generative Content

**Current state**: No procedural systems yet. The design briefs call for: procedural Yelp reviews, procedural dreams, procedural music, procedural levels.

### Option A: Template-Based Generation

**How it works**: Define templates with placeholders. `"The {adjective} {noun} {verb} the {object}."` Fill placeholders from curated pools at runtime. Simple string interpolation.

**Pros**
- Trivial to implement (~100 lines)
- Content quality is high — you control every output
- No runtime learning or training data needed
- Deterministic with seeded RNG — reproducible for debugging
- Easy to extend: add a new template, new words
- Godot portability: GDScript has identical string interpolation

**Cons**
- Limited variety — outputs feel samey after many iterations
- No emergent behavior — every output is pre-designed
- Pool sizes grow linearly with desired variety
- Not suitable for procedural music (too rigid)

**ESM/no-build compatibility**: Yes.

**Estimated file size impact**: ~1-5KB for templates + word pools.

**PM Recommendation**: Use it as the foundation. Template-based generation covers Yelp reviews, dreams, and Tutorial Ghost dialogue. The quality floor is high and the implementation is trivial. Layer more sophisticated techniques on top for specific use cases.

---

### Option B: Markov Chains

**How it works**: Build a probability table from source text. At generation time, pick the next word based on the previous N words (N=2 for bigrams, N=3 for trigrams). Produces semi-coherent text that's different every run.

**Pros**
- Higher variety than templates — nearly infinite output
- Can be trained on curated source text to control tone
- Relatively simple to implement (~150 lines for a bigram model)
- Deterministic with seeded RNG
- Works for text AND simple music sequences (note transitions)

**Cons**
- Quality is inconsistent — sometimes produces nonsense
- Requires source text (training data) for each content type
- No understanding of meaning — "The dragon ate the ceiling" is a valid output
- Storage: the transition table can be large for high-order chains
- Hard to constrain outputs (e.g., "make it exactly 3 sentences")

**ESM/no-build compatibility**: Yes.

**Estimated file size impact**: ~5-20KB depending on source text size and chain order.

**PM Recommendation**: Layer this on top of templates for dream generation and Yelp reviews. Use templates for structure, Markov for word choice. This hybrid approach gives quality + variety without the downsides of either technique alone.

---

### Option C: Grammar-Based Generation (CFG / PCFG)

**How it works**: Define a context-free grammar with production rules. `"sentence" → "noun_phrase" "verb_phrase"`. Probabilistic CFGs add weights to rules, allowing controlled randomness. Parse trees are generated at runtime.

**Pros**
- Structurally coherent outputs — grammar guarantees syntactic validity
- Highly controllable — add a rule, constrain a category
- Supports recursive structures (useful for level generation)
- Well-understood computer science (formal language theory)
- Can generate text, music theory, level layouts, dialogue trees

**Cons**
- More complex to implement than templates (~300-500 lines)
- Grammar design requires linguistic/music theory knowledge
- Debugging malformed outputs requires parser/grammar expertise
- Less variety than Markov for free-form text

**ESM/no-build compatibility**: Yes.

**Estimated file size impact**: ~2-10KB for grammar rules.

**PM Recommendation**: Use for level generation. The terrain structure in the design briefs (clause platforms, breathing platforms, waveform platforms) is inherently hierarchical — grammars model hierarchy naturally. Text generation can stay template+Markov.

---

### Option D: Simple Random Pools

**How it works**: Curated arrays of pre-written content. `const reviews = ["Great service!", "Terrible wait time.", ...]`. Pick one at random. No generation — just selection.

**Pros**
- Dead simple (~10 lines)
- Perfect quality — every output is hand-crafted
- No runtime computation
- Deterministic with seeded RNG
- Easy for designers to maintain

**Cons**
- Fixed variety — players see repeats quickly
- Storage grows linearly with desired variety
- No emergent behavior
- Boring for procedural systems that promise uniqueness

**ESM/no-build compatibility**: Yes.

**Estimated file size impact**: ~2-20KB depending on pool size.

**PM Recommendation**: Use as the quality floor. Every procedural system should have a random pool fallback. When the template/Markov/grammar engine produces garbage, fall back to a curated pool entry. This ensures a minimum quality bar.

---

## 5. Networking / Async

**Current state**: Nothing yet. The design briefs describe a "Gossip Network" leaderboard where scores are carried peer-to-peer between sessions, and a potential server endpoint.

### Option A: Fetch + Simple Server

**How it works**: A minimal HTTP server (Express, Hono, or even Cloudflare Workers) exposes a few endpoints: `POST /scores` (submit), `GET /scores` (leaderboard), `GET /scores/:id` (player score). Client uses `fetch()` for all communication.

**Pros**
- Simplest possible architecture — standard HTTP
- Works through firewalls, proxies, and corporate networks
- No persistent connections to manage
- Easy to deploy (any static host + API server, or serverless)
- Caching and CDN-friendly for leaderboard reads
- Godot portability: Godot's `HTTPRequest` node handles fetch natively

**Cons**
- Request/response latency — no real-time push
- Server required — adds cost and maintenance
- Not suitable for the gossip network concept (which needs P2P)
- Rate limiting needed to prevent abuse

**ESM/no-build compatibility**: Yes — `fetch` is a browser API.

**Estimated file size impact**: 0 bytes client-side.

**PM Recommendation**: Use for the MVP leaderboard. A simple server with 2-3 endpoints covers score submission and retrieval. The gossip network is a later feature that can layer on top. Don't let the gossip concept prevent shipping a basic leaderboard.

---

### Option B: WebRTC (P2P)

**How it works**: Browser-native peer-to-peer protocol. Two clients establish a direct connection via ICE/STUN/TURN. Data flows peer-to-peer without a server (except for signaling and NAT traversal).

**Pros**
- True P2P — no server for data transfer (fits the gossip network concept)
- Low latency — direct connection
- Encrypted by default (DTLS)
- Browser-native — no plugins needed
- Supports data channels (arbitrary data) and media streams

**Cons**
- Complex signaling: you still need a server to exchange SDP offers/answers
- NAT traversal is unreliable — TURN servers needed as fallback (costs money)
- Connection establishment is slow (2-5 seconds)
- No guaranteed delivery — you build reliability on top
- Ephemeral: peers must be online simultaneously
- Godot portability: Godot has WebRTC support but it's less mature than HTTP

**ESM/no-build compatibility**: Yes.

**Estimated file size impact**: 0 bytes (browser API). Signaling server needed.

**PM Recommendation**: Technically fascinating but operationally complex. The gossip network concept requires peers to be online simultaneously, which is unreliable for a casual game. Consider a hybrid: scores are stored on a lightweight server, but the gossip "distortion" mechanic is simulated client-side (scores drift locally based on a seed). This gives the aesthetic without the P2P infrastructure.

---

### Option C: WebSocket

**How it works**: Persistent TCP-like connection between client and server. Bidirectional communication with low latency. Server can push updates to clients in real-time.

**Pros**
- Real-time bidirectional communication
- Lower latency than fetch for frequent updates
- Good for live leaderboards, chat, or multiplayer
- Well-supported in browsers and server frameworks
- Godot portability: Godot's `WebSocketPeer` node is mature

**Cons**
- Requires a persistent server — more infrastructure than fetch
- Connection management: reconnect logic, heartbeat, timeout
- More complex than fetch for simple CRUD operations
- Scaling WebSocket servers is harder than stateless HTTP
- Overkill for a single-player game's leaderboard

**ESM/no-build compatibility**: Yes.

**Estimated file size impact**: 0 bytes client-side.

**PM Recommendation**: Overkill for the MVP. Use fetch for score submission/retrieval. If you add real-time features later (live chat, multiplayer races), WebSocket is the right choice. Don't add it until there's a concrete use case.

---

## 6. Summary Matrix

| Area | Recommended (MVP) | Viable Upgrade | Avoid |
|------|-------------------|----------------|-------|
| **Audio** | Raw Web Audio API + thin wrapper | Tone.js (conditional load for procedural music) | Howler.js, Crunker |
| **Graphics** | Canvas 2D (current) | PixiJS (if perf requires) | DIY WebGL renderer |
| **Persistence** | localStorage | IndexedDB (for large data) | Server JSON files |
| **Procedural** | Templates + Markov (hybrid) | Grammar-based (for levels) | Pure random pools alone |
| **Networking** | Fetch + simple server | WebSocket (if real-time needed) | WebRTC (premature) |

---

## 7. Key Decisions

### Decision 1: Keep it dependency-free for Sprint 1

**Rationale**: The zero-dep constraint is a strength, not a limitation. Web Audio, Canvas 2D, localStorage, and fetch cover every MVP need. A thin homegrown wrapper (~500 lines total) for audio and procedural generation is cheaper than integrating and debugging a library.

### Decision 2: Template + Markov hybrid for procedural text

**Rationale**: Templates guarantee structure (3 sentences, specific categories). Markov chains add word-level variety. Neither technique alone is sufficient. Combined, they produce high-quality, varied output in <200 lines of code.

### Decision 3: Fetch for networking, simulate gossip client-side

**Rationale**: The gossip network concept is compelling but operationally complex (NAT traversal, peer availability, TURN servers). A simple HTTP leaderboard ships in a day. The gossip "distortion" aesthetic can be simulated: scores drift locally based on a deterministic seed, giving the illusion of imperfect memory without P2P infrastructure.

### Decision 4: Canvas 2D until profiling says otherwise

**Rationale**: The line-art aesthetic doesn't need GPU acceleration. `getImageData`/`putImageData` covers Glitch Realm's pixel manipulation needs. If entity count or post-processing becomes a bottleneck, PixiJS is the right upgrade — but premature optimization wastes time.

---

## 8. Future Considerations (Godot Port)

When porting to Godot, these JS-specific choices map cleanly:

| JS Concept | Godot Equivalent |
|-----------|-----------------|
| Web Audio API | `AudioStreamPlayer`, `AudioBus` |
| Canvas 2D | Godot 2D renderer (Node2D) |
| localStorage | `ConfigFile`, `FileAccess` |
| fetch | `HTTPRequest` node |
| ES modules | GDScript class system |

The recommended approach (raw APIs, no heavy JS libraries) keeps the port surface clean. There are no JS-specific abstractions to unwind — just direct API calls that map to Godot equivalents.

---

## Appendix: File Size Budget

Assuming a zero-dependency MVP:

| Module | Estimated Size |
|--------|---------------|
| Game engine (input, physics, entities) | ~15KB |
| Renderer (Canvas 2D wrapper) | ~5KB |
| Audio (Web Audio wrapper) | ~3KB |
| Procedural (templates, Markov, RNG) | ~5KB |
| Persistence (localStorage wrapper) | ~1KB |
| Networking (fetch wrapper) | ~1KB |
| **Total JS bundle** | **~30KB** |

This is well within the budget for a fast-loading HTML5 game. Adding PixiJS (~50KB gzipped) would double the bundle. Adding Tone.js (~40KB gzipped) would triple it. Keeping the zero-dep approach preserves the fast load time as a competitive advantage.
