# Balloon Blaster Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a colorful cartoonish balloon shooter game using Phaser 3, integrated into the game portal at slug `balloon-blaster`.

**Architecture:** Single `game.js` file containing three Phaser scenes (MenuScene, GameScene, GameOverScene). Balloons spawn from the bottom and float upward. A cannon at the bottom center rotates to track the mouse; click fires a projectile. Five balloon types with escalating difficulty over time.

**Tech Stack:** Phaser 3.60.0 (CDN), vanilla JS (ES modules), Vitest (data validation only), localStorage for high score.

---

## Context

- Game files live in `public/games/balloon-blaster/game/` — **never** directly in `balloon-blaster/`
- Astro generates `dist/games/balloon-blaster/index.html` for the detail page; a game file at that path would overwrite it
- Run `npm test` after editing `games.json` to validate registry
- Test gameplay with `npm run dev` → navigate to the game → click Play Now
- The iframe sandbox is `allow-scripts allow-same-origin`
- Reference: `public/games/astro-dash/game/` for file structure patterns

---

## Task 1: Scaffold game files

**Files:**
- Create: `public/games/balloon-blaster/game/index.html`
- Create: `public/games/balloon-blaster/game/style.css`
- Create: `public/games/balloon-blaster/game/game.js`

**Step 1: Create the directory**

```bash
mkdir -p public/games/balloon-blaster/game
```

**Step 2: Create `index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <title>Balloon Blaster</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div id="game-container"></div>
  <script src="https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.min.js"></script>
  <script type="module" src="game.js"></script>
</body>
</html>
```

**Step 3: Create `style.css`**

```css
* { margin: 0; padding: 0; box-sizing: border-box; }

html, body {
  background: #000;
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: fixed;
  touch-action: none;
}

body { display: block; }

#game-container {
  position: relative;
  width: 100%;
  height: 100%;
}

canvas {
  display: block;
  touch-action: none;
}
```

**Step 4: Create `game.js` with a minimal Phaser config (no scenes yet)**

```js
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
  scene: []
};

new Phaser.Game(config);
```

**Step 5: Verify it loads without errors**

```bash
npm run dev
```

Open `http://localhost:4321/games/balloon-blaster/` — click Play Now. The iframe should show a solid sky-blue (`#87CEEB`) canvas with no console errors.

**Step 6: Commit**

```bash
git add public/games/balloon-blaster/
git commit -m "feat: scaffold balloon-blaster game files"
```

---

## Task 2: Register game in games.json

**Files:**
- Modify: `src/data/games.json`
- Test: `src/data/games.test.ts` (existing, no changes needed)

**Step 1: Add entry to `src/data/games.json`**

```json
[
  {
    "slug": "astro-dash",
    "title": "Astro Dash",
    "description": "An 8-bit endless runner — jump, slide, and dodge obstacles across three increasingly dangerous space zones. Survive long enough to face the boss.",
    "thumbnail": "/games/astro-dash/thumbnail.svg",
    "tags": ["runner", "arcade", "8-bit"],
    "featured": true,
    "publishedAt": "2026-02-28"
  },
  {
    "slug": "balloon-blaster",
    "title": "Balloon Blaster",
    "description": "Aim your cannon and pop colorful balloons before they escape! Special balloons bring chain explosions and bonus points — how long can you survive?",
    "thumbnail": "/games/balloon-blaster/thumbnail.svg",
    "tags": ["shooter", "arcade", "casual"],
    "featured": false,
    "publishedAt": "2026-03-06"
  }
]
```

**Step 2: Run tests**

```bash
npm test
```

Expected: all 4 tests pass (including `every game has required fields`).

**Step 3: Commit**

```bash
git add src/data/games.json
git commit -m "feat: register balloon-blaster in games registry"
```

---

## Task 3: Create thumbnail SVG

**Files:**
- Create: `public/games/balloon-blaster/thumbnail.svg`

**Step 1: Create the SVG**

