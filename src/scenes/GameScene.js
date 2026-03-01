import Phaser from 'phaser';
import { SoundGenerator } from '../SoundGenerator.js';
import { MusicEngine } from '../MusicEngine.js';

/**
 * Main gameplay scene — "Late for Class"
 *
 * Connected diagonal stair chain matching Infinite Stairs:
 * - Each step is offset diagonally from the previous (dx, dy)
 * - L = next step goes LEFT of current, R = goes RIGHT
 * - Pattern chunks determine the L/R sequence
 * - Chain stays in bounds by clamping near screen edges
 * - Background is open sky + distant city (no walls)
 */

// Easy patterns for the first ~25 steps (long same-side runs)
const EASY_PATTERNS = [
  ['R','R','R','R','R','R'],
  ['L','L','L','L','L','L'],
  ['R','R','R','R','R'],
  ['L','L','L','L','L'],
  ['R','R','R','R','L','L','L','L'],
  ['L','L','L','L','R','R','R','R'],
];

// Normal patterns (mixed, moderate challenge) — steps 25-50
const PATTERNS = [
  ['L','L','R','L','R','R'],
  ['R','L','L','R','R','L'],
  ['L','R','R','L','L','R'],
  ['R','R','L','R','L','L'],
  ['L','R','L','R'], // Shortened LRLR
  ['R','L','R','L'], // Shortened RLRL
  ['L','L','L','R','R'],
  ['R','R','R','L','L'],
  ['L','R','R','L','L'],
  ['R','L','L','R','R'],
  ['L','L','R','L','L'], // Early juke
  ['R','R','L','R','R'], // Early juke
  ['L','L','L','R','L','L','L'], // Hard juke moved to normal
  ['R','R','R','L','R','R','R'], // Hard juke moved to normal
  // Advanced user jukes in Normal
  ['L','L','L','L','R','L','L','L'], 
  ['R','R','R','R','L','R','R','R'], // (Mirror)
  ['L','L','L','R','L','L','L','L'], // Quick Juke 1
  ['R','R','R','L','R','R','R','R'], // (Mirror)
  ['L','L','L','L','L','R','R','L','L','R','R','R','R','R'],
  ['R','R','R','R','R','L','L','R','R','L','L','L','L','L'], // (Mirror)
  // Extreme Quake Patterns injected early and frequently
  ['R','R','L','R','R','R','R','R','R','L','R','L','L','L','L','R','R','R'],
  ['L','L','R','L','L','L','L','L','L','R','L','R','R','R','R','L','L','L'], // (Mirror)
  ['R','R','L','R','R','R','R','R','R','L','R','L','L','L','L','R','R','R'], // Duplicate for frequency
  ['L','L','R','L','L','L','L','L','L','R','L','R','R','R','R','L','L','L'], // (Mirror duplicate)
];

// Medium patterns — steps 50-120: shorter runs, frequent switches, introduced jukes
const MEDIUM_PATTERNS = [
  ['L','L','L','R','R','R','L','L','L'],
  ['R','R','R','L','L','L','R','R','R'],
  ['L','R','L','R','R','L','L'], // Shortened LRLR
  ['R','L','R','L','L','R','R'], // Shortened RLRL
  ['L','L','R','L','R','R','L','L'], // Juke
  ['R','R','L','R','L','L','R','R'], // Juke
  ['L','L','L','R','L','L','L'], // Hard juke
  ['R','R','R','L','R','R','R'], // Hard juke
  ['L','R','R','R','L','L','L','R'],
  ['R','L','L','L','R','R','R','L'],
  // Advanced user jukes in Medium
  ['L','L','L','L','R','L','L','L'], 
  ['R','R','R','R','L','R','R','R'], // (Mirror)
  ['L','L','L','R','L','L','L','L'], // Quick Juke 1
  ['R','R','R','L','R','R','R','R'], // (Mirror)
  ['L','L','L','L','L','R','R','L','L','R','R','R','R','R'],
  ['R','R','R','R','R','L','L','R','R','L','L','L','L','L'], // (Mirror)
  // Extreme Quake Patterns injected early and frequently
  ['R','R','L','R','R','R','R','R','R','L','R','L','L','L','L','R','R','R'],
  ['L','L','R','L','L','L','L','L','L','R','L','R','R','R','R','L','L','L'], // (Mirror)
  ['R','R','L','R','R','R','R','R','R','L','R','L','L','L','L','R','R','R'], // Duplicate for frequency
  ['L','L','R','L','L','L','L','L','L','R','L','R','R','R','R','L','L','L'], // (Mirror duplicate)
];

