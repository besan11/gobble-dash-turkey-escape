// GOBBLE DASH — the turkey: run / jump / slide / hide, stamina, lives,
// combo. One file, one job: the player's body and its state.

import {
  GAP_HIDE_BONUS,
  GAP_HIT,
  GAP_MAX,
  GAP_STUMBLE,
  GRAVITY,
  GROUND_Y,
  JUMP_VY,
  SLIDE_TIME,
  SPRINT_MULT,
  STAMINA_DRAIN,
  STAMINA_MAX,
  STAMINA_REGEN,
  TURKEY_X,
} from './config.js';

export function createTurkey() {
  return {
    x: TURKEY_X,
    y: GROUND_Y,
    vy: 0,
    onGround: true,
    sliding: false,
    slideTimer: 0,
    hidden: false,
    hideTimer: 0,
    hideCooldown: 0,
    stamina: STAMINA_MAX,
    sprinting: false,
    lives: 3,
    shield: false,
    hurtTimer: 0,
    runPhase: 0,
    combo: 0,
    comboTimer: 0,
    slowmoTimer: 0,
  };
}

// Feet box (for obstacle hits) and body box (for knives/ovens).
export function turkeyBoxes(t) {
  const h = t.sliding ? 34 : 62;
  return {
    feet: { x: t.x - 22, y: t.y - 26, w: 44, h: 26 },
    body: { x: t.x - 26, y: t.y - h, w: 52, h },
  };
}

export function updateTurkey(t, input, dt, speed, nearHaystack, events) {
  const wantSprint = input.held('sprint') && t.stamina > 1 && !t.hidden;
  t.sprinting = wantSprint;
  if (wantSprint) {
    t.stamina = Math.max(0, t.stamina - STAMINA_DRAIN * dt);
  } else {
    t.stamina = Math.min(STAMINA_MAX, t.stamina + STAMINA_REGEN * dt);
  }

  if (t.hideCooldown > 0) t.hideCooldown -= dt;
  if (t.hurtTimer > 0) t.hurtTimer -= dt;
  if (t.comboTimer > 0) {
    t.comboTimer -= dt;
    if (t.comboTimer <= 0) t.combo = 0;
  }
  if (t.slowmoTimer > 0) t.slowmoTimer -= dt;

  // Hiding: only inside a haystack, on a cooldown, ends after 2.5 s.
  if (t.hidden) {
    t.hideTimer -= dt;
    if (t.hideTimer <= 0) {
      t.hidden = false;
      t.hideCooldown = 4;
    }
    return;
  }
  if (input.wasPressed('hide') && nearHaystack && t.hideCooldown <= 0) {
    t.hidden = true;
    t.hideTimer = 2.5;
    events.push({ type: 'hide' });
    return;
  }

  // Jump / slide.
  if (input.wasPressed('jump') && t.onGround) {
    t.vy = JUMP_VY;
    t.onGround = false;
    t.sliding = false;
    events.push({ type: 'jump' });
  }
  if (input.held('slide') && t.onGround && !t.sliding) {
    t.sliding = true;
    t.slideTimer = SLIDE_TIME;
  }
  if (t.sliding) {
    t.slideTimer -= dt;
    if (t.slideTimer <= 0 || !input.held('slide')) t.sliding = false;
  }

  // Vertical physics.
  if (!t.onGround) {
    t.vy += GRAVITY * dt;
    t.y += t.vy * dt;
    if (t.y >= GROUND_Y) {
      t.y = GROUND_Y;
      t.vy = 0;
      t.onGround = true;
      events.push({ type: 'land' });
    }
  }
  t.runPhase += dt * (speed / 34) * (t.sprinting ? 1.3 : 1);
}

// A mistake: stumble costs gap, a hit costs a life too.
export function applyStumble(state, events) {
  state.gap = Math.max(0, state.gap - GAP_STUMBLE);
  state.turkey.combo = 0;
  events.push({ type: 'stumble' });
}

export function applyHit(state, events) {
  const t = state.turkey;
  if (t.hurtTimer > 0) return;
  if (t.shield) {
    t.shield = false;
    t.hurtTimer = 1.2;
    events.push({ type: 'shieldBreak' });
    return;
  }
  t.lives -= 1;
  t.hurtTimer = 1.4;
  state.gap = Math.max(0, state.gap - GAP_HIT);
  t.combo = 0;
  events.push({ type: 'hit' });
  if (t.lives <= 0) events.push({ type: 'caught' });
}

export function grantHideBonus(state) {
  state.gap = Math.min(GAP_MAX, state.gap + GAP_HIDE_BONUS);
}

export { SPRINT_MULT };
