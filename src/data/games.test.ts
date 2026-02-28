import { describe, it, expect } from 'vitest';
import { games, getGame } from './games';

describe('games data', () => {
  it('has at least one game', () => {
    expect(games.length).toBeGreaterThan(0);
  });

  it('every game has required fields', () => {
    for (const game of games) {
      expect(game.slug).toBeTruthy();
      expect(game.title).toBeTruthy();
      expect(game.description).toBeTruthy();
      expect(game.tags).toBeInstanceOf(Array);
      expect(game.thumbnail).toBeTruthy();
      expect(game.publishedAt).toBeTruthy();
    }
  });

  it('getGame returns correct game by slug', () => {
    const game = getGame('astro-dash');
    expect(game?.title).toBe('Astro Dash');
  });

  it('getGame returns undefined for unknown slug', () => {
    expect(getGame('unknown')).toBeUndefined();
  });
});
