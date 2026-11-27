// GOBBLE DASH — every screen that is not the run itself: the HUD (score,
// distance, stage, lives, stamina, farmer proximity), the title screen and
// the two end screens (ESCAPED / CAUGHT) with restart. One file, one job:
// what the player reads.

import { FINISH_M, GAP_LUNGE_AT, GROUND_Y, STAGES, VIEW_H, VIEW_W } from './config.js';
import { drawFarmer, drawTurkey } from './art.js';

function chip(ctx, x, y, w, h, fill, stroke) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 10);
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

function heart(ctx, x, y, filled) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = filled ? '#d43d2a' : 'rgba(255,255,255,0.35)';
  ctx.beginPath();
  ctx.moveTo(0, 8);
  ctx.bezierCurveTo(-12, -2, -8, -12, 0, -5);
  ctx.bezierCurveTo(8, -12, 12, -2, 0, 8);
  ctx.fill();
  ctx.restore();
}

// The in-run HUD: score, distance, stage, lives, stamina, combo and how
// close the farmer is. Drawn every frame of a run.
export function drawHud(ctx, state) {
  const t = state.turkey;
  chip(ctx, 16, 14, 250, 64, 'rgba(40,24,10,0.72)');
  ctx.fillStyle = '#ffd94d';
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('SCORE', 30, 36);
  ctx.fillStyle = '#fffdf5';
  ctx.font = 'bold 26px system-ui, sans-serif';
  ctx.fillText(String(state.score), 30, 66);

  chip(ctx, 282, 14, 250, 64, 'rgba(40,24,10,0.72)');
  ctx.fillStyle = '#ffd94d';
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.fillText('DISTANCE', 296, 36);
  ctx.fillStyle = '#fffdf5';
  ctx.font = 'bold 26px system-ui, sans-serif';
  ctx.fillText(`${Math.floor(state.distance)} m / ${FINISH_M} m`, 296, 66);

  chip(ctx, 548, 14, 210, 64, 'rgba(40,24,10,0.72)');
  ctx.fillStyle = '#ffd94d';
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.fillText('STAGE', 562, 36);
  ctx.fillStyle = '#fffdf5';
  ctx.font = 'bold 22px system-ui, sans-serif';
  ctx.fillText(state.stage.name, 562, 64);

  // Lives (hearts) + stamina bar.
  chip(ctx, 774, 14, 200, 64, 'rgba(40,24,10,0.72)');
  for (let i = 0; i < 3; i++) heart(ctx, 800 + i * 30, 46, i < t.lives);
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fillRect(884, 40, 76, 10);
  ctx.fillStyle = t.sprinting ? '#ffd94d' : '#7fa03f';
  ctx.fillRect(884, 40, 76 * (t.stamina / 100), 10);
  ctx.fillStyle = '#ffd94d';
  ctx.font = 'bold 11px system-ui, sans-serif';
  ctx.fillText('SPRINT', 884, 66);

  // Farmer proximity: a bar that fills as he closes in.
  const closeness = 1 - state.gap / 230;
  chip(ctx, 990, 14, 274, 64, 'rgba(40,24,10,0.72)');
  ctx.fillStyle = state.gap <= GAP_LUNGE_AT ? '#ff5a3c' : '#ffd94d';
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.fillText(state.gap <= GAP_LUNGE_AT ? '⚠ FARMER CLOSE!' : 'FARMER', 1004, 36);
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fillRect(1004, 46, 246, 12);
  ctx.fillStyle = state.gap <= GAP_LUNGE_AT ? '#ff5a3c' : '#e07f2e';
  ctx.fillRect(1004, 46, 246 * closeness, 12);

  // Combo + slow-mo + shield flags.
  if (t.combo >= 2) {
    chip(ctx, 16, 90, 170, 36, 'rgba(192,57,43,0.85)');
    ctx.fillStyle = '#fffdf5';
    ctx.font = 'bold 18px system-ui, sans-serif';
    ctx.fillText(`COMBO x${t.combo}`, 30, 115);
  }
  if (t.slowmoTimer > 0) {
    chip(ctx, 196, 90, 190, 36, 'rgba(46,95,163,0.85)');
    ctx.fillStyle = '#fffdf5';
    ctx.font = 'bold 18px system-ui, sans-serif';
    ctx.fillText(`GRAVY SLOW-MO ${t.slowmoTimer.toFixed(1)}s`, 210, 115);
  }
  if (t.hidden) {
    chip(ctx, VIEW_W / 2 - 130, 90, 260, 40, 'rgba(40,24,10,0.8)');
    ctx.fillStyle = '#ffd94d';
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('HIDDEN IN THE HAY…', VIEW_W / 2, 117);
    ctx.textAlign = 'left';
  }
  // Stage hint banner, first seconds of each stage.
  if (state.hintTimer > 0) {
    ctx.globalAlpha = Math.min(1, state.hintTimer);
    chip(ctx, VIEW_W / 2 - 320, 150, 640, 44, 'rgba(40,24,10,0.8)');
    ctx.fillStyle = '#fffdf5';
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(state.stage.hint, VIEW_W / 2, 179);
    ctx.textAlign = 'left';
    ctx.globalAlpha = 1;
  }
}

