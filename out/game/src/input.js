// GOBBLE DASH — keyboard + mouse input, plus the ?shot= staging query
// the screenshot captures use. One file, one job: raw input state only;
// the game modules decide what each key means.

export function readShotParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    shot: params.get('shot') || null,
    seed: Number(params.get('seed') || 7),
  };
}

export function createInput(canvas) {
  const keys = new Set();
  const pressed = new Set();
  let mouseX = 0;
  let mouseY = 0;
  let clicked = false;

  function keyName(event) {
    if (event.code === 'Space') return 'jump';
    if (event.code === 'ArrowUp' || event.code === 'KeyW') return 'jump';
    if (event.code === 'ArrowDown' || event.code === 'KeyS') return 'slide';
    if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') return 'sprint';
    if (event.code === 'KeyH') return 'hide';
    if (event.code === 'Enter') return 'confirm';
    if (event.code === 'KeyR') return 'restart';
    if (event.code === 'KeyP') return 'pause';
    if (event.code === 'KeyM') return 'mute';
    return null;
  }

  window.addEventListener('keydown', (event) => {
    const name = keyName(event);
    if (!name) return;
    if (['jump', 'slide'].includes(name)) event.preventDefault();
    if (!keys.has(name)) pressed.add(name);
    keys.add(name);
  });
  window.addEventListener('keyup', (event) => {
    const name = keyName(event);
    if (name) keys.delete(name);
  });
  canvas.addEventListener('pointerdown', (event) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = ((event.clientX - rect.left) / rect.width) * canvas.width;
    mouseY = ((event.clientY - rect.top) / rect.height) * canvas.height;
    clicked = true;
    pressed.add('jump');
    keys.add('jump');
  });
  window.addEventListener('pointerup', () => keys.delete('jump'));

  return {
    held(name) {
      return keys.has(name);
    },
    // True once for the frame the key/button went down, then consumed.
    wasPressed(name) {
      if (!pressed.has(name)) return false;
      pressed.delete(name);
      return true;
    },
    consumeClick() {
      const was = clicked;
      clicked = false;
      return was;
    },
    mouse() {
      return { x: mouseX, y: mouseY };
    },
    endFrame() {
      pressed.clear();
    },
  };
}
