# University Games — Design Document

**Date:** 2026-03-01
**Status:** Approved

## Overview

8 standalone educational browser games set on a university campus. Each game is an independent portal entry, sharing no technical coupling. Target audience: kids aged 8–12. Content is curriculum-aligned, substantive, and designed for long-term replayability — not demo quality.

## Approach

**Option A — Independent Games** (selected)
Each game is a self-contained portal entry under its own slug. The campus location is baked into each game's visuals and narrative intro, but there is no shared hub or shell.

**Option C — Shared Visual Identity** (future enhancement)
Once all 8 games are live, retrofit a shared campus color palette, pixel-art character sprite, and UI chrome to make the series feel cohesive without technical coupling.

## Portal Structure

Each game follows the existing CLAUDE.md convention:

```
public/games/<slug>/
  game/
    index.html      ← game entry point
    ...             ← assets, JS, CSS
  thumbnail.svg     ← pixel-art SVG, campus-themed
```

Each gets a `games.json` entry with slug, title, description, thumbnail path, tags, featured flag, and publishedAt date.

## Games

### Build Order
Vanilla JS games first, Phaser 3 games after.

1. Word Quest → 2. Equation Rush → 3. History Hero → 4. Code Cracker → 5. Color Lab → 6. Budget Bites → 7. Lab Chaos → 8. Globe Trotter

---

### 1. Word Quest
- **Slug:** `word-quest`
- **Location:** Library
- **Tech:** Vanilla JS
- **Tags:** `vocabulary`, `language`, `puzzle`
- **Core mechanic:** 10×10 letter grid; player clicks and drags to highlight hidden words
- **Content:** 300+ words across 10 themed word banks (Animals, Space, Human Body, Weather, Countries, Technology, History, Nature, Emotions, Science)
- **Depth:** Each found word shows definition, example sentence, and a "did you know?" fact. 5 difficulty tiers (Grade 3–7 vocab). Word banks unlock sequentially. High score per bank saved to localStorage.

---

### 2. Equation Rush
- **Slug:** `equation-rush`
- **Location:** Math Hall
- **Tech:** Vanilla JS
- **Tags:** `math`, `arcade`, `puzzle`
- **Core mechanic:** Equations fall from top of a blackboard; player types the answer and presses Enter. 3 lives; miss 3 = game over. Speed increases every 10 correct answers.
- **Content:** 5 chapters — Addition/Subtraction (up to 1000), Multiplication/Division, Fractions, Percentages, Basic Algebra (solve for x). 50+ procedurally generated equations per chapter.
- **Depth:** Between chapters, a 30-second "Math Fact" card teaches a real concept. Personal best speed tracked per chapter. Equations generated fresh each session so content never exhausts.

---

### 3. History Hero
- **Slug:** `history-hero`
- **Location:** History Lecture Hall
- **Tech:** Vanilla JS
- **Tags:** `history`, `trivia`, `puzzle`
- **Core mechanic:** 8 historical event cards; player drags them onto a horizontal timeline. Submit checks order; wrong placements highlighted in red with correct year shown.
- **Content:** 150+ real historical events across 6 eras — Ancient Civilizations, Classical World, Middle Ages, Age of Exploration, Industrial Revolution, Modern World.
- **Depth:** Each correctly placed event reveals a 2-sentence insight about why it mattered. Unlockable Expert Mode with 12 events. Eras unlock sequentially.

---

### 4. Code Cracker
- **Slug:** `code-cracker`
- **Location:** Computer Lab
- **Tech:** Vanilla JS
- **Tags:** `coding`, `logic`, `puzzle`
- **Core mechanic:** Stack command blocks (move forward, turn left/right, repeat, if/else) to guide a robot through a grid maze to the exit.
- **Content:** 40 handcrafted levels across 4 concepts — Sequences, Loops, Conditionals, Functions.
- **Depth:** Each concept section opens with a short illustrated explanation. After each level, a real-world connection shown (e.g. "Loops are how Netflix decides what to show you next"). Bonus stars for solving in ≤ N commands. Teaches genuine computational thinking.

---

### 5. Color Lab
- **Slug:** `color-lab`
- **Location:** Art Studio
- **Tech:** Vanilla JS
- **Tags:** `art`, `creative`, `puzzle`
- **Core mechanic:** Three sliders control color mix; player matches a target color swatch. Score = delta-E color distance from target.
- **Content:** 3 modes — RGB Mixing (science of light), Pigment Mixing (art, CMY model), Color Theory (complementary, analogous, triadic). 60 target challenges.
- **Depth:** Each session opens with a 1-slide lesson on how the mode works. Inspired by how Pixar and artists use color — kids learn both art and physics. Bonus: limited-move challenge mode.

---

### 6. Budget Bites
- **Slug:** `budget-bites`
- **Location:** Cafeteria
- **Tech:** Vanilla JS
- **Tags:** `math`, `life-skills`, `puzzle`
- **Core mechanic:** Drag food items onto a tray; each item shows its fraction of the daily budget. Hit the target budget (within 5%) to win.
- **Content:** 30 meal scenarios across 3 contexts — School Cafeteria, Grocery Shopping for a family, Planning a Party.
- **Depth:** Fractions shown as visual portions, decimals, and percentages simultaneously. Real (approximated) food prices. Bonus "Nutrition Mode" balances food groups alongside cost.

---

### 7. Lab Chaos
- **Slug:** `lab-chaos`
- **Location:** Science Lab
- **Tech:** Phaser 3
- **Tags:** `science`, `chemistry`, `arcade`
- **Core mechanic:** Click and drag element tiles into a beaker. Correct combinations trigger animated reactions (color change, bubbles, smoke). Wrong combo = mild explosion, lose one attempt (3 per challenge).
- **Content:** 50 real chemical/scientific combinations across 4 lab environments — Kitchen Chemistry, Biology Lab, Physics Lab, Environmental Science. Sourced from middle-school science curriculum.
- **Depth:** Each reaction shows what happened, why it happened, and where it occurs in real life. 3 difficulty levels. Phaser 3 used for rich animations.

---

### 8. Globe Trotter
- **Slug:** `globe-trotter`
- **Location:** Geography Room
- **Tech:** Phaser 3
- **Tags:** `geography`, `trivia`, `puzzle`
- **Core mechanic:** SVG world map in Phaser; a question appears and player clicks the correct country or capital. Correct = green flash + points; wrong = red flash + location revealed.
- **Content:** 195 countries, 50 US states, 30 major world cities. 4 game modes — Capitals Quiz, Flag Recognition, Population Ranking, Continent Sorting. 20 questions per round.
- **Depth:** Each correct answer unlocks a 1-sentence cultural fact. Timed and untimed modes. Cumulative world map fills in as player discovers countries — visible progress toward exploring the whole world. High score saved to localStorage.

---

## Universal Features (All 8 Games)

- **Learn More screen** after each session: concept summary, not just a score
- **Session summary** shows what was learned alongside performance
- **Encouraging language** throughout: "Nice try — the answer was X, because..."
- **localStorage persistence** for high scores, unlocked content, and progress
- **No external links** — all educational content is self-contained within the game

## Future Enhancement (Option C)

When all 8 games are live, introduce a shared visual system:
- Campus color palette (warm stone + ivy green + sky blue)
- Shared pixel-art student character sprite
- Consistent UI chrome (score display, life indicators, progress bar)
- "University Collection" branding on the portal homepage
