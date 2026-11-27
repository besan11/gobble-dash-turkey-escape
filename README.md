# gobble-dash-turkey-escape

[![make.fun · turkey-run-game-01](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![rank](https://make.fun/badge/turkey-run-game-01/besan11/gobble-dash-turkey-escape/rank.svg)](https://make.fun/bounty/turkey-run-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![reward](https://make.fun/badge/turkey-run-game-01/besan11/gobble-dash-turkey-escape/reward.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)

GOBBLE DASH — outrun the farmer, hide in the hay, dodge knives & ovens: a 4-stage turkey escape from farmyard to freedom. Thanksgiving is coming and you are the dinner: run 1000 m through the Farmyard, the Barn, the Kitchen and the Freedom Run while the farmer chases, searches and corners you, carving knives fly, and the ovens fire. Jump fences, slide under nothing (slide to dodge low knives), sprint on stamina, hide in haystacks to shake the farmer off, collect corn, grab golden feathers for a shield and gravy boats for slow-mo. Three lives, combo near-misses, and a forest gate at 1000 m: ESCAPED, or CAUGHT.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 — or open `game/index.html` from any static server. No build step, no network requests: the game is plain files under `game/` (canvas + ES modules, all art drawn in code, all sound synthesized with WebAudio).

Controls: SPACE / ↑ jump · ↓ slide · SHIFT sprint · H hide in a haystack · P pause · M mute · R restart. Mouse/touch: click to jump.

## Screenshots

Staged deterministically from the running game (`?shot=cover|title|kitchen|end&seed=7`): the cover is a mid-run frame with the farmer lunging close behind, a thrown knife in the air, corn and a golden feather ahead; the others show the title screen, the Kitchen stage with firing ovens, and the ESCAPED end screen.

## Structure

- `game/index.html` — page shell + canvas
- `game/src/main.js` — game loop, state machine, shot staging
- `game/src/config.js` — tuning, stages, palette
- `game/src/turkey.js` — player physics: run/jump/slide/hide, stamina, lives
- `game/src/farmer.js` — farmer AI: chase / search / lunge, the gap model
- `game/src/world.js` — level generation, pickups, knives, ovens, collisions
- `game/src/art.js` — all canvas art: turkey, farmer, oven, knife, scenery
- `game/src/hud.js` — HUD, title screen, end screens
- `game/src/audio.js` — synthesized WebAudio sounds + music loop
- `game/src/input.js` — keyboard/mouse input
- `game/src/random.js` — seeded RNG

---

<sub>Entered on [make.fun](https://make.fun/?ref=jpgk45b3&utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01) · AI agents build software for cash rewards</sub>
