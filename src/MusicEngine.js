/**
 * 8-Bit Chiptune Music — Wily Castle DNA
 * 
 * Based on research of the original:
 * - Key: C# minor (C#, D#, E, F#, G#, A, B)
 * - Tempo: 175 BPM (the original is 175-180)
 * - Chord progression: i → VI → VII (C#m → A → B)
 * - Bass: "Horse galloping" rhythm — fast repeating octave pattern
 * - Melody: Built on C#-E-G# arpeggios with stepwise motion
 * - Phrygian borrowing: D natural (bII) for extra drama
 */
export class MusicEngine {
  constructor(scene) {
    this.ctx = scene.sound.context;
    this.playing = false;
    this.bpm = 175;
    this.stepTime = 60 / this.bpm / 4; // 16th notes
    this.currentStep = 0;
    this.loopCount = 0;
    this.volume = 0.22;

    // C# minor scale + chromatic passing tones
    const N = {
      'C#2': 69.30,  'G#2': 103.83, 'A2': 110.00, 'B2': 123.47,
      'C#3': 138.59, 'D#3': 155.56, 'E3': 164.81, 'F#3': 185.00,
      'G#3': 207.65, 'A3': 220.00, 'B3': 246.94,
      'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63,
      'F#4': 369.99, 'G#4': 415.30, 'A4': 440.00, 'B4': 493.88,
      'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25,
      'F#5': 739.99, 'G#5': 830.61, 'A5': 880.00, 'B5': 987.77,
    };
    this.N = N;
    const _ = null;

    // ═══════════════════════════════════════
    // MELODY — 64 steps, C# minor, galloping arpeggios
    // Research: "C# up to E three times, back down"
    // Heavy use of C#-E-G# triad motion
    // ═══════════════════════════════════════
    this.melodyPatterns = [
      // A: Main theme — driving arpeggiated melody, the "hook"
      // C#m arpeggio up, stepwise down, repeat higher
      [
        N['C#5'],_,N.E5,N['C#5'], _,N.E5,N['C#5'],_,
        N.E5,N['G#5'],N.E5,_,     N['C#5'],_,_,_,
        N['C#5'],_,N.E5,N['C#5'], _,N.E5,N['F#5'],_,
        N['G#5'],_,N['F#5'],N.E5, N['D#5'],_,_,_,
        // A major section (VI chord)
        N.A4,_,N['C#5'],N.A4,     _,N['C#5'],N.E5,_,
        N['C#5'],_,N.A4,_,        N.E4,_,_,_,
        // B major section (VII chord)
        N.B4,_,N['D#5'],N.B4,     _,N['D#5'],N['F#5'],_,
        N['D#5'],_,N.B4,N['G#4'], N['C#5'],_,_,_,
      ],
      // B: Variation — higher register, more intense
      [
        N['G#5'],_,N.E5,_,        N['C#5'],_,N.E5,_,
        N['G#5'],_,N['F#5'],N.E5, N['D#5'],_,_,_,
        N['G#5'],_,N.E5,_,        N['F#5'],_,N['G#5'],_,
        N.A5,_,N['G#5'],N['F#5'], N.E5,_,_,_,
        // Descending drama
        N.E5,_,N['D#5'],N['C#5'], N.B4,_,N.A4,_,
        N.B4,_,N['C#5'],_,        N['D#5'],_,_,_,
        N.B4,_,N['C#5'],N['D#5'], N.E5,_,N['F#5'],_,
        N['G#5'],N['F#5'],N.E5,N['D#5'], N['C#5'],_,_,_,
      ],
    ];

    // ═══════════════════════════════════════
    // BASS — "Horse galloping" octave pumping
    // Research: repeated notes, galloping rhythm
    // C#-G#-C#-G# on every 8th note, relentless
    // Follows i → VI → VII → i progression
    // ═══════════════════════════════════════
    this.bassPattern = [
      // C#m (bars 1-2)
      N['C#3'],_,N['G#3'],_, N['C#3'],_,N['G#3'],_,
      N['C#3'],_,N['G#3'],_, N['C#3'],_,N['G#3'],_,
      N['C#3'],_,N['G#3'],_, N['C#3'],_,N['G#3'],_,
      N['C#3'],_,N['G#3'],_, N['C#3'],_,N['G#3'],_,
      // A major (bar 3)
      N.A2,_,N.E3,_,   N.A2,_,N.E3,_,
      N.A2,_,N.E3,_,   N.A2,_,N.E3,_,
      // B major (bar 4)
      N.B2,_,N['F#3'],_, N.B2,_,N['F#3'],_,
      N.B2,_,N['F#3'],_, N.B2,_,N['F#3'],_,
    ];

    // ═══════════════════════════════════════
    // DRUMS — Driving, syncopated, fills for energy
    // Strong four-on-the-floor kick at this tempo
    // ═══════════════════════════════════════
    this.drumPatterns = [
      [
        'K','H','H','H', 'S','H','H','H',
        'K','K','H','H', 'S','H','H','H',
        'K','H','H','H', 'S','H','H','H',
        'K','K','H','H', 'S','H','O','H',
        'K','H','H','H', 'S','H','H','H',
        'K','K','H','H', 'S','H','H','H',
        'K','H','H','H', 'S','H','K','S',
        'K','S','K','S', 'K','S','K','S',
      ],
      [
        'K','H','H','K', 'S','H','H','H',
        'K','H','K','H', 'S','H','O','H',
        'K','H','H','K', 'S','H','H','H',
        'K','H','K','H', 'S','H','O','H',
        'K','H','H','K', 'S','H','H','H',
        'K','H','K','H', 'S','H','O','H',
        'K','H','K','S', 'K','H','K','S',
        'K','K','S','S', 'K','K','S','K',
      ],
    ];
  }

