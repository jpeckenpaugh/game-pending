# Game Pending — CEO BACKLOG REVIEW

> **From:** The Product Manager  
> **To:** Everyone  
> **Re:** The CEO called. We're pivoting hard.  
> **Date:** 2026-06-27

---

## The Memo

The CEO looked at Sprint-001 and said: *"This is competent. Competent is not a feature."*

Forest Canopy. Shotgun. Haste. localStorage leaderboard. These are the things every platformer ships with. We're not making every platformer. We're making THE platformer.

The directive: **Novelty first. Feasibility second. Screenshot-worthy moments first. Familiar patterns last.**

This isn't a re-sprint. This is a re-orientation. We're not throwing out solid foundations — we're putting the weird stuff *on top* where it can be seen.

New rule for every item: **"Would someone screenshot this and send it to a friend?"** If the answer is no, it better be earning its spot through sheer mechanical excellence.

---

## CEO's Priorities

These are the items the CEO wants us obsessing over. They're weird, they're risky, and they're exactly what makes a game people *talk* about. Sorted by "holy shit" factor.

| # | Item | Why the CEO Loves It | Risk Score | Tag | Size | Deps |
|---|------|---------------------|-----------|-----|------|------|
| L-05 | **The Glitch Realm** (z-fighting platforms, palette-swap zones, null tiles, memory leak zones) | "People will think the game is broken. That's the POINT. The memory leak zone is evil genius. This is the level that gets shared." | High | ✨ Showstopper | XL | Pixel manipulation, simulated FPS drop, null tile projectile interaction |
| M-05 | **The Mirror** (copies player's last 5 actions with 2s delay) | "Fighting yourself is the most memorable thing in gaming. Killing it by walking off a cliff is *brilliant.*" | High | ✨ Showstopper | M | Input history buffer |
| M-06 | **The Tutorial Ghost** (gives inverted advice, gets frustrated if ignored) | "Comic Sans speech bubbles. ALL CAPS when angry. This enemy is a meme generator. People will clip this." | Medium | ✨ Showstopper | M | Dialogue pool (50+ lines), aggression escalation |
| M-07 | **The Bug Reporter** (files bugs about player exploits, manifests as game effects) | "Windows XP error dialog on screen. 'BUG #427: Player camping.' I'm crying. This is comedy gold." | High | ✨ Showstopper | L | Exploit detection heuristics, popup UI system |
| L-06 | **The Organism** (breathing platforms, peristaltic tunnels, immune response, The Heart) | "The level is ALIVE. This is art. The Heart at the center — players will feel something." | High | ✨ Showstopper | XL | Breathing cycle system, immune AI spawning, neural trigger system |
| W-08 | **The Question Mark** (no damage, applies "philosophical crisis" debuff — enemies ponder mortality) | "'What am I?' thought bubbles. Enemies get *existential.* Then ENRAGE. This weapon is a conversation starter." | Medium | ✨ Showstopper | M | Debuff state on enemies, rage timer |
| W-13 | **The Yelp Review** (1 damage + stat reduction, stacked reviews cause 'mental breakdown') | "'2/10, would not get attacked again.' Review-bombing enemies into attacking their friends. I'm dead." | Medium | ✨ Showstopper | M | Stat modifier system, breakdown AI state |
| LB-07 | **The Haunted Museum** (top scores as haunted artifacts, ghost replays, weekly rotation) | "Touching an artifact replays that player's run. CURSED artifacts debuff your next run. *Incredible.*" | High | ✨ Showstopper | XL | Artifact rendering, ghost replay system, curation voting |
| AI-06 | **The Fan Fiction Authors** (enemies write narrative that affects player stats, player can 'edit' text) | "'The hero's legs weak' → jump height -30%. Shoot the text to edit it to 'strong legs.' *Mind-blowing.*" | High | ✨ Showstopper | L | Floating text system, stat modifier from text, edit mechanic |
| AI-09 | **The Band** (enemies play instruments with gameplay effects, kill order matters) | "Kill the drummer = tempo drops. Kill the guitarist = platforms vanish. MUSICAL COMBAT." | High | ✨ Showstopper | XL | Procedural audio, instrument-specific AI, crowd morale |
| L-08 | **The Musical Score** (waveform platforms, tempo zones, harmonic resonance, silence zones) | "Rhythm mechanics in a platformer. Could be legendary or a disaster. No in-between. I love it." | High | ✨ Showstopper | XL | Web Audio API integration, beat detection, tempo-based speed scaling |
| AI-10 | **The Friendship Circle** (spare enemies → friendship meter → they fight for you) | "Pacifist path. Befriend ALL types → they fight each other → but boss is unbeatable without allies. *Incredible design.*" | High | ✨ Showstopper | L | Friendship meter, ally AI state, cross-type hostility |

---

## Fresh from the CEO

These ideas came straight out of the CEO's brain after seeing the backlog. They're not in either brief. They're unhinged. We love them.

| # | New Idea | Description | Risk Score | Tag | Size | Deps |
|---|----------|-------------|-----------|-----|------|------|
| NEW-01 | **The Roast** (weapon: enemies trash-talk the player, damage scales with humor rating) | A weapon that roasts the player. Every enemy has a unique insult pool. The funnier the roast, the MORE DAMAGE IT DOES TO YOU. Players have to dodge jokes. Screenshot potential: the moment a goblin makes you laugh and you take 50 damage. The rating system uses a "Comedy Meter" UI that shows live audience reactions. | High | ✨ Showstopper | L | S-05 (Debuff State), S-07 (Floating Text), humor rating algorithm |
| NEW-02 | **The Photo Mode** (literal camera — take a photo of the boss, flash stuns it, photos become collectible gallery) | A weapon that's literally a camera. Flash stuns the boss. Photos go into a gallery. But the gallery is PUBLIC — other players see your worst photos. The game roasts your photography. "Blurry. 2/10. Would not frame." The gallery becomes the real endgame. | High | ✨ Showstopper | L | S-07 (Floating Text), gallery storage, photo quality scoring |
| NEW-03 | **The Glitch Shop** (NPC that sells you bugs — literal software bugs as power-ups) | A shop where you BUY bugs. "Null Pointer: fall through any platform once." "Stack Overflow: your jump height is now infinite (for 3 seconds)." "Segfault: the level geometry breaks." Every purchase is a gamble. The shopkeeper is a smug little error message. Players will screenshot their bug collections. | High | ✨ Showstopper | L | S-05 (Debuff), S-07 (Floating Text), bug effect system |
| NEW-04 | **The Time Paradox** (kill your past self, gain its items — but past self was BETTER than you) | Every level, a ghost of your best previous run appears. Kill it and loot drops. But your past self had YOUR ITEMS and played PERFECTLY. You're fighting a version of yourself that didn't miss that jump. The loot is worth it though. Screenshot: watching yourself die to... yourself. | High | ✨ Showstopper | XL | S-06 (Input History), ghost replay system, loot table |
| NEW-05 | **The Director's Commentary** (post-game audio commentary from the developers — but it's IN CHARACTER as the monsters) | After beating a level, unlock "Director's Commentary" where the monsters talk about the level design. "I was supposed to patrol here but the developer forgot to set my waypoint." "This platform is load-bearing. Please don't break it." The monsters are sentient game developers. The final boss's commentary is a 10-minute rant about work-life balance. | Medium | ✨ Showstopper | M | S-07 (Floating Text), audio system, commentary content |

