import { applyQuery } from '../lib/query';
import type { Artwork, ArtworkInput, ArtworkQuery } from '../types';
import { SEED_ARTWORKS } from './seed';
import type { ArtworkService } from './service';

export const STORAGE_KEY = 'art-gallery:artworks';

type KeyValueStorage = Pick<Storage, 'getItem' | 'setItem'>;

const isArtwork = (v: unknown): v is Artwork =>
  typeof v === 'object' &&
  v !== null &&
  typeof (v as Artwork).id === 'string' &&
  typeof (v as Artwork).title === 'string' &&
  typeof (v as Artwork).artist === 'string' &&
  typeof (v as Artwork).type === 'string' &&
  typeof (v as Artwork).price === 'number' &&
  typeof (v as Artwork).availability === 'boolean';

const newId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

export class LocalStorageArtworkService implements ArtworkService {
  readonly mode = 'localStorage' as const;

  constructor(private readonly storage: KeyValueStorage = window.localStorage) {}

  /** Reads saved state; seeds the 4 default artworks on first launch or if data is corrupted. */
  private read(): Artwork[] {
    try {
      const raw = this.storage.getItem(STORAGE_KEY);
      if (raw !== null) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.every(isArtwork)) return parsed;
      }
    } catch {
      /* fall through to seeding */
    }
    this.write(SEED_ARTWORKS);
    return [...SEED_ARTWORKS];
  }

  private write(artworks: Artwork[]) {
    this.storage.setItem(STORAGE_KEY, JSON.stringify(artworks));
  }

  async list(query: ArtworkQuery) {
    return applyQuery(this.read(), query);
  }

  async create(input: ArtworkInput) {
    const artwork: Artwork = { id: newId(), ...input };
    this.write([...this.read(), artwork]);
    return artwork;
  }

  async remove(id: string) {
    this.write(this.read().filter((a) => a.id !== id));
  }
}
