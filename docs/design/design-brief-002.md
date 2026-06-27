# Game Pending — Design Brief 002

> **Designer**: AI Agent
> **Status**: Draft
> **Target**: Product Manager review
> **Philosophy**: Break the bell. No forests, no volcanoes, no shotguns, no speed boosts. Ideas that make you say "wait, that could actually be really fun."

---

## Executive Summary

This brief presents fringe, surprising, and intentionally weird design concepts for "Game Pending." Every idea is implementable in vanilla JS / Canvas but pushes the boundaries of what that looks like. The goal is to make players question what a game *is*, while keeping the core loop satisfying and the line-art aesthetic stretchable.

**What we're avoiding:**
- Standard biomes (forests, deserts, ice levels, volcanoes)
- Normal weapons (shotguns, boomerangs, grenade launchers)
- Typical power-ups (speed, invisibility, time slow, shields)
- Boring persistence (localStorage, simple server leaderboards)
- Simple AI (patrol, chase, flee state machines)

**What we're embracing:**
- Levels that change the rules of the game
- Enemies that mess with the player's head
- Weapons with bizarre tradeoffs and emergent properties
- Power-ups that create entirely new systems
- Meta-game layers and community weirdness
- AI that feels alive, not programmed

---

## 1. Level Themes & Terrain Types

The level itself should be the puzzle. Not just "different looking" — different *rules*. The player enters a zone and suddenly the game plays differently.

### Option A: The Glitch Realm

**Concept:** A level that appears to be a corrupted game cartridge. Visual artifacts, broken rules, and impossible geometry. The terrain isn't just weird-looking — it's *wrong* in ways that affect gameplay.

**Terrain Mechanics:**
- **Z-fighting platforms:** Two platforms occupy the same Y-space. The player flickers between them randomly. You can't control which one you're on — you have to predict the flicker pattern.
- **Palette-swap zones:** The level randomly desaturates. In greyscale zones, all enemies move 2x faster but can't shoot. In color zones, enemies are slow but their projectiles track you. Players must position themselves in the right color zone for the current threat.
- **Sprite tearing:** Some enemies appear torn in half. Their hitbox is split — you have to shoot the correct half to damage them. The visual tear is random each encounter.
- **Null tiles:** Black voids in the terrain that destroy anything that touches them — player, enemies, projectiles. But they also *create* new platforms when a projectile passes through them. Shooting a null tile spawns a temporary platform at the next null tile's location.
- **Memory leak zones:** The longer you stay in a section, the more the frame rate drops (simulated). The game gets sluggish. You have to keep moving or find a "cache clear" pickup.

**Visual Style:** VHS tracking lines, scanline artifacts, color bleed, pixel sorting. The line-art aesthetic becomes corrupted — clean lines break into static. Occasional frames are replaced with nonsense sprites (a cat, a spreadsheet, a math equation).

**Why it's interesting:** The player can't master the level through repetition because the glitches are semi-random. Each run feels different. The "broken" aesthetic becomes a feature, not a bug.

### Option B: The Organism

**Concept:** The level is a living creature. The terrain is made of flesh, bone, and organ tissue. But this isn't horror — it's *bizarre biology*. The creature is alive and reacts to the player's presence.

**Terrain Mechanics:**
- **Breathing platforms:** The ground rises and falls in a rhythmic cycle. Platforms are lungs. Jumping during inhale launches you higher; jumping during exhale pushes you down.
- **Peristaltic tunnels:** Corridors that contract and expand, pushing you forward like food through a digestive tract. You can fight the current or ride it.
- **Immune response zones:** If you stay still too long, the terrain grows antibodies — white blood cell platforms that chase you and deal contact damage. You have to keep moving.
- **Neural pathways:** Glowing lines in the terrain that, when activated (by stepping on them), trigger reactions elsewhere — opening passages, activating enemies, or even healing you. The level has a nervous system.
- **The Heart:** A massive beating organ at the center of the level. Destroying it doesn't end the level — it makes the entire level *more chaotic* as the creature goes into cardiac arrest. Platforms shake, immune response goes haywire, and the exit opens but the path becomes random.

**Visual Style:** Organic line art — veins, pulsing textures, peristaltic motion. The clean aesthetic becomes fleshy and alive. Occasional anatomical diagrams float in the background like a biology textbook come to life.

**Why it's interesting:** The level has a *rhythm*. Players learn the breathing cycle, the neural pathways, the immune response timing. It's a pattern-recognition puzzle wrapped in a side-scroller.

### Option C: The Legal Document

**Concept:** The level is a literal contract. Platforms are clauses, walls are terms, and the player must navigate the fine print. This is absurd, bureaucratic, and hilarious.

**Terrain Mechanics:**
- **Clause platforms:** Platforms are paragraphs of text. Some clauses are enforceable (solid ground). Some are void (they disappear when you step on them). Some are "subject to change" (they shift position every 10 seconds).
- **Loophole passages:** Secret passages hidden in the fine print. You have to read the terrain text to find them. Example: "The party of the first part shall not be held liable for falls exceeding 30 pixels" — there's a passage in the "30 pixels" text.
- **Bureaucratic enemies:** Not monsters — auditors. They don't attack directly. They file paperwork that creates new obstacles. An auditor filing a "cease and desist" creates a wall that blocks your path until you "respond to the complaint" (shoot it with a specific weapon).
- **Amendment zones:** Areas where the rules of the game change mid-level. A sign reads "SECTION 4.2(a): All projectiles now move in arcs." Suddenly your straight-shooting weapon has gravity.
- **Signature gates:** Doors that require you to "sign" them — trace a pattern on the canvas. But the pattern is written in legalese and you have to decipher what it means.

**Visual Style:** The level looks like a giant scroll. Platforms are underlined text. The background is parchment with watermarks. Enemy auditors wear glasses and carry clipboards. Everything is in a typewriter font.

