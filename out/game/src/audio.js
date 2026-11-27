// GOBBLE DASH — all sound is synthesized with WebAudio: no audio files,
// no network. Gobbles, thuds, alarms, oven sizzles and a little banjo-ish
// pluck loop. Created lazily on the first user gesture.

export function createAudio() {
  let ctx = null;
  let muted = false;
  let musicTimer = null;
  const MELODY = [392, 440, 494, 587, 494, 440, 392, 330];

  function ensure() {
    if (!ctx) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        ctx = new AC();
      } catch {
        ctx = null;
      }
    }
    if (ctx && ctx.state === 'suspended') void ctx.resume();
    return ctx;
  }

  function tone(freq, dur, type, vol, when = 0, slideTo = 0) {
    const ac = ensure();
    if (!ac || muted) return;
    const t0 = ac.currentTime + when;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(gain).connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  function noise(dur, vol, filterFreq) {
    const ac = ensure();
    if (!ac || muted) return;
    const len = Math.floor(ac.sampleRate * dur);
    const buffer = ac.createBuffer(1, len, ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ac.createBufferSource();
    src.buffer = buffer;
    const filter = ac.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = filterFreq;
    const gain = ac.createGain();
    gain.gain.value = vol;
    src.connect(filter).connect(gain).connect(ac.destination);
    src.start();
  }

  return {
    unlock() {
      ensure();
    },
    toggleMute() {
      muted = !muted;
      return muted;
    },
    isMuted() {
      return muted;
    },
    gobble() {
      tone(520, 0.09, 'square', 0.12, 0, 300);
      tone(430, 0.09, 'square', 0.12, 0.1, 260);
      tone(560, 0.12, 'square', 0.12, 0.2, 320);
    },
    jump() {
      tone(300, 0.16, 'sine', 0.14, 0, 640);
    },
    land() {
      noise(0.08, 0.1, 400);
    },
    pickup() {
      tone(880, 0.1, 'triangle', 0.14);
      tone(1318, 0.14, 'triangle', 0.12, 0.07);
    },
    feather() {
      [660, 880, 1100, 1320].forEach((f, i) => tone(f, 0.12, 'triangle', 0.12, i * 0.06));
    },
    hit() {
      tone(220, 0.25, 'sawtooth', 0.16, 0, 90);
      noise(0.18, 0.14, 900);
    },
    alarm() {
      tone(740, 0.12, 'square', 0.09);
      tone(740, 0.12, 'square', 0.09, 0.16);
    },
    sizzle() {
      noise(0.35, 0.1, 3200);
    },
    hide() {
      tone(500, 0.2, 'sine', 0.1, 0, 900);
    },
    escaped() {
      [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, 0.22, 'triangle', 0.14, i * 0.11));
    },
    caught() {
      [392, 370, 349, 311].forEach((f, i) => tone(f, 0.3, 'sawtooth', 0.1, i * 0.18));
    },
    startMusic() {
      if (musicTimer || !ensure()) return;
      let step = 0;
      musicTimer = window.setInterval(() => {
        if (muted) return;
        const f = MELODY[step % MELODY.length];
        tone(f, 0.16, 'triangle', 0.05);
        tone(f / 2, 0.2, 'sine', 0.04, 0.02);
        step += 1;
      }, 210);
    },
    stopMusic() {
      if (musicTimer) window.clearInterval(musicTimer);
      musicTimer = null;
    },
  };
}
