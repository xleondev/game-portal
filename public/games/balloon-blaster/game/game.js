// ─── Balloon types config ─────────────────────────────────────────────────────
const BALLOON_TYPES = {
  normal: { color: null,     speed: 90,  points: 10, hp: 1, weight: 60 },
  fast:   { color: 0xFF2222, speed: 180, points: 20, hp: 1, weight: 20 },
  tank:   { color: 0x6A0DAD, speed: 65,  points: 30, hp: 2, weight: 15 },
  golden: { color: 0xFFD700, speed: 75,  points: 50, hp: 1, weight: 3  },
  bomb:   { color: 0x111111, speed: 80,  points: 25, hp: 1, weight: 2  },
};

const NORMAL_COLORS = [0xFF6B6B, 0x66B3FF, 0x66DD66, 0xFF99CC, 0xFF9944];

// ─── MenuScene ────────────────────────────────────────────────────────────────
class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }

  create() {
    const { width, height } = this.scale;

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x87CEEB, 0x87CEEB, 0x4A90D9, 0x4A90D9, 1);
    bg.fillRect(0, 0, width, height);

    this.add.text(width / 2, height * 0.22, 'BALLOON\nBLASTER', {
      fontSize: '52px', fontFamily: 'Arial Black, sans-serif', fontStyle: 'bold',
      color: '#FFFFFF', stroke: '#0055AA', strokeThickness: 6,
      align: 'center', lineSpacing: 8,
    }).setOrigin(0.5);

    this._drawBalloon(width * 0.18, height * 0.38, 30, 0xFF6B6B);
    this._drawBalloon(width * 0.82, height * 0.35, 26, 0xFFE566);
    this._drawBalloon(width * 0.5,  height * 0.46, 22, 0x66B3FF);

    const hi = localStorage.getItem('balloonBlaster_hi') || 0;
    this.add.text(width / 2, height * 0.57, `Best: ${hi}`, {
      fontSize: '22px', fontFamily: 'Arial, sans-serif',
      color: '#FFF9C4', stroke: '#885500', strokeThickness: 3,
    }).setOrigin(0.5);

    const btnBg = this.add.graphics();
    btnBg.fillStyle(0xFF4444, 1);
    btnBg.fillRoundedRect(width / 2 - 90, height * 0.65, 180, 52, 14);
    btnBg.setInteractive(
      new Phaser.Geom.Rectangle(width / 2 - 90, height * 0.65, 180, 52),
      Phaser.Geom.Rectangle.Contains
    );

    this.add.text(width / 2, height * 0.65 + 26, 'PLAY', {
      fontSize: '30px', fontFamily: 'Arial Black, sans-serif', fontStyle: 'bold',
      color: '#FFFFFF', stroke: '#880000', strokeThickness: 4,
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
    g.fillStyle(0xFFFFFF, 0.3);
    g.fillEllipse(x - r * 0.25, y - r * 0.3, r * 0.6, r * 0.7);
    g.lineStyle(1.5, 0x888888, 1);
    g.strokeLineShape(new Phaser.Geom.Line(x, y + r * 1.2, x, y + r * 2.2));
  }
}