**Why it's interesting:** It's genuinely funny. Players will screenshot the clause platforms and share them. The "reading comprehension as platforming" mechanic is unlike anything in the genre.

### Option D: The Musical Score

**Concept:** The level is a piece of music. Terrain is generated from audio waveforms. The player's actions create sound that *affects the level*.

**Terrain Mechanics:**
- **Waveform platforms:** Platforms are sine waves, sawtooth waves, and square waves rendered as terrain. The amplitude determines platform height. The frequency determines spacing.
- **Tempo zones:** Different sections of the level have different tempos. In fast-tempo zones, everything moves quickly — enemies, projectiles, even the player. In slow-tempo zones, everything drags.
- **Harmonic resonance:** If the player fires a weapon at the exact moment a background beat hits, the projectile becomes "in tune" and deals 3x damage. Off-beat shots deal 0.5x damage. The level has a visual metronome.
- **Silence zones:** Areas where all sound is suppressed. In these zones, the player can't shoot (no sound = no weapon) but enemies can't hear you (stealth is automatic). You have to navigate through silent sections by sneaking.
- **Crescendo:** The level builds in intensity. Each section adds more instruments (visual layers, enemies, hazards). The final section is a chaotic orchestra of everything at once. Surviving it requires rhythm.

**Visual Style:** Musical notation as terrain. Notes are platforms. Rests are gaps. The line-art becomes staff lines and clefs. The background is sheet music. The player character is a conductor's baton.

**Why it's interesting:** Rhythm-game mechanics in a platformer. The harmonic resonance system rewards timing without requiring a full rhythm game input scheme. It's accessible but deep.

---

## 2. New Monster Types

These enemies don't just hurt the player — they mess with the player's understanding of the game.

### Option A: The Mirror

**Concept:** An enemy that copies the player's last 5 actions and plays them back as an attack. It doesn't have its own AI — it *is* the player, delayed by 2 seconds.

