# Balloon Blaster — Game Design

**Date:** 2026-03-06
**Status:** Approved

## Overview

A colorful, cartoonish balloon shooter. A cannon at the bottom center of the screen rotates to follow the mouse. The player clicks to fire projectiles at balloons floating upward. Balloons that escape the top cost a life. Three lives total — survive as long as possible for a high score.

## Tech Stack

- **Engine:** Phaser 3.60.0 (via CDN, consistent with Astro Dash)
- **Language:** Vanilla JavaScript (ES modules)
- **Persistence:** localStorage for high score
- **Portal slug:** `balloon-blaster`

## Cannon Mechanic

- Cannon sprite at bottom center rotates to track the mouse cursor
- Rotation limited to ~160° arc (cannot aim straight down)
- Click to fire a projectile in the aimed direction
- No ammo limit; 0.3s cooldown between shots prevents spam
- Projectile travels in a straight line (no bullet gravity)

## Balloon Types

| Type   | Color         | Behavior                                    | Points |
|--------|---------------|---------------------------------------------|--------|
| Normal | Bright colors | Floats straight up, medium speed            | 10     |
| Fast   | Red           | Moves 2× faster                             | 20     |
| Tank   | Dark purple   | Takes 2 hits to pop                         | 30     |
| Golden | Gold/shimmer  | Rare spawn, high value                      | 50     |
| Bomb   | Black + fuse  | Chain explosion clears nearby balloons      | 25 + bonus |

## Difficulty Progression

- **0–30s:** Normal balloons only, slow spawn rate
- **Every 30s:** Spawn rate increases, balloon speed increases slightly
- **2:00+:** Fast and Tank balloons begin spawning
- **4:00+:** Golden and Bomb balloons join the mix

## Scenes

1. **MenuScene** — Title, high score, Start button
2. **GameScene** — Main gameplay loop
3. **GameOverScene** — Final score, high score saved to localStorage, Play Again button

## File Structure

```
public/games/balloon-blaster/
  game/
    index.html    ← Phaser 3 entry point
    game.js       ← All Phaser scenes (Menu, Game, GameOver)
    style.css     ← Full-screen canvas styles
  thumbnail.svg   ← Portal card thumbnail
```

## Games Registry Entry

```json
{
  "slug": "balloon-blaster",
  "title": "Balloon Blaster",
  "description": "Aim your cannon and pop colorful balloons before they escape! Special balloons bring chain explosions and bonus points — how long can you survive?",
  "thumbnail": "/games/balloon-blaster/thumbnail.svg",
  "tags": ["shooter", "arcade", "casual"],
  "featured": false,
  "publishedAt": "2026-03-06"
}
```
