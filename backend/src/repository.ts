import type Database from 'better-sqlite3';
import { randomUUID } from 'node:crypto';
import type { Artwork, ArtworkFilters, ArtworkInput, ArtworkType } from './artwork.js';

interface ArtworkRow {
  id: string;
  title: string;
  artist: string;
  type: ArtworkType;
  price: number;
  availability: 0 | 1;
}

const COLUMNS = 'id, title, artist, type, price, availability';

const toArtwork = (row: ArtworkRow): Artwork => ({ ...row, availability: row.availability === 1 });

export class ArtworkRepository {
  constructor(private readonly db: Database.Database) {}

  findAll(filters: ArtworkFilters = {}): Artwork[] {
    const where: string[] = [];
    const params: Record<string, string> = {};

    if (filters.artist) {
      // partial match, case-insensitive for ASCII (SQLite LIKE): "picasso" finds "Pablo Picasso"
      where.push(`artist LIKE @artist ESCAPE '\\'`);
      params.artist = `%${filters.artist.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
    }
    if (filters.type) {
      where.push('type = @type');
      params.type = filters.type;
    }

    const order =
      filters.price === 'asc'
        ? 'price ASC, created_at ASC'
        : filters.price === 'desc'
          ? 'price DESC, created_at ASC'
          : 'created_at ASC';

    const sql = `SELECT ${COLUMNS} FROM artworks
                 ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
                 ORDER BY ${order}`;

    return (this.db.prepare(sql).all(params) as ArtworkRow[]).map(toArtwork);
  }

  findById(id: string): Artwork | undefined {
    const row = this.db.prepare(`SELECT ${COLUMNS} FROM artworks WHERE id = ?`).get(id) as
      | ArtworkRow
      | undefined;
    return row && toArtwork(row);
  }

  create(input: ArtworkInput): Artwork {
    const artwork: Artwork = { id: randomUUID(), ...input };
    this.db
      .prepare(
        `INSERT INTO artworks (id, title, artist, type, price, availability)
         VALUES (@id, @title, @artist, @type, @price, @availability)`,
      )
      .run({ ...artwork, availability: artwork.availability ? 1 : 0 });
    return artwork;
  }

  update(id: string, input: ArtworkInput): Artwork | undefined {
    const result = this.db
      .prepare(
        `UPDATE artworks
            SET title = @title, artist = @artist, type = @type,
                price = @price, availability = @availability
          WHERE id = @id`,
      )
      .run({ id, ...input, availability: input.availability ? 1 : 0 });
    return result.changes ? { id, ...input } : undefined;
  }

  delete(id: string): boolean {
    return this.db.prepare('DELETE FROM artworks WHERE id = ?').run(id).changes > 0;
  }
}