---

## The Full Prioritized Backlog

Every item from the original backlog, re-tagged and risk-scored. Items are ordered by the CEO's priority, not the original recommendation.

---

### Level Themes

| # | Idea | Risk | Tag | Size | Deps | Notes |
|---|------|------|-----|------|------|-------|
| L-05 | The Glitch Realm | High | ✨ Showstopper | XL | Pixel manipulation, simulated FPS drop, null tile projectile interaction | THE dream level. People will think the game crashed. Perfect. |
| L-06 | The Organism | High | ✨ Showstopper | XL | Breathing cycle system, immune AI spawning, neural trigger system | Living level. Art. Ambition incarnate. |
| L-08 | The Musical Score | High | ✨ Showstopper | XL | Web Audio API, beat detection, tempo-based speed scaling | Rhythm platformer. Legendary or disaster. Worth it. |
| L-07 | The Legal Document | Medium | 👍 Solid | L | Text rendering for platforms, legalese content pool | "Subject to change" platforms that move. Hilarious. |
| L-04 | Haunted Crypt | Medium | 👍 Solid | L | Visibility system, platform phase logic | Flickering lights + phantom platforms = good tension. |
| L-03 | Neon Cyberpunk | Medium | 👍 Solid | L | Conveyor physics, hologram phasing | Hologram phasing is a fun mechanic. |
| L-02 | Volcanic Cavern | Low | 👍 Solid | L | Hazard zone system | Crumbling platforms are solid. Standard but good. |
| L-01 | Forest Canopy | Low | 🤷 Try It | M | — | Sprint-001 material but... it's a forest. Fine as starter, not memorable. |

