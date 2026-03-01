import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const { width, height } = this.scale;

    // Background — AI school building
    const bg = this.add.image(width / 2, height / 2, 'bg-mid');
    bg.setDisplaySize(width, height);

    // Dark overlay
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.5);

    // Title
    const title = this.add.text(width / 2, 120, 'LATE FOR\nCLASS!', {
      fontSize: '48px',
      fontFamily: 'monospace',
      color: '#FFD700',
      stroke: '#8B4513',
      strokeThickness: 6,
      align: 'center',
      lineSpacing: 8,
    }).setOrigin(0.5);

    // Bounce animation on title
    this.tweens.add({
      targets: title,
      y: 130,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Student character preview
    const student = this.add.image(width / 2, 260, 'student-idle-clean').setScale(0.24);

    // Subtitle
    this.add.text(width / 2, 340, "Don't be late!", {
      fontSize: '18px',
      fontFamily: 'monospace',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    // Controls guide box
    const guideY = 420;
    const guideBg = this.add.rectangle(width / 2, guideY, 300, 120, 0x1A1A2E, 0.85)
      .setStrokeStyle(2, 0xFFD700);

    this.add.text(width / 2, guideY - 45, '— CONTROLS —', {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#FFD700',
    }).setOrigin(0.5);

    this.add.text(width / 2, guideY - 15, '← LEFT: Flip & Step', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#FFFFFF',
    }).setOrigin(0.5);

    this.add.text(width / 2, guideY + 10, '→ RIGHT: Step Forward', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#FFFFFF',
    }).setOrigin(0.5);

    this.add.text(width / 2, guideY + 38, 'Mobile: Use on-screen buttons', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#AAAAAA',
    }).setOrigin(0.5);

    // Start prompt
    const startText = this.add.text(width / 2, 560, 'TAP TO START', {
      fontSize: '22px',
      fontFamily: 'monospace',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // Blink effect
    this.tweens.add({
      targets: startText,
      alpha: 0.3,
      duration: 600,
      yoyo: true,
      repeat: -1,
    });

    // Best score
    const bestScore = localStorage.getItem('lateForClass_bestScore') || 0;
    if (bestScore > 0) {
      this.add.text(width / 2, 600, `Best: ${bestScore}`, {
        fontSize: '16px',
        fontFamily: 'monospace',
        color: '#FFD700',
        stroke: '#000000',
        strokeThickness: 3,
      }).setOrigin(0.5);
    }

    // Start game on any input
    this.input.once('pointerdown', () => {
      this.scene.start('GameScene');
    });

    this.input.keyboard.once('keydown', () => {
      this.scene.start('GameScene');
    });
  }
}
