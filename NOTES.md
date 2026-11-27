# GOBBLE DASH — build notes

## What it is

A complete turkey escape game in one static `game/` folder: a 2D canvas
side-scroller, keyboard + mouse, no build step, no network requests, all art
drawn in code and all sound synthesized with WebAudio.

The player is a turkey escaping becoming Thanksgiving dinner. The farmer
chases from behind (a visible gap that shrinks on every mistake), searches
when the turkey hides in a haystack, and lunges — knife in hand — when he
gets close. Hazards grow harder across 4 stages: Farmyard (fences, rolling
pumpkins, corn), Barn (thrown knives, more haystacks), Kitchen (ovens with
timed flame jets, falling knives), Freedom Run (everything, faster, to the
forest gate at 1000 m). ESCAPED or CAUGHT end screens with stats and restart.

## The one measurable differentiator

**The chase is visible and fair:** the farmer is always on screen, the gap
bar in the HUD shows exactly how close he is, and every mistake costs a
measured amount of gap (stumble −70 px, hit −95 px, hide +150 px). The game
was play-tested headless (CDP): Enter starts, Space jumps, distance and
score advance, the world scrolls, zero console errors.

## What the screenshots prove (all real renders of the running game)

- `1-cover.jpg` — mid-run: HUD (score 2450, 182 m / 1000 m, stage FARMYARD,
  3 lives, stamina, FARMER CLOSE bar, COMBO x3), turkey mid-jump over a
  fence, farmer lunging with knife + "!", thrown knife in the air, corn,
  golden feather, pumpkin, haystack.
- `2-title.jpg` — title screen with controls and the 4-stage plan.
- `3-kitchen.jpg` — Kitchen stage: two firing ovens, falling knife, corn,
  2 lives, farmer chasing.
- `4-end.jpg` — ESCAPED end screen with score/distance/corn/time and the
  FREEDOM gate.

Staged with `?shot=cover|title|kitchen|end&seed=7`, frozen so the capture is
stable; the same code plays live with no `?shot=` parameter.

## Known weaknesses (honest)

- Art is flat vector shapes, not textured sprites; the scenery is simple
  parallax hills/trees rather than detailed backgrounds.
- No touch-specific controls beyond click-to-jump; the game targets desktop
  Chrome as the bounty asks.
- The farmer never catches the turkey from the front — the chase is a gap
  model, not a full pursuit AI with cornering; his "cornering" is the lunge
  state plus faster knife throws in the Kitchen.
- Music is a short 8-note pluck loop, not a composed track.