---

### Monster Types

| # | Idea | Risk | Tag | Size | Deps | Notes |
|---|------|------|-----|------|------|-------|
| M-05 | The Mirror | High | ✨ Showstopper | M | Input history buffer | Fighting yourself. The meta-enemy. |
| M-06 | The Tutorial Ghost | Medium | ✨ Showstopper | M | Dialogue pool (50+ lines), aggression escalation | Comic Sans. ALL CAPS. Meme generator. |
| M-07 | The Bug Reporter | High | ✨ Showstopper | L | Exploit detection heuristics, popup UI system | Windows XP errors. Comedy gold. |
| M-08 | The Save File | Medium | ✨ Showstopper | M | Save state manipulation | Risk/reward as an ENEMY. Floppy disk with worried face. |
| M-02 | Burrower — Pentagon Head | Low | 👍 Solid | L | Surface-detection helper, state machine | Ground ripple = good paranoia. |
| M-03 | Charger — Arrow Head | Low | 👍 Solid | L | Screen shake system | Baiting into walls = satisfying. |
| M-04 | Sniper — Hexagon Head | Low | 👍 Solid | L | Laser rendering, line-of-sight checks | Zone denial. Tactical. |
| M-01 | Flyer — Diamond Head | Low | 🤷 Try It | M | — | Vertical threat. Fine. Not exciting. |

---

### Weapons

| # | Idea | Risk | Tag | Size | Deps | Notes |
|---|------|------|-----|------|------|-------|
| W-08 | The Question Mark | Medium | ✨ Showstopper | M | Debuff state on enemies, rage timer | Existential crisis weapon. Screenshot gold. |
| W-13 | The Yelp Review | Medium | ✨ Showstopper | M | Stat modifier system, breakdown AI state | Review-bombing enemies into infighting. |
| W-09 | The Receipt | Medium | ✨ Showstopper | L | Damage-over-time queue, floating receipt UI | "Emotional Damage: +1" on the receipt. |
| W-10 | The Typo | Medium | ✨ Showstopper | M | Name-mangling system, "lost" AI state | "Goblien" → "Danragon." Progressive misspelling. |
| W-11 | The Tax Form | Medium | 👍 Solid | M | Progress bar UI, filing timer | Briefcase projectile. Enemy gets a desk. |
| W-12 | The GPS | Medium | 👍 Solid | M | Wandering AI override, immunity timer | "Recalculating..." enemies block each other. |
| W-06 | Ricochet Shot | Low | 👍 Solid | M | Bounce physics on terrain collision | Bank shots. High skill ceiling. |
| W-03 | Boomerang | Low | 👍 Solid | M | — | Outgoing + return. Satisfying loop. |
| W-05 | Laser Beam | Low | 👍 Solid | M | Raycast system | Precision. Multi-kills. Feels powerful. |
| W-02 | Grenade Launcher | Low | 👍 Solid | L | Explosion system | AoE opens doors for future content. |
| W-04 | Flame Thrower | Low | 👍 Solid | L | Burn status effect system | Visceral sustained fire. |
| W-07 | Deployable Turret | Low | 👍 Solid | L | Turret entity management, AI targeting | Area control. Strategic. |
| W-01 | Shotgun | Low | 🤷 Try It | M | — | Classic but generic. We already have gun + club + boomerang. This one's getting cut. |