The thumbnail is 400×300. Show a sky-blue background, three colorful balloons (red, yellow, blue), and a cannon at the bottom center pointing slightly upward.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
  <!-- Sky background -->
  <defs>
    <radialGradient id="sky" cx="50%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#87CEEB"/>
      <stop offset="100%" stop-color="#4A90D9"/>
    </radialGradient>
    <radialGradient id="balloonRed" cx="35%" cy="35%" r="60%">
      <stop offset="0%" stop-color="#FF6B6B"/>
      <stop offset="100%" stop-color="#CC0000"/>
    </radialGradient>
    <radialGradient id="balloonYellow" cx="35%" cy="35%" r="60%">
      <stop offset="0%" stop-color="#FFE566"/>
      <stop offset="100%" stop-color="#FFA500"/>
    </radialGradient>
    <radialGradient id="balloonBlue" cx="35%" cy="35%" r="60%">
      <stop offset="0%" stop-color="#66B3FF"/>
      <stop offset="100%" stop-color="#0055CC"/>
    </radialGradient>
    <radialGradient id="balloonGold" cx="35%" cy="35%" r="60%">
      <stop offset="0%" stop-color="#FFD700"/>
      <stop offset="100%" stop-color="#B8860B"/>
    </radialGradient>
  </defs>

  <rect width="400" height="300" fill="url(#sky)"/>

  <!-- Clouds -->
  <ellipse cx="80" cy="60" rx="40" ry="20" fill="white" opacity="0.8"/>
  <ellipse cx="110" cy="50" rx="30" ry="18" fill="white" opacity="0.8"/>
  <ellipse cx="60" cy="55" rx="25" ry="15" fill="white" opacity="0.8"/>
  <ellipse cx="300" cy="80" rx="35" ry="18" fill="white" opacity="0.7"/>
  <ellipse cx="330" cy="70" rx="28" ry="16" fill="white" opacity="0.7"/>

  <!-- Red balloon -->
  <ellipse cx="120" cy="100" rx="35" ry="42" fill="url(#balloonRed)"/>
  <ellipse cx="108" cy="88" rx="10" ry="12" fill="white" opacity="0.3"/>
  <path d="M120 142 Q115 155 120 160" stroke="#CC0000" stroke-width="2" fill="none"/>
  <line x1="120" y1="160" x2="120" y2="185" stroke="#888" stroke-width="1.5"/>

  <!-- Yellow balloon -->
  <ellipse cx="200" cy="80" rx="38" ry="46" fill="url(#balloonYellow)"/>
  <ellipse cx="187" cy="66" rx="11" ry="13" fill="white" opacity="0.3"/>
  <path d="M200 126 Q195 139 200 144" stroke="#FFA500" stroke-width="2" fill="none"/>
  <line x1="200" y1="144" x2="200" y2="175" stroke="#888" stroke-width="1.5"/>

  <!-- Blue balloon -->
  <ellipse cx="300" cy="110" rx="32" ry="38" fill="url(#balloonBlue)"/>
  <ellipse cx="289" cy="99" rx="9" ry="11" fill="white" opacity="0.3"/>
  <path d="M300 148 Q295 159 300 164" stroke="#0055CC" stroke-width="2" fill="none"/>
  <line x1="300" y1="164" x2="300" y2="190" stroke="#888" stroke-width="1.5"/>

  <!-- Golden balloon (small, top right) -->
  <ellipse cx="360" cy="55" rx="22" ry="27" fill="url(#balloonGold)"/>
  <ellipse cx="352" cy="46" rx="6" ry="8" fill="white" opacity="0.4"/>
  <path d="M360 82 Q357 90 360 93" stroke="#B8860B" stroke-width="1.5" fill="none"/>
  <line x1="360" y1="93" x2="360" y2="110" stroke="#888" stroke-width="1"/>

  <!-- Ground -->
  <rect x="0" y="255" width="400" height="45" fill="#5D8A3C"/>
  <rect x="0" y="255" width="400" height="8" fill="#7AB648"/>

  <!-- Cannon base -->
  <ellipse cx="200" cy="265" rx="35" ry="12" fill="#4A4A4A"/>
  <rect x="175" y="255" width="50" height="18" rx="5" fill="#555"/>

  <!-- Cannon barrel (angled ~-45deg pointing upper-right) -->
  <g transform="translate(200, 258) rotate(-50)">
    <rect x="-8" y="-45" width="16" height="48" rx="6" fill="#333"/>
    <rect x="-6" y="-43" width="5" height="20" rx="3" fill="#555"/>
    <!-- Muzzle -->
    <ellipse cx="0" cy="-45" rx="9" ry="6" fill="#222"/>
  </g>

  <!-- Projectile in flight -->
  <circle cx="248" cy="190" r="5" fill="#FFD700"/>
  <ellipse cx="244" cy="193" rx="4" ry="2" fill="#FFA500" opacity="0.5" transform="rotate(-45, 244, 193)"/>

  <!-- Title -->
  <text x="200" y="30" font-family="Arial Black, sans-serif" font-size="22" font-weight="900"
        fill="white" text-anchor="middle" stroke="#0055AA" stroke-width="3" paint-order="stroke">
    BALLOON BLASTER
  </text>