**Behavior:**
- Tracks the player's last 5 inputs (move left, jump, shoot, etc.)
- After a 2-second delay, it performs those inputs as its own actions
- If the player was jumping and shooting, the Mirror jumps and shoots — at the player's *previous* position
- The Mirror takes damage from its own projectiles if they collide with terrain (it doesn't dodge like the player did)
- Killing it requires the player to do something the Mirror will fail at — like walking into a wall or off a cliff

**Counter-play:** Lure the Mirror into hazards by doing things that are safe for you but deadly for it. The 2-second delay means you can set traps for your own shadow.

**Visual Style:** A shimmering, distorted outline of the player character. Like a heat haze in the shape of the protagonist. When it takes damage, it "glitches" and skips frames.

**Why it's interesting:** The player is fighting their own habits. If you always jump over pits, the Mirror will too — but you can bait it into pits you already crossed. It's a puzzle enemy that changes every encounter based on player behavior.

### Option B: The Tutorial Ghost

**Concept:** An enemy that appears helpful but gives *inverted* advice. It's a parody of game tutorials — and its advice is actually correct if you reverse it.

**Behavior:**
- Appears as a friendly ghost with a speech bubble
- Says things like: "Jump over the spikes!" (the spikes are safe — the ceiling is deadly)
- "Shoot the red enemy!" (the red enemy heals when shot — the blue one takes damage)
- "Don't go left!" (left is the correct path)
- If the player follows its advice, they take damage. If they do the opposite, they succeed.
- The ghost gets frustrated if you ignore it and becomes more aggressive — throwing actual projectiles

**Counter-play:** Treat it as an unreliable narrator. The humor comes from realizing the ghost is a troll. Advanced players learn to read the ghost's personality — it's consistent in its inversions.

**Visual Style:** A cute, helpful-looking ghost with a graduation cap and a pointer stick. Its speech bubble has comic sans. When it gets frustrated, its face turns red and the font becomes ALL CAPS.

**Why it's interesting:** It's a meta-enemy. It teaches the player to question everything in the game, including the game itself. New players will be confused. Experienced players will laugh. It's a gatekeeper enemy that rewards skepticism.

### Option C: The Bug Reporter

**Concept:** An enemy that files actual "bugs" about the player's gameplay. These bugs manifest as real game effects.

**Behavior:**
- When the player does something exploitative (camping, spamming a weapon, exploiting a pattern), the Bug Reporter notices
- It "files a bug report" — a popup appears on screen describing the exploit
- The bug report has a "severity" rating. Low severity = cosmetic glitch. High severity = gameplay effect
- Example: "BUG #427: Player camping on Platform 3. Severity: Medium. Effect: Platform now rotates."
- The player can "fix the bug" by doing something different — proving to the Bug Reporter that they're not exploiting

**Counter-play:** The Bug Reporter rewards varied gameplay. If you change your tactics frequently, it has nothing to report. If you're predictable, it punishes you — not with damage, but with *game changes*.

**Visual Style:** A small, insect-like creature wearing a tiny hard hat and carrying a tiny clipboard. It has glasses and looks very serious. When it files a bug, a Windows XP error dialog pops up on screen.

**Why it's interesting:** It's an anti-exploit system that's *part of the game*. Instead of secretly patching exploits, the game makes the exploit hunter into an enemy. It's self-aware without being annoying — the bug reports are funny.

### Option D: The Save File

**Concept:** An enemy that, if killed, deletes the player's current run data. It's a walking consequence.

**Behavior:**
- Appears as a floating floppy disk / USB drive / cloud icon (era-appropriate)
- Doesn't attack. Just floats there, menacingly.
- If you kill it, your current run's progress is deleted — score, collected items, power-ups. You start the level from the beginning.
- But it's worth *a lot* of points. Killing it is a high-risk, high-reward play.
- It's always visible in the background before you encounter it — you know it's coming
- Some levels have multiple Save Files. The decision to kill or avoid becomes the level's core puzzle.

**Counter-play:** The Save File never attacks you. It's purely a strategic choice. Do you want the points? Or do you want to keep your progress? Some players will always kill it for the challenge. Some will always avoid it for the score. Both are valid.

**Visual Style:** A classic floppy disk with little arms and legs. It has a worried expression — it knows you might kill it. When it's destroyed, a "FILE NOT FOUND" error flashes on screen.

**Why it's interesting:** It creates emergent difficulty. The game doesn't make itself harder — the player chooses to make it harder. It's a self-imposed challenge that's baked into the design.

---

## 3. 6 Additional Weapon Types

These weapons have weird tradeoffs, strange mechanics, and emergent properties. None of them are just "better gun."

### Option A: The Question Mark

**Concept:** Fires a projectile that makes the target question its own existence. Affected enemies stop attacking and ponder their mortality — but only for a few seconds.

**Mechanics:**
- Deals no direct damage
- Enemies hit by it enter a "philosophical crisis" state — they stop moving and a thought bubble appears with existential questions ("What am I?", "Why do I attack?", "Is the player real?")
- During this state, the enemy takes 2x damage from any source
- The philosophical crisis lasts 3-5 seconds, then the enemy snaps out of it and becomes enraged (2x speed, 2x aggression)
- Cannot be used on bosses — they're too confident in their purpose
- Ammo is limited but regenerates slowly — you can't spam it

**Emergent Property:** Players learn to use the Question Mark as a setup tool, not a damage tool. Hit a group of enemies, then switch to a damage weapon for the guaranteed critical window. The enraged state after the crisis becomes a threat timer — you have X seconds to kill them before they become more dangerous.

**Visual Style:** A gun shaped like a giant question mark. The projectile is a floating "?" that spirals toward the target. Affected enemies have "..." thought bubbles with tiny rotating question marks.

### Option B: The Receipt

**Concept:** Fires a projectile that itemizes damage. The target doesn't take a single hit — it receives a detailed receipt of all the damage it *will* take over the next 5 seconds.

**Mechanics:**
- Projectile deals 1 damage on hit
- Then, over 5 seconds, the target receives additional "line item" damage:
  - "Base Damage: 3"
  - "Critical Hit: +2"
  - "Emotional Damage: +1"
  - "Tax: -1" (heals the target slightly)
  - "Total: 5 damage over 5 seconds"
- The target can be healed during this period, which reduces the receipt's total
- If the target dies before the receipt finishes, it drops "refund tokens" (health pickups)
- The receipt scrolls on screen in real-time as the damage ticks — it's visually funny

**Emergent Property:** The Receipt is terrible against fast enemies (they die before the receipt finishes) but incredible against tanky enemies (the total damage is huge). Players learn to match the Receipt to the right target type. The "refund tokens" mechanic means the Receipt can *generate* health pickups if used on weak enemies.

**Visual Style:** The projectile is a tiny rolled-up paper. When it hits, a long receipt unfurls from the enemy, scrolling upward with line items. The font is thermal printer style. At the bottom: "THANK YOU FOR YOUR PATRONAGE."

### Option C: The Typo

**Concept:** Fires a projectile that misspells the target's name. A target with a misspelled name can't find itself — it's lost.

**Mechanics:**
- Projectile deals 0 damage
- The target's name is altered (e.g., "Goblin" becomes "Gobln" or "Goblien")
- A misspelled enemy has a "lost" status — it wanders randomly, can't attack, and can't be healed by allies
- The misspelling is random and can be subtle ("Slime" → "Sllime") or absurd ("Dragon" → "Danragon")
- If you misspell a name that's already misspelled, it gets *more* wrong — eventually the enemy becomes a gibberish entity that despawns
- Bosses have long names that can be progressively misspelled — each misspelling weakens them

**Emergent Property:** The Typo creates a crowd-control system where enemies become harmless but not dead. This is useful for clearing paths without spending ammo on kills. The "progressive misspelling" mechanic means spamming the Typo on one target eventually deletes it — but it takes multiple hits.

**Visual Style:** The projectile is a floating pen nib. When it hits, the enemy's name label glitches — letters swap, duplicate, and fall off. The enemy becomes visually distorted as its name degrades. Its sprite might have missing pixels or scrambled features.

### Option D: The Tax Form

**Concept:** Fires a projectile that forces the target to file taxes. The target must complete paperwork before it can attack again.

**Mechanics:**
- Projectile deals 1 damage and applies "Tax Audit" debuff
- Affected enemy must "file" — a progress bar appears above it showing paperwork completion
- During filing, the enemy can't move or attack
- Filling time varies by enemy type: 2 seconds for grunts, 8 seconds for elites, 15 seconds for bosses
- If the enemy is hit again during filing, the audit restarts (but the progress saves at 50%)
- Killing a filing enemy drops "deductions" (currency) and "loopholes" (temporary buffs)

**Emergent Property:** The Tax Form is the ultimate setup weapon. Use it on a tough enemy, then deal with the weak ones while the tough one is stuck in paperwork. The "audit restart" mechanic means you can keep an enemy permanently stuck in filing if you time your shots right. But it also means you can accidentally free a filing enemy by hitting it too early.

**Visual Style:** The projectile is a tiny briefcase. When it hits, a desk and chair materialize under the enemy. A tax form appears in its hands. It starts writing furiously. A progress bar fills with tax jargon: "W-2... 1099... Schedule C... AMT calculation..."

### Option E: The GPS

**Concept:** Fires a projectile that tells the target exactly where it is — but not how to get where it wants to be. The target becomes aware of its position and obsessed with it.

**Mechanics:**
- Projectile deals 0 damage
- Affected enemy gains a GPS voice: "Recalculating... You are at (437, 289). Your destination is unknown."
- The enemy becomes fixated on finding its "destination" — which doesn't exist
- It wanders in patterns, trying to reach a goal it can never achieve
- While GPS'd, the enemy is immune to all damage (it's "not really here" — it's in its own world)
- The GPS status wears off after 10 seconds, at which point the enemy takes double damage for 3 seconds as it "reorients"

**Emergent Property:** The GPS is a pure crowd-control weapon that creates safe zones. GPS'd enemies block other enemies' paths. Players can herd groups of enemies into GPS'd clusters, then wait for the vulnerability window to blast them all. The "recalculating" voice line becomes a cue for when the vulnerability window is about to open.

**Visual Style:** A gun shaped like a car dashboard. The projectile is a tiny satellite. Affected enemies get a glowing blue circle around them with arrows pointing in random directions. A GPS voice plays: "In 200 pixels, turn around."

### Option F: The Yelp Review

**Concept:** Fires a projectile that writes a negative review of the target. The target's self-esteem drops, reducing its stats.

**Mechanics:**
- Projectile deals 1 damage
- The target receives a "1-star review" — its stats are halved for 8 seconds:
  - Speed: -50%
  - Damage: -50%
  - Size: -25% (it shrinks)
- The review text appears as a floating overlay: "2/10, would not get attacked again. Slow, predictable, ugly sprite."
- If multiple reviews stack (3+), the target has a "mental breakdown" — it attacks its own allies for 5 seconds
- Bosses are immune to stat reduction but still receive the review text (it's funny)

**Emergent Property:** The Yelp Review is a debuff weapon that scales with use. One review weakens an enemy. Three reviews make it a threat to its own team. Players learn to "review bomb" tough enemies, turning them into allies. The review text is procedurally generated from a pool of sarcastic templates — players will collect their favorites.

**Visual Style:** The projectile is a tiny smartphone. When it hits, a star rating appears above the enemy. One star fills in with a dramatic "ding." The review text floats upward in a speech bubble. The enemy's sprite droops slightly — it looks sad.

---

## 4. 6 Additional Power-Ups

These power-ups create new systems, not just number adjustments. They change *how* the game plays, not just *how well*.

### Option A: The Union Card

**Concept:** Enemies集体谈判 (collective bargaining) instead of fighting. All enemies in the level form a union and go on strike.

**Mechanics:**
- Duration: 15 seconds
- All enemies stop attacking and gather in the center of the screen
- They hold tiny picket signs with demands: "BETTER PAY," "DENTAL COVERAGE," "LESS SPAWN KILLING"
- While on strike, enemies are completely passive — you can walk through them, shoot them (they don't dodge), or just pass by
- But: the union has a "strike fund." If you kill striking enemies, the fund depletes. When the fund hits zero, the strike ends early and ALL enemies become enraged (2x stats)
- If you let the strike run its full duration, enemies return to normal but drop bonus loot (their " severance package")

**New System:** The Union Card creates a risk/reward decision. Do you exploit the strike for easy kills (risking enrage) or let it run for safe passage + bonus loot? It also introduces the concept of "enemy morale" — a hidden stat that affects enemy behavior.

**Visual Style:** A tiny laminated ID card with a union logo. When activated, a "STRIKE" banner unfurls across the top of the screen. Enemies walk in a picket line, chanting silently.

### Option B: The Time Zone

**Concept:** The player exists in a different time zone than the enemies. Time flows differently for you and them.

**Mechanics:**
- Duration: 10 seconds
- Player time: 1x (normal)
- Enemy time: 0.25x (slow motion)
- But: projectiles are timezone-locked. Enemy projectiles move at normal speed. Player projectiles move at 0.25x speed.
- This means: enemies are slow but their bullets are fast. You're normal but your bullets are slow.
- The time zone is visualized as a clock overlay — two clocks, one for you, one for them, ticking at different rates
- During the time zone, gravity is also affected — jumps are floatier, falls are slower

**New System:** The Time Zone creates a "bullet hell in slow motion" effect. Players must dodge fast bullets while their own attacks crawl toward targets. It changes the combat rhythm from "shoot and move" to "dodge and wait."

**Visual Style:** A wristwatch power-up. When active, the screen splits into two color temperatures — warm for player time, cool for enemy time. Two clocks float in the corner, ticking at different speeds.

### Option C: The Captcha

**Concept:** Enemies must prove they're human before attacking. If they fail, they're frozen.

**Mechanics:**
- Duration: 12 seconds
- All enemies must solve a captcha before attacking
- Captchas are procedurally generated: "Select all squares with traffic lights," "Type the letters in this image," "Click the bicycles"
- Enemies that fail the captcha (most of them — they're monsters, not humans) are frozen in a "checking" state
- Enemies that pass the captcha (rare, but possible — smart enemies) become "verified humans" and get +50% stats
- The captcha interface appears above each enemy as a tiny grid of images
- You can solve captchas for enemies to *help* them (if you want the challenge of fighting verified enemies)

**New System:** The Captcha turns combat into a mini-game. Players watch enemies struggle with captchas, which is funny. The rare "verified human" enemy becomes a special threat. The option to help enemies creates emergent difficulty selection.

**Visual Style:** A tiny checkbox power-up. When active, each enemy gets a floating captcha UI above them. The captchas are intentionally absurd: "Select all squares with existential dread," "Type the meaning of life."

### Option D: The Terms of Service

**Concept:** Enemies agree to a Terms of Service that prohibits harming the player. The ToS is legally binding — in the game's logic.

**Mechanics:**
- Duration: 20 seconds
- A massive wall of text appears on screen — a real Terms of Service
- Enemies are forced to read and accept it before they can attack
- The ToS contains clauses that benefit the player:
  - "Section 4.2: agrees not to deal more than 1 damage per hit"
  - "Section 7.1: agrees to drop all loot upon death"
  - "Section 12.3: agrees to apologize if they miss an attack"
- Enemies that break the ToS (by dealing more than 1 damage, for example) are "sued" — they take 10 damage
- The ToS is so long that most enemies can't read it all before the duration expires
- Bosses have lawyers (tiny creatures in suits) that read the ToS for them — bosses are unaffected

**New System:** The Terms of Service creates a "rules-based" combat system. Players watch enemies try to comply with absurd legal requirements. The humor comes from enemies carefully attacking for exactly 1 damage, then looking confused when they want to hit harder.

**Visual Style:** A scroll power-up. When active, a massive document unfurls on screen, scrolling endlessly. Enemies get tiny reading glasses and magnifying glasses. Bosses have tiny lawyers standing next to them.

### Option E: The Debug Mode

**Concept:** The player gains access to the game's debug tools. Hitboxes, AI logic, frame data — everything is visible.

**Mechanics:**
- Duration: 30 seconds (longest power-up — it's informational, not combat-focused)
- All enemy hitboxes are visible as colored wireframes
- Enemy AI state is displayed as text: "STATE: PATROL," "STATE: CHASE," "STATE: CONFUSED"
- Damage numbers are exaggerated and detailed: "CRITICAL HIT: 15.2 damage (base: 8, modifier: +90%)"
- A frame counter appears in the corner showing the game's internal tick rate
- The player can pause the game and step frame-by-frame (but enemies still act during pauses — you're pausing the render, not the simulation)
- Hidden objects and secrets are highlighted with a glow effect

**New System:** Debug Mode turns the game into a learning tool. Players understand the game's systems at a deeper level. The "pause but enemies still move" mechanic creates a puzzle — you can analyze the game, but you can't stop it.

**Visual Style:** Green terminal text overlays. Wireframe hitboxes. Frame counter. Memory usage display. The game looks like it's being reverse-engineered in real-time.

### Option F: The Backup

**Concept:** The player can undo one action per level. A literal save state that reverts the last thing that happened.

**Mechanics:**
- Single use per level
- Activated by pressing a key (not a weapon slot — it's a global ability)
- Rewinds the game state by 3 seconds — position, health, enemy positions, projectiles, everything
- Visual: the screen rewinds like a VHS tape, with scan lines and reversed motion
- The rewind is *perfect* — no desync, no glitches. It's the actual game state from 3 seconds ago.
- But: the Backup is visible to enemies. They can see the rewind happening. If you rewind too many times in a row (max 3), enemies learn the pattern and start *predicting* where you'll be after the rewind
- Using the Backup resets your score multiplier to 1x

**New System:** The Backup creates a "time manipulation" meta-layer. It's not a power-up you activate in combat — it's a safety net that changes how aggressive you play. Knowing you can undo one mistake encourages riskier play. But the enemy prediction mechanic prevents abuse.

**Visual Style:** A floppy disk icon in the corner that glows when the Backup is available. When activated, the screen fills with VHS tracking lines and rewinds. After the rewind, a "PLAY" icon appears briefly.

---

## 5. Leaderboard

Not localStorage. Not a simple server. Weird persistence, community mechanics, meta-game layers.

### Option A: The Gossip Network

**Concept:** Scores spread through "word of mouth" between sessions. Your score isn't stored on a server — it's carried by other players.

**Mechanics:**
- When you finish a run, your score is encrypted and stored locally
- When you play again, your score is "gossiped" to the next player you encounter (via peer-to-peer or server relay)
- The gossip chain: Player A's score is carried by Player B, who carries it to Player C, etc.
- Over time, scores become distorted — each player adds a small random offset to the gossip. Old scores drift.
- The leaderboard is a *probabilistic* ranking — you see approximate positions, not exact scores
- The "oldest" gossip (most hops) is marked as "unreliable" — it's been through too many hands
- Players can choose to "verify" a gossip (by re-encrypting and re-sending it) to keep it alive

**Meta-game Layer:** The leaderboard is a living network. It decays without participation. Players who stop playing cause their scores to drift and eventually vanish. The leaderboard only exists because players keep it alive. It's a social contract, not a database.

**Visual Style:** The leaderboard is displayed as a web of connections — nodes are players, edges are gossip chains. The more hops, the fuzzier the score. Old scores are shown as fading text. The whole thing looks like a conspiracy board with red string.

### Option B: The Dream Journal

**Concept:** The leaderboard entries are dream-like — cryptic, poetic, open to interpretation. You don't see numbers. You see stories.

**Mechanics:**
- When you finish a run, your score is translated into a "dream" — a short, procedurally generated story
- Dreams are based on your performance metrics: "The traveler crossed 47 bridges but fell from the 12th. The sun was angry." (47 platforms, 12th death, angry = boss kill)
- Other players' dreams appear in your game as ambient text — floating in the background, on walls, in enemy speech bubbles
- You can "interpret" other players' dreams by guessing their score. If you're close, you get bonus points.
- The leaderboard is a collection of dreams, ranked by how many people have interpreted them correctly
- Dreams that are never interpreted fade away

**Meta-game Layer:** The leaderboard becomes a collaborative fiction. Players write stories for each other, and the community collectively decodes them. It's a game within a game — the meta-game is interpretation.

**Visual Style:** The leaderboard is a library of books. Each book is a dream. The text is written in a handwritten font, with occasional illustrations. The background is a starry night sky with floating pages.

### Option C: The Haunted Museum

**Concept:** The leaderboard is a museum where top scores are displayed as artifacts. The artifacts are haunted — they do things.

**Mechanics:**
- Top 100 scores are displayed as artifacts in a virtual museum
- Each artifact is haunted by the player who set the score — a ghost that represents their playstyle
- Visiting the museum, you can "interact" with artifacts:
  - Touching a high-score artifact causes the ghost to replay a segment of that player's run
  - Some artifacts are cursed — touching them applies a debuff to your next run
  - Some artifacts are blessed — touching them gives a buff
- The museum changes layout every week — new artifacts, new room configurations, new ghosts
- Players can "curate" the museum by voting on which artifacts to keep

**Meta-game Layer:** The museum is a rotating gallery of community achievements. It's not just a list — it's an experience. Players visit to be entertained, not just to check rankings. The haunted artifacts create emergent stories — "don't touch the artifact from the player who died 47 times on the same jump."

**Visual Style:** A 2D museum with rooms, pedestals, and display cases. Artifacts are glowing objects. Ghosts are semi-transparent player silhouettes. The lighting is dramatic — spotlights on artifacts, shadows in corners.

### Option D: The Black Market

**Concept:** The leaderboard is a market where players can buy, sell, and trade score positions. Score is currency.

**Mechanics:**
- Your score is tradable. You can sell it, buy better scores, or trade with other players.
- The market fluctuates — scores gain or lose value based on demand
- Rare achievements (like "no death run") are worth more than raw score
- Players can "short" a score — bet that it will lose value, then profit if it does
- The market is player-driven — no central authority sets prices
- Scam protection: all trades are mediated by the game. No player-to-player trades without game oversight.
- The leaderboard shows market activity: "SCORE SOLD FOR 1500 CREDITS," "PLAYER BOUGHT POSITION #42"

**Meta-game Layer:** The leaderboard becomes an economy. Players who are good at the game can profit. Players who are good at trading can climb the leaderboard without being good at the game. It's a dual-skill system — the game rewards both gameplay and market savvy.

**Visual Style:** The leaderboard is a stock ticker. Scores scroll across the screen with prices. A graph shows score value over time. Players are represented by trader avatars. The background is a chaotic trading floor with flashing numbers.

### Option E: The Therapy Session

**Concept:** The leaderboard is a support group. Players discuss their feelings about the game. Scores are secondary to emotional expression.

**Mechanics:**
- When you finish a run, you're prompted to write a short emotional response: "Frustrated," "Proud," "Confused," "Euphoric," etc.
- These responses are aggregated into a community mood board
- The leaderboard ranks players by "emotional range" — how many different emotions they've expressed
- The most "balanced" players (equal positive and negative emotions) get a special badge
- Players can "react" to other players' emotions with support messages
- The mood board affects the game — if the community is mostly frustrated, the next patch (update) makes the game slightly easier. If mostly euphoric, it gets slightly harder.
- The mood board is visible in the game as background ambience — happy levels are brighter, sad levels are darker

**Meta-game Layer:** The leaderboard becomes a community health monitor. It's not about who's best — it's about how everyone *feels*. The feedback loop (community mood → game difficulty → community mood) creates a self-regulating system.

**Visual Style:** The leaderboard is a wall of sticky notes. Each note is a player's emotional response, written in their handwriting (if they use a tablet) or a random handwriting font. The wall is covered in supportive doodles and hearts.

### Option F: The Prophecy Board

**Concept:** The leaderboard predicts the future. It shows not just past scores, but *projected* future scores based on trends.

**Mechanics:**
- The board shows three columns: Past, Present, Future
- "Past" is your historical scores
- "Present" is your current score
- "Future" is a projected score based on your improvement rate
- The projection is probabilistic — it shows a range (e.g., "Next run: 12,000 - 15,000 points, 70% confidence")
- If you beat the projection, you get a "Fate Breaker" bonus — extra score
- If you fall short, you get a "Destiny Deferred" debuff — slightly reduced score next run
- The projection algorithm is public — players can game it by sandbagging (low scores to lower projections, then beating them easily)
- But: sandbagging too much triggers a "prophecy collapse" — your projections become unreliable and you lose the bonus

**Meta-game Layer:** The leaderboard becomes a prediction game. Players aren't just competing against each other — they're competing against their own projected future. It's a game of self-improvement and strategic score manipulation.

**Visual Style:** The leaderboard is a crystal ball display. Past scores are in faded text. Present scores are glowing. Future scores are in swirling, prophetic text that shifts and changes. The background is mystical — stars, moons, arcane symbols.

---

## 6. AI Logic for New Monsters

Not simple state machines. Emergent behaviors, environmental AI, monster-to-monster interactions.

### Option A: The Book Club

**Concept:** Enemies form book clubs and discuss the player's tactics. They learn from each other and adapt as a group.

**Mechanics:**
- Every 30 seconds, all enemies in a group "meet" — they pause for 2 seconds and exchange information
- During the meeting, a thought bubble appears above each enemy showing what they've learned:
  - "The player likes to jump over projectiles" → Enemies start shooting upward
  - "The player camps on platforms" → Enemies start destroying platforms
  - "The player uses the Question Mark weapon" → Enemies become immune to philosophical crises
- After the meeting, enemies implement their new strategies
- The more meetings that happen, the smarter the group becomes
- If the player interrupts a meeting (by attacking), the enemies become confused — their strategies are half-implemented

**Emergent Behavior:** The Book Club creates a difficulty curve within a single encounter. The first meeting is easy to interrupt. The third meeting produces enemies that are genuinely hard to beat. Players learn to either interrupt meetings early or avoid them entirely and fight smarter enemies.

**Visual Style:** Enemies gather in a circle. A tiny book floats in the center. Thought bubbles show book covers and discussion points. When interrupted, the book falls and pages scatter.

### Option B: The Fan Fiction Authors

**Concept:** Enemies write fan fiction about the player. The fiction affects reality — if an enemy writes that "the player is clumsy," the player's jump height decreases.

**Mechanics:**
- Each enemy has a "writing" state where it stops attacking and starts composing
- The writing appears on screen as floating text: "The hero stumbled, their legs weak from fear..."
- The fiction becomes true for 5 seconds after it's written:
  - "The hero's legs weak" → Jump height -30%
  - "The hero's aim faltered" → Weapon spread +50%
  - "The hero was surrounded" → Enemies spawn at the player's location
- The player can "edit" the fan fiction by shooting the text — changing "weak legs" to "strong legs" (which buffs the player)
- Enemy fan fiction quality improves over time — early writing is simple, later writing is more specific and powerful

**Emergent Behavior:** The Fan Fiction Authors create a narrative combat system. Players must read enemy text and decide whether to let it stand (debuff) or edit it (spend ammo to buff themselves). The "editing" mechanic turns combat into a game of hot-potato with narrative text.

**Visual Style:** Enemies carry tiny quill pens and parchment. Floating text appears in a storybook font. Edited text has strike-through and correction marks. The background occasionally shows illustrations of the fan fiction.

### Option C: The Union

**Concept:** Enemies form a labor union and go on strike if working conditions are too dangerous. They集体谈判 with the player.

**Mechanics:**
- Each enemy has a "morale" stat that decreases when:
  - They take damage
  - They see other enemies die
  - The player uses overpowered weapons
- When morale drops below 20%, the enemy goes on strike — it stops attacking and holds a picket sign
- Striking enemies are passive but *cannot be killed* — they're on strike, not dead. They're protected by "labor laws" (game rules)
- The player must negotiate: offer "concessions" (give up a power-up, reduce weapon damage) to end the strike
- If too many enemies strike at once, a "general strike" occurs — ALL enemies stop, and the player must complete the level without killing anyone
- A "strikebreaker" enemy exists — it's immune to morale and attacks striking enemies. Hiring one (picking up a power-up) ends the strike but makes other enemies hostile

**Emergent Behavior:** The Union creates a diplomatic layer. Players must balance aggression with diplomacy. Overusing powerful weapons triggers strikes. Underusing them means enemies remain aggressive. The "general strike" is a unique challenge — complete the level pacifistically.

**Visual Style:** Striking enemies hold picket signs: "FAIR WAGES," "SAFE WORKING CONDITIONS," "DENTAL." A tiny union hall building appears in the level. A "negotiation table" appears when the player approaches striking enemies.

### Option D: The Podcast

**Concept:** Enemies start a podcast and interview the player. The interview distracts the player and provides information to other enemies.

**Mechanics:**
- One enemy becomes the "host" — it carries a microphone and asks questions
- Questions appear on screen as multiple-choice: "What's your favorite weapon?" "How do you feel about boss fights?" "What's your greatest fear?"
- Answering correctly (the "expected" answer) gives you a buff. Answering incorrectly debuffs you.
- But: the answers are shared with all enemies. If you say "I hate fire enemies," all fire enemies become enraged.
- The podcast has a "listener count" — the more questions you answer, the more listeners join. More listeners = more enemies gain the information.
- You can skip the podcast by shooting the host — but this triggers a "controversy" where all enemies get a temporary buff (sympathy for the host)

**Emergent Behavior:** The Podcast creates an information warfare system. The player must choose between:
1. Answering honestly (and giving enemies information)
2. Answering dishonestly (and getting debuffed)
3. Skipping (and triggering a controversy)
Each option has tradeoffs. The "listener count" mechanic means the podcast gets worse the longer it goes — but also more rewarding if you play along.

**Visual Style:** The host enemy wears headphones and holds a microphone. A "LIVE" indicator flashes. A listener count appears in the corner. Question text appears in a speech bubble. The background shows a tiny recording studio.

### Option E: The Band

**Concept:** Enemies form a musical band and play music that affects gameplay. The music has real-time effects on the player and the environment.

**Mechanics:**
- Enemies pick up instruments (guitars, drums, keyboards, etc.)
- Each instrument has a different effect:
  - Guitar: creates shockwave platforms (sonic waves become solid)
  - Drums: increases enemy speed (tempo)
  - Keyboard: creates healing zones (harmonics)
  - Bass: creates slow zones (heavy notes)
- The music is procedurally generated based on enemy positions and states
- If you kill the drummer, the tempo drops and enemies slow down
- If you kill the guitarist, platforms disappear
- The band plays in real-time — you can hear the music change as enemies die
- A "crowd" of enemies gathers to watch — they provide additional buffs to the band

**Emergent Behavior:** The Band creates a "music management" system. Players must decide which instrument to target first based on which effect is most threatening. Killing the band in the wrong order makes the fight harder. The "crowd" mechanic means killing band members without killing the crowd makes the remaining members stronger (sympathy effect).

**Visual Style:** Enemies hold instruments. Musical notes float in the air as visual effects. A stage appears in the level. The crowd waves glow sticks. When a member dies, their instrument drops and can be picked up by the player (temporary weapon).

### Option F: The Friendship Circle

**Concept:** Enemies become friends with the player if spared enough times. They switch sides and fight for you.

**Mechanics:**
- Each enemy has a "friendship" meter that starts at 0
- The meter increases when:
  - You spare the enemy (don't attack it for 10+ seconds)
  - You help the enemy (heal it, protect it from other enemies)
  - You spare its friends (other enemies of the same type)
- At friendship level 5, the enemy becomes "friendly" — it stops attacking you and starts attacking other enemies
- At friendship level 10, it becomes "loyal" — it follows you and fights on your behalf
- At friendship level 15, it becomes "devoted" — it sacrifices itself to protect you (taking a hit that would have killed you)
- But: making friends with one enemy type makes other enemy types hostile to you — they see you as a traitor
- If you make friends with ALL enemy types, they fight each other and you can walk through the level unscathed — but the final boss is unbeatable without enemy allies

**Emergent Behavior:** The Friendship Circle creates a pacifist path through the game. Players can choose to befriend enemies instead of killing them. This changes the entire game dynamic — levels become social puzzles instead of combat challenges. The "traitor" mechanic means befriending enemies has consequences.

**Visual Style:** Friendly enemies have heart icons above their heads. They wave at the player. They follow in a line. When they sacrifice themselves, a "friendship forever" message appears. The background becomes brighter and more colorful as more enemies are befriended.

---

## PM Recommendation

### Priority Tier: Must-Have (Implement in Sprint 1)

1. **The Glitch Realm** (Level Theme) — Unique, technically feasible, visually striking. The corrupted aesthetic is cheap to produce (shader effects, sprite distortion) and high-impact.

2. **The Mirror** (Monster Type) — The core mechanic (copy player actions) is simple to implement but creates emergent gameplay. It's the most "game-changing" enemy on this list.

3. **The Question Mark** (Weapon) — Simple to implement (debuff + damage multiplier) but creates tactical depth. It's a "setup weapon" that makes other weapons better.

4. **The Debug Mode** (Power-Up) — Purely informational, no combat balance needed. It's a teaching tool that rewards observant players. Low implementation cost, high player value.

5. **The Gossip Network** (Leaderboard) — Peer-to-peer score sharing is technically challenging but unique. It creates a community layer without server infrastructure.

6. **The Book Club** (AI Logic) — Simple to implement (shared memory between enemies) but creates adaptive difficulty. Enemies that learn from player behavior are a holy grail of AI design.

### Priority Tier: Nice-to-Have (Implement in Sprint 2)

1. **The Organism** (Level Theme) — High concept, high visual impact, but requires more animation work.

2. **The Tutorial Ghost** (Monster Type) — Hilarious and unique, but requires a large pool of inverted advice text.

3. **The Typo** (Weapon) — Funny and mechanically interesting, but requires text generation and display systems.

4. **The Union Card** (Power-Up) — Creates a unique system, but requires enemy morale tracking and strike behavior.

5. **The Dream Journal** (Leaderboard) — Poetic and unique, but requires procedural text generation and interpretation mechanics.

6. **The Fan Fiction Authors** (AI Logic) — Creative and emergent, but requires floating text systems and "editing" mechanics.

### Priority Tier: Stretch Goal (Implement in Sprint 3)

1. **The Legal Document** (Level Theme) — Hilarious and unique, but requires extensive text content and legal humor.

2. **The Save File** (Monster Type) — Brilliant risk/reward mechanic, but requires save system integration.

3. **The Yelp Review** (Weapon) — Funny and mechanically interesting, but requires procedural review generation.

4. **The Captcha** (Power-Up) — Unique and funny, but requires captcha generation and UI work.

5. **The Haunted Museum** (Leaderboard) — Visually stunning, but requires 3D-like museum rendering.

6. **The Podcast** (AI Logic) — Unique and emergent, but requires question/answer systems and information sharing.

---

## Appendix A: Implementation Notes

### Canvas Rendering Concerns

All of these ideas are implementable in vanilla JS / Canvas, but some require specific rendering techniques:

- **The Glitch Realm:** Use `getImageData()` and `putImageData()` for pixel manipulation. Apply random offsets, color channel shifts, and scanline effects.
- **The Organism:** Use sine waves and Perlin noise for organic movement. Pulsing effects are just time-based amplitude modulation.
- **The Legal Document:** Use `fillText()` with measured widths to create text-based platforms. The "fine print" is just small text.
- **The Musical Score:** Use the Web Audio API for sound generation. Visuals are waveform renders of the audio data.

### State Management

Several of these mechanics require complex state tracking:

- **The Mirror:** Store a circular buffer of player inputs (last 5 actions, timestamped).
- **The Book Club:** Store a "knowledge base" per enemy group. Knowledge is key-value pairs learned from player behavior.
- **The Friendship Circle:** Store a friendship meter per enemy instance. Meter persists across the encounter.

### Performance Considerations

- **The Gossip Network:** Requires async communication (fetch or WebSocket). Use a debounce to prevent spam.
- **The Debug Mode:** Rendering hitboxes and AI states is cheap. The frame counter is just `performance.now()`.
- **The Band:** Procedural music generation requires careful timing. Use `requestAnimationFrame` for visual sync, `AudioContext` for sound sync.

---

## Appendix B: Content Requirements

### Text Content

- **The Legal Document:** 20+ unique clause platforms with humorous legal text.
- **The Tutorial Ghost:** 50+ inverted advice lines.
- **The Yelp Review:** 100+ sarcastic review templates.
- **The Fan Fiction Authors:** 30+ narrative fragments per enemy type.
- **The Dream Journal:** 50+ dream templates with variable slots.

### Art Assets

- **The Organism:** 10+ organic terrain tiles (veins, muscles, bones, organs).
- **The Glitch Realm:** 5+ glitch effect presets (scanlines, color bleed, sprite tear, etc.).
- **The Museum:** 20+ artifact sprites, 10+ ghost variants.
- **The Band:** 4+ instrument sprites, 1+ crowd sprite.

### Sound Design

- **The Musical Score:** Procedural music generation system.
- **The Band:** 4+ instrument samples, crowd noise.
- **The Podcast:** Podcast intro/outro jingle, question readout sound.
- **The Gossip Network:** Whisper sound effect for score gossip.

---

## Appendix C: Balancing Framework

### Power Creep Prevention

- **The Question Mark:** Max 3 uses per level. Regeneration is slow (1 charge per 30 seconds).
- **The Receipt:** Total damage is capped at 10. Can't stack more than 3 receipts on one target.
- **The Debug Mode:** Informational only. No combat benefit except knowledge.
- **The Backup:** Single use per level. The "enemy prediction" mechanic prevents abuse.

### Difficulty Scaling

- **The Book Club:** Meeting frequency increases with level difficulty. Early levels: 1 meeting. Late levels: 5+ meetings.
- **The Union:** Strike threshold decreases in harder levels. Easy: 20% morale. Hard: 40% morale.
- **The Friendship Circle:** Friendship requirements increase with level. Easy: 10 seconds to befriend. Hard: 30 seconds.

### Meta-game Balance

- **The Gossip Network:** Score drift is capped at ±5% per hop. Old scores are marked unreliable after 10 hops.
- **The Dream Journal:** Dream interpretation rewards scale with dream age. Old dreams are worth more.
- **The Black Market:** Market manipulation is limited by trade cooldowns (1 trade per 5 minutes).

---

*End of Design Brief 002*
