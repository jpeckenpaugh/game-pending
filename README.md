# Game Pending

**An arcade arena platformer with stackable power-ups, customizable visual themes, and instant sandbox build-crafting—running natively in your browser with zero dependencies.**

### 👉 [**▶ Play Game Pending in Your Browser (`gp.livive.net`)**](https://gp.livive.net/)

[![Play Game Pending in Your Browser](https://gp.livive.net/demos/latest/03-game-start.png)](https://gp.livive.net/)

[**▶ Play Live Now**](https://gp.livive.net/) · [**🎬 Watch 30s Gameplay Reel**](https://gp.livive.net/demos/latest/demo.webm) · [**🖼️ Visual Theme Gallery**](https://gp.livive.net/demos/gallery.html) · [**📺 Featured on Livive.net**](https://beta.livive.net/#project=game-pending)

---

## How to Play

### 1. The Objective
- **Clear the Wave:** Defeat every enemy in the multi-tiered arena to complete the level, earn **+4 Ammo**, and draft **1 of 3 Power-Ups** before the next wave spawns.
- **Watch Your Ammo:** Every weapon attack costs **1 Ammo**. Conserve shots by collecting green ammo drops or **stomping enemies from above**.
- **Survive:** Taking an unshielded hit—or hitting **0 Ammo** with no active projectiles or drops left—ends the run (`OUT OF AMMO`). Use upper platforms, underground cave routes, and left/right **wrap-around teleport portals** to outmaneuver enemy swarms.

### 2. Controls

| Key / Input | Action |
| :--- | :--- |
| **`A` / `D`** or **Left / Right** | Move across platforms, underground caves, and wrap portals |
| **`X`** | **Jump** — with **Boots Lv. 6+**, hold **`X`** after jump apex to **Rocket Glide** |
| **`W` / `S`** or **Up / Down** | Aim shots vertically, climb ladders up/down, or duck |
| **`Space`** or **Left Click** | Attack with your equipped weapon (`Gun`, `Club`, or `Wand`) |
| **`Z`** | **Dash** burst (unlocked via the **Haste** power-up) |
| **`G`** | **Sandbox Power-Up Grant** *(see below)* |
| **`H`** or **`?`** | Open the in-game **How to Play** screen |
| **`Enter`** / **`R`** | Pause game (`Enter`) or Quick Restart (`R`) |

### 3. Unlimited Power-Ups: The `G` Key (Sandbox Mode)
Want to test wild endgame builds immediately without grinding waves?
1. Press **`G`** anytime during gameplay to open the **3-Choice Power-Up Picker** on demand.
2. Keep pressing **`G`** while the picker is open to **auto-grant a power-up and immediately reroll** the three cards.
3. Press **`Enter`** (or `1` / `2` / `3`) to lock in your final card and jump back into the action with a fully stacked loadout.

### 4. Power-Ups & Tier Evolutions
- **Boots (Lv. 1–10):** Lv. 1–5 grant mid-air multi-jumps. Lv. 6–10 unlock **Rocket Glide** charges (hold `X` after reaching jump apex).
- **Shield (Lv. 1–10):** Lv. 1–5 block incoming hits. Lv. 6–10 add **Kinetic Discharges** that suspend, flash, and spin attackers on contact.
- **Drone (Lv. 1–10):** Autonomous companion that fires homing strikes (Lv. 1–5) and rapid multi-missile salvos (Lv. 6–10).
- **Specs:** Enables automatic target lock when firing without holding a directional aim key.
- **Radar:** Displays a live directional indicator pointing to the nearest enemy.
- **Haste:** Increases movement speed and grants rechargeable **`Z` Dash** charges.

### 5. Customize Everything
Open **Customize** from the Title or Pause screen to remix the game on the fly:
- **Color Themes:** `Classic` (crisp black-and-white vector line art), `Arcade`, `Natural`, `Sunset`, and `Pastel`.
- **Character Templates:** `Classic`, `Robot`, `Emoji (Color)`, `Aquatic`, `Farm`, or mix-and-match custom heads and reactive faces.
- **Loadout & World:** Choose your weapon (`Gun`, `Club`, `Wand`), starting power-up levels, enemy AI behavior, and seeded vs. randomized worlds.

---

## For Developers: Clone, Fork & Run Locally

**Game Pending** is built with vanilla JavaScript ES modules and the HTML5 Canvas 2D API—no bundler, no npm install, and no build step required to play or hack on the game.

### Quickstart (3 Commands)

```sh
git clone https://github.com/jpeckenpaugh/game-pending.git
cd game-pending
python3 -m http.server 8000 -d html
```

Then open **`http://localhost:8000/`** in your browser.

### Repository Layout

```text
game-pending/
├── html/               # Playable browser game (served directly by GitHub Pages)
│   ├── index.html      # Canvas shell & module entrypoint
│   ├── src/            # Modular ES6 game loop, rendering, physics, AI, and menus
│   └── demos/          # Published 720p gameplay showcase video & theme gallery
├── test-runner/        # Dockerized Playwright smoke test & 30s 720p showcase recorder
└── docs/               # Architecture notes, test-runner spec, and design history
```

### Automated Smoke Test & 720p Showcase Recorder
To run the headless Chromium smoke test (or regenerate the 30-second `1280x720` gameplay video and 7-image gallery via Docker):

```sh
./test-runner/run.sh              # Fast 8-second headless smoke test
./test-runner/run.sh --showcase   # Record 30s 720p WebM demo + 7 gallery stills
```

See [docs/test-runner.md](docs/test-runner.md) and [AGENTS.md](AGENTS.md) for detailed architecture and contributor guidelines.