</svg>
```

**Step 2: Verify thumbnail appears on the portal homepage**

```bash
npm run dev
```

Open `http://localhost:4321` — Balloon Blaster card should appear with the thumbnail.

**Step 3: Commit**

```bash
git add public/games/balloon-blaster/thumbnail.svg
git commit -m "feat: add balloon-blaster thumbnail"
```

---

## Task 4: Implement MenuScene

**Files:**
- Modify: `public/games/balloon-blaster/game/game.js`

**Step 1: Replace `game.js` with MenuScene**

```js
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
```

**Step 2: Verify MenuScene**

```bash
npm run dev
```

- Open the game via Play Now
- Should see: sky-blue gradient, "BALLOON BLASTER" title, three balloons, a Best score of 0, and a red PLAY button
- Clicking PLAY should do nothing (GameScene not yet registered) — that's fine for now

**Step 3: Commit**

```bash
git add public/games/balloon-blaster/game/game.js
git commit -m "feat: add MenuScene for balloon-blaster"
```

---

## Task 5: Implement GameScene — cannon + mouse aiming

**Files:**
- Modify: `public/games/balloon-blaster/game/game.js`

**Step 1: Add GameScene class with cannon drawing and mouse rotation**

Insert this class **before** the `config` constant:

```js
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

  _fireBullet(ptr) {
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
    // Destroy bullets that leave the screen
    this.bullets.getChildren().forEach(b => {
      if (b.y < -20 || b.x < -20 || b.x > this.scale.width + 20) b.destroy();
    });
  }
}
```

**Step 2: Add `GameScene` to the Phaser config scenes array**

```js
scene: [MenuScene, GameScene]
```

**Step 3: Verify cannon aiming**

```bash
npm run dev
```

- Click PLAY on the menu
- Should see: sky background, ground, cannon at bottom center
- Moving the mouse should rotate the cannon barrel to track the cursor
- Clicking should create a gold projectile that flies toward where you aimed
- Cannon cannot aim downward (clamped arc)

**Step 4: Commit**

```bash
git add public/games/balloon-blaster/game/game.js
git commit -m "feat: add GameScene cannon aiming and shooting"
```

---

## Task 6: Implement balloon spawning + life loss

**Files:**
- Modify: `public/games/balloon-blaster/game/game.js`

**Step 1: Add balloon config constants at top of file (before MenuScene)**

```js
// ─── Balloon types config ─────────────────────────────────────────────────────
const BALLOON_TYPES = {
  normal: { color: null, speed: 90,  points: 10, hp: 1, weight: 60 },
  fast:   { color: 0xFF2222, speed: 180, points: 20, hp: 1, weight: 20 },
  tank:   { color: 0x6A0DAD, speed: 65,  points: 30, hp: 2, weight: 15 },
  golden: { color: 0xFFD700, speed: 75,  points: 50, hp: 1, weight: 3  },
  bomb:   { color: 0x111111, speed: 80,  points: 25, hp: 1, weight: 2  },
};

const NORMAL_COLORS = [0xFF6B6B, 0x66B3FF, 0x66DD66, 0xFF99CC, 0xFF9944];
```

**Step 2: Add `_spawnBalloon()` and `_pickBalloonType()` methods to GameScene, and a spawn timer in `create()`**

In `create()`, after building the HUD, add:

