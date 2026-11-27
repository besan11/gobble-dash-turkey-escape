// GOBBLE DASH — the farmer: he chases, searches and corners. One file,
// one job: the gap between hunter and turkey, and what he does with it.
// Modes: chase (closing in), search (turkey hidden — he stops and looks),
// lunge (gap small — he leans in and throws knives faster).

import { GAP_LUNGE_AT, GAP_MAX, GAP_RECOVER_PER_S, GROUND_Y, TURKEY_X } from './config.js';

export function createFarmer() {
  return {
    mode: 'chase',
    searchTimer: 0,
    throwTimer: 2.2,
    x: TURKEY_X - 260,
    runPhase: 0,
  };
}

export function updateFarmer(f, state, dt, events) {
  const t = state.turkey;
  // The turkey pulls away slowly while running clean.
  if (!t.hidden && t.onGround) {
    state.gap = Math.min(GAP_MAX, state.gap + GAP_RECOVER_PER_S * dt);
  }
  f.x = TURKEY_X - state.gap;
  f.runPhase += dt * 11;

  if (t.hidden) {
    if (f.mode !== 'search') {
      f.mode = 'search';
      f.searchTimer = 2.2;
      events.push({ type: 'search' });
    }
    f.searchTimer -= dt;
    return;
  }
  if (f.mode === 'search') f.mode = 'chase';

  // Lunge when close: he throws knives more often.
  f.mode = state.gap <= GAP_LUNGE_AT ? 'lunge' : 'chase';
  if (f.mode === 'lunge' && f.throwTimer > 1.4) f.throwTimer = 1.4;
  f.throwTimer -= dt;
  if (f.throwTimer <= 0) {
    const stage = state.stage.id;
    const interval = stage === 'kitchen' ? 1.6 : stage === 'barn' ? 2.4 : 3.4;
    f.throwTimer = interval;
    events.push({ type: 'throwKnife', fromX: f.x + 30, fromY: GROUND_Y - 120 });
  }
}

// Caught: gap closed to zero.
export function farmerCaught(state) {
  return state.gap <= 0 && state.turkey.lives > 0;
}
