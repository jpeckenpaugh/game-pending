# Game Pending — Living Backlog

> **Product Manager:** The vibes are immaculate. Both briefs are loaded with gold.  
> **Rule #1:** No idea is a bad idea. Every concept lives here.  
> **Last Updated:** 2026-06-27

---

## Legend

| Tag | Meaning |
|-----|---------|
| `001` | From Design Brief 001 (the sensible one) |
| `002` | From Design Brief 002 (the weird one) |
| `BOTH` | Overlapping concepts from both briefs |

| Size | Meaning |
|------|---------|
| `S` | A few hours. Low complexity, familiar patterns. |
| `M` | About a day. Some new systems but nothing wild. |
| `L` | A few days. New subsystems or tricky state machines. |
| `XL` | A week+. Major new systems, rendering changes, or community features. |

---

## Level Themes

| # | Idea | Size | Deps | Brief | Chill PM Notes |
|---|------|------|------|-------|----------------|
| L-01 | Forest Canopy (mud patches, vine ladders, falling leaves) | M | — | 001 | Sprint-001 material. Canvas primitives, palette swap, instant vibe. |
| L-02 | Volcanic Cavern (lava pools, crumbling platforms, heat geysers) | L | Hazard zone system | 001 | Crumbling platforms are a *chef's kiss* mechanic. Second theme, easy call. |
| L-03 | Neon Cyberpunk (conveyor belts, holographic platforms, electrified walls) | L | Conveyor physics, hologram phasing | 001 | Hologram platforms are going to be annoying to playtest and I'm here for it. |
| L-04 | Haunted Crypt (flickering lights, phantom platforms, one-way drops) | L | Visibility system, platform phase logic | 001 | Flickering light visibility on enemies is devious. Love it. |
| L-05 | The Glitch Realm (z-fighting platforms, palette-swap zones, null tiles, memory leak zones) | XL | Pixel manipulation, simulated FPS drop, null tile projectile interaction | 002 | This is the one that makes people say "wait, WHAT." High concept, high payoff. The memory leak zone is *evil genius*. |
| L-06 | The Organism (breathing platforms, peristaltic tunnels, immune response, neural pathways, The Heart) | XL | Breathing cycle system, immune AI spawning, neural trigger system | 002 | "The level is alive" — this is art. Also a ton of work. Future sprint when we're feeling ambitious. |
| L-07 | The Legal Document (clause platforms, loophole passages, bureaucratic auditors, amendment zones) | L | Text rendering for platforms, legalese content pool | 002 | Platforms made of actual text. "Subject to change" platforms that move. This is *hilarious*. |
| L-08 | The Musical Score (waveform platforms, tempo zones, harmonic resonance, silence zones) | XL | Web Audio API integration, beat detection, tempo-based speed scaling | 002 | Rhythm mechanics in a platformer. Bold. Very bold. Could be legendary or a disaster. No in-between. |

---

## Monster Types