```js
    // Difficulty state
    this.elapsed = 0;
    this.spawnDelay = 1800; // ms between spawns (decreases over time)
    this.speedMult  = 1.0;

    // Spawn timer
    this.spawnTimer = this.time.addEvent({
      delay: this.spawnDelay,
      callback: this._spawnBalloon,
      callbackScope: this,
      loop: true,
    });

    // Difficulty ramp every 30s
    this.time.addEvent({
      delay: 30000,
      callback: this._rampDifficulty,
      callbackScope: this,
      loop: true,
    });
```

Add these methods to GameScene:

```js
  _pickBalloonType() {
    const elapsed = this.elapsed;
    const pool = ['normal'];
    if (elapsed >= 120) pool.push('fast', 'tank');
    if (elapsed >= 240) pool.push('golden', 'bomb');

    // Weighted random from pool
    const weights = pool.map(t => BALLOON_TYPES[t].weight);
    const total = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    for (let i = 0; i < pool.length; i++) {
      r -= weights[i];
      if (r <= 0) return pool[i];
    }
    return 'normal';
  }

  _spawnBalloon() {
    const { width, height } = this.scale;
    const typeName = this._pickBalloonType();
    const def = BALLOON_TYPES[typeName];
    const color = def.color ?? NORMAL_COLORS[Phaser.Math.Between(0, NORMAL_COLORS.length - 1)];
    const r = 22;
    const x = Phaser.Math.Between(r + 10, width - r - 10);

    // Draw balloon graphic
    const g = this.add.graphics();
    g.fillStyle(color, 1);
    g.fillEllipse(0, 0, r * 2, r * 2.4);
    // Shine highlight
    g.fillStyle(0xFFFFFF, 0.28);
    g.fillEllipse(-r * 0.25, -r * 0.32, r * 0.65, r * 0.7);
    // Bomb fuse marker
    if (typeName === 'bomb') {
      g.fillStyle(0xFF6600, 1);
      g.fillRect(-2, -r * 1.3, 4, r * 0.5);
    }
    // Golden shimmer
    if (typeName === 'golden') {
      g.fillStyle(0xFFFFAA, 0.5);
      g.fillEllipse(0, 0, r * 1.6, r * 2.0);
    }
    // String
    g.lineStyle(1.5, 0x888888, 1);
    g.strokeLineShape(new Phaser.Geom.Line(0, r * 1.2, 0, r * 2.2));

    g.setPosition(x, height + r * 2.5);
    this.physics.add.existing(g);
    g.body.setVelocityY(-def.speed * this.speedMult);
    g.body.setAllowGravity(false);
    g.body.setSize(r * 2, r * 2.4);

    // Metadata
    g.balloonType = typeName;
    g.hp = def.hp;
    g.points = def.points;
    g.radius = r;

    this.balloons.add(g);
  }

  _rampDifficulty() {
    this.spawnDelay = Math.max(500, this.spawnDelay - 150);
    this.speedMult  = Math.min(2.5, this.speedMult + 0.12);
    this.spawnTimer.reset({
      delay: this.spawnDelay,
      callback: this._spawnBalloon,
      callbackScope: this,
      loop: true,
    });
  }
```

**Step 3: In `update()`, track elapsed time and check balloon escape**

Replace the `update()` method:

```js
  update(time, delta) {
    this.elapsed += delta / 1000;

    // Destroy off-screen bullets
    this.bullets.getChildren().forEach(b => {
      if (b.y < -20 || b.x < -20 || b.x > this.scale.width + 20) b.destroy();
    });

    // Check balloons that escaped the top
    const escaped = this.balloons.getChildren().filter(b => b.y < -60);
    escaped.forEach(b => {
      b.destroy();
      this._loseLife();
    });
  }

  _loseLife() {
    this.lives--;
    const hearts = '❤️'.repeat(Math.max(0, this.lives));
    this.livesTxt.setText(hearts || '💀');
    if (this.lives <= 0) {
      this.spawnTimer.remove();
      this.time.delayedCall(400, () => {
        this.scene.start('GameOverScene', { score: this.score });
      });
    }
  }
```

**Step 4: Verify balloons spawn**

```bash
npm run dev
```