---

### Power-Ups

| # | Idea | Risk | Tag | Size | Deps | Notes |
|---|------|------|-----|------|------|-------|
| P-07 | The Union Card | Medium | ✨ Showstopper | L | Enemy morale system, picket behavior, enrage state | Enemies with tiny picket signs. "DENTAL COVERAGE." Sold. |
| P-09 | The Captcha | Medium | ✨ Showstopper | M | Procedural captcha UI, pass/fail logic | "Select all squares with existential dread." |
| P-10 | The Terms of Service | Medium | 👍 Solid | L | ToS text rendering, clause-based stat modification | Enemies attack for 1 damage then look confused. |
| P-12 | The Backup | Medium | 👍 Solid | L | Game state snapshot, 3s rollback, prediction counter | VHS rewind. Safety net that rewards risk. |
| P-11 | The Debug Mode | Low | 👍 Solid | S | — | Hitboxes visible. Teaching tool. High value. |
| P-08 | The Time Zone | Medium | 👍 Solid | L | Separate dt for player/enemies, dual clock HUD | Bullet hell in slow motion. Devious. |
| P-02 | Chrono | Low | 👍 Solid | L | dt multiplier, bullet-time visual effect | Bullet time. Solid tactical power-up. |
| P-06 | Ghost | Low | 👍 Solid | L | Double-tap input tracking, collision bypass | Phase through platforms. High skill expression. |
| P-05 | Mirror | Low | 👍 Solid | M | Decoy entity, enemy targeting override | Decoy + explosion. Strategic. |
| P-03 | Shade | Low | 👍 Solid | M | Aggro skip logic, ambush damage multiplier | Stealth + shotgun ambush. Fun combo. |
| P-01 | Haste | Low | 🤷 Try It | M | Dash mechanic | Standard speed boost. Fine but not exciting. |
| P-04 | Magnet | Low | 🗑️ Cut Candidate | S | — | Auto-collecting ammo. Zero personality. |

---

### Leaderboard

| # | Idea | Risk | Tag | Size | Deps | Notes |
|---|------|------|-----|------|------|-------|
| LB-07 | The Haunted Museum | High | ✨ Showstopper | XL | Artifact rendering, ghost replay system, curation voting | Ghost replays + cursed artifacts. The best leaderboard ever designed. |
| LB-06 | The Dream Journal | High | ✨ Showstopper | XL | Procedural text generation, dream templates | "The traveler crossed 47 bridges but fell from the 12th." *Art.* |
| LB-05 | The Gossip Network | High | ✨ Showstopper | XL | Async communication, encryption, relay system | Scores decay over hops. Poetic. |
| LB-08 | The Black Market | High | ✨ Showstopper | XL | Market simulation, trading UI | Score economy. Shorting scores. Insane. |
| LB-10 | The Prophecy Board | Medium | 👍 Solid | L | Projection algorithm, confidence ranges | Competing against predicted future self. |
| LB-09 | The Therapy Session | Medium | 👍 Solid | L | Emotion input UI, mood aggregation | Community mood affects difficulty. Wholesome + weird. |
| LB-04 | Daily Seed Challenge | Low | 👍 Solid | M | Seed system, daily reset logic | Replayability driver. FOMO feature. |
| LB-02 | localStorage + Share Code | Low | 🤷 Try It | M | LB-01, encoding/decoding | Share codes. Nice. Not memorable. |
| LB-03 | JSON Server Endpoint | Low | 🤷 Try It | L | Server deployment, fetch() | True global board. Future when we have users. |
| LB-01 | localStorage Leaderboard | Low | 🗑️ Cut Candidate | S | — | Zero infrastructure. Fine for Sprint-001. But boring long-term. |

---

### AI Logic

