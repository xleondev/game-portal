import gamesData from './games.json';

export interface Game {
  slug: string;
  title: string;
  description: string;
  thumbnail: string;
  tags: string[];
  featured: boolean;
  publishedAt: string;
}

export const games: Game[] = gamesData as Game[];

export function getGame(slug: string): Game | undefined {
  return games.find((g) => g.slug === slug);
}