- Balloons should float upward from the bottom
- When one escapes off the top, a heart disappears from the HUD
- After 3 escapes, the scene should transition (crash for now since GameOverScene doesn't exist yet)

**Step 5: Commit**

```bash
git add public/games/balloon-blaster/game/game.js
git commit -m "feat: add balloon spawning and life loss"
```

---

## Task 7: Implement bullet-balloon collision

**Files:**
- Modify: `public/games/balloon-blaster/game/game.js`

**Step 1: In `create()`, add the overlap after groups are created**

Add after `this.balloons = this.physics.add.group();`:

```js
    this.physics.add.overlap(
      this.bullets,
      this.balloons,
      this._onHit,
      null,
      this
    );
```

**Step 2: Add `_onHit()` method to GameScene**

```js
  _onHit(bullet, balloon) {
    bullet.destroy();
    balloon.hp--;

    if (balloon.hp > 0) {
      // Tank balloon: flash white to show damage
      this.tweens.add({
        targets: balloon,
        alpha: 0.3,
        duration: 80,
        yoyo: true,
      });
      return;
    }

    // Pop!
    this._popBalloon(balloon);
  }

  _popBalloon(balloon) {
    const { x, y } = balloon;
    const typeName = balloon.balloonType;

    // Score
    this.score += balloon.points;
    this.scoreTxt.setText(`Score: ${this.score}`);

    // Pop particle burst (circles expanding outward)
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const particle = this.add.circle(x, y, 5, balloon.getData?.('color') ?? 0xFFAAAA);
      this.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * 40,
        y: y + Math.sin(angle) * 40,
        alpha: 0,
        scaleX: 0.3,
        scaleY: 0.3,
        duration: 350,
        onComplete: () => particle.destroy(),
      });
    }

    // Bomb chain explosion
    if (typeName === 'bomb') {
      this._chainExplosion(x, y);
    }

    balloon.destroy();
  }

  _chainExplosion(x, y) {
    const radius = 90;
    // Flash ring
    const ring = this.add.circle(x, y, 10, 0xFF6600, 0.8);
    this.tweens.add({
      targets: ring,
      scaleX: radius / 10,
      scaleY: radius / 10,
      alpha: 0,
      duration: 300,
      onComplete: () => ring.destroy(),
    });

    // Destroy nearby balloons
    const nearby = this.balloons.getChildren().filter(b => {
      return Phaser.Math.Distance.Between(x, y, b.x, b.y) <= radius;
    });
    nearby.forEach(b => {
      this.time.delayedCall(Phaser.Math.Between(0, 150), () => {
        if (b.active) this._popBalloon(b);
      });
    });
  }
```

**Step 3: Verify collisions**

```bash
npm run dev
```

- Shooting a balloon should pop it with a burst of particles
- Score increments in the HUD
- Tank balloons (dark purple, appear after 2 min) should flash on first hit and pop on second
- After 4 min, shooting a bomb balloon should trigger a chain reaction nearby

**Step 4: Commit**

```bash
git add public/games/balloon-blaster/game/game.js
git commit -m "feat: add bullet-balloon collision, pop effects, chain bomb"
```

---

## Task 8: Implement GameOverScene

**Files:**
- Modify: `public/games/balloon-blaster/game/game.js`

**Step 1: Add GameOverScene class before the config constant**

```js
// ─── GameOverScene ────────────────────────────────────────────────────────────
class GameOverScene extends Phaser.Scene {
  constructor() { super('GameOverScene'); }

  init(data) {
    this.finalScore = data.score ?? 0;
  }

  create() {
    const { width, height } = this.scale;

    // Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
    bg.fillRect(0, 0, width, height);

    // Game Over text
    this.add.text(width / 2, height * 0.22, 'GAME OVER', {
      fontSize: '48px',
      fontFamily: 'Arial Black, sans-serif',
      fontStyle: 'bold',
      color: '#FF4444',
      stroke: '#880000',
      strokeThickness: 6,
    }).setOrigin(0.5);

    // Score
    this.add.text(width / 2, height * 0.40, `Score: ${this.finalScore}`, {
      fontSize: '32px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#FFFFFF',
      stroke: '#0055AA',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // High score
    const prev = parseInt(localStorage.getItem('balloonBlaster_hi') || '0', 10);
    const isNew = this.finalScore > prev;
    if (isNew) {
      localStorage.setItem('balloonBlaster_hi', String(this.finalScore));
      this.add.text(width / 2, height * 0.50, '🏆 New Best!', {
        fontSize: '24px',
        fontFamily: 'Arial, sans-serif',
        color: '#FFD700',
      }).setOrigin(0.5);
    } else {
      this.add.text(width / 2, height * 0.50, `Best: ${prev}`, {
        fontSize: '22px',
        fontFamily: 'Arial, sans-serif',
        color: '#FFF9C4',
        stroke: '#885500',
        strokeThickness: 3,
      }).setOrigin(0.5);
    }

    // Play Again button
    const btnBg = this.add.graphics();
    btnBg.fillStyle(0x22AA44, 1);
    btnBg.fillRoundedRect(width / 2 - 110, height * 0.63, 220, 54, 14);

    const btn = this.add.text(width / 2, height * 0.63 + 27, 'PLAY AGAIN', {
      fontSize: '28px',
      fontFamily: 'Arial Black, sans-serif',
      fontStyle: 'bold',
      color: '#FFFFFF',
      stroke: '#006622',
      strokeThickness: 4,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => {
      btnBg.clear();
      btnBg.fillStyle(0x44CC66, 1);
      btnBg.fillRoundedRect(width / 2 - 110, height * 0.63, 220, 54, 14);
    });
    btn.on('pointerout', () => {
      btnBg.clear();
      btnBg.fillStyle(0x22AA44, 1);
      btnBg.fillRoundedRect(width / 2 - 110, height * 0.63, 220, 54, 14);
    });
    btn.on('pointerdown', () => this.scene.start('MenuScene'));

    // Menu button
    const menuBtn = this.add.text(width / 2, height * 0.76, 'Main Menu', {
      fontSize: '20px',
      fontFamily: 'Arial, sans-serif',
      color: '#AAAAAA',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    menuBtn.on('pointerover', () => menuBtn.setColor('#FFFFFF'));
    menuBtn.on('pointerout',  () => menuBtn.setColor('#AAAAAA'));
    menuBtn.on('pointerdown', () => this.scene.start('MenuScene'));
  }
}
```

**Step 2: Add `GameOverScene` to the config scenes array**

```js
scene: [MenuScene, GameScene, GameOverScene]
```

**Step 3: Verify full game loop**

```bash
npm run dev
```

- Play the game, let 3 balloons escape
- Game Over screen should appear with the final score
- If it's a new best, "🏆 New Best!" should appear
- PLAY AGAIN restarts the game
- Main Menu goes back to the menu with the updated Best score

**Step 4: Commit**

```bash
git add public/games/balloon-blaster/game/game.js
git commit -m "feat: add GameOverScene with high score persistence"
```

---

## Task 9: Run all tests and final verification

**Step 1: Run data validation tests**

```bash
npm test
```

Expected output:
```
✓ has at least one game
✓ every game has required fields
✓ getGame returns correct game by slug
✓ getGame returns undefined for unknown slug
```

All 4 tests pass.

**Step 2: Full local playthrough checklist**

```bash
npm run dev
```

Check each item manually:

- [ ] Homepage shows Balloon Blaster card with thumbnail
- [ ] Clicking the card opens the detail page
- [ ] Clicking Play Now opens the game in the iframe
- [ ] Menu shows title, best score (0 initially), and PLAY button
- [ ] Cannon rotates to follow mouse (won't aim downward)
- [ ] Clicking fires a gold projectile
- [ ] Balloons float upward from the bottom
- [ ] Popping a balloon increases score
- [ ] Letting 3 balloons escape shows Game Over screen
- [ ] Game Over shows correct score; high score saves to localStorage
- [ ] PLAY AGAIN restarts; Menu shows updated best score

**Step 3: Commit any final tweaks, then verify no uncommitted changes**

```bash
git status
```

Expected: `nothing to commit, working tree clean`

---

## Done

The game is fully implemented and tested locally. To deploy, follow the portal's deploy policy: push only once everything is verified.

```bash
git push
```
