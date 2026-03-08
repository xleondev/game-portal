// ─── Balloon types config ─────────────────────────────────────────────────────
const BALLOON_TYPES = {
  normal: { color: null,     speed: 90,  points: 10, hp: 1, weight: 60 },
  fast:   { color: 0xFF2222, speed: 180, points: 20, hp: 1, weight: 20 },
  tank:   { color: 0x6A0DAD, speed: 65,  points: 30, hp: 2, weight: 15 },
  golden: { color: 0xFFD700, speed: 75,  points: 50, hp: 1, weight: 3  },
  bomb:   { color: 0x111111, speed: 80,  points: 25, hp: 1, weight: 2  },
};

const NORMAL_COLORS = [0xFF6B6B, 0x66B3FF, 0x66DD66, 0xFF99CC, 0xFF9944];

// ─── Achievements ─────────────────────────────────────────────────────────────
const ACHIEVEMENTS = [
  { id: 'first_blood',    icon: '🎯', label: 'First Blood',    desc: 'Pop your first balloon'               },
  { id: 'on_fire',        icon: '🔥', label: 'On Fire',        desc: 'Reach a 5× combo'                     },
  { id: 'chain_reaction', icon: '💥', label: 'Chain Reaction', desc: 'Trigger a bomb explosion'             },
  { id: 'golden_touch',   icon: '⭐', label: 'Golden Touch',   desc: 'Pop a golden balloon'                 },
  { id: 'untouchable',    icon: '🛡️', label: 'Untouchable',    desc: 'Survive 2 min without losing a life' },
  { id: 'sharpshooter',   icon: '🏹', label: 'Sharpshooter',   desc: 'Pop 50 balloons in one run'           },
  { id: 'survivor',       icon: '⏱️', label: 'Survivor',       desc: 'Survive for 5 minutes'                },
  { id: 'combo_master',   icon: '⚡', label: 'Combo Master',   desc: 'Reach an 8× combo'                    },
];

function getUnlocked() {
  return new Set(JSON.parse(localStorage.getItem('balloonBlaster_achievements') || '[]'));
}
function unlockAchievement(id) {
  const s = getUnlocked();
  if (s.has(id)) return false;
  s.add(id);
  localStorage.setItem('balloonBlaster_achievements', JSON.stringify([...s]));
  return true;
}