// Title screen: the game's name, the turkey and the farmer, controls.
export function drawTitle(ctx, best, t) {
  ctx.fillStyle = 'rgba(40,24,10,0.35)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fffdf5';
  ctx.font = 'bold 26px system-ui, sans-serif';
  ctx.fillText('THANKSGIVING IS COMING — AND YOU ARE THE DINNER', VIEW_W / 2, 92);
  ctx.fillStyle = '#ffd94d';
  ctx.font = 'bold 96px system-ui, sans-serif';
  ctx.fillText('GOBBLE DASH', VIEW_W / 2, 196);
  ctx.fillStyle = '#fffdf5';
  ctx.font = 'bold 30px system-ui, sans-serif';
  ctx.fillText('Outrun the farmer · Hide in the hay · Dodge knives & ovens', VIEW_W / 2, 246);
  ctx.font = 'bold 22px system-ui, sans-serif';
  ctx.fillStyle = '#ffd94d';
  ctx.fillText('▶  CLICK OR PRESS ENTER TO RUN', VIEW_W / 2, 500);
  ctx.fillStyle = '#fffdf5';
  ctx.font = '20px system-ui, sans-serif';
  ctx.fillText('SPACE / ↑ jump      ↓ slide      SHIFT sprint      H hide in haystack', VIEW_W / 2, 544);
  ctx.fillText('Collect corn · Golden feather = shield · Gravy = slow-mo', VIEW_W / 2, 576);
  ctx.fillText('4 stages: Farmyard → Barn → Kitchen → Freedom · Reach 1000 m to escape!', VIEW_W / 2, 608);
  if (best > 0) {
    ctx.fillStyle = '#ffd94d';
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.fillText(`BEST ESCAPE SO FAR: ${best} m`, VIEW_W / 2, 648);
  }
  ctx.textAlign = 'left';
}

// End screen: ESCAPED (gold, forest gate) or CAUGHT (farmer wins).
export function drawEnd(ctx, state, t) {
  const escaped = state.result === 'escaped';
  ctx.fillStyle = escaped ? 'rgba(46,107,46,0.55)' : 'rgba(60,10,5,0.55)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.textAlign = 'center';
  if (escaped) {
    ctx.fillStyle = '#ffd94d';
    ctx.font = 'bold 84px system-ui, sans-serif';
    ctx.fillText('ESCAPED!', VIEW_W / 2, 190);
    ctx.fillStyle = '#fffdf5';
    ctx.font = 'bold 28px system-ui, sans-serif';
    ctx.fillText('You made it through the forest gate — no Thanksgiving dinner today!', VIEW_W / 2, 240);
    drawTurkey(ctx, VIEW_W / 2, 420, { runPhase: t * 3 });
  } else {
    ctx.fillStyle = '#ff5a3c';
    ctx.font = 'bold 84px system-ui, sans-serif';
    ctx.fillText('CAUGHT!', VIEW_W / 2, 190);
    ctx.fillStyle = '#fffdf5';
    ctx.font = 'bold 28px system-ui, sans-serif';
    ctx.fillText('The farmer got you… dinner is served. Gobble one more time?', VIEW_W / 2, 240);
    drawFarmer(ctx, VIEW_W / 2 - 60, 430, { runPhase: 0, mode: 'caught' });
    drawTurkey(ctx, VIEW_W / 2 + 90, 430, { runPhase: 0, hurt: true });
  }
  // Stats box.
  chip(ctx, VIEW_W / 2 - 260, 470, 520, 110, 'rgba(40,24,10,0.8)');
  ctx.fillStyle = '#ffd94d';
  ctx.font = 'bold 20px system-ui, sans-serif';
  ctx.fillText(`SCORE  ${state.score}`, VIEW_W / 2, 506);
  ctx.fillStyle = '#fffdf5';
  ctx.font = '20px system-ui, sans-serif';
  ctx.fillText(
    `Distance ${Math.floor(state.distance)} m · Corn ${state.corn} · Time ${state.time.toFixed(1)}s`,
    VIEW_W / 2,
    540,
  );
  ctx.fillText(`Best: ${state.best} m`, VIEW_W / 2, 568);
  ctx.fillStyle = '#ffd94d';
  ctx.font = 'bold 24px system-ui, sans-serif';
  ctx.fillText('PRESS R OR CLICK TO RUN AGAIN', VIEW_W / 2, 640);
  ctx.textAlign = 'left';
}

export { STAGES };
