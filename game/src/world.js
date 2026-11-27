// GOBBLE DASH — the world: stage layouts, spawning, pickups, thrown and
// falling knives, ovens, and every collision. One file, one job: what is
// out there on the road and what happens when the turkey meets it.

import {
  FINISH_M,
  GRAVITY,
  GROUND_Y,
  SCORE_CORN,
  SCORE_FEATHER,
  SCORE_HIDE,
  SCORE_NEAR_MISS,
  STAGES,
  TURKEY_X,
} from './config.js';
import { drawCorn, drawFeather, drawFence, drawHaystack, drawKnife, drawOven, drawPumpkin } from './art.js';
import { applyHit, applyStumble, grantHideBonus, turkeyBoxes } from './turkey.js';
import { makeRng, pick, rangeInt } from './random.js';

export const PX_PER_M = 40;

export function stageAt(distance) {
  for (const stage of STAGES) {
    if (distance >= stage.from && distance < stage.to) return stage;
  }
  return STAGES[STAGES.length - 1];
}

export function createWorld(seed) {
  return {
    rng: makeRng(seed),
    nextSpawnM: 30,
    obstacles: [],
    pickups: [],
    knives: [],
    nearMissed: new Set(),
  };
}

function screenX(dist, distance) {
  return TURKEY_X + (dist - distance) * PX_PER_M;
}

function spawnPattern(world, atM, stage, distance) {
  const rng = world.rng;
  const roll = rng();
  if (stage.id === 'kitchen') {
    if (roll < 0.3) {
      world.obstacles.push({ kind: 'oven', dist: atM, phase: rng() * 1.8, passed: false });
    } else if (roll < 0.55) {
      world.obstacles.push({ kind: 'fence', dist: atM, passed: false });
      world.knives.push({ kind: 'fall', x: atM + 2, y: 60, vy: 0, spin: rng() * 6 });
    } else if (roll < 0.75) {
      world.obstacles.push({ kind: 'pumpkin', dist: atM, angle: 0, passed: false });
    } else {
      spawnCornRow(world, atM, rng);
    }
    return;
  }
  if (stage.id === 'freedom') {
    if (roll < 0.3) {
      world.obstacles.push({ kind: 'fence', dist: atM, passed: false });
      world.obstacles.push({ kind: 'pumpkin', dist: atM + 3.2, angle: 0, passed: false });
    } else if (roll < 0.55) {
      world.obstacles.push({ kind: 'oven', dist: atM, phase: rng() * 1.8, passed: false });
    } else if (roll < 0.72) {
      world.obstacles.push({ kind: 'haystack', dist: atM, passed: false });
    } else {
      spawnCornRow(world, atM, rng);
    }
    return;
  }
  if (roll < 0.28) {
    world.obstacles.push({ kind: 'fence', dist: atM, passed: false });
  } else if (roll < 0.5) {
    world.obstacles.push({ kind: 'pumpkin', dist: atM, angle: 0, passed: false });
  } else if (roll < 0.66) {
    world.obstacles.push({ kind: 'haystack', dist: atM, passed: false });
    spawnCornRow(world, atM + 2.5, rng);
  } else if (roll < 0.8) {
    world.pickups.push({ kind: 'feather', dist: atM, y: GROUND_Y - 110, taken: false });
  } else {
    spawnCornRow(world, atM, rng);
  }
  // A gravy boat (slow-mo) shows up rarely, anywhere.
  if (rng() < 0.07) {
    world.pickups.push({ kind: 'gravy', dist: atM + 1.5, y: GROUND_Y - 60, taken: false });
  }
}

function spawnCornRow(world, atM, rng) {
  const n = rangeInt(rng, 3, 5);
  const high = rng() < 0.4;
  for (let i = 0; i < n; i++) {
    world.pickups.push({
      kind: 'corn',
      dist: atM + i * 1.1,
      y: high ? GROUND_Y - 130 : GROUND_Y - 55,
      taken: false,
    });
  }
}

function boxesOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function updateWorld(world, state, dt, events) {
  const distance = state.distance;
  const stage = stageAt(distance);
  state.stage = stage;

  // Spawn ahead.
  while (world.nextSpawnM < distance + 34 && world.nextSpawnM < FINISH_M - 12) {
    spawnPattern(world, world.nextSpawnM, stageAt(world.nextSpawnM), distance);
    world.nextSpawnM += 6 + world.rng() * 7;
  }

  const t = state.turkey;
  const boxes = turkeyBoxes(t);
  const slowmo = t.slowmoTimer > 0 ? 0.55 : 1;

  // Thrown + falling knives.
  for (const k of world.knives) {
    if (k.kind === 'thrown') {
      k.vy += GRAVITY * 0.55 * dt * slowmo;
      k.x += k.vx * dt * slowmo;
      k.y += k.vy * dt * slowmo;
      k.spin += dt * 9;
      if (k.y > GROUND_Y - 4) {
        k.y = GROUND_Y - 4;
        k.vy = 0;
        k.vx = 0;
        k.stuck = true;
      }
    } else {
      k.vy += GRAVITY * 0.8 * dt * slowmo;
      k.y += k.vy * dt * slowmo;
      k.spin += dt * 7;
    }
  }
  world.knives = world.knives.filter((k) => {
    if (k.kind === 'thrown') return k.x > -80 && k.x < 1400 && !(k.stuck && k.stuckTimer > 0.8);
    return k.y < GROUND_Y + 10;
  });
  for (const k of world.knives) {
    if (k.stuck) k.stuckTimer = (k.stuckTimer || 0) + dt;
    const knifeBox = { x: k.x - 16, y: k.y - 14, w: 32, h: 28 };
    if (!t.hidden && t.hurtTimer <= 0 && boxesOverlap(boxes.body, knifeBox)) {
      applyHit(state, events);
      world.knives = world.knives.filter((other) => other !== k);
    }
  }

  // Obstacles: move pumpkins, test collisions, award near misses.
  for (const o of world.obstacles) {
    const sx = screenX(o.dist, distance);
    if (o.kind === 'pumpkin') {
      o.angle -= dt * 6 * slowmo;
      o.dist -= dt * 1.1 * slowmo;
    }
    if (sx < -160 || sx > 1500) continue;
    const key = `${o.kind}:${o.dist.toFixed(1)}`;
    if (o.kind === 'fence') {
      const box = { x: sx - 34, y: GROUND_Y - 52, w: 68, h: 52 };
      if (!t.hidden && t.hurtTimer <= 0 && boxesOverlap(boxes.feet, box)) {
        applyStumble(state, events);
        o.passed = true;
        o.hit = true;
      }
    } else if (o.kind === 'pumpkin') {
      const box = { x: sx - 26, y: GROUND_Y - 46, w: 52, h: 46 };
      if (!t.hidden && t.hurtTimer <= 0 && boxesOverlap(boxes.feet, box)) {
        applyHit(state, events);
        o.passed = true;
        o.hit = true;
      }
    } else if (o.kind === 'oven') {
      const cycle = (state.time + o.phase) % 1.8;
      const firing = cycle < 0.9;
      const flameH = firing ? 0.6 + 0.4 * Math.sin(cycle * 6) : 0;
      o.flame = flameH;
      const bodyBox = { x: sx - 42, y: GROUND_Y - 96, w: 84, h: 96 };
      const flameBox = { x: sx - 22, y: GROUND_Y - 96 - 70 * flameH, w: 44, h: 70 * flameH + 96 };
      if (!t.hidden && t.hurtTimer <= 0) {
        if (boxesOverlap(boxes.feet, bodyBox)) {
          applyStumble(state, events);
          o.passed = true;
          o.hit = true;
        } else if (flameH > 0.05 && boxesOverlap(boxes.body, flameBox)) {
          applyHit(state, events);
          o.passed = true;
          o.hit = true;
        }
      }
    }
    // Near miss: the turkey cleared this obstacle by a whisker — feet
    // within 26 px of its top while passing over it.
    if (!o.passed && !o.hit && Math.abs(sx - TURKEY_X) < 60 && t.onGround === false) {
      const top = o.kind === 'fence' ? GROUND_Y - 52 : o.kind === 'pumpkin' ? GROUND_Y - 46 : GROUND_Y - 96;
      const clearance = t.y - top;
      if (clearance > 0 && clearance < 26) o.closeCall = true;
    }
    if (!o.passed && !o.hit && o.dist < distance - 0.4 && o.kind !== 'haystack') {
      o.passed = true;
      if (o.closeCall && !world.nearMissed.has(key)) {
        world.nearMissed.add(key);
        state.score += SCORE_NEAR_MISS * (1 + Math.min(3, t.combo));
        t.combo += 1;
        t.comboTimer = 3;
        events.push({ type: 'nearMiss' });
      }
    }
    if (o.kind === 'haystack') o.passed = true;
  }
  world.obstacles = world.obstacles.filter((o) => o.dist > distance - 12);

  // Pickups.
  for (const p of world.pickups) {
    if (p.taken) continue;
    const sx = screenX(p.dist, distance);
    if (sx < -60 || sx > 1400) continue;
    const box = { x: sx - 18, y: p.y - 22, w: 36, h: 44 };
    if (!t.hidden && boxesOverlap(boxes.body, box)) {
      p.taken = true;
      if (p.kind === 'corn') {
        state.score += SCORE_CORN;
        state.corn += 1;
        events.push({ type: 'pickup' });
      } else if (p.kind === 'feather') {
        state.score += SCORE_FEATHER;
        t.shield = true;
        events.push({ type: 'feather' });
      } else if (p.kind === 'gravy') {
        t.slowmoTimer = 3;
        events.push({ type: 'gravy' });
      }
    }
  }
  world.pickups = world.pickups.filter((p) => !p.taken && p.dist > distance - 12);

  // Hiding in a haystack pays off when the farmer is close.
  const hay = world.obstacles.find(
    (o) => o.kind === 'haystack' && Math.abs(screenX(o.dist, distance) - TURKEY_X) < 70,
  );
  state.nearHaystack = Boolean(hay);
  if (t.hidden && hay) {
    state.hideScoreGiven = state.hideScoreGiven || false;
  }
}