| # | Idea | Risk | Tag | Size | Deps | Notes |
|---|------|------|-----|------|------|-------|
| AI-06 | The Fan Fiction Authors | High | ✨ Showstopper | L | Floating text system, stat modifier from text, edit mechanic | Enemies write your story. You edit it. *Mind-blowing.* |
| AI-09 | The Band | High | ✨ Showstopper | XL | Procedural audio, instrument-specific AI | Musical combat. Kill order = gameplay. |
| AI-10 | The Friendship Circle | High | ✨ Showstopper | L | Friendship meter, ally AI state | Pacifist path with massive payoff. |
| AI-07 | The Union | Medium | 👍 Solid | L | Morale stat, strike behavior, negotiation UI | "GENERAL STRIKE" — pacifist level. Deep. |
| AI-05 | The Book Club | Medium | 👍 Solid | L | Shared memory between enemy instances | Enemies learn from each other. |
| AI-08 | The Podcast | Medium | 👍 Solid | L | Question/answer UI, info sharing | Information warfare. Answer wrong, get punished. |
| AI-11 | Boss AI Concept | Low | 👍 Solid | XL | All monster AI systems, arena transformation | Future boss. Multi-phase. Essential. |
| AI-03 | Charger AI | Low | 👍 Solid | L | M-03, screen shake | Environmental interaction. |
| AI-04 | Sniper AI | Low | 👍 Solid | L | M-04, laser rendering | Zone denial. Tactical. |
| AI-01 | Flyer AI | Low | 🤷 Try It | M | M-01 | Clean state machine. Not exciting. |
| AI-02 | Burrower AI | Low | 🤷 Try It | L | M-02, surface detection | Pack behavior is good. Not flashy. |

---

### Shared Systems

These are infrastructure. They enable the weird stuff. Build them.

| # | System | Risk | Tag | Size | Enables | Notes |
|---|--------|------|-----|------|---------|-------|
| S-05 | Debuff State System | Low | 👍 Solid | M | W-08, W-10, W-11, W-12, W-13, NEW-01 | Foundation for ALL weird weapons. Critical. |
| S-07 | Floating Text / UI Overlays | Low | 👍 Solid | M | W-09, W-10, AI-06, LB-06, NEW-01, NEW-03, NEW-05 | Many 002 ideas need this. Build early. |
| S-06 | Input History Buffer | Low | 👍 Solid | S | M-05 (Mirror) | Simple but essential for the Mirror. |
| S-09 | Procedural Text Generation | Low | 👍 Solid | L | LB-06, W-09, W-13, LB-09, NEW-01 | Template-based text. Content pipeline. |
| S-08 | Enemy Morale System | Low | 👍 Solid | L | P-07, AI-07 | Shared morale stat. Enables union mechanics. |
| S-10 | Game State Snapshot / Rollback | Low | 👍 Solid | L | P-12 | 3-second state capture. Expensive but powerful. |
| S-01 | Hazard Zone System | Low | 👍 Solid | M | L-02, L-03, L-05 | Build once, use everywhere. Foundational. |
| S-03 | Explosion System | Low | 👍 Solid | M | W-02, P-05 | AoE damage + visual. One system, two weapons. |
| S-04 | Raycast / Hit-Scan System | Low | 👍 Solid | M | W-05, M-04 | Needed for laser + sniper LOS. |
| S-02 | Screen Shake | Low | 🤷 Try It | S | M-03, general juice | Small but adds feel. |

---

## Items Cut for Deletion

Every backlog needs pruning. These three are getting the axe. Not because they're bad — because they're *forgettable.* And forgettable is the one thing we can't afford.

### 🗑️ Cut #1: W-01 — Shotgun

**Why it's gone:** 5-pellet spread. 30° fan. Short range. This is the default shotgun in every platformer ever made. We already have Gun (ranged), Club (melee), and Boomerang (ranged returning). The Shotgun adds "spread" which is... a variation on a theme. Not a new theme. With W-08 (existential crisis), W-13 (Yelp reviews), W-09 (receipts), and W-10 (typos), we have enough ranged variety that's actually *interesting.* The Shotgun can come back if we need it, but right now it's earning zero screenshots.

### 🗑️ Cut #2: P-04 — Magnet

