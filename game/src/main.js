// GOBBLE DASH — the game loop and state machine. One file, one job: wire
// input, turkey, farmer, world, art and sound together; own the states
// title → play → end; and stage the four deterministic ?shot= scenes the
// screenshots are taken from.

import {
  BASE_SPEED,
  FINISH_M,
  GAP_MAX,
  GAP_START,
  GROUND_Y,
  MAX_SPEED,
  STAGES,
  VIEW_H,
  VIEW_W,
} from './config.js';
import { createInput, readShotParams } from './input.js';
import { createAudio } from './audio.js';
import { drawFarmer, drawScenery, drawTurkey } from './art.js';
import { applyHit, createTurkey, updateTurkey } from './turkey.js';
import { createFarmer, farmerCaught, updateFarmer } from './farmer.js';
import {
  PX_PER_M,
  createWorld,
  drawWorld,
  onHideComplete,
  stageAt,
  throwKnifeFrom,
  updateWorld,
} from './world.js';
import { drawEnd, drawHud, drawTitle } from './hud.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const input = createInput(canvas);
const audio = createAudio();
const shot = readShotParams();

const BEST_KEY = 'gobble-dash-best';
let best = 0;
try {
  best = Number(window.localStorage.getItem(BEST_KEY) || 0) || 0;
} catch {
  best = 0;
}

function newRun(seed) {
  return {
    mode: 'title',
    time: 0,
    distance: 0,
    score: 0,
    corn: 0,
    gap: GAP_START,
    stage: STAGES[0],
    hintTimer: 0,
    lastStageId: STAGES[0].id,
    result: null,
    best,
    nearHaystack: false,
    turkey: createTurkey(),
    farmer: createFarmer(),
    world: createWorld(seed),
    scrollPx: 0,
    frozen: false,
  };
}

let state = newRun(shot.seed);

// --- Shot staging: deterministic scenes for the screenshots. The world is
// fast-forwarded to a chosen moment, then frozen so the capture is stable.
function stageShot() {
  if (!shot.shot) return;
  const s = state;
  if (shot.shot === 'title') {
    s.mode = 'title';
  } else if (shot.shot === 'cover') {
    // Mid farmyard run: farmer lunging close behind, a knife in the air,
    // corn ahead, full HUD.
    s.mode = 'play';
    s.distance = 182;
    s.score = 2450;
    s.corn = 9;
    s.gap = 115;
    s.turkey.combo = 3;
    s.turkey.comboTimer = 3;
    s.turkey.stamina = 62;
    s.world.nextSpawnM = 200;
    s.world.obstacles.push({ kind: 'fence', dist: 186.5, passed: false });
    s.world.obstacles.push({ kind: 'haystack', dist: 193, passed: true });
    s.world.obstacles.push({ kind: 'pumpkin', dist: 190.2, angle: 0.7, passed: false });
    s.world.pickups.push({ kind: 'corn', dist: 184.6, y: GROUND_Y - 55, taken: false });
    s.world.pickups.push({ kind: 'corn', dist: 185.7, y: GROUND_Y - 55, taken: false });
    s.world.pickups.push({ kind: 'feather', dist: 189, y: GROUND_Y - 110, taken: false });
    s.world.knives.push({ kind: 'thrown', x: 560, y: 330, vx: 0, vy: 0, spin: 0.9, stuck: false });
    s.farmer.mode = 'lunge';
    s.farmer.x = 230 - 115;
    s.turkey.y = GROUND_Y - 75;
    s.turkey.onGround = false;
    s.turkey.vy = -60;
  } else if (shot.shot === 'kitchen') {
    // Kitchen stage: ovens firing, a falling knife, farmer searching.
    s.mode = 'play';
    s.distance = 623;
    s.score = 7310;
    s.corn = 24;
    s.gap = 170;
    s.turkey.lives = 2;
    s.turkey.stamina = 80;
    s.stage = stageAt(623);
    s.world.nextSpawnM = 640;
    s.world.obstacles.push({ kind: 'oven', dist: 627.4, phase: 0.2, passed: false, flame: 0.9 });
    s.world.obstacles.push({ kind: 'oven', dist: 632.8, phase: 1.1, passed: false, flame: 0.2 });
    s.world.obstacles.push({ kind: 'fence', dist: 636.5, passed: false });
    s.world.pickups.push({ kind: 'corn', dist: 629.5, y: GROUND_Y - 130, taken: false });
    s.world.pickups.push({ kind: 'corn', dist: 630.6, y: GROUND_Y - 130, taken: false });
    s.world.knives.push({ kind: 'fall', x: 633.5, y: 220, vy: 120, spin: 2.1 });
    s.farmer.mode = 'chase';
    s.farmer.x = 230 - 170;
  } else if (shot.shot === 'end') {
    s.mode = 'end';
    s.result = 'escaped';
    s.distance = FINISH_M;
    s.score = 12840;
    s.corn = 31;
    s.time = 96.4;
    s.best = FINISH_M;
  }
  s.frozen = true;
  s.time = shot.shot === 'end' ? 96.4 : 1.6;
  document.title = 'GOBBLE DASH — shot ' + shot.shot;
}

stageShot();

