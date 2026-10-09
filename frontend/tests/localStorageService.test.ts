import { beforeEach, describe, expect, it } from 'vitest';
import { LocalStorageArtworkService, STORAGE_KEY } from '../src/api/localStorageService';
import type { ArtworkQuery } from '../src/types';

class MemoryStorage {
  data = new Map<string, string>();
  getItem(k: string) {
    return this.data.get(k) ?? null;
  }
  setItem(k: string, v: string) {
    this.data.set(k, v);
  }
}

const all: ArtworkQuery = { artist: '', type: '', price: '' };
let storage: MemoryStorage;
let service: LocalStorageArtworkService;

beforeEach(() => {
  storage = new MemoryStorage();
  service = new LocalStorageArtworkService(storage);
});

describe('LocalStorageArtworkService', () => {
  it('seeds 4 artworks on first launch', async () => {
    expect(await service.list(all)).toHaveLength(4);
    expect(storage.getItem(STORAGE_KEY)).not.toBeNull();
  });

  it('persists created and deleted artworks across instances (page reload)', async () => {
    const created = await service.create({
      title: 'New',
      artist: 'Someone',
      type: 'digital',
      price: 10,
      availability: false,
    });
    await service.remove('1');

    const reloaded = new LocalStorageArtworkService(storage);
    const ids = (await reloaded.list(all)).map((a) => a.id);
    expect(ids).toContain(created.id);
    expect(ids).not.toContain('1');
    expect(ids).toHaveLength(4);
  });

  it('does not re-seed after the user deletes everything', async () => {
    for (const a of await service.list(all)) await service.remove(a.id);
    expect(await new LocalStorageArtworkService(storage).list(all)).toHaveLength(0);
  });

  it('sorts by price and filters by artist and type', async () => {
    const asc = (await service.list({ ...all, price: 'asc' })).map((a) => a.price);
    expect(asc).toEqual([1800, 3500, 5500, 11000]);
    const desc = (await service.list({ ...all, price: 'desc' })).map((a) => a.price);
    expect(desc).toEqual([11000, 5500, 3500, 1800]);

    expect((await service.list({ ...all, artist: 'LIAM' })).map((a) => a.title)).toEqual(['Geometric Harmony']);
    expect(await service.list({ ...all, type: 'painting' })).toHaveLength(2);
  });

  it('recovers from corrupted storage by re-seeding', async () => {
    storage.setItem(STORAGE_KEY, '{not json');
    expect(await service.list(all)).toHaveLength(4);
  });
});