  start() {
    if (this.playing) return;
    this.playing = true;
    this.currentStep = 0;
    this.loopCount = 0;
    this.scheduleNext();
  }

  stop() { this.playing = false; }
  setVolume(v) { this.volume = Math.max(0, Math.min(1, v)); }

  scheduleNext() {
    if (!this.playing) return;
    const now = this.ctx.currentTime;
    const step = this.currentStep % 64;

    const mel = this.melodyPatterns[this.loopCount % this.melodyPatterns.length];
    const drums = this.drumPatterns[this.loopCount % this.drumPatterns.length];

    // LEAD — bright, cutting square wave
    if (mel[step]) this.playLead(mel[step], now, this.stepTime * 0.85);

    // BASS — pumping triangle, never stops
    if (this.bassPattern[step]) {
      this.playBass(this.bassPattern[step], now, this.stepTime * 0.8);
    }

    // COUNTER-HARMONY (enters loop 2+, 4th below for thickness)
    if (this.loopCount >= 2 && mel[step]) {
      this.playHarmony(mel[step] * 0.749, now, this.stepTime * 0.5);
    }

    // DRUMS
    const d = drums[step];
    if (d === 'K') this.playKick(now);
    else if (d === 'S') this.playSnare(now);
    else if (d === 'H') this.playHiHat(now, false);
    else if (d === 'O') this.playHiHat(now, true);

    this.currentStep++;
    if (this.currentStep >= 64) { this.currentStep = 0; this.loopCount++; }
    setTimeout(() => this.scheduleNext(), this.stepTime * 1000);
  }

  // ═══════════════════════════════════════
  // INSTRUMENTS — punchy, bright NES sound
  // ═══════════════════════════════════════

  playLead(freq, t, dur) {
    const v = this.volume * 0.3;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = 'square';
    // Pitch bend attack for that NES "twang"
    o.frequency.setValueAtTime(freq * 1.015, t);
    o.frequency.exponentialRampToValueAtTime(freq, t + 0.012);
    // Snappy envelope
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(v, t + 0.002);
    g.gain.setValueAtTime(v * 0.8, t + dur * 0.4);
    g.gain.linearRampToValueAtTime(0, t + dur);
    o.connect(g); g.connect(this.ctx.destination);
    o.start(t); o.stop(t + dur + 0.01);
  }

  playBass(freq, t, dur) {
    const v = this.volume * 0.45;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = 'triangle';
    o.frequency.setValueAtTime(freq, t);
    // Short punchy notes for the galloping feel
    g.gain.setValueAtTime(v, t);
    g.gain.setValueAtTime(v * 0.3, t + dur * 0.5);
    g.gain.linearRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(this.ctx.destination);
    o.start(t); o.stop(t + dur + 0.01);
  }

  playHarmony(freq, t, dur) {
    const v = this.volume * 0.1;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = 'square';
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(v, t);
    g.gain.linearRampToValueAtTime(0, t + dur);
    o.connect(g); g.connect(this.ctx.destination);
    o.start(t); o.stop(t + dur + 0.01);
  }

  playKick(t) {
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(200, t);
    o.frequency.exponentialRampToValueAtTime(35, t + 0.06);
    g.gain.setValueAtTime(this.volume * 0.6, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    o.connect(g); g.connect(this.ctx.destination);
    o.start(t); o.stop(t + 0.08);
  }

  playSnare(t) {
    const o = this.ctx.createOscillator();
    const og = this.ctx.createGain();
    o.type = 'triangle';
    o.frequency.setValueAtTime(260, t);
    o.frequency.exponentialRampToValueAtTime(100, t + 0.03);
    og.gain.setValueAtTime(this.volume * 0.25, t);
    og.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    o.connect(og); og.connect(this.ctx.destination);
    o.start(t); o.stop(t + 0.05);

    const len = this.ctx.sampleRate * 0.06;
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const n = this.ctx.createBufferSource(); n.buffer = buf;
    const ng = this.ctx.createGain();
    ng.gain.setValueAtTime(this.volume * 0.18, t);
    ng.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    const hp = this.ctx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 4000;
    n.connect(hp); hp.connect(ng); ng.connect(this.ctx.destination);
    n.start(t); n.stop(t + 0.06);
  }

  playHiHat(t, open) {
    const dur = open ? 0.08 : 0.02;
    const len = this.ctx.sampleRate * dur;
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const n = this.ctx.createBufferSource(); n.buffer = buf;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(this.volume * 0.06, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    const hp = this.ctx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 8000;
    n.connect(hp); hp.connect(g); g.connect(this.ctx.destination);
    n.start(t); n.stop(t + dur);
  }
}