// ─── MenuScene ────────────────────────────────────────────────────────────────
class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }

  create() {
    const { width, height } = this.scale;

    // Deep sky gradient
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a1628, 0x0a1628, 0x1a5276, 0x1a5276, 1);
    bg.fillRect(0, 0, width, height * 0.55);
    bg.fillGradientStyle(0x1a5276, 0x1a5276, 0x87CEEB, 0x87CEEB, 1);
    bg.fillRect(0, height * 0.55, width, height * 0.45);

    // Stars
    for (let i = 0; i < 40; i++) {
      const sx   = Phaser.Math.Between(0, width);
      const sy   = Phaser.Math.Between(0, height * 0.42);
      const star = this.add.circle(sx, sy, Phaser.Math.FloatBetween(0.8, 2.2), 0xFFFFFF,
                                   Phaser.Math.FloatBetween(0.4, 0.9));
      this.tweens.add({
        targets: star, alpha: 0.08, duration: Phaser.Math.Between(700, 2200),
        yoyo: true, repeat: -1, delay: Phaser.Math.Between(0, 1500),
      });
    }

    // Ground
    const ground = this.add.graphics();
    ground.fillStyle(0x27AE60, 1);
    ground.fillRect(0, height - 50, width, 50);
    ground.fillStyle(0x2ECC71, 1);
    ground.fillRect(0, height - 50, width, 10);

    // Animated floating balloons
    this._spawnMenuBalloon(width * 0.12, height * 0.55, 26, 0xFF6B6B, 1.9);
    this._spawnMenuBalloon(width * 0.84, height * 0.52, 20, 0xFFE566, 2.3);
    this._spawnMenuBalloon(width * 0.50, height * 0.65, 18, 0x66B3FF, 1.6);
    this._spawnMenuBalloon(width * 0.30, height * 0.75, 16, 0x66DD66, 2.1);
    this._spawnMenuBalloon(width * 0.72, height * 0.70, 22, 0xFF99CC, 1.8);

    // Title shadow
    this.add.text(width / 2 + 4, height * 0.17 + 4, 'BALLOON\nBLASTER', {
      fontSize: '54px', fontFamily: 'Arial Black, sans-serif', fontStyle: 'bold',
      color: '#000033', align: 'center', lineSpacing: 8, alpha: 0.5,
    }).setOrigin(0.5);

    // Title
    const title = this.add.text(width / 2, height * 0.17, 'BALLOON\nBLASTER', {
      fontSize: '54px', fontFamily: 'Arial Black, sans-serif', fontStyle: 'bold',
      color: '#FFFFFF', stroke: '#0044AA', strokeThickness: 8,
      align: 'center', lineSpacing: 8,
    }).setOrigin(0.5);
    this.tweens.add({
      targets: title, scaleX: 1.04, scaleY: 1.04,
      duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    // Best score badge
    const hi    = localStorage.getItem('balloonBlaster_hi') || 0;
    const hiBg  = this.add.graphics();
    hiBg.fillStyle(0x000000, 0.45);
    hiBg.fillRoundedRect(width / 2 - 88, height * 0.53, 176, 34, 12);
    hiBg.lineStyle(1.5, 0xFFD700, 0.6);
    hiBg.strokeRoundedRect(width / 2 - 88, height * 0.53, 176, 34, 12);
    this.add.text(width / 2, height * 0.53 + 17, `🏆  BEST: ${hi}`, {
      fontSize: '18px', fontFamily: 'Arial Black, sans-serif', color: '#FFD700',
    }).setOrigin(0.5);

    // Button glow pulse
    const btnGlow = this.add.graphics();
    btnGlow.fillStyle(0xFF6666, 0.28);
    btnGlow.fillRoundedRect(width / 2 - 102, height * 0.63 - 7, 204, 68, 22);
    this.tweens.add({ targets: btnGlow, alpha: 0, duration: 900, yoyo: true, repeat: -1 });

    // Play button
    const btnBg = this.add.graphics();
    this._drawMenuBtn(btnBg, width, height, 0xFF4444);
    btnBg.setInteractive(
      new Phaser.Geom.Rectangle(width / 2 - 92, height * 0.63, 184, 54),
      Phaser.Geom.Rectangle.Contains
    );
    this.add.text(width / 2, height * 0.63 + 27, '▶  PLAY', {
      fontSize: '30px', fontFamily: 'Arial Black, sans-serif', fontStyle: 'bold',
      color: '#FFFFFF', stroke: '#880000', strokeThickness: 4,
    }).setOrigin(0.5);

    btnBg.on('pointerover',  () => { btnBg.clear(); this._drawMenuBtn(btnBg, width, height, 0xFF6666); this.input.setDefaultCursor('pointer'); });
    btnBg.on('pointerout',   () => { btnBg.clear(); this._drawMenuBtn(btnBg, width, height, 0xFF4444); this.input.setDefaultCursor('default'); });
    btnBg.on('pointerdown',  () => this.scene.start('GameScene'));

    // Achievements section
    const unlocked = getUnlocked();
    const count    = unlocked.size;
    this.add.text(width / 2, height * 0.76, `Achievements: ${count} / ${ACHIEVEMENTS.length}`, {
      fontSize: '13px', fontFamily: 'Arial, sans-serif',
      color: '#8899AA', stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5);

    const iconCount = ACHIEVEMENTS.length;
    const iconW     = 36;
    const totalW    = iconCount * iconW;
    const startX    = width / 2 - totalW / 2 + iconW / 2;
    const iconY     = height * 0.83;

    ACHIEVEMENTS.forEach((def, i) => {
      const isUnlocked = unlocked.has(def.id);
      const ix = startX + i * iconW;

      if (isUnlocked) {
        const glow = this.add.circle(ix, iconY, 14, 0xFFD700, 0.22);
        this.tweens.add({ targets: glow, alpha: 0.05, duration: 900, yoyo: true, repeat: -1, delay: i * 120 });
      }

      this.add.text(ix, iconY, def.icon, {
        fontSize: '20px',
      }).setOrigin(0.5).setAlpha(isUnlocked ? 1 : 0.2);
    });

    // Instructions
    this.add.text(width / 2, height * 0.93, 'Move mouse to aim  •  Click to shoot', {
      fontSize: '13px', fontFamily: 'Arial, sans-serif',
      color: '#AACCDD', stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5);
  }

  _drawMenuBtn(g, width, height, color) {
    g.fillStyle(color, 1);
    g.fillRoundedRect(width / 2 - 92, height * 0.63, 184, 54, 16);
    g.fillStyle(0xFFFFFF, 0.22);
    g.fillRoundedRect(width / 2 - 82, height * 0.63 + 5, 164, 20, 8);
  }

  _spawnMenuBalloon(x, startY, r, color, speed) {
    const g = this.add.graphics();
    g.x = x;
    g.y = startY;
    this._paintMenuBalloon(g, r, color);
    this.tweens.add({
      targets: g, y: -(r * 4),
      duration: (this.scale.height + r * 7) / speed * 1000,
      ease: 'Linear', repeat: -1,
      delay: Phaser.Math.Between(0, 2000),
      onRepeat: () => {
        g.y = this.scale.height + r * 3;
        g.x = Phaser.Math.Between(r + 10, this.scale.width - r - 10);
      },
    });
  }

  _paintMenuBalloon(g, r, color) {
    g.clear();
    const tw = r * 2, th = Math.ceil(r * 2.4);
    // Shadow
    g.fillStyle(0x000000, 0.2);
    g.fillEllipse(3, 4, tw * 0.88, th * 0.88);
    // Body
    g.fillStyle(color, 1);
    g.fillEllipse(0, 0, tw, th);
    // Highlight
    g.fillStyle(0xFFFFFF, 0.45);
    g.fillEllipse(-r * 0.26, -r * 0.3, r * 0.62, r * 0.74);
    g.fillStyle(0xFFFFFF, 0.72);
    g.fillEllipse(-r * 0.32, -r * 0.38, r * 0.2, r * 0.24);
    // Knot
    g.fillStyle(0x000000, 0.4);
    g.fillEllipse(0, th / 2 - 2, 7, 7);
    // String
    g.lineStyle(1.5, 0x888888, 0.75);
    g.lineBetween(0, th / 2 - 1, 0, th / 2 + r * 0.7);
  }
}

// ─── GameScene ────────────────────────────────────────────────────────────────
class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }

  create() {
    const { width, height } = this.scale;

    this._generateTextures();

    // Sky gradient
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a3a6e, 0x1a3a6e, 0x5ba3d9, 0x5ba3d9, 1);
    bg.fillRect(0, 0, width, height * 0.7);
    bg.fillGradientStyle(0x5ba3d9, 0x5ba3d9, 0xadd8e6, 0xadd8e6, 1);
    bg.fillRect(0, height * 0.7, width, height * 0.3);

    // Clouds
    this._drawCloud(width * 0.14, height * 0.11, 0.9);
    this._drawCloud(width * 0.65, height * 0.07, 0.72);
    this._drawCloud(width * 0.40, height * 0.21, 0.62);

    // Ground
    const ground = this.add.graphics();
    ground.fillGradientStyle(0x27AE60, 0x27AE60, 0x1E8449, 0x1E8449, 1);
    ground.fillRect(0, height - 44, width, 44);
    ground.fillStyle(0x2ECC71, 1);
    ground.fillRect(0, height - 44, width, 9);
    // Grass tufts
    ground.fillStyle(0x52BE80, 0.6);
    for (let gx = 14; gx < width; gx += 20) ground.fillCircle(gx, height - 41, 5);

    // Cannon wheels + axle
    const base = this.add.graphics();
    base.fillStyle(0x1a1a1a, 1);
    base.fillCircle(width / 2 - 30, height - 22, 14);
    base.fillCircle(width / 2 + 30, height - 22, 14);
    base.fillStyle(0x555555, 0.65);
    base.fillCircle(width / 2 - 30, height - 22, 8);
    base.fillCircle(width / 2 + 30, height - 22, 8);
    base.fillStyle(0x222222, 1);
    base.fillCircle(width / 2 - 30, height - 22, 4);
    base.fillCircle(width / 2 + 30, height - 22, 4);
    // Axle bar
    base.fillStyle(0x3a3a3a, 1);
    base.fillRect(width / 2 - 32, height - 26, 64, 9);
    // Body ellipse
    base.fillStyle(0x2c2c2c, 1);
    base.fillEllipse(width / 2, height - 30, 74, 28);
    base.fillStyle(0x555555, 0.4);
    base.fillEllipse(width / 2, height - 37, 62, 14);

    // Barrel
    this.cannonPivot = this.add.container(width / 2, height - 36);
    const barrel = this.add.graphics();
    barrel.fillStyle(0x2a2a2a, 1);
    barrel.fillRoundedRect(-9, -54, 18, 56, 6);
    // Bands
    barrel.fillStyle(0x111111, 1);
    barrel.fillRect(-9, -16, 18, 6);
    barrel.fillRect(-9, -33, 18, 6);
    // Highlight stripe
    barrel.fillStyle(0x888888, 0.3);
    barrel.fillRoundedRect(-5, -52, 5, 48, 3);
    // Muzzle
    barrel.fillStyle(0x1a1a1a, 1);
    barrel.fillEllipse(0, -54, 26, 12);
    barrel.fillStyle(0x444444, 1);
    barrel.fillEllipse(0, -54, 16, 7);
    barrel.fillStyle(0xFF8800, 0.18);
    barrel.fillCircle(0, -54, 11);
    this.cannonPivot.add(barrel);

    // State
    this.score     = 0;
    this.lives     = 3;
    this.lastFired = 0;
    this.fireCooldown = 300;
    this.bullets   = [];
    this.balloons  = [];

    // Combo state
    this.combo      = 0;
    this.comboTimer = null;
    this.maxCombo   = 0;

    // Achievement tracking
    this.balloonsPopped     = 0;
    this.livesLostThisRun   = 0;
    this._newAchievements   = [];
    this._toastQueue        = [];
    this._toastActive       = false;
    this.untouchableChecked = false;
    this.survivorChecked    = false;

    this._buildHUD();
    this._buildComboHUD();

    // Hint text
    const hint = this.add.text(width / 2, height * 0.47, 'Click to shoot!', {
      fontSize: '20px', fontFamily: 'Arial, sans-serif',
      color: '#FFFFFF', stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(10);
    this.tweens.add({ targets: hint, alpha: 0, delay: 2500, duration: 900, onComplete: () => hint.destroy() });

    this.elapsed    = 0;
    this.spawnDelay = 1200;
    this.speedMult  = 1.0;

    this._spawnBalloon();
    this.spawnTimer = this.time.addEvent({ delay: this.spawnDelay, callback: this._spawnBalloon, callbackScope: this, loop: true });
    this.rampTimer  = this.time.addEvent({ delay: 30000, callback: this._rampDifficulty, callbackScope: this, loop: true });

    this.input.on('pointermove', (ptr) => this._aimCannon(ptr));
    this.input.on('pointerdown', (ptr) => this._fireBullet(ptr));
  }

  // ── Clouds ───────────────────────────────────────────────────────────────────
  _drawCloud(x, y, s) {
    const g = this.add.graphics();
    g.fillStyle(0xFFFFFF, 0.78);
    g.fillCircle(x,           y,           22 * s);
    g.fillCircle(x + 19 * s, y - 11 * s, 17 * s);
    g.fillCircle(x + 36 * s, y,           22 * s);
    g.fillCircle(x + 19 * s, y +  9 * s, 16 * s);
    g.fillStyle(0xFFFFFF, 0.35);
    g.fillCircle(x +  8 * s, y - 16 * s, 11 * s);
  }

  // ── Texture generation ───────────────────────────────────────────────────────
  _generateTextures() {
    const rad       = 22;
    const tw        = rad * 2;
    const stringLen = 16;
    const ellipseH  = Math.ceil(rad * 2.4);
    const th        = ellipseH + stringLen;

    const darken = (hex, f) => {
      const rv = Math.min(255, Math.floor((hex >> 16 & 0xFF) * f));
      const gv = Math.min(255, Math.floor((hex >> 8  & 0xFF) * f));
      const bv = Math.min(255, Math.floor((hex & 0xFF) * f));
      return (rv << 16) | (gv << 8) | bv;
    };

    const drawBalloon = (key, fillColor, isBomb, isGolden) => {
      const g  = this.add.graphics();
      const cx = tw / 2;
      const cy = ellipseH / 2;
      const fc = fillColor ?? 0xFF6B6B;

      // Golden outer glow
      if (isGolden) {
        g.fillStyle(fc, 0.12);
        g.fillEllipse(cx, cy, tw * 1.8, ellipseH * 1.8);
        g.fillStyle(fc, 0.22);
        g.fillEllipse(cx, cy, tw * 1.35, ellipseH * 1.35);
      }

      // Drop shadow
      g.fillStyle(0x000000, 0.2);
      g.fillEllipse(cx + 3, cy + 5, tw * 0.86, ellipseH * 0.86);

      // Dark shading layer (bottom-right gives depth)
      g.fillStyle(darken(fc, 0.58), 1);
      g.fillEllipse(cx + 3, cy + 5, tw * 0.88, ellipseH * 0.88);

      // Main body
      g.fillStyle(fc, 1);
      g.fillEllipse(cx, cy, tw, ellipseH);

      // Soft mid-shine
      g.fillStyle(0xFFFFFF, 0.2);
      g.fillEllipse(cx - rad * 0.2, cy - rad * 0.14, rad * 1.1, rad * 1.25);

      // Primary specular
      g.fillStyle(0xFFFFFF, 0.55);
      g.fillEllipse(cx - rad * 0.28, cy - rad * 0.3, rad * 0.62, rad * 0.74);

      // Bright specular dot
      g.fillStyle(0xFFFFFF, 0.88);
      g.fillEllipse(cx - rad * 0.34, cy - rad * 0.38, rad * 0.19, rad * 0.23);

      // Bomb fuse
      if (isBomb) {
        g.fillStyle(0xFF8800, 1);
        g.fillRect(cx - 2, 0, 4, rad * 0.65);
        g.fillStyle(0xFFFF00, 1);
        g.fillCircle(cx, 0, 3.5);
        g.fillStyle(0xFF0000, 1);
        g.fillCircle(cx, 0, 1.5);
      }

      // Knot
      g.fillStyle(0x000000, 0.5);
      g.fillEllipse(cx, ellipseH - 3, 8, 9);
      g.fillStyle(darken(fc, 0.75), 1);
      g.fillEllipse(cx, ellipseH - 3, 5, 6);

      // String
      g.lineStyle(1.5, 0x666666, 0.85);
      g.lineBetween(cx, ellipseH - 1, cx, th);

      g.generateTexture(key, tw, th);
      g.destroy();
    };

    NORMAL_COLORS.forEach((c, i) => drawBalloon(`balloon_n${i}`, c, false, false));
    drawBalloon('balloon_fast',   BALLOON_TYPES.fast.color,   false, false);
    drawBalloon('balloon_tank',   BALLOON_TYPES.tank.color,   false, false);
    drawBalloon('balloon_golden', BALLOON_TYPES.golden.color, false, true);
    drawBalloon('balloon_bomb',   BALLOON_TYPES.bomb.color,   true,  false);
  }

  // ── Aim cannon ───────────────────────────────────────────────────────────────
  _aimCannon(ptr) {
    const dx    = ptr.x - this.cannonPivot.x;
    const dy    = ptr.y - this.cannonPivot.y;
    let   angle = Math.atan2(dy, dx) + Math.PI / 2;
    angle = Phaser.Math.Clamp(angle, -Phaser.Math.DegToRad(80), Phaser.Math.DegToRad(80));
    this.cannonPivot.setRotation(angle);
  }

  // ── Fire bullet ──────────────────────────────────────────────────────────────
  _fireBullet(ptr) {
    this._aimCannon(ptr);
    const now = this.time.now;
    if (now - this.lastFired < this.fireCooldown) return;
    this.lastFired = now;

    const angle  = this.cannonPivot.rotation - Math.PI / 2;
    const speed  = 520;
    const startX = this.cannonPivot.x + Math.cos(angle) * 54;
    const startY = this.cannonPivot.y + Math.sin(angle) * 54;

    // Muzzle flash
    const flash1 = this.add.circle(startX, startY, 16, 0xFFAA00, 0.9).setDepth(5);
    const flash2 = this.add.circle(startX, startY,  8, 0xFFFFFF, 1.0).setDepth(6);
    this.tweens.add({
      targets: [flash1, flash2], alpha: 0, scaleX: 2.5, scaleY: 2.5, duration: 140,
      onComplete: () => { flash1.destroy(); flash2.destroy(); },
    });

    // Bullet: golden outer ring + white core
    const outer = this.add.circle(startX, startY, 7, 0xFFAA00, 0.88).setDepth(8);
    const core  = this.add.circle(startX, startY, 4, 0xFFFFFF, 1.0 ).setDepth(9);
    outer._vx   = Math.cos(angle) * speed;
    outer._vy   = Math.sin(angle) * speed;
    outer._core = core;
    this.bullets.push(outer);
  }

  // ── HUD ──────────────────────────────────────────────────────────────────────
  _buildHUD() {
    const { width } = this.scale;

    const sBg = this.add.graphics().setDepth(15);
    sBg.fillStyle(0x000000, 0.5);
    sBg.fillRoundedRect(8, 8, 158, 40, 12);
    sBg.lineStyle(1.5, 0x4499FF, 0.75);
    sBg.strokeRoundedRect(8, 8, 158, 40, 12);

    this.scoreTxt = this.add.text(88, 28, 'SCORE  0', {
      fontSize: '17px', fontFamily: 'Arial Black, sans-serif', color: '#FFFFFF',
    }).setOrigin(0.5).setDepth(16);

    const lBg = this.add.graphics().setDepth(15);
    lBg.fillStyle(0x000000, 0.5);
    lBg.fillRoundedRect(width - 108, 8, 100, 40, 12);
    lBg.lineStyle(1.5, 0xFF4466, 0.75);
    lBg.strokeRoundedRect(width - 108, 8, 100, 40, 12);

    this.livesTxt = this.add.text(width - 58, 28, '❤️❤️❤️', {
      fontSize: '20px', fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5).setDepth(16);
  }

  // ── Combo HUD ─────────────────────────────────────────────────────────────────
  _buildComboHUD() {
    const { width } = this.scale;
    const cx = width / 2;

    this._comboBg = this.add.graphics().setDepth(15).setAlpha(0);
    this._comboTxt = this.add.text(cx, 28, '', {
      fontSize: '17px', fontFamily: 'Arial Black, sans-serif', color: '#FFFFFF',
    }).setOrigin(0.5).setDepth(16).setAlpha(0);
  }

  _updateComboHUD() {
    const { width } = this.scale;
    const cx = width / 2;

    if (this.combo < 2) {
      this._comboBg.setAlpha(0);
      this._comboTxt.setAlpha(0);
      return;
    }

    const color = this.combo >= 6 ? 0xFFD700 : this.combo >= 4 ? 0xFF3333 : 0xFF8800;
    this._comboBg.clear();
    this._comboBg.fillStyle(0x000000, 0.55);
    this._comboBg.fillRoundedRect(cx - 70, 8, 140, 40, 10);
    this._comboBg.lineStyle(2, color, 0.9);
    this._comboBg.strokeRoundedRect(cx - 70, 8, 140, 40, 10);
    this._comboBg.setAlpha(1);

    this._comboTxt.setText(`${this.combo}× COMBO`).setAlpha(1);
    const hexStr = '#' + color.toString(16).padStart(6, '0');
    this._comboTxt.setColor(hexStr);

    // Scale bump
    this.tweens.add({ targets: this._comboTxt, scaleX: 1.28, scaleY: 1.28, duration: 80, yoyo: true });
  }

  _showComboAnnounce(combo) {
    const { width, height } = this.scale;
    const txt = this.add.text(width / 2, height * 0.40, `${combo}× COMBO!`, {
      fontSize: '36px', fontFamily: 'Arial Black, sans-serif',
      color: combo >= 6 ? '#FFD700' : combo >= 4 ? '#FF3333' : '#FF8800',
      stroke: '#000000', strokeThickness: 5,
    }).setOrigin(0.5).setDepth(28);
    this.tweens.add({
      targets: txt, y: height * 0.28, alpha: 0, duration: 800, ease: 'Power2',
      onComplete: () => txt.destroy(),
    });
  }

  // ── Score popup ───────────────────────────────────────────────────────────────
  _showScorePopup(x, y, points) {
    const color = points >= 50 ? '#FFD700' : points >= 30 ? '#FF88FF' : points >= 20 ? '#FF6666' : '#FFFFFF';
    const txt   = this.add.text(x, y - 10, `+${points}`, {
      fontSize: '24px', fontFamily: 'Arial Black, sans-serif',
      color, stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(25);
    this.tweens.add({
      targets: txt, y: y - 68, alpha: 0, scaleX: 1.3, scaleY: 1.3,
      duration: 700, ease: 'Power2', onComplete: () => txt.destroy(),
    });
  }

  // ── Hit handler ───────────────────────────────────────────────────────────────
  _onHit(bullet, balloon) {
    if (!balloon.active) return;
    balloon.hp--;
    if (balloon.hp > 0) {
      this.tweens.add({ targets: balloon, alpha: 0.22, duration: 65, yoyo: true, repeat: 1 });
      const lbl = this.add.text(balloon.x, balloon.y - 28, 'TANK!', {
        fontSize: '14px', fontFamily: 'Arial Black', color: '#FF99FF', stroke: '#000', strokeThickness: 2,
      }).setOrigin(0.5).setDepth(20);
      this.tweens.add({ targets: lbl, y: balloon.y - 58, alpha: 0, duration: 480, onComplete: () => lbl.destroy() });
      return;
    }
    this._popBalloon(balloon);
  }

  // ── Pop balloon ───────────────────────────────────────────────────────────────
  _popBalloon(balloon) {
    if (!balloon.active) return;
    const { x, y } = balloon;
    const typeName  = balloon.balloonType;

    // Combo multiplier
    if (this.comboTimer) { this.comboTimer.remove(); this.comboTimer = null; }
    this.combo = Math.min(8, this.combo + 1);
    if (this.combo > this.maxCombo) this.maxCombo = this.combo;

    const finalPoints = balloon.points * Math.max(1, this.combo);
    this.score += finalPoints;
    this.scoreTxt.setText(`SCORE  ${this.score}`);
    this.tweens.add({ targets: this.scoreTxt, scaleX: 1.22, scaleY: 1.22, duration: 90, yoyo: true });

    this.comboTimer = this.time.delayedCall(1800, () => {
      this.combo = 0;
      this._updateComboHUD();
    });
    this._updateComboHUD();
    if (this.combo >= 2) this._showComboAnnounce(this.combo);

    // Balloon count
    this.balloonsPopped++;

    // White flash ring
    const ring = this.add.circle(x, y, 10, 0xFFFFFF, 0.92).setDepth(20);
    this.tweens.add({ targets: ring, scaleX: 5.5, scaleY: 5.5, alpha: 0, duration: 220, onComplete: () => ring.destroy() });

    // Particle burst
    const color = balloon.color ?? 0xFFAAAA;
    for (let i = 0; i < 14; i++) {
      const a    = (i / 14) * Math.PI * 2;
      const dist = Phaser.Math.Between(38, 72);
      const sz   = Phaser.Math.Between(3, 7);
      const p    = this.add.circle(x, y, sz, color).setDepth(18);
      this.tweens.add({
        targets: p,
        x: x + Math.cos(a) * dist, y: y + Math.sin(a) * dist,
        alpha: 0, scaleX: 0.1, scaleY: 0.1,
        duration: Phaser.Math.Between(280, 500), ease: 'Power2',
        onComplete: () => p.destroy(),
      });
    }

    this._showScorePopup(x, y, finalPoints);
    if (typeName === 'bomb') this._chainExplosion(x, y);

    // Achievement checks
    if (this.balloonsPopped === 1) this._tryUnlock('first_blood');
    if (this.combo >= 5) this._tryUnlock('on_fire');
    if (this.combo >= 8) this._tryUnlock('combo_master');
    if (typeName === 'golden') this._tryUnlock('golden_touch');
    if (this.balloonsPopped >= 50) this._tryUnlock('sharpshooter');

    balloon.destroy();
    const idx = this.balloons.indexOf(balloon);
    if (idx !== -1) this.balloons.splice(idx, 1);
  }

  // ── Chain explosion ───────────────────────────────────────────────────────────
  _chainExplosion(x, y) {
    this._tryUnlock('chain_reaction');
    const radius = 90;
    [0, 90, 180].forEach(delay => {
      this.time.delayedCall(delay, () => {
        const ring = this.add.circle(x, y, 8, 0xFF6600, 0.9).setDepth(22);
        this.tweens.add({ targets: ring, scaleX: radius / 8, scaleY: radius / 8, alpha: 0, duration: 340, onComplete: () => ring.destroy() });
      });
    });

    this.cameras.main.shake(220, 0.009);

    const boom = this.add.text(x, y - 18, '💥 BOOM!', {
      fontSize: '28px', fontFamily: 'Arial Black, sans-serif',
      color: '#FF6600', stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(30);
    this.tweens.add({ targets: boom, y: y - 85, scaleX: 1.5, scaleY: 1.5, alpha: 0, duration: 700, ease: 'Power2', onComplete: () => boom.destroy() });

    this.balloons
      .filter(b => b.active && b.balloonType !== 'bomb' &&
                   Phaser.Math.Distance.Between(x, y, b.x, b.y) <= radius)
      .forEach(b => {
        this.time.delayedCall(Phaser.Math.Between(0, 160), () => {
          if (b.active) this._popBalloon(b);
        });
      });
  }

  // ── Pick balloon type ─────────────────────────────────────────────────────────
  _pickBalloonType() {
    const pool = ['normal'];
    if (this.elapsed >= 120) pool.push('fast', 'tank');
    if (this.elapsed >= 240) pool.push('golden', 'bomb');
    const weights = pool.map(t => BALLOON_TYPES[t].weight);
    const total   = weights.reduce((a, b) => a + b, 0);
    let   r       = Math.random() * total;
    for (let i = 0; i < pool.length; i++) { r -= weights[i]; if (r <= 0) return pool[i]; }
    return 'normal';
  }

  // ── Spawn balloon ─────────────────────────────────────────────────────────────
  _spawnBalloon() {
    const { width, height } = this.scale;
    const typeName = this._pickBalloonType();
    const def      = BALLOON_TYPES[typeName];
    const rad      = 22;
    const x        = Phaser.Math.Between(rad + 10, width - rad - 10);

    let textureKey, color;
    if (typeName === 'normal') {
      const ci   = Phaser.Math.Between(0, NORMAL_COLORS.length - 1);
      textureKey = `balloon_n${ci}`;
      color      = NORMAL_COLORS[ci];
    } else {
      textureKey = `balloon_${typeName}`;
      color      = def.color;
    }

    const g = this.physics.add.image(x, height + rad * 2.5, textureKey);
    g.body.setVelocityY(-def.speed * this.speedMult);
    g.body.setAllowGravity(false);
    g.balloonType = typeName;
    g.hp          = def.hp;
    g.points      = def.points;
    g.radius      = rad;
    g.color       = color;

    // Gentle wobble as it rises
    this.tweens.add({
      targets: g, scaleX: 1.07, scaleY: 0.94,
      duration: 550 + Math.random() * 350,
      yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      delay: Math.random() * 400,
    });

    this.balloons.push(g);
  }

  // ── Difficulty ramp ───────────────────────────────────────────────────────────
  _rampDifficulty() {
    this.spawnDelay = Math.max(500, this.spawnDelay - 150);
    this.speedMult  = Math.min(2.5, this.speedMult + 0.12);
    this.spawnTimer.reset({ delay: this.spawnDelay, callback: this._spawnBalloon, callbackScope: this, loop: true });
  }

  // ── Update loop ───────────────────────────────────────────────────────────────
  update(time, delta) {
    this.elapsed += delta / 1000;
    const dt    = delta / 1000;

    // Timed achievements
    if (!this.untouchableChecked && this.elapsed >= 120 && this.livesLostThisRun === 0) {
      this.untouchableChecked = true;
      this._tryUnlock('untouchable');
    }
    if (!this.survivorChecked && this.elapsed >= 300) {
      this.survivorChecked = true;
      this._tryUnlock('survivor');
    }
    const { width } = this.scale;

    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      if (!b.active) {
        if (b._core?.active) b._core.destroy();
        this.bullets.splice(i, 1);
        continue;
      }

      b.x += b._vx * dt;
      b.y += b._vy * dt;
      if (b._core?.active) { b._core.x = b.x; b._core.y = b.y; }

      if (b.y < -20 || b.x < -20 || b.x > width + 20) {
        if (b._core?.active) b._core.destroy();
        b.destroy();
        this.bullets.splice(i, 1);
        continue;
      }

      let hit = false;
      for (const bal of this.balloons) {
        if (!bal.active) continue;
        if (Phaser.Math.Distance.Between(b.x, b.y, bal.x, bal.y) < bal.radius + 9) {
          if (b._core?.active) b._core.destroy();
          b.destroy();
          this.bullets.splice(i, 1);
          this._onHit(b, bal);
          hit = true;
          break;
        }
      }
      if (hit) continue;
    }

    for (let i = this.balloons.length - 1; i >= 0; i--) {
      const b = this.balloons[i];
      if (!b.active) { this.balloons.splice(i, 1); continue; }
      if (b.y < -60) {
        b.destroy();
        this.balloons.splice(i, 1);
        this._loseLife();
      }
    }
  }

  // ── Lose life ─────────────────────────────────────────────────────────────────
  _loseLife() {
    if (this.lives <= 0) return;
    this.lives--;
    this.livesLostThisRun++;

    // Reset combo on life loss
    if (this.comboTimer) { this.comboTimer.remove(); this.comboTimer = null; }
    this.combo = 0;
    this._updateComboHUD();

    this.livesTxt.setText('❤️'.repeat(Math.max(0, this.lives)) || '💀');

    // Red screen flash
    const flash = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0xFF0000, 0.32)
      .setOrigin(0).setDepth(50);
    this.tweens.add({ targets: flash, alpha: 0, duration: 320, onComplete: () => flash.destroy() });

    if (this.lives <= 0) {
      this.spawnTimer.remove();
      this.rampTimer.remove();
      this.time.delayedCall(420, () => this.scene.start('GameOverScene', {
        score: this.score,
        newAchievements: this._newAchievements,
      }));
    }
  }

  // ── Achievement helpers ────────────────────────────────────────────────────────
  _tryUnlock(id) {
    if (unlockAchievement(id)) {
      const def = ACHIEVEMENTS.find(a => a.id === id);
      if (def) { this._newAchievements.push(def); this._queueToast(def); }
    }
  }

  _queueToast(def) {
    this._toastQueue.push(def);
    if (!this._toastActive) this._showNextToast();
  }

  _showNextToast() {
    if (this._toastQueue.length === 0) { this._toastActive = false; return; }
    this._toastActive = true;
    const def = this._toastQueue.shift();
    const { width, height } = this.scale;

    const container = this.add.container(width + 10, height * 0.82).setDepth(40);

    const bg = this.add.graphics();
    bg.fillStyle(0x111111, 0.88);
    bg.fillRoundedRect(-110, -29, 220, 58, 10);
    bg.lineStyle(2, 0xFFD700, 0.9);
    bg.strokeRoundedRect(-110, -29, 220, 58, 10);
    container.add(bg);

    const iconTxt = this.add.text(-92, 0, def.icon, { fontSize: '26px' }).setOrigin(0, 0.5);
    const labelTxt = this.add.text(-58, -10, def.label, {
      fontSize: '14px', fontFamily: 'Arial Black, sans-serif', color: '#FFD700',
    }).setOrigin(0, 0.5);
    const descTxt = this.add.text(-58, 9, def.desc, {
      fontSize: '11px', fontFamily: 'Arial, sans-serif', color: '#AAAAAA',
    }).setOrigin(0, 0.5);
    container.add([iconTxt, labelTxt, descTxt]);

    // Slide in
    this.tweens.add({
      targets: container, x: width - 232, duration: 380, ease: 'Back.easeOut',
      onComplete: () => {
        // Stay 2500ms, then slide out
        this.time.delayedCall(2500, () => {
          this.tweens.add({
            targets: container, x: width + 10, duration: 300, ease: 'Power2',
            onComplete: () => { container.destroy(); this._showNextToast(); },
          });
        });
      },
    });
  }
}

// ─── GameOverScene ────────────────────────────────────────────────────────────
class GameOverScene extends Phaser.Scene {
  constructor() { super('GameOverScene'); }
  init(data) {
    this.finalScore      = data.score ?? 0;
    this.newAchievements = data.newAchievements ?? [];
  }

  create() {
    const { width, height } = this.scale;

    // Dark bg
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x08081e, 0x08081e, 0x1a0a2e, 0x1a0a2e, 1);
    bg.fillRect(0, 0, width, height);

    // Twinkling stars
    for (let i = 0; i < 30; i++) {
      const sx   = Phaser.Math.Between(10, width - 10);
      const sy   = Phaser.Math.Between(10, height - 10);
      const star = this.add.circle(sx, sy, Phaser.Math.FloatBetween(1, 3),
                                   0xFFFFFF, Phaser.Math.FloatBetween(0.3, 0.85));
      this.tweens.add({
        targets: star, alpha: 0.05, scaleX: 1.8, scaleY: 1.8,
        duration: Phaser.Math.Between(500, 1800), yoyo: true, repeat: -1,
        delay: Phaser.Math.Between(0, 1400),
      });
    }

    // GAME OVER
    this.add.text(width / 2 + 4, height * 0.19 + 4, 'GAME OVER', {
      fontSize: '50px', fontFamily: 'Arial Black, sans-serif', fontStyle: 'bold',
      color: '#000000', alpha: 0.45,
    }).setOrigin(0.5);
    this.add.text(width / 2, height * 0.19, 'GAME OVER', {
      fontSize: '50px', fontFamily: 'Arial Black, sans-serif', fontStyle: 'bold',
      color: '#FF4444', stroke: '#880000', strokeThickness: 6,
    }).setOrigin(0.5);

    // Score panel
    const sBg = this.add.graphics();
    sBg.fillStyle(0x000000, 0.55);
    sBg.fillRoundedRect(width / 2 - 125, height * 0.32, 250, 58, 16);
    sBg.lineStyle(2, 0x4499FF, 0.85);
    sBg.strokeRoundedRect(width / 2 - 125, height * 0.32, 250, 58, 16);
    this.add.text(width / 2, height * 0.32 + 29, `SCORE: ${this.finalScore}`, {
      fontSize: '32px', fontFamily: 'Arial Black, sans-serif',
      color: '#FFFFFF', stroke: '#0055AA', strokeThickness: 3,
    }).setOrigin(0.5);

    // High score
    const prev  = parseInt(localStorage.getItem('balloonBlaster_hi') || '0', 10);
    const isNew = this.finalScore > prev;
    if (isNew) {
      localStorage.setItem('balloonBlaster_hi', String(this.finalScore));
      const newBest = this.add.text(width / 2, height * 0.50, '🏆  NEW BEST!', {
        fontSize: '28px', fontFamily: 'Arial Black, sans-serif',
        color: '#FFD700', stroke: '#885500', strokeThickness: 3,
      }).setOrigin(0.5);
      this.tweens.add({ targets: newBest, scaleX: 1.14, scaleY: 1.14, duration: 580, yoyo: true, repeat: -1 });
    } else {
      const hiBg = this.add.graphics();
      hiBg.fillStyle(0x000000, 0.38);
      hiBg.fillRoundedRect(width / 2 - 88, height * 0.485, 176, 34, 10);
      this.add.text(width / 2, height * 0.485 + 17, `🏆  BEST: ${prev}`, {
        fontSize: '18px', fontFamily: 'Arial Black, sans-serif',
        color: '#FFF9C4', stroke: '#885500', strokeThickness: 2,
      }).setOrigin(0.5);
    }

    // New achievements this run
    const hasNew = this.newAchievements.length > 0;
    if (hasNew) {
      this.add.text(width / 2, height * 0.57, `🏆 ${this.newAchievements.length} achievement${this.newAchievements.length > 1 ? 's' : ''} unlocked!`, {
        fontSize: '18px', fontFamily: 'Arial Black, sans-serif',
        color: '#FFD700', stroke: '#885500', strokeThickness: 2,
      }).setOrigin(0.5);

      const count  = this.newAchievements.length;
      const iconW  = 36;
      const totalW = count * iconW;
      const startX = width / 2 - totalW / 2 + iconW / 2;
      this.newAchievements.forEach((def, i) => {
        this.add.text(startX + i * iconW, height * 0.615, def.icon, {
          fontSize: '24px',
        }).setOrigin(0.5);
      });
    }

    // Play Again button — shifts down when achievements shown
    const btnY = hasNew ? height * 0.68 : height * 0.61;

    const btnGlow = this.add.graphics();
    btnGlow.fillStyle(0x44CC66, 0.24);
    btnGlow.fillRoundedRect(width / 2 - 118, btnY - 7, 236, 67, 22);
    this.tweens.add({ targets: btnGlow, alpha: 0, duration: 820, yoyo: true, repeat: -1 });

    const btnBg = this.add.graphics();
    this._drawBtn(btnBg, width, btnY, 0x22AA44, 226, 53);
    btnBg.setInteractive(
      new Phaser.Geom.Rectangle(width / 2 - 113, btnY, 226, 53),
      Phaser.Geom.Rectangle.Contains
    );
    this.add.text(width / 2, btnY + 26.5, '↺  PLAY AGAIN', {
      fontSize: '26px', fontFamily: 'Arial Black, sans-serif', fontStyle: 'bold',
      color: '#FFFFFF', stroke: '#006622', strokeThickness: 3,
    }).setOrigin(0.5);

    btnBg.on('pointerover',  () => { btnBg.clear(); this._drawBtn(btnBg, width, btnY, 0x44CC66, 226, 53); this.input.setDefaultCursor('pointer'); });
    btnBg.on('pointerout',   () => { btnBg.clear(); this._drawBtn(btnBg, width, btnY, 0x22AA44, 226, 53); this.input.setDefaultCursor('default'); });
    btnBg.on('pointerdown',  () => this.scene.start('GameScene'));

    // Menu link
    const menuBtn = this.add.text(width / 2, hasNew ? height * 0.84 : height * 0.78, '← Main Menu', {
      fontSize: '19px', fontFamily: 'Arial, sans-serif',
      color: '#8888AA', stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    menuBtn.on('pointerover',  () => menuBtn.setColor('#CCCCFF'));
    menuBtn.on('pointerout',   () => menuBtn.setColor('#8888AA'));
    menuBtn.on('pointerdown',  () => this.scene.start('MenuScene'));
  }

  _drawBtn(g, width, top, color, w, h) {
    g.fillStyle(color, 1);
    g.fillRoundedRect(width / 2 - w / 2, top, w, h, 14);
    g.fillStyle(0xFFFFFF, 0.2);
    g.fillRoundedRect(width / 2 - w / 2 + 8, top + 5, w - 16, h * 0.38, 8);
  }
}

// ─── Phaser config ────────────────────────────────────────────────────────────
const config = {
  type: Phaser.AUTO,
  width: 480,
  height: 640,
  backgroundColor: '#1a3a6e',
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
