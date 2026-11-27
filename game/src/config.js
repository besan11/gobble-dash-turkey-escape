// GOBBLE DASH — tuning constants, stage plan and the autumn palette.
// One file, one job: every number the game balances on lives here so the
// other modules can stay about behaviour, not magic numbers.

export const VIEW_W = 1280;
export const VIEW_H = 720;
export const GROUND_Y = 600;
export const TURKEY_X = 230;
export const FINISH_M = 1000;

// Physics (pixels, seconds).
export const GRAVITY = 2600;
export const JUMP_VY = -980;
export const BASE_SPEED = 330;
export const MAX_SPEED = 560;
export const SPRINT_MULT = 1.45;
export const STAMINA_MAX = 100;
export const STAMINA_DRAIN = 34;
export const STAMINA_REGEN = 20;
export const SLIDE_TIME = 0.55;

// The farmer's gap: pixels between the farmer's nose and the turkey's tail.
// The gap shrinks on every mistake and grows when the turkey pulls away.
export const GAP_START = 200;
export const GAP_MAX = 230;
export const GAP_STUMBLE = 70;
export const GAP_HIT = 95;
export const GAP_RECOVER_PER_S = 9;
export const GAP_HIDE_BONUS = 150;
export const GAP_LUNGE_AT = 95;

// Stages, by distance in metres. Each stage changes the scenery, the
// hazards that spawn and the farmer's temper.
export const STAGES = [
  {
    id: 'farmyard',
    name: 'FARMYARD',
    from: 0,
    to: 250,
    skyTop: '#f9cf7d',
    skyBottom: '#f2a65a',
    ground: '#9a6a33',
    grass: '#7fa03f',
    hint: 'SPACE jump · DOWN slide · SHIFT sprint',
  },
  {
    id: 'barn',
    name: 'THE BARN',
    from: 250,
    to: 500,
    skyTop: '#f2b25e',
    skyBottom: '#e07f3e',
    ground: '#8a5c2c',
    grass: '#8a7a35',
    hint: 'HAYSTACKS! Press H to HIDE when the farmer closes in',
  },
  {
    id: 'kitchen',
    name: 'THE KITCHEN',
    from: 500,
    to: 750,
    skyTop: '#e8b06a',
    skyBottom: '#c96a3a',
    ground: '#6e4a2c',
    grass: '#a8875a',
    hint: 'OVENS! Jump the flames — time the jets, do not rush',
  },
  {
    id: 'freedom',
    name: 'FREEDOM RUN',
    from: 750,
    to: FINISH_M,
    skyTop: '#f6c169',
    skyBottom: '#e88a4a',
    ground: '#7d5a28',
    grass: '#5d8a3a',
    hint: 'THE FOREST GATE IS CLOSE — SPRINT!',
  },
];

// Scoring.
export const SCORE_PER_M = 10;
export const SCORE_CORN = 50;
export const SCORE_FEATHER = 200;
export const SCORE_NEAR_MISS = 25;
export const SCORE_HIDE = 75;

export const PALETTE = {
  turkeyBody: '#8b5a2b',
  turkeyDark: '#6b421e',
  turkeyWing: '#a06a35',
  featherOrange: '#e07f2e',
  featherRed: '#c0392b',
  featherGold: '#f1c40f',
  wattle: '#d43d2a',
  beak: '#f39c12',
  farmerShirt: '#c0392b',
  farmerOveralls: '#2e5fa3',
  farmerSkin: '#f0c08a',
  farmerHat: '#e8c85a',
  knifeBlade: '#dfe6ea',
  knifeHandle: '#5d3a1a',
  ovenBody: '#3a3a3f',
  ovenFire: '#ff7b1c',
  corn: '#ffd94d',
  hay: '#e8c85a',
  pumpkin: '#e67e22',
};
