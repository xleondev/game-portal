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
    btnBg.setInteractive(
      new Phaser.Geom.Rectangle(width / 2 - 90, height * 0.65, 180, 52),
      Phaser.Geom.Rectangle.Contains
    );

    const btn = this.add.text(width / 2, height * 0.65 + 26, 'PLAY', {
      fontSize: '30px',
      fontFamily: 'Arial Black, sans-serif',
      fontStyle: 'bold',
      color: '#FFFFFF',
      stroke: '#880000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    btnBg.on('pointerover', () => {
      btnBg.clear();
      btnBg.fillStyle(0xFF6666, 1);
      btnBg.fillRoundedRect(width / 2 - 90, height * 0.65, 180, 52, 14);
    });
    btnBg.on('pointerout', () => {
      btnBg.clear();
      btnBg.fillStyle(0xFF4444, 1);
      btnBg.fillRoundedRect(width / 2 - 90, height * 0.65, 180, 52, 14);
    });
    btnBg.on('pointerdown', () => this.scene.start('GameScene'));
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

// ─── GameScene ────────────────────────────────────────────────────────────────
class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }

  create() {
    const { width, height } = this.scale;

    // Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x87CEEB, 0x87CEEB, 0x4A90D9, 0x4A90D9, 1);
    bg.fillRect(0, 0, width, height);

    // Ground
    const ground = this.add.graphics();
    ground.fillStyle(0x5D8A3C, 1);
    ground.fillRect(0, height - 40, width, 40);
    ground.fillStyle(0x7AB648, 1);
    ground.fillRect(0, height - 40, width, 8);

    // Cannon base
    const base = this.add.graphics();
    base.fillStyle(0x4A4A4A, 1);
    base.fillEllipse(width / 2, height - 30, 70, 24);

    // Cannon barrel (drawn as a rectangle, rotated via container)
    this.cannonPivot = this.add.container(width / 2, height - 34);
    const barrel = this.add.graphics();
    barrel.fillStyle(0x333333, 1);
    barrel.fillRoundedRect(-8, -44, 16, 46, 5);
    barrel.fillStyle(0x555555, 1);
    barrel.fillRoundedRect(-5, -42, 6, 18, 3);
    // Muzzle cap
    barrel.fillStyle(0x222222, 1);
    barrel.fillEllipse(0, -44, 18, 10);
    this.cannonPivot.add(barrel);

    // State
    this.score = 0;
    this.lives = 3;
    this.lastFired = 0;
    this.fireCooldown = 300; // ms

    // Groups
    this.bullets = this.physics.add.group();
    this.balloons = this.physics.add.group();

    // HUD (drawn last so it's on top)
    this._buildHUD();

    // Input
    this.input.on('pointermove', (ptr) => this._aimCannon(ptr));
    this.input.on('pointerdown', (ptr) => this._fireBullet(ptr));
  }

  _aimCannon(ptr) {
    const dx = ptr.x - this.cannonPivot.x;
    const dy = ptr.y - this.cannonPivot.y;
    let angle = Math.atan2(dy, dx) + Math.PI / 2; // offset: 0 = pointing up
    // Clamp to upward-only arc: -80° to +80° from vertical
    const maxAngle = Phaser.Math.DegToRad(80);
    angle = Phaser.Math.Clamp(angle, -maxAngle, maxAngle);
    this.cannonPivot.setRotation(angle);
  }

  _fireBullet(_ptr) {
    const now = this.time.now;
    if (now - this.lastFired < this.fireCooldown) return;
    this.lastFired = now;

    const angle = this.cannonPivot.rotation - Math.PI / 2;
    const speed = 600;
    const startX = this.cannonPivot.x + Math.cos(angle) * 48;
    const startY = this.cannonPivot.y + Math.sin(angle) * 48;

    const bullet = this.add.circle(startX, startY, 6, 0xFFD700);
    this.physics.add.existing(bullet);
    bullet.body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    bullet.body.setAllowGravity(false);
    this.bullets.add(bullet);
  }

  _buildHUD() {
    const { width } = this.scale;
    this.scoreTxt = this.add.text(12, 12, 'Score: 0', {
      fontSize: '20px', fontFamily: 'Arial Black, sans-serif',
      color: '#FFFFFF', stroke: '#0055AA', strokeThickness: 3,
    });
    this.livesTxt = this.add.text(width - 12, 12, '❤️❤️❤️', {
      fontSize: '20px', fontFamily: 'Arial, sans-serif',
    }).setOrigin(1, 0);
  }

  update() {
    // Destroy bullets that leave the screen (slice() prevents mutation-during-iteration)
    this.bullets.getChildren().slice().forEach(b => {
      if (b.active && (b.y < -20 || b.x < -20 || b.x > this.scale.width + 20)) b.destroy();
    });
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
  scene: [MenuScene, GameScene]
};

new Phaser.Game(config);