| # | Idea | Size | Deps | Brief | Chill PM Notes |
|---|------|------|------|-------|----------------|
| M-01 | Flyer — Diamond Head (flying patrol, sine-wave dive, can't be stomped) | M | — | 001 | Vertical threat. Forces aim-up gameplay. Clean design. |
| M-02 | Burrower — Pentagon Head (underground movement, periodic emergence, pack coordination) | L | Surface-detection helper, state machine | 001 | Watching the ground ripple before one pops up is going to make players nervous. Good nervous. |
| M-03 | Charger — Arrow Head (patrol → lock-on → charge → stunned) | L | Screen shake system | 001 | Baiting it into walls for a free kill is *chef's kiss* game design. |
| M-04 | Sniper — Hexagon Head (rooted, laser sight tracking, high-damage projectile) | L | Laser rendering, line-of-sight checks | 001 | Zone denial. Makes players think before they run. Tactical. |
| M-05 | The Mirror (copies player's last 5 actions with 2s delay) | M | Input history buffer | 002 | Fighting yourself. The meta-enemy. Killing it by walking off a cliff is *brilliant*. |
| M-06 | The Tutorial Ghost (gives inverted advice, gets frustrated if ignored) | M | Dialogue pool (50+ lines), aggression escalation | 002 | Comic Sans speech bubbles. Gets angry and goes ALL CAPS. This enemy is a meme generator. |
| M-07 | The Bug Reporter (files bugs about player exploits, manifests as game effects) | L | Exploit detection heuristics, popup UI system | 002 | Windows XP error dialog on screen. "BUG #427: Player camping." I'm crying. |
| M-08 | The Save File (kills run progress if destroyed, worth huge points) | M | Save state manipulation | 002 | Risk/reward as an *enemy*. Floppy disk with a worried expression. This is perfect. |

---

## Weapons

| # | Idea | Size | Deps | Brief | Chill PM Notes |
|---|------|------|------|-------|----------------|
| W-01 | Shotgun (5-pellet spread, 30° fan, short range, 3 ammo per shot) | M | — | 001 | Classic. Satisfying. Close-range devastation. Easy win. |
| W-02 | Grenade Launcher (arcing projectile, AoE explosion on terrain/timer contact) | L | Explosion system (effects.js addExplosion) | 001 | The explosion system opens doors for future content. Worth the investment. |
| W-03 | Boomerang (outgoing → return path, hits both ways, ammo refund on catch) | M | — | 001 | Reuses club hit tracking. Satisfying boomerang loop. Players will love the catch. |
| W-04 | Flame Thrower (continuous stream, DoT with burn, ammo drains while firing) | L | Burn status effect system | 001 | Sustained fire. Enemies catch flame. Visceral. |
| W-05 | Laser Beam (hit-scan, piercing, instant travel, narrow line) | M | Raycast system (raycastHit) | 001 | Precision weapon. Line up multi-kills. Feels *powerful*. |
| W-06 | Ricochet Shot (bounces off walls/platforms, up to 3 bounces, retains 85% speed) | M | Bounce physics on terrain collision | 001 | Bank shots in tight caves. High skill ceiling. |
| W-07 | Deployable Turret (stationary auto-firing turret, 15s duration, 20 shots max) | L | Turret entity management, AI targeting | 001 | Area control. Can only have 1 active. Strategic. |
| W-08 | The Question Mark (no damage, applies "philosophical crisis" debuff — enemies ponder mortality, take 2x damage, then enrage) | M | Debuff state on enemies, rage timer | 002 | "What am I?" thought bubbles. Enemies get *existential*. Then angry. Setup weapon for combos. |
| W-09 | The Receipt (1 damage hit + delayed "line item" damage over 5s, scrolls on screen) | L | Damage-over-time queue, floating receipt UI | 002 | "Emotional Damage: +1" on the receipt. "Tax: -1" (heals the enemy). I'm dead. |
| W-10 | The Typo (0 damage, misspells enemy name — target becomes "lost," wanders randomly) | M | Name-mangling system, "lost" AI state | 002 | "Goblin" → "Goblien" → "Danragon." Progressive misspelling until despawn. *Chef's kiss.* |
| W-11 | The Tax Form (1 damage + "Tax Audit" debuff — enemy files paperwork, can't act) | M | Progress bar UI, filing timer per enemy type | 002 | Briefcase projectile. Enemy gets a desk and starts writing. "W-2... 1099..." I can't. |
| W-12 | The GPS (0 damage, target becomes obsessed with finding its nonexistent destination) | M | Wandering AI override, immunity timer | 002 | "Recalculating... You are at (437, 289). Your destination is unknown." Enemies block each other. |
| W-13 | The Yelp Review (1 damage + stat reduction for 8s, stacked reviews cause "mental breakdown") | M | Stat modifier system, breakdown AI state | 002 | "2/10, would not get attacked again. Slow, predictable, ugly sprite." Review-bombing enemies into attacking their friends. |

---

## Power-Ups

| # | Idea | Size | Deps | Brief | Chill PM Notes |
|---|------|------|------|-------|----------------|
| P-01 | Haste (speed boost + dash at L6+) | M | Dash mechanic (invulnerability frames) | 001 | Simple, satisfying, immediate feel-change. Sprint-001 gold. |
| P-02 | Chrono (time slow radius + "Bullet Time" freeze at L6+) | L | dt multiplier on enemies/projectiles, bullet-time visual effect | 001 | Changes combat rhythm. Bullet time is a tactical nuke. |
| P-03 | Shade (invisibility + 3x ambush at L6+) | M | Aggro skip logic, ambush damage multiplier | 001 | Stealth playstyle. Shade + Shotgun = devastating ambush combo. |
| P-04 | Magnet (pulls ammo drops, auto-collect at L6+) | S | — | 001 | Quality-of-life power-up. Buffs ammo-hungry weapons indirectly. |
| P-05 | Mirror (deploy decoy that draws aggro, explodes at L6+) | M | Decoy entity, enemy targeting override, explosion reuse | 001 | Decoy + explosion. Strategic placement. Fun and clean. |
| P-06 | Ghost (phase dodge + phase walk through platforms at L6+) | L | Double-tap input tracking, collision bypass, platform pass-through | 001 | High skill expression. Phase through a platform to stomp an enemy. *Cool.* |
| P-07 | The Union Card (enemies go on strike for 15s, strike fund mechanic) | L | Enemy morale system, picket behavior, enrage state | 002 | Enemies holding tiny picket signs. "DENTAL COVERAGE." I'm sold. |
| P-08 | The Time Zone (different time rates for player vs enemies, projectiles unaffected) | L | Separate dt for player/enemies, dual clock HUD | 002 | "Bullet hell in slow motion." Your bullets are slow too. Devious twist. |
| P-09 | The Captcha (enemies must solve captcha before attacking, rare pass = buffed) | M | Procedural captcha UI, pass/fail logic | 002 | "Select all squares with existential dread." Enemies frozen checking. Funny. |
| P-10 | The Terms of Service (massive ToS, enemies bound by legal clauses, violation = damage) | L | ToS text rendering, clause-based stat modification | 002 | Enemies attacking for exactly 1 damage then looking confused. Lawyers for bosses. |
| P-11 | The Debug Mode (hitboxes visible, AI state text, frame counter, hidden objects glow) | S | — | 002 | Purely informational. Teaching tool. Low cost, high value for observant players. |
| P-12 | The Backup (undo one action per level, VHS rewind visual, enemies predict repeated rewinds) | L | Game state snapshot, 3s rollback, prediction counter | 002 | Single use per level. Safety net that encourages riskier play. Enemy prediction on abuse is *chef's kiss*. |

---

## Leaderboard

| # | Idea | Size | Deps | Brief | Chill PM Notes |
|---|------|------|------|-------|----------------|
| LB-01 | localStorage Leaderboard (local scores, up to 20 entries, zero infra) | S | — | 001 | Sprint-001 lock. Zero infrastructure. Immediate retention win. |
| LB-02 | localStorage + Share Code (GP-XXXX-XXXX-XXXX format, base36 encoding) | M | LB-01, encoding/decoding functions | 001 | Share codes for friendly competition. No server needed. |
| LB-03 | JSON Server Endpoint (minimal Python/Node server, daily/weekly/all-time tabs) | L | Server deployment, fetch() integration | 001 | True global board. But we have LB-01 for now. Future when we have users. |
| LB-04 | Daily Seed Challenge (fixed daily world seed, share-code fair comparison) | M | Seed system, daily reset logic | 001 | Replayability driver. Same seed = fair comparison. FOMO is a feature. |
| LB-05 | The Gossip Network (peer-to-peer score sharing, scores drift over hops) | XL | Async communication, encryption, relay system | 002 | Scores as "word of mouth." They decay. The leaderboard only exists because players keep it alive. Poetic. |
| LB-06 | The Dream Journal (scores → procedural dream stories, community interpretation) | XL | Procedural text generation, dream templates, interpretation UI | 002 | "The traveler crossed 47 bridges but fell from the 12th. The sun was angry." *Art.* |
| LB-07 | The Haunted Museum (top scores as haunted artifacts, ghost replays, weekly rotation) | XL | Artifact rendering, ghost replay system, curation voting | 002 | Touching an artifact replays that player's run. Cursed artifacts debuff your next run. *Incredible.* |
| LB-08 | The Black Market (scores as tradable currency, market fluctuations, short-selling) | XL | Market simulation, trading UI, price algorithms | 002 | Score economy. "Shorting" a score. Dual-skill system. Insane and brilliant. |
| LB-09 | The Therapy Session (emotional responses, community mood board, mood → difficulty) | L | Emotion input UI, mood aggregation, difficulty modifier | 002 | Community mood affects game difficulty. Sticky note leaderboard wall. Wholesome and weird. |
| LB-10 | The Prophecy Board (projected future scores, Fate Breaker bonus, prophecy collapse) | L | Projection algorithm, confidence ranges, sandbagging detection | 002 | Competing against your own predicted future. Crystal ball aesthetic. Wild. |

---

## AI Logic

| # | Idea | Size | Deps | Brief | Chill PM Notes |
|---|------|------|------|-------|----------------|
| AI-01 | Flyer AI (patrol → aggro dive → climb → patrol) | M | M-01 (Flyer monster) | 001 | State machine is clean and self-contained. Phase offset for multiples is smart. |
| AI-02 | Burrower AI (buried → emerge → active → submerge cycle, pack coordination) | L | M-02 (Burrower monster), surface detection | 001 | Staggered emerge/submerge so one is always above ground. Devious pack behavior. |
| AI-03 | Charger AI (patrol → lock-on → charge → stunned, environment interaction) | L | M-03 (Charger monster), screen shake | 001 | Can be baited into crumbling platforms or lava. Environmental interaction *chef's kiss*. |
| AI-04 | Sniper AI (idle → tracking → fire → cooldown, line-of-sight, body-blockable) | L | M-04 (Sniper monster), laser rendering | 001 | Zone denial. Square enemies can body-block shots. Tactical depth. |
| AI-05 | The Book Club (enemies "meet" every 30s, share learned player tactics, adapt as group) | L | Shared memory between enemy instances, knowledge base | 002 | Enemies *learn from each other*. Interrupt a meeting = confused half-implemented strategies. Brilliant. |
| AI-06 | The Fan Fiction Authors (enemies write narrative that affects player stats, player can "edit" text) | L | Floating text system, stat modifier from text, edit mechanic | 002 | "The hero's legs weak" → jump height -30%. Shoot the text to edit it to "strong legs." *Mind-blowing.* |
| AI-07 | The Union (enemies have morale, go on strike when low, negotiation mechanic) | L | Morale stat, strike behavior, negotiation UI | 002 | "GENERAL STRIKE" — complete the level pacifistically. Hire a strikebreaker. *Deep.* |
| AI-08 | The Podcast (enemy interviews player with multiple-choice, answers shared with all enemies) | L | Question/answer UI, information sharing across enemies | 002 | "What's your favorite weapon?" Answer honestly and fire enemies get mad. Information warfare. |
| AI-09 | The Band (enemies play instruments with gameplay effects, kill order matters) | XL | Procedural audio, instrument-specific AI, crowd morale | 002 | Kill the drummer = tempo drops. Kill the guitarist = platforms vanish. Musical combat. |
| AI-10 | The Friendship Circle (spare enemies → friendship meter → they fight for you) | L | Friendship meter, ally AI state, cross-type hostility | 002 | Pacifist path. Befriend ALL types → they fight each other → but boss is unbeatable without allies. *Incredible design.* |
| AI-11 | Boss AI Concept (multi-phase: charge → fly → root+spawn) | XL | All monster AI systems, arena transformation | 001 | Future boss. Charges, then flies, then roots and spawns minions. The big kahuna. |

---

## Shared Systems (Cross-Cutting)

These aren't features themselves but enable multiple items above.

| # | System | Size | Enables | Chill PM Notes |
|---|--------|------|---------|----------------|
| S-01 | Hazard Zone System (lava, null tiles, electrified walls) | M | L-02, L-03, L-05 | Build once, use everywhere. Damage zones are foundational. |
| S-02 | Screen Shake | S | M-03 (Charger), general juice | Small effect, huge feel improvement. |
| S-03 | Explosion System | M | W-02 (Grenade), P-05 (Mirror decoy) | AoE damage + visual. One system, two weapons. |
| S-04 | Raycast / Hit-Scan System | M | W-05 (Laser), M-04 (Sniper LOS) | Needed for laser weapons and sniper line-of-sight. |
| S-05 | Debuff State System | M | W-08 (Question Mark), W-10 (Typo), W-11 (Tax Form), W-12 (GPS), W-13 (Yelp) | Generic debuff framework. Many weird weapons depend on this. |
| S-06 | Input History Buffer | S | M-05 (Mirror enemy) | Circular buffer of last N player inputs. Simple but essential. |
| S-07 | Floating Text / UI Overlays | M | W-09 (Receipt), W-10 (Typo names), AI-06 (Fan Fiction), LB-06 (Dreams) | Many 002 ideas need floating text. Build a renderer for it. |
| S-08 | Enemy Morale System | L | P-07 (Union Card), AI-07 (Union AI) | Shared morale stat. Enables union mechanics on both sides. |
| S-09 | Procedural Text Generation | L | LB-06 (Dreams), W-09 (Receipts), W-13 (Yelp), LB-09 (Therapy) | Template-based text with variable slots. Content pipeline needed. |
| S-10 | Game State Snapshot / Rollback | L | P-12 (Backup) | 3-second state capture + replay. Expensive but powerful. |

---

## Sprint-001 Recommendation

Here's what we're building first. The goal: maximum visible progress, proven systems, and things that make players go "oh cool" within the first play session.

| # | Item | Why |
|---|------|-----|
| **L-01** | Forest Canopy | Simplest theme. Mud patches + vine visuals. Canvas primitives only. Instant visual variety. Sprint-001 lock. |
| **M-01** | Flyer (Diamond Head) | Flying enemies force vertical gameplay. Existing drawing primitives. Can't be stomped — tactical shift from jump-kill to aim-and-shoot. |
| **M-02** | Burrower (Pentagon Head) | Underground emergence is *chef's kiss* tension. The ground ripple before they pop up is going to make players paranoid. Good paranoid. |
| **W-01** | Shotgun | 5-pellet spread. Devastating close-range. Changes combat feel immediately. Uses existing projectile system. |
| **W-03** | Boomerang | Reuses club hit tracking. Outgoing + return path doubles value. Ammo refund on catch adds skill expression. |
| **P-01** | Haste | Speed boost + dash at L6+. Simplest new power-up. Immediate feel-change. High player satisfaction. |
| **LB-01** | localStorage Leaderboard | Zero infrastructure. Score tracking + local board. Retention win on day one. |
| **AI-01 + AI-02** | Flyer + Burrower AI | Implements the AI for our two new monsters. Self-contained state machines. Proves the new-enemy pipeline. |

**Total: 8 items.** Two new enemies, two new weapons, one power-up, one theme, one leaderboard, and the AI to make the enemies feel alive. Everything stays within vanilla JS/Canvas. Maximum fun per line of code.

**Deferred but buzzing:**
- Grenade Launcher (W-02) needs the explosion system — Sprint-002
- Charger (M-03) needs screen shake — Sprint-002
- The Glitch Realm (L-05) is the dream theme — Sprint-003+
- The Mirror enemy (M-05) is going to break players' brains — future sprint

---

*This backlog is alive. It grows. It evolves. It might even unionize.*
