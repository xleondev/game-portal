// ─── MenuScene ────────────────────────────────────────────────────────────────
class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }

  create() {
    const { width, height } = this.scale;

    // Sky gradient background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x87CEEB, 0x87CEEB, 0x4A90D9, 0x4A90D9, 1);
    bg.fillRect(0, 0, width, height);

    // Title
    this.add.text(width / 2, height * 0.22, 'BALLOON\nBLASTER', {
      fontSize: '52px',
      fontFamily: 'Arial Black, sans-serif',
      fontStyle: 'bold',
      color: '#FFFFFF',
      stroke: '#0055AA',
      strokeThickness: 6,
      align: 'center',
      lineSpacing: 8,
    }).setOrigin(0.5);

    // Decorative balloons
    this._drawBalloon(width * 0.18, height * 0.38, 30, 0xFF6B6B);
    this._drawBalloon(width * 0.82, height * 0.35, 26, 0xFFE566);
    this._drawBalloon(width * 0.5,  height * 0.46, 22, 0x66B3FF);

    // High score
    const hi = localStorage.getItem('balloonBlaster_hi') || 0;
    this.add.text(width / 2, height * 0.57, `Best: ${hi}`, {
      fontSize: '22px',
      fontFamily: 'Arial, sans-serif',
      color: '#FFF9C4',
      stroke: '#885500',
      strokeThickness: 3,
    }).setOrigin(0.5);

    // Start button
    const btnBg = this.add.graphics();
    btnBg.fillStyle(0xFF4444, 1);
    btnBg.fillRoundedRect(width / 2 - 90, height * 0.65, 180, 52, 14);

    const btn = this.add.text(width / 2, height * 0.65 + 26, 'PLAY', {
      fontSize: '30px',
      fontFamily: 'Arial Black, sans-serif',
      fontStyle: 'bold',
      color: '#FFFFFF',
      stroke: '#880000',
      strokeThickness: 4,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => {
      btnBg.clear();
      btnBg.fillStyle(0xFF6666, 1);
      btnBg.fillRoundedRect(width / 2 - 90, height * 0.65, 180, 52, 14);
    });
    btn.on('pointerout', () => {
      btnBg.clear();
      btnBg.fillStyle(0xFF4444, 1);
      btnBg.fillRoundedRect(width / 2 - 90, height * 0.65, 180, 52, 14);
    });
    btn.on('pointerdown', () => this.scene.start('GameScene'));
  }

  _drawBalloon(x, y, r, color) {
    const g = this.add.graphics();
    g.fillStyle(color, 1);
    g.fillEllipse(x, y, r * 2, r * 2.4);
    // Shine
    g.fillStyle(0xFFFFFF, 0.3);
    g.fillEllipse(x - r * 0.25, y - r * 0.3, r * 0.6, r * 0.7);
    // String
    g.lineStyle(1.5, 0x888888, 1);
    g.strokeLineShape(new Phaser.Geom.Line(x, y + r * 1.2, x, y + r * 2.2));
  }
}

// ─── Phaser config ────────────────────────────────────────────────────────────
const config = {
  type: Phaser.AUTO,
  width: 480,
  height: 640,
  backgroundColor: '#87CEEB',
  parent: 'game-container',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 0 }, debug: false }
  },
  scene: [MenuScene]
};

new Phaser.Game(config);
