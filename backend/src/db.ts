import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import type { ArtworkInput } from './artwork.js';

export const SEED_ARTWORKS: (ArtworkInput & { id: string })[] = [
  { id: '1', title: 'Abstract Vibrance', artist: 'Alex Johnson', type: 'painting', price: 5500, availability: true },
  { id: '2', title: 'Tranquil Lake', artist: 'Maria Gonzales', type: 'painting', price: 3500, availability: true },
  { id: '3', title: 'Geometric Harmony', artist: 'Liam Smith', type: 'sculpture', price: 11000, availability: false },
  { id: '4', title: 'Silent Streets', artist: 'Yuki Tanaka', type: 'photography', price: 1800, availability: true },
];

export function createDatabase(filename: string): Database.Database {
  if (filename !== ':memory:') mkdirSync(dirname(filename), { recursive: true });

  const db = new Database(filename);
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS artworks (
      id           TEXT PRIMARY KEY,
      title        TEXT    NOT NULL CHECK (length(title) BETWEEN 1 AND 99),
      artist       TEXT    NOT NULL CHECK (length(artist) BETWEEN 1 AND 50),
      type         TEXT    NOT NULL,
      price        REAL    NOT NULL CHECK (price > 0),
      availability INTEGER NOT NULL DEFAULT 1 CHECK (availability IN (0, 1)),
      created_at   TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );
  `);

  const { count } = db.prepare('SELECT COUNT(*) AS count FROM artworks').get() as { count: number };
  if (count === 0) {
    const insert = db.prepare(
      `INSERT INTO artworks (id, title, artist, type, price, availability, created_at)
       VALUES (@id, @title, @artist, @type, @price, @availability, @createdAt)`,
    );
    const seed = db.transaction(() => {
      SEED_ARTWORKS.forEach((a, i) =>
        insert.run({
          ...a,
          availability: a.availability ? 1 : 0,
          // fixed, increasing timestamps keep the default order stable
          createdAt: new Date(Date.UTC(2024, 0, 1, 0, 0, i)).toISOString(),
        }),
      );
    });
    seed();
  }

  return db;
}