**Why it's gone:** Pulls ammo drops. Auto-collect at L6+. This is a quality-of-life passive. It doesn't change how you play. It doesn't create a moment. It doesn't make anyone laugh, think, or feel anything. It's the definition of "fine." Every item in this backlog should make someone *feel something.* The Magnet makes you feel... convenient. That's not enough.

### 🗑️ Cut #3: LB-01 — localStorage Leaderboard

**Why it's gone:** Zero infrastructure. Local scores. Up to 20 entries. This is the definition of "everyone does this." We're keeping LB-02 (share codes) as our entry-level leaderboard because it at least creates social sharing. LB-01 alone is a dead-end feature. If we can't share it, why does it exist? We'll use localStorage as the *implementation* of LB-02, but we're not shipping "just a local list" as a feature. That's not screenshot-worthy. That's not even mention-worthy.

---

## Revised Sprint-001 Recommendation

The CEO wants the weird in Sprint-01. Not Sprint-03. Sprint-01. Here's how we thread the needle — build the infrastructure for the weird while shipping something playable.

| # | Item | Why | Risk | Tag |
|---|------|-----|------|-----|
| **S-05** | Debuff State System | Enables Question Mark, Yelp, Tax Form, GPS, Typo, AND the new Roast weapon. Build this first. | Low | 👍 Solid |
| **S-06** | Input History Buffer | Enables The Mirror. Small, essential, unlocks the most meta enemy in the game. | Low | 👍 Solid |
| **S-07** | Floating Text / UI Overlays | Enables Receipts, Fan Fiction, Dreams, Yelp, and the new Roast + Photo Mode. Critical pipeline. | Low | 👍 Solid |
| **M-05** | The Mirror | The CEO's #1 priority. Fighting yourself is THE screenshot moment. Build the input buffer, build the enemy. | High | ✨ Showstopper |
| **M-06** | The Tutorial Ghost | Comic Sans. ALL CAPS. Meme factory. Medium risk, massive payoff. | Medium | ✨ Showstopper |
| **W-08** | The Question Mark | Existential crisis debuff. Enemies ponder mortality. Then enrage. Screenshot gold. | Medium | ✨ Showstopper |
| **W-10** | The Typo | "Goblien" → "Danragon." Progressive misspelling. People will clip this. | Medium | ✨ Showstopper |
| **L-05** | The Glitch Realm | THE dream level. We start building the rendering infrastructure now. Even partial is memorable. | High | ✨ Showstopper |

**Total: 8 items.** Three shared systems, three weird monsters/weapons, one dream level in progress, and one tutorial ghost. This sprint is where "Game Pending" stops being a platformer and starts being a *thing.*

**Deferred but buzzing:**
- AI-06 (Fan Fiction Authors) — needs S-07 (Floating Text) + more AI infra. Sprint-02.
- P-07 (Union Card) — needs S-08 (Morale System). Sprint-02.
- W-13 (Yelp Review) — needs S-05 (Debuff) + S-09 (Procedural Text). Sprint-02.
- LB-07 (Haunted Museum) — the dream leaderboard. Sprint-03+.
- NEW-03 (The Glitch Shop) — need to prove the bug effect system first. Sprint-02.
- NEW-04 (The Time Paradox) — needs ghost replay infra from LB-07. Sprint-04+.

---

## Risk Appetite Statement

From the CEO: *"High-risk items are not a problem. Low-payoff items are a problem. If something is risky AND boring, cut it. If something is risky AND could be legendary, green-light it. We're not a safe game. We're a memorable game."*

Translation for the team:
- **High Risk + High Payoff** = GREEN LIGHT (L-05, M-05, L-06, LB-07, AI-09, NEW-04)
- **Medium Risk + High Payoff** = GREEN LIGHT (M-06, W-08, W-13, P-07, AI-10, NEW-01, NEW-02)
- **Low Risk + Low Payoff** = YELLOW (Forest Canopy, Shotgun, standard monsters — fine to include, not worth highlighting)
- **Low Risk + No Payoff** = RED (Magnet, pure localStorage — cut them)

---

*The backlog has been re-oriented. The weird stuff is at the top. The safe stuff is earning its place or getting out.*

*Let's make something people remember.*

— The Product Manager
