import Phaser from 'phaser';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  create(data) {
    const { width, height } = this.scale;
    const score = data.score || 0;

    // Update best score
    const prevBest = parseInt(localStorage.getItem('lateForClass_bestScore') || '0', 10);
    const isNewBest = score > prevBest;
    if (isNewBest) {
      localStorage.setItem('lateForClass_bestScore', score.toString());
    }
    const bestScore = Math.max(score, prevBest);

    // Background — AI-generated moody school hallway
    const bg = this.add.image(width / 2, height / 2, 'bg-gameover');
    bg.setDisplaySize(width, height);
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.5);

    // Tripping student
    const student = this.add.image(width / 2, 180, 'student-trip-clean').setScale(0.26);

    // Shake effect
    this.tweens.add({
      targets: student,
      x: width / 2 - 5,
      duration: 50,
      yoyo: true,
      repeat: 5,
    });

    // Game Over text
    const gameOverText = this.add.text(width / 2, 300, 'GAME OVER', {
      fontSize: '42px',
      fontFamily: 'monospace',
      color: '#FF4444',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5);

    // Pulse effect
    this.tweens.add({
      targets: gameOverText,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 500,
      yoyo: true,
      repeat: -1,
    });

    // Subtitle
    this.add.text(width / 2, 350, 'You tripped on the stairs!', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#FFAAAA',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);

    // Score
    this.add.text(width / 2, 400, `Score: ${score}`, {
      fontSize: '32px',
      fontFamily: 'monospace',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // Best score
    const bestColor = isNewBest ? '#FFD700' : '#AAAAAA';
    const bestPrefix = isNewBest ? '★ NEW BEST: ' : 'Best: ';
    this.add.text(width / 2, 440, `${bestPrefix}${bestScore}`, {
      fontSize: '20px',
      fontFamily: 'monospace',
      color: bestColor,
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    // Restart button
    const restartBg = this.add.rectangle(width / 2, 520, 200, 50, 0x44AA44)
      .setStrokeStyle(3, 0x228822)
      .setInteractive({ useHandCursor: true });

    const restartText = this.add.text(width / 2, 520, 'RESTART', {
      fontSize: '24px',
      fontFamily: 'monospace',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    restartBg.on('pointerover', () => restartBg.setFillStyle(0x55CC55));
    restartBg.on('pointerout', () => restartBg.setFillStyle(0x44AA44));
    restartBg.on('pointerdown', () => {
      this.scene.start('GameScene');
    });

    // Menu button
    const menuBg = this.add.rectangle(width / 2, 585, 200, 40, 0x666688)
      .setStrokeStyle(2, 0x444466)
      .setInteractive({ useHandCursor: true });

    this.add.text(width / 2, 585, 'MENU', {
      fontSize: '18px',
      fontFamily: 'monospace',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);

    menuBg.on('pointerover', () => menuBg.setFillStyle(0x8888AA));
    menuBg.on('pointerout', () => menuBg.setFillStyle(0x666688));
    menuBg.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });

    // Keyboard restart
    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.start('GameScene');
    });

    this.input.keyboard.once('keydown-ENTER', () => {
      this.scene.start('GameScene');
    });
  }
}