// Hard patterns — steps 120-250: rapid alternation + long runs + jukes
const HARD_PATTERNS = [
  ['L','R','L','R','R','R','R','R','L','L','L'],
  ['R','L','R','L','L','L','L','L','R','R','R'],
  ['L','L','L','L','R','L','R','R','R','R','R'], // Reduced LRLR
  ['R','R','R','R','L','R','L','L','L','L','L'], // Reduced RLRL
  // Juke patterns
  ['R','R','R','R','L','R','L','L','L','R'],
  ['L','L','L','L','R','L','R','R','R','L'],
  ['R','R','R','R','L','R','R','R','R','L'],
  ['L','L','L','L','R','L','L','L','L','R'],
  // Advanced user jukes in Hard
  ['L','L','L','L','R','L','L','L'], 
  ['R','R','R','R','L','R','R','R'], // (Mirror)
  ['L','L','L','R','L','L','L','L'], // Quick Juke 1
  ['R','R','R','L','R','R','R','R'], // (Mirror)
  ['L','L','L','L','L','R','R','L','L','R','R','R','R','R'],
  ['R','R','R','R','R','L','L','R','R','L','L','L','L','L'], // (Mirror)
  // Extreme Quake Patterns injected early and frequently
  ['R','R','L','R','R','R','R','R','R','L','R','L','L','L','L','R','R','R'],
  ['L','L','R','L','L','L','L','L','L','R','L','R','R','R','R','L','L','L'], // (Mirror)
  ['R','R','L','R','R','R','R','R','R','L','R','L','L','L','L','R','R','R'], // Duplicate for frequency
  ['L','L','R','L','L','L','L','L','L','R','L','R','R','R','R','L','L','L'], // (Mirror duplicate)
];

// Extreme patterns — steps 250+: very long chains, tricky combos, continuous jukes
const EXTREME_PATTERNS = [
  ['R','R','R','R','R','R','R','R','L','L','L','L'],
  ['L','L','L','L','L','L','L','L','R','R','R','R'],
  ['R','L','R','L','R','L','L','L'], // Severely reduced oscillating run
  ['L','R','L','R','L','R','R','R'], // Severely reduced oscillating run
  // Advanced Juke patterns (like requested: R R R R L R L L L L R)
  ['R','R','R','R','L','R','L','L','L','L','R'],
  ['L','L','L','L','R','L','R','R','R','R','L'],     // (Mirror of above)
  ['R','R','R','R','R','L','R','R','R','R','R','L','R'],
  ['L','L','L','L','L','R','L','L','L','L','L','R','L'],
  // Specific user-requested extreme patterns
  ['R','R','R','R','R','R','L','R','R','R','R','R'],
  ['L','L','L','L','L','L','R','L','L','L','L','L'], // (Mirror of above)
  ['L','L','L','R','L','L','L','L'], // Quick Juke 1
  ['R','R','R','L','R','R','R','R'], // (Mirror)
  ['R','R','R','R','R','L','L','R','R','L','L','L','L','L'],
  ['L','L','L','L','L','R','R','L','L','R','R','R','R','R'], // (Mirror of above)
  ['R','R','L','R','R','R','R','R','R','L','R','L','L','L','L','R','R','R'], // Very long juke
  ['L','L','R','L','L','L','L','L','L','R','L','R','R','R','R','L','L','L'], // (Mirror)
  ['R','R','L','R','R','R','R','R','R','L','R','L','L','L','L','R','R','R'], // Duplicate for frequency
  ['L','L','R','L','L','L','L','L','L','R','L','R','R','R','R','L','L','L'], // (Mirror duplicate)
];