// ─── GameScene ────────────────────────────────────────────────────────────────
class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }

  create() {
    const { width, height } = this.scale;

    // Pre-generate textures for physics objects (avoids Graphics+physics rendering issues)
    this._generateTextures();

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

    // Cannon barrel
    this.cannonPivot = this.add.container(width / 2, height - 34);
    const barrel = this.add.graphics();
    barrel.fillStyle(0x333333, 1);
    barrel.fillRoundedRect(-8, -44, 16, 46, 5);
    barrel.fillStyle(0x555555, 1);
    barrel.fillRoundedRect(-5, -42, 6, 18, 3);
    barrel.fillStyle(0x222222, 1);
    barrel.fillEllipse(0, -44, 18, 10);
    this.cannonPivot.add(barrel);

    // State
    this.score = 0;
    this.lives = 3;
    this.lastFired = 0;
    this.fireCooldown = 300;

    // Physics groups
    this.bullets  = this.physics.add.group();
    this.balloons = this.physics.add.group();

    this.physics.add.overlap(this.bullets, this.balloons, this._onHit, null, this);

    // HUD
    this._buildHUD();

    // Hint text
    const hint = this.add.text(width / 2, height * 0.5, '🎈 Click to shoot!', {
      fontSize: '20px', fontFamily: 'Arial, sans-serif',
      color: '#FFFFFF', stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(10);
    this.tweens.add({
      targets: hint, alpha: 0, delay: 2000, duration: 1000,
      onComplete: () => hint.destroy(),
    });

    // Difficulty state
    this.elapsed    = 0;
    this.spawnDelay = 1200;
    this.speedMult  = 1.0;

    // Spawn first balloon immediately
    this._spawnBalloon();

    this.spawnTimer = this.time.addEvent({
      delay: this.spawnDelay, callback: this._spawnBalloon,
      callbackScope: this, loop: true,
    });
    this.rampTimer = this.time.addEvent({
      delay: 30000, callback: this._rampDifficulty,
      callbackScope: this, loop: true,
    });

    // Input
    this.input.on('pointermove', (ptr) => this._aimCannon(ptr));
    this.input.on('pointerdown', (ptr) => this._fireBullet(ptr));
  }

  // ── Texture generation (called once in create) ──────────────────────────────
  _generateTextures() {
    const r  = 22;
    const tw = r * 2;               // 44px wide
    const th = Math.ceil(r * 2.4);  // 53px tall (matches ellipse height)

    const drawBalloon = (key, fillColor, isBomb, isGolden) => {
      const g = this.add.graphics();
      if (isGolden) {
        g.fillStyle(fillColor, 0.45);
        g.fillEllipse(tw / 2, th / 2, tw * 1.3, th * 1.3);
      }
      g.fillStyle(fillColor, 1);
      g.fillEllipse(tw / 2, th / 2, tw, th);
      // Shine
      g.fillStyle(0xFFFFFF, 0.35);
      g.fillEllipse(tw / 2 - r * 0.25, th / 2 - r * 0.3, r * 0.6, r * 0.7);
      // Bomb fuse
      if (isBomb) {
        g.fillStyle(0xFF6600, 1);
        g.fillRect(tw / 2 - 2, 2, 4, r * 0.5);
      }
      g.generateTexture(key, tw, th);
      g.destroy();
    };

    NORMAL_COLORS.forEach((c, i) => drawBalloon(`balloon_n${i}`, c, false, false));
    drawBalloon('balloon_fast',   BALLOON_TYPES.fast.color,   false, false);
    drawBalloon('balloon_tank',   BALLOON_TYPES.tank.color,   false, false);
    drawBalloon('balloon_golden', BALLOON_TYPES.golden.color, false, true);
    drawBalloon('balloon_bomb',   BALLOON_TYPES.bomb.color,   true,  false);

    // Bullet texture: 12x12 yellow circle
    const bGfx = this.add.graphics();
    bGfx.fillStyle(0xFFD700, 1);
    bGfx.fillCircle(6, 6, 6);
    bGfx.generateTexture('bullet', 12, 12);
    bGfx.destroy();
  }

  // ── Aim cannon ──────────────────────────────────────────────────────────────
  _aimCannon(ptr) {
    const dx = ptr.x - this.cannonPivot.x;
    const dy = ptr.y - this.cannonPivot.y;
    let angle = Math.atan2(dy, dx) + Math.PI / 2;
    const maxAngle = Phaser.Math.DegToRad(80);
    angle = Phaser.Math.Clamp(angle, -maxAngle, maxAngle);
    this.cannonPivot.setRotation(angle);
  }

  // ── Fire bullet ─────────────────────────────────────────────────────────────
  _fireBullet(ptr) {
    this._aimCannon(ptr);
    const now = this.time.now;
    if (now - this.lastFired < this.fireCooldown) return;
    this.lastFired = now;

    const angle  = this.cannonPivot.rotation - Math.PI / 2;
    const speed  = 600;
    const startX = this.cannonPivot.x + Math.cos(angle) * 48;
    const startY = this.cannonPivot.y + Math.sin(angle) * 48;

    const bullet = this.physics.add.image(startX, startY, 'bullet');
    bullet.body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    bullet.body.setAllowGravity(false);
    this.bullets.add(bullet);
  }

  // ── HUD ─────────────────────────────────────────────────────────────────────
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

  // ── Collision handler ────────────────────────────────────────────────────────
  _onHit(bullet, balloon) {
    if (!bullet.active || !balloon.active) return;
    bullet.destroy();
    balloon.hp--;

    if (balloon.hp > 0) {
      this.tweens.add({ targets: balloon, alpha: 0.3, duration: 80, yoyo: true });
      return;
    }
    this._popBalloon(balloon);
  }

  // ── Pop balloon ──────────────────────────────────────────────────────────────
  _popBalloon(balloon) {
    const { x, y } = balloon;
    const typeName  = balloon.balloonType;

    this.score += balloon.points;
    this.scoreTxt.setText(`Score: ${this.score}`);

    // Particle burst
    for (let i = 0; i < 8; i++) {
      const angle    = (i / 8) * Math.PI * 2;
      const color    = balloon.color ?? 0xFFAAAA;
      const particle = this.add.circle(x, y, 5, color);
      this.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * 40, y: y + Math.sin(angle) * 40,
        alpha: 0, scaleX: 0.3, scaleY: 0.3, duration: 350,
        onComplete: () => particle.destroy(),
      });
    }

    if (typeName === 'bomb') this._chainExplosion(x, y);
    balloon.destroy();
  }

  // ── Chain explosion ──────────────────────────────────────────────────────────
  _chainExplosion(x, y) {
    const radius = 90;
    const ring   = this.add.circle(x, y, 10, 0xFF6600, 0.8);
    this.tweens.add({
      targets: ring, scaleX: radius / 10, scaleY: radius / 10,
      alpha: 0, duration: 300, onComplete: () => ring.destroy(),
    });

    this.balloons.getChildren()
      .filter(b => b.active && b.balloonType !== 'bomb' &&
                   Phaser.Math.Distance.Between(x, y, b.x, b.y) <= radius)
      .forEach(b => {
        this.time.delayedCall(Phaser.Math.Between(0, 150), () => {
          if (b.active) this._popBalloon(b);
        });
      });
  }

  // ── Pick balloon type ────────────────────────────────────────────────────────
  _pickBalloonType() {
    const pool = ['normal'];
    if (this.elapsed >= 120) pool.push('fast', 'tank');
    if (this.elapsed >= 240) pool.push('golden', 'bomb');

    const weights = pool.map(t => BALLOON_TYPES[t].weight);
    const total   = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    for (let i = 0; i < pool.length; i++) {
      r -= weights[i];
      if (r <= 0) return pool[i];
    }
    return 'normal';
  }

  // ── Spawn balloon ────────────────────────────────────────────────────────────
  _spawnBalloon() {
    const { width, height } = this.scale;
    const typeName = this._pickBalloonType();
    const def      = BALLOON_TYPES[typeName];
    const r        = 22;
    const x        = Phaser.Math.Between(r + 10, width - r - 10);

    // Pick texture key and color
    let textureKey, color;
    if (typeName === 'normal') {
      const ci   = Phaser.Math.Between(0, NORMAL_COLORS.length - 1);
      textureKey = `balloon_n${ci}`;
      color      = NORMAL_COLORS[ci];
    } else {
      textureKey = `balloon_${typeName}`;
      color      = def.color;
    }

    // Use physics.add.image — proper texture with defined dimensions
    const g = this.physics.add.image(x, height + r * 2.5, textureKey);
    g.body.setVelocityY(-def.speed * this.speedMult);
    g.body.setAllowGravity(false);

    // Metadata
    g.balloonType = typeName;
    g.hp          = def.hp;
    g.points      = def.points;
    g.radius      = r;
    g.color       = color;

    this.balloons.add(g);
  }

  // ── Difficulty ramp ──────────────────────────────────────────────────────────
  _rampDifficulty() {
    this.spawnDelay = Math.max(500, this.spawnDelay - 150);
    this.speedMult  = Math.min(2.5, this.speedMult + 0.12);
    this.spawnTimer.reset({
      delay: this.spawnDelay, callback: this._spawnBalloon,
      callbackScope: this, loop: true,
    });
  }

  // ── Update loop ──────────────────────────────────────────────────────────────
  update(time, delta) {
    this.elapsed += delta / 1000;

    // Clean up off-screen bullets
    this.bullets.getChildren().slice().forEach(b => {
      if (b.active && (b.y < -20 || b.x < -20 || b.x > this.scale.width + 20)) {
        b.destroy();
      }
    });

    // Remove escaped balloons
    const escaped = this.balloons.getChildren().filter(b => b.active && b.y < -60);
    escaped.forEach(b => {
      b.destroy();
      this._loseLife();
    });
  }

  // ── Lose life ────────────────────────────────────────────────────────────────
  _loseLife() {
    if (this.lives <= 0) return;
    this.lives--;
    this.livesTxt.setText('❤️'.repeat(Math.max(0, this.lives)) || '💀');
    if (this.lives <= 0) {
      this.spawnTimer.remove();
      this.rampTimer.remove();
      this.time.delayedCall(400, () => {
        this.scene.start('GameOverScene', { score: this.score });
      });
    }
  }
}

