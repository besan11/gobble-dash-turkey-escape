// GOBBLE DASH — all art is drawn on the canvas: the turkey, the farmer,
// the oven, knives, haystacks, corn, pumpkins and the farm/barn/kitchen/
// forest scenery. No image files, no network — the game is one HTML file
// plus its own modules.

import { GROUND_Y, PALETTE, VIEW_H, VIEW_W } from './config.js';

function ellipse(ctx, x, y, rx, ry, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function roundRect(ctx, x, y, w, h, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

// The hero: a plump brown turkey with a fanned tail, mid-stride.
export function drawTurkey(ctx, x, y, opts) {
  const {
    runPhase = 0,
    sliding = false,
    hidden = false,
    shield = false,
    hurt = false,
  } = opts || {};
  if (hidden) return;
  ctx.save();
  ctx.translate(x, y);
  if (hurt && Math.floor(runPhase * 20) % 2 === 0) ctx.globalAlpha = 0.45;
  const bob = sliding ? 0 : Math.abs(Math.sin(runPhase)) * 3;
  const bodyY = -34 - bob;

  // Tail fan: five feathers.
  for (let i = -2; i <= 2; i++) {
    ctx.save();
    ctx.translate(-26, bodyY - 6);
    ctx.rotate(i * 0.34);
    ctx.fillStyle = [PALETTE.featherOrange, PALETTE.featherRed, PALETTE.featherGold][
      ((i + 2) % 3 + 3) % 3
    ];
    ctx.beginPath();
    ctx.ellipse(0, -26, 9, 30, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff8e0';
    ctx.beginPath();
    ctx.ellipse(0, -42, 3.5, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  // Body and wing.
  ellipse(ctx, 0, bodyY, 30, 24, PALETTE.turkeyBody);
  ellipse(ctx, -4, bodyY + 2, 18, 13, PALETTE.turkeyWing);
  // Head, wattle, beak, eye.
  ellipse(ctx, 24, bodyY - 26, 13, 12, PALETTE.turkeyBody);
  ellipse(ctx, 30, bodyY - 16, 5, 9, PALETTE.wattle);
  ctx.fillStyle = PALETTE.beak;
  ctx.beginPath();
  ctx.moveTo(34, bodyY - 30);
  ctx.lineTo(48, bodyY - 25);
  ctx.lineTo(34, bodyY - 20);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.arc(28, bodyY - 30, 2.6, 0, Math.PI * 2);
  ctx.fill();
  // Legs, running.
  ctx.strokeStyle = PALETTE.beak;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  const legSwing = Math.sin(runPhase) * 10;
  ctx.beginPath();
  ctx.moveTo(-6, bodyY + 20);
  ctx.lineTo(-6 + legSwing, 0);
  ctx.moveTo(8, bodyY + 20);
  ctx.lineTo(8 - legSwing, 0);
  ctx.stroke();
  if (shield) {
    ctx.strokeStyle = 'rgba(241,196,15,0.85)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, bodyY - 8, 46, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

// The farmer: straw hat, red plaid shirt, blue overalls, carving knife in
// hand when he lunges. mode: 'chase' | 'search' | 'lunge' | 'caught'.
export function drawFarmer(ctx, x, y, opts) {
  const { runPhase = 0, mode = 'chase' } = opts || {};
  ctx.save();
  ctx.translate(x, y);
  const lean = mode === 'lunge' ? 0.22 : mode === 'search' ? -0.08 : 0.1;
  ctx.rotate(lean);
  const bob = Math.abs(Math.sin(runPhase)) * 3;
  const hipY = -52 - bob;
  // Legs.
  ctx.strokeStyle = PALETTE.farmerOveralls;
  ctx.lineWidth = 9;
  ctx.lineCap = 'round';
  const swing = Math.sin(runPhase) * 12;
  ctx.beginPath();
  ctx.moveTo(-6, hipY);
  ctx.lineTo(-6 + swing, 0);
  ctx.moveTo(6, hipY);
  ctx.lineTo(6 - swing, 0);
  ctx.stroke();
  // Overalls + shirt.
  roundRect(ctx, -17, hipY - 26, 34, 30, 6, PALETTE.farmerOveralls);
  roundRect(ctx, -19, hipY - 44, 38, 22, 6, PALETTE.farmerShirt);
  // Plaid crosses.
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-19, hipY - 33);
  ctx.lineTo(19, hipY - 33);
  ctx.moveTo(0, hipY - 44);
  ctx.lineTo(0, hipY - 22);
  ctx.stroke();
  // Arms: one reaches forward, the other holds the knife up when lunging.
  ctx.strokeStyle = PALETTE.farmerShirt;
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(14, hipY - 38);
  ctx.lineTo(34, hipY - 26);
  ctx.stroke();
  if (mode === 'lunge' || mode === 'caught') {
    ctx.strokeStyle = PALETTE.farmerSkin;
    ctx.beginPath();
    ctx.moveTo(-12, hipY - 38);
    ctx.lineTo(-26, hipY - 62);
    ctx.stroke();
    drawKnife(ctx, -30, hipY - 78, -0.9, 1);
  }
  // Head, beard, hat.
  ellipse(ctx, 0, hipY - 56, 14, 13, PALETTE.farmerSkin);
  ctx.fillStyle = '#e8e0cc';
  ctx.beginPath();
  ctx.ellipse(2, hipY - 46, 12, 8, 0, 0, Math.PI);
  ctx.fill();
  ctx.fillStyle = PALETTE.farmerHat;
  ctx.beginPath();
  ctx.ellipse(0, hipY - 66, 22, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  roundRect(ctx, -11, hipY - 82, 22, 17, 5, PALETTE.farmerHat);
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.arc(6, hipY - 58, 2.2, 0, Math.PI * 2);
  ctx.fill();
  // Speech bubble when searching or lunging.
  if (mode === 'search' || mode === 'lunge') {
    const label = mode === 'search' ? '?' : '!';
    ctx.fillStyle = '#fffdf5';
    ctx.beginPath();
    ctx.arc(24, hipY - 96, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#c0392b';
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, 24, hipY - 95);
  }
  ctx.restore();
}

// A spinning carving knife, thrown or falling.
export function drawKnife(ctx, x, y, angle, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.scale(scale, scale);
  ctx.fillStyle = PALETTE.knifeBlade;
  ctx.beginPath();
  ctx.moveTo(0, -4);
  ctx.lineTo(34, -2);
  ctx.lineTo(40, 0);
  ctx.lineTo(34, 2);
  ctx.lineTo(0, 4);
  ctx.closePath();
  ctx.fill();
  roundRect(ctx, -16, -5, 16, 10, 3, PALETTE.knifeHandle);
  ctx.restore();
}

// A kitchen oven with a fire window; flameHeight 0..1 drives the jet.
export function drawOven(ctx, x, y, flameHeight, t) {
  ctx.save();
  ctx.translate(x, y);
  roundRect(ctx, -42, -96, 84, 96, 8, PALETTE.ovenBody);
  roundRect(ctx, -42, -96, 84, 14, 8, '#2a2a2e');
  // Window with fire.
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(-30, -72, 60, 40);
  const flick = 0.75 + Math.sin(t * 13) * 0.25;
  ctx.fillStyle = PALETTE.ovenFire;
  ctx.beginPath();
  ctx.moveTo(-26, -34);
  ctx.quadraticCurveTo(-14, -58 * flick, 0, -44 - 12 * flick);
  ctx.quadraticCurveTo(14, -58 * flick, 26, -34);
  ctx.closePath();
  ctx.fill();
  // Flame jet above the oven when it is firing.
  if (flameHeight > 0.05) {
    const h = 70 * flameHeight;
    const grad = ctx.createLinearGradient(0, 0, 0, -h);
    grad.addColorStop(0, '#ff7b1c');
    grad.addColorStop(1, '#ffd94d');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(-20, -96);
    ctx.quadraticCurveTo(-10, -96 - h * (0.7 + Math.sin(t * 17) * 0.1), 0, -96 - h);
    ctx.quadraticCurveTo(10, -96 - h * (0.7 + Math.cos(t * 15) * 0.1), 20, -96);
    ctx.closePath();
    ctx.fill();
  }
  // Dials and chimney.
  ctx.fillStyle = '#dfe6ea';
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(-24 + i * 24, -86, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  roundRect(ctx, 18, -128, 16, 34, 3, '#55555a');
  ctx.restore();
}

// A haystack the turkey can hide in.
export function drawHaystack(ctx, x, y, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = PALETTE.hay;
  ctx.beginPath();
  ctx.moveTo(-46, 0);
  ctx.quadraticCurveTo(-40, -52, 0, -58);
  ctx.quadraticCurveTo(40, -52, 46, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#c9a13a';
  ctx.lineWidth = 2;
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 14, -8);
    ctx.quadraticCurveTo(i * 16, -30, i * 10, -50);
    ctx.stroke();
  }
  ctx.restore();
}

// Corn on the cob pickup, bobbing.
export function drawCorn(ctx, x, y, bob) {
  ctx.save();
  ctx.translate(x, y + bob);
  ctx.rotate(0.5);
  ellipse(ctx, 0, 0, 10, 20, PALETTE.corn);
  ctx.fillStyle = '#e8b800';
  for (let r = -1; r <= 1; r++) {
    ctx.beginPath();
    ctx.moveTo(-8, r * 9);
    ctx.lineTo(8, r * 9);
    ctx.stroke();
  }
  ctx.fillStyle = '#7fa03f';
  ctx.beginPath();
  ctx.moveTo(-8, 18);
  ctx.lineTo(8, 18);
  ctx.lineTo(0, 30);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// A golden feather: bonus pickup + shield.
export function drawFeather(ctx, x, y, bob) {
  ctx.save();
  ctx.translate(x, y + bob);
  ctx.rotate(-0.4 + Math.sin(bob * 0.1) * 0.1);
  ctx.fillStyle = PALETTE.featherGold;
  ctx.beginPath();
  ctx.ellipse(0, 0, 8, 22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#fff8e0';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -20);
  ctx.lineTo(0, 22);
  ctx.stroke();
  ctx.restore();
}

// A rolling pumpkin hazard.
export function drawPumpkin(ctx, x, y, angle) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = PALETTE.pumpkin;
  ctx.beginPath();
  ctx.ellipse(0, 0, 26, 22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#c85a10';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, 0, 14, 22, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#5d8a3a';
  ctx.fillRect(-3, -30, 6, 10);
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.moveTo(-10, -6);
  ctx.lineTo(-4, 0);
  ctx.lineTo(-10, 6);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// A wooden fence to jump over.
export function drawFence(ctx, x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#8a5a2b';
  ctx.fillRect(-34, -46, 68, 8);
  ctx.fillRect(-34, -26, 68, 8);
  ctx.fillRect(-30, -52, 9, 52);
  ctx.fillRect(21, -52, 9, 52);
  ctx.restore();
}

// Parallax scenery for a stage: sun, hills, trees/barn/kitchen/forest.
export function drawScenery(ctx, stage, scrollPx, t) {
  const grad = ctx.createLinearGradient(0, 0, 0, VIEW_H);
  grad.addColorStop(0, stage.skyTop);
  grad.addColorStop(1, stage.skyBottom);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  // Sun.
  ctx.fillStyle = '#fff3c4';
  ctx.beginPath();
  ctx.arc(1080, 110, 52, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,243,196,0.4)';
  ctx.beginPath();
  ctx.arc(1080, 110, 72, 0, Math.PI * 2);
  ctx.fill();
  // Drifting clouds.
  ctx.fillStyle = 'rgba(255,253,245,0.85)';
  for (let i = 0; i < 3; i++) {
    const cx = ((i * 430 + t * 12) % (VIEW_W + 300)) - 150;
    const cy = 90 + i * 46;
    ellipse(ctx, cx, cy, 62, 18, 'rgba(255,253,245,0.85)');
    ellipse(ctx, cx + 40, cy + 6, 44, 14, 'rgba(255,253,245,0.85)');
  }
  // Far hills.
  ctx.fillStyle = stage.id === 'kitchen' ? '#b98a5a' : '#c98a4a';
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y - 120);
  for (let x = 0; x <= VIEW_W; x += 80) {
    ctx.lineTo(x, GROUND_Y - 120 - Math.sin((x + scrollPx * 0.2) * 0.006) * 46);
  }
  ctx.lineTo(VIEW_W, GROUND_Y);
  ctx.lineTo(0, GROUND_Y);
  ctx.closePath();
  ctx.fill();

  if (stage.id === 'kitchen') {
    // Kitchen wall: tiles + a window with the farm outside.
    ctx.fillStyle = '#f3e2c8';
    ctx.fillRect(0, 150, VIEW_W, GROUND_Y - 150);
    ctx.strokeStyle = 'rgba(180,140,90,0.5)';
    ctx.lineWidth = 2;
    for (let y = 170; y < GROUND_Y; y += 44) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(VIEW_W, y);
      ctx.stroke();
    }
    for (let x = 0; x < VIEW_W; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, 150);
      ctx.lineTo(x, GROUND_Y);
      ctx.stroke();
    }
    ctx.fillStyle = '#9fc3e8';
    ctx.fillRect(80, 190, 220, 150);
    ctx.fillStyle = '#7fa03f';
    ctx.fillRect(80, 300, 220, 40);
    ctx.fillStyle = '#fffdf5';
    ctx.fillRect(180, 190, 10, 150);
    ctx.fillRect(80, 260, 220, 10);
  } else {
    // Trees / barn / fence posts drifting past.
    for (let i = 0; i < 6; i++) {
      const wx = i * 260 - (scrollPx * 0.45) % 1560;
      const tx = wx < -80 ? wx + 1560 : wx;
      drawTree(ctx, tx, GROUND_Y, stage.id);
    }
    if (stage.id === 'barn') {
      const bx = 900 - ((scrollPx * 0.3) % 1600);
      drawBarn(ctx, bx < -200 ? bx + 1600 : bx, GROUND_Y);
    }
    if (stage.id === 'freedom') {
      for (let i = 0; i < 4; i++) {
        const wx = i * 340 - (scrollPx * 0.6) % 1360;
        const tx = wx < -60 ? wx + 1360 : wx;
        drawPine(ctx, tx, GROUND_Y);
      }
    }
  }
  // Ground.
  ctx.fillStyle = stage.ground;
  ctx.fillRect(0, GROUND_Y, VIEW_W, VIEW_H - GROUND_Y);
  ctx.fillStyle = stage.grass;
  ctx.fillRect(0, GROUND_Y, VIEW_W, 14);
  // Ground texture dashes scrolling with the world.
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  for (let i = 0; i < 24; i++) {
    const gx = (i * 97 - scrollPx) % (VIEW_W + 100);
    const x = gx < -50 ? gx + VIEW_W + 100 : gx;
    ctx.fillRect(x, GROUND_Y + 34 + (i % 3) * 22, 46, 5);
  }
}

function drawTree(ctx, x, y, stageId) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#6b421e';
  ctx.fillRect(-6, -70, 12, 70);
  ctx.fillStyle = stageId === 'freedom' ? '#4a7a2e' : '#8a6a2a';
  ellipse(ctx, 0, -96, 44, 34, stageId === 'freedom' ? '#4a7a2e' : '#b5762a');
  ellipse(ctx, -26, -78, 26, 20, stageId === 'freedom' ? '#3d6a26' : '#a06a1e');
  ellipse(ctx, 26, -78, 26, 20, stageId === 'freedom' ? '#3d6a26' : '#c07f22');
  ctx.restore();
}

function drawPine(ctx, x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#5d3a1a';
  ctx.fillRect(-5, -40, 10, 40);
  ctx.fillStyle = '#2e6b2e';
  ctx.beginPath();
  ctx.moveTo(0, -140);
  ctx.lineTo(-34, -60);
  ctx.lineTo(34, -60);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(0, -110);
  ctx.lineTo(-28, -40);
  ctx.lineTo(28, -40);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawBarn(ctx, x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#a33327';
  ctx.fillRect(-90, -150, 180, 150);
  ctx.fillStyle = '#7d241a';
  ctx.beginPath();
  ctx.moveTo(-100, -150);
  ctx.lineTo(0, -205);
  ctx.lineTo(100, -150);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#fffdf5';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(-90, -150);
  ctx.lineTo(90, -150);
  ctx.moveTo(-90, -75);
  ctx.lineTo(90, -75);
  ctx.moveTo(0, -150);
  ctx.lineTo(0, 0);
  ctx.stroke();
  ctx.restore();
}