const EASY_STEPS = 25;
const MEDIUM_STEPS = 50;
const HARD_STEPS = 120;
const EXTREME_STEPS = 250;

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    const { width, height } = this.scale;

    // ─── LAYOUT ───
    this.STEP_DX = 56;            // horizontal offset per step
    this.STEP_DY = 56;            // vertical offset per step
    this.MIN_X = -500;            // wide world boundary (camera follows)
    this.MAX_X = width + 500;     // wide world boundary
    this.GROUND_Y = height - 70;  // screen Y for ground floor
    this.ANCHOR_Y = height * 0.55; // player kept at this screen Y (centered in play area)
    this.ANCHOR_X = width / 2;     // player kept horizontally centered

    // ─── SOUND ───
    this.sfx = new SoundGenerator(this);
    this.music = new MusicEngine(this);

    // ─── STATE ───
    this.score = 0;
    this.isGameOver = false;
    this.maxTime = 100;
    this.currentTime = this.maxTime;
    this.baseDrainRate = 5;
    this.timeRefill = 8;
    this.drainRate = this.baseDrainRate;
    this.speedLevel = 0;
    this.isMoving = false;
    this.showTutorial = true;
    this.hasStarted = false;
    this.scrollY = 0;
    this.scrollX = width / 2;   // start centered on the first stair
    this.playerDir = 1; // 1=facing right, -1=facing left
    this.currentIdx = 0;
    this.patternQueue = [];
    this.climbFrame = 0;   // alternates between 0 and 1 for leg animation
    this.idleTimer = null; // delayed revert to idle texture

    // ─── BACKGROUND LAYERS (7 layers: school → sky → space, seamless cross-fade) ───
    // All backgrounds are oversized (1.4x) and centered so parallax drift
    // never exposes edges — the cross-fade handles transitions seamlessly.
    this.bgLayers = [];
    const oversize = 1.4;
    const bgConfigs = [
      { key: 'bg-deep-space',  parallax: 0.005 },  // 6: deep space nebula
      { key: 'bg-space-low',   parallax: 0.008 },  // 5: low earth orbit
      { key: 'bg-far',         parallax: 0.01 },   // 4: sky
      { key: 'bg-mid-far',     parallax: 0.02 },   // 3: aerial view
      { key: 'bg-mid',         parallax: 0.03 },   // 2: full building
      { key: 'bg-close-mid',   parallax: 0.04 },   // 1: building exterior
      { key: 'bg-close',       parallax: 0.06 },   // 0: school gate
    ];
    for (let i = 0; i < bgConfigs.length; i++) {
      const cfg = bgConfigs[i];
      const img = this.add.image(width / 2, height / 2, cfg.key)
        .setScrollFactor(0).setDepth(0).setAlpha(0);
      img.setDisplaySize(width * oversize, height * oversize);
      img.setTint(0x999999); // darken backgrounds so foreground pops
      img.parallaxRate = cfg.parallax;
      img.baseY = height / 2;
      this.bgLayers.push(img);
    }
    // bg-close starts fully visible (last in array = index 6)
    this.bgLayers[6].setAlpha(1);

    // Height thresholds for 7-layer cross-fade
    // Each step = ~56 worldY. Transitions now span school → sky → space
    // Step estimates: ~21 steps for first transition, ~600+ steps to deep space
    this.BG_TRANSITIONS = [
      // School gate (idx 6): fades out ~21-32 steps
      { idx: 6, inStart: 0,     inEnd: 0,     outStart: 1200,  outEnd: 1800 },
      // Building exterior (idx 5): ~18-63 steps
      { idx: 5, inStart: 1000,  inEnd: 1500,  outStart: 2800,  outEnd: 3500 },
      // Full building (idx 4): ~45-104 steps
      { idx: 4, inStart: 2500,  inEnd: 3200,  outStart: 5000,  outEnd: 5800 },
      // Aerial view (idx 3): ~86-139 steps
      { idx: 3, inStart: 4800,  inEnd: 5500,  outStart: 7000,  outEnd: 7800 },
      // Sky (idx 2): ~125-214 steps
      { idx: 2, inStart: 7000,  inEnd: 8000,  outStart: 11000, outEnd: 12000 },
      // Low earth orbit (idx 1): ~196-375 steps
      { idx: 1, inStart: 11000, inEnd: 13000, outStart: 19000, outEnd: 21000 },
      // Deep space nebula (idx 0): ~339+ steps, stays forever
      { idx: 0, inStart: 19000, inEnd: 22000, outStart: 99999, outEnd: 99999 },
    ];

    // Scale progression: player and stairs shrink gradually as you climb
    this.BASE_PLAYER_SCALE = 0.25;
    this.MIN_PLAYER_SCALE = 0.16;
    this.BASE_STAIR_SCALE_X = 0.16;
    this.BASE_STAIR_SCALE_Y = 0.055;
    this.SCALE_SHRINK_HEIGHT = 35000; // full shrink takes much longer now

    // ─── GROUND FLOOR (pixel-art textured) ───
    this.gndMain = this.add.image(width / 2, this.GROUND_Y + 80, 'ground-tex')
      .setDisplaySize(width + 20, 200).setDepth(3);
    this.gndTop = this.add.rectangle(width / 2, this.GROUND_Y + 2, width + 20, 3, 0xD8D0C4).setDepth(4);
    this.gndHi = this.add.rectangle(width / 2, this.GROUND_Y - 1, width + 20, 2, 0xE8E0D4).setDepth(4);

    // ─── STAIR CHAIN ───
    // { sprite, worldX, worldY }
    this.stairs = [];
    this.stairPool = [];
    this.generateInitialStairs();

    // ─── PLAYER ───
    const s0 = this.stairs[0];
    this.player = this.add.image(this.toScreenX(s0.worldX), this.toScreen(s0.worldY), 'student-idle-clean')
      .setScale(this.BASE_PLAYER_SCALE).setOrigin(0.5, 1).setDepth(10);
    this.player.setFlipX(this.playerDir === -1);

    // ─── UI ───
    this.scoreText = this.add.text(width / 2, 58, '0', {
      fontSize: '44px', fontFamily: 'monospace', color: '#FFFFFF',
      stroke: '#000000', strokeThickness: 6,
    }).setOrigin(0.5).setDepth(20).setScrollFactor(0);

    this.timerFrame = this.add.image(width / 2, 22, 'timer-frame').setDepth(20).setScrollFactor(0);
    this.timerFill = this.add.image(width / 2 - 107, 22, 'timer-fill').setDepth(20).setScrollFactor(0);
    this.timerFill.setOrigin(0, 0.5);

    // ─── BUTTONS ───
    this.createButtons();

    // ─── KEYBOARD (triggers button animations too) ───
    const KB = Phaser.Input.Keyboard.KeyCodes;
    const kLeft = this.input.keyboard.addKey(KB.LEFT);
    const kA = this.input.keyboard.addKey(KB.A);
    const kRight = this.input.keyboard.addKey(KB.RIGHT);
    const kD = this.input.keyboard.addKey(KB.D);

    kLeft.on('down', () => this.animateButton(this.btnL, 'btn-left', 'flip'));
    kLeft.on('up', () => this.releaseButton(this.btnL, 'btn-left'));
    kA.on('down', () => this.animateButton(this.btnL, 'btn-left', 'flip'));
    kA.on('up', () => this.releaseButton(this.btnL, 'btn-left'));
    kRight.on('down', () => this.animateButton(this.btnR, 'btn-right', 'step'));
    kRight.on('up', () => this.releaseButton(this.btnR, 'btn-right'));
    kD.on('down', () => this.animateButton(this.btnR, 'btn-right', 'step'));
    kD.on('up', () => this.releaseButton(this.btnR, 'btn-right'));

    // ─── TUTORIAL ───
    if (this.showTutorial) this.createTutorial();
  }

  // ═══════════════
  // COORDINATES
  // ═══════════════

  toScreen(worldY) { return this.GROUND_Y - worldY + this.scrollY; }
  toScreenX(worldX) { return worldX - this.scrollX + this.ANCHOR_X; }

  // ═══════════════
  // STAIR GENERATION — CONNECTED DIAGONAL CHAIN
  // ═══════════════

  fillQueue() {
    const totalGenerated = this.stairs ? this.stairs.length : 0;
    let pool;
    if (totalGenerated < EASY_STEPS) pool = EASY_PATTERNS;
    else if (totalGenerated < MEDIUM_STEPS) pool = PATTERNS;
    else if (totalGenerated < HARD_STEPS) pool = MEDIUM_PATTERNS;
    else if (totalGenerated < EXTREME_STEPS) pool = HARD_PATTERNS;
    else pool = EXTREME_PATTERNS;
    const chunk = Phaser.Utils.Array.GetRandom(pool);
    this.patternQueue.push(...chunk);
  }

  popSide() {
    if (this.patternQueue.length === 0) this.fillQueue();
    return this.patternQueue.shift();
  }

  generateInitialStairs() {
    // Stair 0 at center
    const startX = this.scale.width / 2;
    this.addStair(startX, 0);

    // Force the first 8 stairs to go RIGHT for a clean running start
    this.patternQueue = ['R','R','R','R','R','R','R','R'];

    // Fill screen + buffer
    const num = Math.ceil((this.scale.height + 500) / this.STEP_DY) + 5;
    for (let i = 0; i < num; i++) this.genNext();
  }

  genNext() {
    const prev = this.stairs[this.stairs.length - 1];
    let side = this.popSide();

    // Direction: L = go left, R = go right
    let dx = (side === 'L') ? -this.STEP_DX : this.STEP_DX;
    let nx = prev.worldX + dx;

    // Clamp to keep stairs in bounds — if we'd go out, force opposite direction
    if (nx < this.MIN_X) {
      nx = prev.worldX + this.STEP_DX;
      side = 'R';
    } else if (nx > this.MAX_X) {
      nx = prev.worldX - this.STEP_DX;
      side = 'L';
    }

    const ny = prev.worldY + this.STEP_DY;
    this.addStair(nx, ny, side);
  }

  addStair(worldX, worldY, side) {
    const sy = this.toScreen(worldY);
    const sx = this.toScreenX(worldX);
    let sprite;
    if (this.stairPool.length > 0) {
      sprite = this.stairPool.pop();
      sprite.setPosition(sx, sy).setVisible(true).setActive(true);
    } else {
      sprite = this.add.image(sx, sy, 'stair-clean').setDepth(5);
    }
    sprite.setScale(0.16, 0.055);
    this.stairs.push({ sprite, worldX, worldY, side: side || 'R' });
  }

  ensureAbove() {
    let safety = 0;
    while (safety < 30) {
      const top = this.stairs[this.stairs.length - 1];
      if (this.toScreen(top.worldY) < -400) break;
      this.genNext();
      safety++;
    }
  }

  recycleBelow() {
    const limit = this.scale.height + 200;
    while (this.stairs.length > 0 && this.currentIdx > 2) {
      const s = this.stairs[0];
      if (this.toScreen(s.worldY) > limit) {
        s.sprite.setVisible(false).setActive(false);
        this.stairPool.push(s.sprite);
        this.stairs.shift();
        this.currentIdx--;
      } else break;
    }
  }

  updateStairPositions() {
    for (const s of this.stairs)
      s.sprite.setPosition(this.toScreenX(s.worldX), this.toScreen(s.worldY));
  }

  // ═══════════════
  // INPUT
  // ═══════════════

  handleInput(action) {
    if (this.isGameOver) return;
    if (this.showTutorial) { this.dismissTutorial(); return; }
    if (this.isMoving) return;

    const ni = this.currentIdx + 1;
    if (ni >= this.stairs.length) return;

    const cur = this.stairs[this.currentIdx];
    const nxt = this.stairs[ni];

    // Determine direction of next step relative to current
    const goingRight = nxt.worldX > cur.worldX;
    const playerGoingRight = this.playerDir === 1;
    const sameDir = goingRight === playerGoingRight;

    let ok = false;
    if (action === 'step') {
      ok = sameDir;
    } else if (action === 'flip') {
      ok = !sameDir;
      if (ok) {
        this.playerDir = -this.playerDir;
        this.player.setFlipX(this.playerDir === -1);
      }
    }

    if (ok) this.doStep(ni);
    else this.triggerGameOver();
  }

  doStep(ni) {
    this.isMoving = true;
    this.currentIdx = ni;
    const t = this.stairs[ni];

    // Cancel any pending idle revert — player is still climbing
    if (this.idleTimer) { this.idleTimer.remove(false); this.idleTimer = null; }

    // Set climbing static texture
    this.player.setTexture('student-climb-clean');
    
    this.createDust(this.player.x, this.player.y);
    this.sfx.playStep();

    const dur = Math.max(40, 85 - this.speedLevel * 3);
    this.tweens.add({
      targets: this.player,
      x: this.toScreenX(t.worldX), y: this.toScreen(t.worldY),
      duration: dur, ease: 'Quad.easeOut',
      onComplete: () => {
        // Don't snap to idle — wait 150ms. If another step comes, it cancels this.
        this.idleTimer = this.time.delayedCall(150, () => {
          this.player.setTexture('student-idle-clean'); // Reset to standing idle
          this.idleTimer = null;
        });
        this.score++;
        this.scoreText.setText(this.score.toString());
        this.currentTime = Math.min(this.maxTime, this.currentTime + this.timeRefill);

        const nl = Math.floor(this.score / 20);
        if (nl > this.speedLevel) {
          this.speedLevel = nl;
          this.drainRate = this.baseDrainRate + nl * 3;
        }

        this.tweens.add({ targets: this.scoreText, scaleX: 1.3, scaleY: 1.3, duration: 80, yoyo: true });
        this.scrollToPlayer();
        this.isMoving = false;
      },
    });
  }

  scrollToPlayer() {
    const cur = this.stairs[this.currentIdx];
    const { width } = this.scale;

    // ─── VERTICAL SCROLL ───
    const curSY = this.toScreen(cur.worldY);
    const diffY = curSY - this.ANCHOR_Y;
    if (diffY < 0) {
      this.scrollY += -diffY;
    }

    // ─── HORIZONTAL SCROLL (camera follows player) ───
    // scrollX tracks the world X that should appear at screen center
    const targetScrollX = cur.worldX;
    // Smooth interpolation for horizontal panning
    this.scrollX += (targetScrollX - this.scrollX) * 0.5;

    // Update all positions
    this.updateStairPositions();
    this.player.x = this.toScreenX(cur.worldX);
    this.player.y = this.toScreen(cur.worldY);

    // Ground
    const gsy = this.toScreen(0);
    this.gndMain.y = gsy + 80;
    this.gndTop.y = gsy + 2;
    this.gndHi.y = gsy - 1;

    // ─── PARALLAX: very subtle vertical drift (backgrounds are oversized) ───
    for (const bg of this.bgLayers) {
      bg.y = bg.baseY + this.scrollY * bg.parallaxRate;
    }

    // ─── SCALE PROGRESSION: shrink player & stairs as height increases ───
    const progress = Math.min(1, cur.worldY / this.SCALE_SHRINK_HEIGHT);
    const pScale = this.BASE_PLAYER_SCALE - progress * (this.BASE_PLAYER_SCALE - this.MIN_PLAYER_SCALE);
    this.player.setScale(pScale);

    const stairScale = 1 - progress * 0.15;
    for (const s of this.stairs) {
      s.sprite.setScale(this.BASE_STAIR_SCALE_X * stairScale, this.BASE_STAIR_SCALE_Y * stairScale);
    }

    this.ensureAbove();
    this.recycleBelow();
  }

  // ═══════════════
  // BUTTONS
  // ═══════════════

  createButtons() {
    const { width, height } = this.scale;
    const by = height - 65;

    // Store base Y for push-down animation
    this.btnBaseY = by;

    this.btnL = this.add.image(85, by, 'btn-left')
      .setScale(1.3).setDepth(30).setAlpha(0.85).setInteractive().setScrollFactor(0);
    this.btnL.on('pointerdown', () => this.animateButton(this.btnL, 'btn-left', 'flip'));
    this.btnL.on('pointerup', () => this.releaseButton(this.btnL, 'btn-left'));
    this.btnL.on('pointerout', () => this.releaseButton(this.btnL, 'btn-left'));

    this.btnR = this.add.image(width - 85, by, 'btn-right')
      .setScale(1.3).setDepth(30).setAlpha(0.85).setInteractive().setScrollFactor(0);
    this.btnR.on('pointerdown', () => this.animateButton(this.btnR, 'btn-right', 'step'));
    this.btnR.on('pointerup', () => this.releaseButton(this.btnR, 'btn-right'));
    this.btnR.on('pointerout', () => this.releaseButton(this.btnR, 'btn-right'));

    this.flipLabel = this.add.text(85, by + 55, 'FLIP', {
      fontSize: '11px', fontFamily: 'monospace', color: '#FFF',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(30).setScrollFactor(0);
    this.stepLabel = this.add.text(width - 85, by + 55, 'STEP', {
      fontSize: '11px', fontFamily: 'monospace', color: '#FFF',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(30).setScrollFactor(0);
  }

  // Animate button press (works for both touch and keyboard)
  animateButton(btn, texKey, action) {
    btn.setTexture(texKey + '-pressed');
    this.tweens.killTweensOf(btn);
    this.tweens.add({
      targets: btn,
      scaleX: 1.1, scaleY: 1.1,
      y: this.btnBaseY + 4,
      duration: 50,
      ease: 'Quad.easeOut',
    });
    if (action) this.handleInput(action);
  }

  // Release button animation
  releaseButton(btn, texKey) {
    btn.setTexture(texKey);
    this.tweens.killTweensOf(btn);
    this.tweens.add({
      targets: btn,
      scaleX: 1.3, scaleY: 1.3,
      y: this.btnBaseY,
      duration: 150,
      ease: 'Back.easeOut',
    });
  }

  // ═══════════════
  // TUTORIAL
  // ═══════════════

  createTutorial() {
    const { width, height } = this.scale;
    const els = [];
    els.push(this.add.rectangle(width/2, height/2, width, height, 0x000000, 0.5).setDepth(50));
    els.push(this.add.text(width/2, 130, "YOU'RE LATE!", {
      fontSize:'30px',fontFamily:'monospace',color:'#FF4444',stroke:'#000',strokeThickness:5
    }).setOrigin(0.5).setDepth(50));
    els.push(this.add.text(width/2, 170, 'Climb the stairs!', {
      fontSize:'15px',fontFamily:'monospace',color:'#FFF',stroke:'#000',strokeThickness:3
    }).setOrigin(0.5).setDepth(50));
    els.push(this.add.text(width/2, 240, '→ RIGHT / D\nSame direction = Step', {
      fontSize:'13px',fontFamily:'monospace',color:'#88FF88',stroke:'#000',strokeThickness:3,align:'center'
    }).setOrigin(0.5).setDepth(50));
    els.push(this.add.text(width/2, 300, '← LEFT / A\nChange direction = Flip', {
      fontSize:'13px',fontFamily:'monospace',color:'#88CCFF',stroke:'#000',strokeThickness:3,align:'center'
    }).setOrigin(0.5).setDepth(50));
    els.push(this.add.text(width/2, 360, 'Wrong step = TRIP!', {
      fontSize:'13px',fontFamily:'monospace',color:'#FFCC66',stroke:'#000',strokeThickness:2
    }).setOrigin(0.5).setDepth(50));
    const p = this.add.text(width/2, 430, 'Press any key', {
      fontSize:'18px',fontFamily:'monospace',color:'#FFF',stroke:'#000',strokeThickness:3
    }).setOrigin(0.5).setDepth(50);
    els.push(p);
    this.tweens.add({targets:p,alpha:0.3,duration:500,yoyo:true,repeat:-1});
    this.tutorialElements = els;
  }

  dismissTutorial() {
    if (!this.showTutorial) return;
    this.showTutorial = false;
    this.hasStarted = true;
    this.music.start(); // 🎵 Start the chiptune!
    this.tutorialElements.forEach(e =>
      this.tweens.add({targets:e,alpha:0,duration:200,onComplete:()=>e.destroy()})
    );
  }

  // ═══════════════
  // EFFECTS
  // ═══════════════

  createDust(x, y) {
    for (let i = 0; i < 4; i++) {
      const d = this.add.circle(
        x + Phaser.Math.Between(-8,8), y + Phaser.Math.Between(-3,3),
        Phaser.Math.Between(2,4), 0xFFDD88, 0.7
      ).setDepth(9);
      this.tweens.add({
        targets:d, y:d.y+Phaser.Math.Between(6,16), x:d.x+Phaser.Math.Between(-10,10),
        alpha:0,scaleX:0.2,scaleY:0.2,duration:200, onComplete:()=>d.destroy()
      });
    }
  }

  triggerGameOver() {
    if (this.isGameOver) return;
    this.isGameOver = true;
    this.player.setTexture('student-trip-clean');
    this.sfx.playFall();
    this.music.stop(); // Stop the music on game over
    this.cameras.main.shake(300, 0.02);
    this.cameras.main.flash(200, 255, 0, 0, false);
    this.input.keyboard.removeAllKeys(true);
    this.time.delayedCall(1000, () => this.scene.start('GameOverScene', { score: this.score }));
  }

  // ═══════════════
  // UPDATE
  // ═══════════════

  update(time, delta) {
    if (this.isGameOver || !this.hasStarted) return;
    const dt = delta / 1000;
    this.currentTime -= this.drainRate * dt;
    if (this.currentTime <= 0) { this.currentTime = 0; this.triggerGameOver(); }

    // Timer bar
    const r = this.currentTime / this.maxTime;
    this.timerFill.setScale(r, 1);
    if (r < 0.25) {
      this.timerFill.setTint(0xFF4444);
      this.timerFill.setAlpha(Math.floor(time/300)%2===0 ? 0.7 : 1);
    } else if (r < 0.5) {
      this.timerFill.setTint(0xFFAA44); this.timerFill.setAlpha(1);
    } else {
      this.timerFill.clearTint(); this.timerFill.setAlpha(1);
    }

    // Background cross-fade based on player height
    this.updateBackground();

    // ─── CONTINUOUS HORIZONTAL CAMERA FOLLOW ───
    // Smoothly track the player's world X every frame during tweens
    const cur = this.stairs[this.currentIdx];
    if (cur) {
      const targetX = cur.worldX;
      const dx = targetX - this.scrollX;
      if (Math.abs(dx) > 1) {
        this.scrollX += dx * 0.15;
        this.updateStairPositions();
        this.player.x = this.toScreenX(cur.worldX);
      }
    }
  }

  updateBackground() {
    const cur = this.stairs[this.currentIdx];
    if (!cur) return;
    const h = cur.worldY;

    // Cross-fade each of the 7 background layers based on player height
    for (const t of this.BG_TRANSITIONS) {
      const bg = this.bgLayers[t.idx];
      let alpha = 0;

      if (t.inStart === 0 && t.inEnd === 0) {
        // This layer starts fully visible (bg-close)
        if (h < t.outStart) {
          alpha = 1;
        } else if (h < t.outEnd) {
          alpha = 1 - (h - t.outStart) / (t.outEnd - t.outStart);
        } else {
          alpha = 0;
        }
      } else {
        // Normal fade-in then fade-out
        if (h < t.inStart) {
          alpha = 0;
        } else if (h < t.inEnd) {
          alpha = (h - t.inStart) / (t.inEnd - t.inStart);
        } else if (h < t.outStart) {
          alpha = 1;
        } else if (h < t.outEnd) {
          alpha = 1 - (h - t.outStart) / (t.outEnd - t.outStart);
        } else {
          alpha = 0;
        }
      }

      bg.setAlpha(alpha);
    }
  }
}