function startRun() {
  const seed = (shot.seed + Math.floor(Math.random() * 1000)) % 100000;
  const keepBest = state.best;
  state = newRun(seed);
  state.best = keepBest;
  state.mode = 'play';
  state.hintTimer = 4;
  audio.unlock();
  audio.gobble();
  audio.startMusic();
}

function endRun(result) {
  state.mode = 'end';
  state.result = result;
  audio.stopMusic();
  if (result === 'escaped') audio.escaped();
  else audio.caught();
  const d = Math.floor(state.distance);
  if (d > state.best) {
    state.best = d;
    try {
      window.localStorage.setItem(BEST_KEY, String(d));
    } catch {
      /* storage unavailable — best is session-only */
    }
  }
}

function handleEvents(events) {
  for (const event of events) {
    if (event.type === 'jump') audio.jump();
    else if (event.type === 'land') audio.land();
    else if (event.type === 'pickup') audio.pickup();
    else if (event.type === 'feather') audio.feather();
    else if (event.type === 'hit') audio.hit();
    else if (event.type === 'stumble') audio.land();
    else if (event.type === 'alarm') audio.alarm();
    else if (event.type === 'hide') {
      audio.hide();
      onHideComplete(state);
    } else if (event.type === 'search') audio.alarm();
    else if (event.type === 'throwKnife') throwKnifeFrom(state.world, event.fromX, event.fromY);
    else if (event.type === 'nearMiss') audio.pickup();
    else if (event.type === 'caught') endRun('caught');
  }
}

function update(dt) {
  const s = state;
  if (s.mode === 'title') {
    if (input.wasPressed('confirm') || input.consumeClick()) startRun();
    return;
  }
  if (s.mode === 'end') {
    if (input.wasPressed('restart') || input.wasPressed('confirm') || input.consumeClick()) {
      startRun();
    }
    return;
  }
  // Play.
  if (input.wasPressed('pause')) {
    s.mode = 'paused';
    return;
  }
  if (input.wasPressed('mute')) audio.toggleMute();
  const t = s.turkey;
  const speedM = Math.min(MAX_SPEED / PX_PER_M, (BASE_SPEED + s.distance * 0.09) / PX_PER_M);
  const speedPx = speedM * PX_PER_M * (t.sprinting ? 1.45 : 1);
  const slowmo = t.slowmoTimer > 0 ? 0.55 : 1;
  const events = [];
  updateTurkey(t, input, dt * slowmo, speedPx, s.nearHaystack, events);
  updateFarmer(s.farmer, s, dt * slowmo, events);
  updateWorld(s.world, s, dt * slowmo, events);
  handleEvents(events);
  s.time += dt;
  s.distance += speedM * dt * slowmo * (t.sprinting ? 1.45 : 1);
  s.score += Math.floor(speedM * dt * slowmo * 10);
  s.scrollPx += speedPx * dt * slowmo;
  // Stage change banner.
  if (s.stage.id !== s.lastStageId) {
    s.lastStageId = s.stage.id;
    s.hintTimer = 4;
    audio.gobble();
  }
  if (s.hintTimer > 0) s.hintTimer -= dt;
  if (s.distance >= FINISH_M) {
    s.distance = FINISH_M;
    endRun('escaped');
    return;
  }
  if (farmerCaught(s)) {
    endRun('caught');
  }
}

function render() {
  const s = state;
  const t = s.time;
  drawScenery(ctx, s.stage, s.scrollPx, t);
  if (s.mode === 'title') {
    drawTurkey(ctx, 170, GROUND_Y - 40, { runPhase: t * 2 });
    drawFarmer(ctx, 1110, GROUND_Y - 40, { runPhase: t * 2.4, mode: 'chase' });
    drawTitle(ctx, s.best, t);
    return;
  }
  drawWorld(ctx, s.world, s, t);
  // The end screen brings its own turkey and farmer: do not draw the
  // in-run ones underneath it.
  if (s.mode === 'end') {
    drawEnd(ctx, s, t);
    return;
  }
  // Farmer (behind the turkey) then the turkey.
  drawFarmer(ctx, s.farmer.x, GROUND_Y, {
    runPhase: s.farmer.runPhase,
    mode: s.farmer.mode,
  });
  drawTurkey(ctx, s.turkey.x, s.turkey.y, {
    runPhase: s.turkey.runPhase,
    sliding: s.turkey.sliding,
    hidden: s.turkey.hidden,
    shield: s.turkey.shield,
    hurt: s.turkey.hurtTimer > 0,
  });
  if (s.mode === 'play' || s.mode === 'paused') drawHud(ctx, s);
  if (s.mode === 'paused') {
    ctx.fillStyle = 'rgba(40,24,10,0.6)';
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    ctx.fillStyle = '#fffdf5';
    ctx.font = 'bold 56px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED — press P to run on', VIEW_W / 2, VIEW_H / 2);
    ctx.textAlign = 'left';
    if (input.wasPressed('pause')) s.mode = 'play';
    return;
  }
  if (s.mode === 'end') drawEnd(ctx, s, t);
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (!state.frozen) update(dt);
  render();
  input.endFrame();
  requestAnimationFrame(frame);
}

document.title = 'GOBBLE DASH — a turkey escape game';
requestAnimationFrame(frame);
