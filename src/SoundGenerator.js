/**
 * Generates game sound effects programmatically using the Web Audio API.
 * No external audio files needed.
 */
export class SoundGenerator {
  constructor(scene) {
    this.scene = scene;
    this.ctx = scene.sound.context; // Phaser's Web Audio context
  }

  /**
   * Satisfying thud / footstep sound for climbing stairs.
   * Low-frequency thump with a subtle click on top.
   */
  playStep() {
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Low-frequency thud (the body of the sound)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.08);
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);

    // High click (the "impact" feel)
    const click = ctx.createOscillator();
    const clickGain = ctx.createGain();
    click.type = 'square';
    click.frequency.setValueAtTime(800, now);
    click.frequency.exponentialRampToValueAtTime(200, now + 0.03);
    clickGain.gain.setValueAtTime(0.08, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    click.connect(clickGain);
    clickGain.connect(ctx.destination);
    click.start(now);
    click.stop(now + 0.04);

    // Noise burst for texture
    const bufferSize = ctx.sampleRate * 0.05;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.15;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.12, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    // Low-pass filter for warmth
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(now);
    noise.stop(now + 0.06);
  }

  /**
   * Fall / trip sound — descending pitch with crash noise.
   * Plays when the player misses a step.
   */
  playFall() {
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Descending "woosh" 
    const woosh = ctx.createOscillator();
    const wooshGain = ctx.createGain();
    woosh.type = 'sawtooth';
    woosh.frequency.setValueAtTime(600, now);
    woosh.frequency.exponentialRampToValueAtTime(80, now + 0.4);
    wooshGain.gain.setValueAtTime(0.15, now);
    wooshGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    woosh.connect(wooshGain);
    wooshGain.connect(ctx.destination);
    woosh.start(now);
    woosh.stop(now + 0.5);

    // Impact thud (delayed)
    const thud = ctx.createOscillator();
    const thudGain = ctx.createGain();
    thud.type = 'sine';
    thud.frequency.setValueAtTime(80, now + 0.15);
    thud.frequency.exponentialRampToValueAtTime(25, now + 0.45);
    thudGain.gain.setValueAtTime(0, now);
    thudGain.gain.setValueAtTime(0.4, now + 0.15);
    thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    thud.connect(thudGain);
    thudGain.connect(ctx.destination);
    thud.start(now);
    thud.stop(now + 0.55);

    // Crash noise burst
    const bufferSize = ctx.sampleRate * 0.3;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.3;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0, now);
    noiseGain.gain.setValueAtTime(0.2, now + 0.12);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3000, now + 0.12);
    filter.frequency.exponentialRampToValueAtTime(200, now + 0.5);
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(now);
    noise.stop(now + 0.5);
  }
}
