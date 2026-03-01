import Phaser from 'phaser';
import { AssetGenerator } from '../AssetGenerator.js';
import { removeCheckerboard } from '../removeCheckerboard.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    this.add.text(180, 280, 'Loading...', {
      fontSize: '24px', fontFamily: 'monospace', color: '#FFFFFF',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5);

    // AI Backgrounds (7 layers for smooth transitions: school → sky → space)
    this.load.image('bg-close', 'assets/bg-close.png');
    this.load.image('bg-close-mid', 'assets/bg-close-mid.png');
    this.load.image('bg-mid', 'assets/bg-mid.png');
    this.load.image('bg-mid-far', 'assets/bg-mid-far.png');
    this.load.image('bg-far', 'assets/bg-far.png');
    this.load.image('bg-space-low', 'assets/bg-space-low.png');
    this.load.image('bg-deep-space', 'assets/bg-deep-space.png');
    this.load.image('bg-gameover', 'assets/game-over-bg.png');

    // AI Sprites with solid green (#00FF00) backgrounds
    this.load.image('stair-raw', 'assets/stair-green.png');
    this.load.image('student-idle-raw', 'assets/student-idle-green.png');
    this.load.image('student-climb-raw', 'assets/student-climb-green.png');
    this.load.image('student-trip-raw', 'assets/student-trip-green.png');
  }

  create() {
    // Generate UI buttons and timer bar
    AssetGenerator.generateAll(this);

    // Remove green backgrounds from AI sprites and save them to '-clean' keys
    removeCheckerboard(this, 'stair-raw', 'stair-clean');
    removeCheckerboard(this, 'student-idle-raw', 'student-idle-clean');
    removeCheckerboard(this, 'student-climb-raw', 'student-climb-clean');
    removeCheckerboard(this, 'student-trip-raw', 'student-trip-clean');

    // Add safe delay to ensure UI canvas processing finishes
    this.time.delayedCall(200, () => this.scene.start('MenuScene'));
  }
}