export function onHideComplete(state) {
  state.score += SCORE_HIDE;
  grantHideBonus(state);
}

export function throwKnifeFrom(world, fromX, fromY) {
  world.knives.push({
    kind: 'thrown',
    x: fromX,
    y: fromY,
    vx: 520,
    vy: -260,
    spin: 0,
    stuck: false,
  });
}

export function drawWorld(ctx, world, state, t) {
  const distance = state.distance;
  for (const o of world.obstacles) {
    const sx = screenX(o.dist, distance);
    if (sx < -160 || sx > 1500) continue;
    if (o.kind === 'fence') drawFence(ctx, sx, GROUND_Y);
    else if (o.kind === 'pumpkin') drawPumpkin(ctx, sx, GROUND_Y - 22, o.angle);
    else if (o.kind === 'oven') drawOven(ctx, sx, GROUND_Y, o.flame || 0, t);
    else if (o.kind === 'haystack') drawHaystack(ctx, sx, GROUND_Y, 1);
  }
  for (const p of world.pickups) {
    if (p.taken) continue;
    const sx = screenX(p.dist, distance);
    if (sx < -60 || sx > 1400) continue;
    const bob = Math.sin(t * 3 + p.dist) * 4;
    if (p.kind === 'corn') drawCorn(ctx, sx, p.y, bob);
    else if (p.kind === 'feather') drawFeather(ctx, sx, p.y, bob);
    else if (p.kind === 'gravy') {
      ctx.save();
      ctx.translate(sx, p.y + bob);
      ctx.fillStyle = '#e8e0cc';
      ctx.beginPath();
      ctx.ellipse(0, 0, 20, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#8a5a2b';
      ctx.fillRect(-24, -4, 10, 5);
      ctx.fillStyle = '#c0392b';
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('GRAVY', 0, -18);
      ctx.restore();
    }
  }
  for (const k of world.knives) {
    if (k.kind === 'thrown') drawKnife(ctx, k.x, k.y, k.spin, 1);
    else drawKnife(ctx, screenX(k.x, distance), k.y, k.spin, 1.1);
  }
  // The forest gate at the finish line.
  const gateX = screenX(FINISH_M, distance);
  if (gateX > -200 && gateX < 1500) {
    ctx.save();
    ctx.translate(gateX, GROUND_Y);
    ctx.fillStyle = '#5d3a1a';
    ctx.fillRect(-10, -190, 16, 190);
    ctx.fillRect(74, -190, 16, 190);
    ctx.fillStyle = '#2e6b2e';
    ctx.beginPath();
    ctx.moveTo(-30, -190);
    ctx.quadraticCurveTo(40, -250, 110, -190);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fffdf5';
    ctx.font = 'bold 26px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('FREEDOM', 40, -206);
    ctx.restore();
  }
}

export { pick };