// ─── GameOverScene ────────────────────────────────────────────────────────────
class GameOverScene extends Phaser.Scene {
  constructor() { super('GameOverScene'); }

  init(data) { this.finalScore = data.score ?? 0; }

  create() {
    const { width, height } = this.scale;

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
    bg.fillRect(0, 0, width, height);

    this.add.text(width / 2, height * 0.22, 'GAME OVER', {
      fontSize: '48px', fontFamily: 'Arial Black, sans-serif', fontStyle: 'bold',
      color: '#FF4444', stroke: '#880000', strokeThickness: 6,
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.40, `Score: ${this.finalScore}`, {
      fontSize: '32px', fontFamily: 'Arial Black, sans-serif',
      color: '#FFFFFF', stroke: '#0055AA', strokeThickness: 4,
    }).setOrigin(0.5);

    const prev  = parseInt(localStorage.getItem('balloonBlaster_hi') || '0', 10);
    const isNew = this.finalScore > prev;
    if (isNew) {
      localStorage.setItem('balloonBlaster_hi', String(this.finalScore));
      this.add.text(width / 2, height * 0.50, '🏆 New Best!', {
        fontSize: '24px', fontFamily: 'Arial, sans-serif', color: '#FFD700',
      }).setOrigin(0.5);
    } else {
      this.add.text(width / 2, height * 0.50, `Best: ${prev}`, {
        fontSize: '22px', fontFamily: 'Arial, sans-serif',
        color: '#FFF9C4', stroke: '#885500', strokeThickness: 3,
      }).setOrigin(0.5);
    }

    // Play Again button
    const btnBg = this.add.graphics();
    btnBg.fillStyle(0x22AA44, 1);
    btnBg.fillRoundedRect(width / 2 - 110, height * 0.63, 220, 54, 14);
    btnBg.setInteractive(
      new Phaser.Geom.Rectangle(width / 2 - 110, height * 0.63, 220, 54),
      Phaser.Geom.Rectangle.Contains
    );

    this.add.text(width / 2, height * 0.63 + 27, 'PLAY AGAIN', {
      fontSize: '28px', fontFamily: 'Arial Black, sans-serif', fontStyle: 'bold',
      color: '#FFFFFF', stroke: '#006622', strokeThickness: 4,
    }).setOrigin(0.5);

    btnBg.on('pointerover', () => {
      this.input.setDefaultCursor('pointer');
      btnBg.clear();
      btnBg.fillStyle(0x44CC66, 1);
      btnBg.fillRoundedRect(width / 2 - 110, height * 0.63, 220, 54, 14);
    });
    btnBg.on('pointerout', () => {
      this.input.setDefaultCursor('default');
      btnBg.clear();
      btnBg.fillStyle(0x22AA44, 1);
      btnBg.fillRoundedRect(width / 2 - 110, height * 0.63, 220, 54, 14);
    });
    btnBg.on('pointerdown', () => this.scene.start('MenuScene'));

    const menuBtn = this.add.text(width / 2, height * 0.76, 'Main Menu', {
      fontSize: '20px', fontFamily: 'Arial, sans-serif',
      color: '#AAAAAA', stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    menuBtn.on('pointerover', () => menuBtn.setColor('#FFFFFF'));
    menuBtn.on('pointerout',  () => menuBtn.setColor('#AAAAAA'));
    menuBtn.on('pointerdown', () => this.scene.start('MenuScene'));
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
    arcade: { gravity: { y: 0 }, debug: false },
  },
  scene: [MenuScene, GameScene, GameOverScene],
};

new Phaser.Game(config);
