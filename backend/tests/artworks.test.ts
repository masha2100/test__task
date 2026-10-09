import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { createDatabase } from '../src/db.js';
import { ArtworkRepository } from '../src/repository.js';

const valid = {
  title: 'Sunset Over the Ocean',
  artist: 'Claude Monet',
  type: 'painting',
  price: 4500,
  availability: true,
};

let app: ReturnType<typeof createApp>;

beforeEach(() => {
  app = createApp(new ArtworkRepository(createDatabase(':memory:')));
});

describe('GET /artworks', () => {
  it('returns the 4 seeded artworks', async () => {
    const res = await request(app).get('/artworks');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(4);
  });

  it('sorts by price asc and desc', async () => {
    const asc = (await request(app).get('/artworks?price=asc')).body.map((a: any) => a.price);
    const desc = (await request(app).get('/artworks?price=desc')).body.map((a: any) => a.price);
    expect(asc).toEqual([...asc].sort((a, b) => a - b));
    expect(desc).toEqual([...asc].reverse());
  });

  it('filters by artist (case-insensitive, partial) and by type', async () => {
    const byArtist = await request(app).get('/artworks?artist=maria');
    expect(byArtist.body.map((a: any) => a.artist)).toEqual(['Maria Gonzales']);

    const byType = await request(app).get('/artworks?type=painting');
    expect(byType.body.every((a: any) => a.type === 'painting')).toBe(true);
    expect(byType.body).toHaveLength(2);
  });

  it('combines sorting and filters', async () => {
    const res = await request(app).get('/artworks?price=desc&type=painting');
    expect(res.body.map((a: any) => a.price)).toEqual([5500, 3500]);
  });

  it('treats % and _ in the artist filter literally', async () => {
    const res = await request(app).get('/artworks?artist=%25');
    expect(res.body).toHaveLength(0);
  });

  it('rejects invalid query parameters with 400', async () => {
    expect((await request(app).get('/artworks?price=up')).status).toBe(400);
    expect((await request(app).get('/artworks?type=poem')).status).toBe(400);
    expect((await request(app).get('/artworks?foo=bar')).status).toBe(400);
  });
});

describe('GET /artworks/:id', () => {
  it('returns one artwork', async () => {
    const res = await request(app).get('/artworks/3');
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Geometric Harmony');
  });

  it('returns 404 for unknown id', async () => {
    expect((await request(app).get('/artworks/nope')).status).toBe(404);
  });
});

describe('POST /artworks', () => {
  it('creates an artwork and returns 201', async () => {
    const res = await request(app).post('/artworks').send(valid);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject(valid);
    expect(typeof res.body.id).toBe('string');
    expect(res.headers.location).toBe(`/artworks/${res.body.id}`);

    const list = await request(app).get('/artworks');
    expect(list.body).toHaveLength(5);
  });

  it('defaults availability to true and trims strings', async () => {
    const { availability, ...rest } = valid;
    const res = await request(app)
      .post('/artworks')
      .send({ ...rest, title: '  Padded  ' });
    expect(res.status).toBe(201);
    expect(res.body.availability).toBe(true);
    expect(res.body.title).toBe('Padded');
  });

  it.each([
    ['missing title', { ...valid, title: undefined }],
    ['blank title', { ...valid, title: '   ' }],
    ['title over 99 chars', { ...valid, title: 'a'.repeat(100) }],
    ['missing artist', { ...valid, artist: undefined }],
    ['artist over 50 chars', { ...valid, artist: 'a'.repeat(51) }],
    ['unknown type', { ...valid, type: 'poem' }],
    ['missing type', { ...valid, type: undefined }],
    ['price = 0', { ...valid, price: 0 }],
    ['negative price', { ...valid, price: -5 }],
    ['price as string', { ...valid, price: '4500' }],
    ['missing price', { ...valid, price: undefined }],
    ['availability not boolean', { ...valid, availability: 'yes' }],
    ['unknown field', { ...valid, id: '999' }],
  ])('returns 400 for %s', async (_name, body) => {
    const res = await request(app).post('/artworks').send(body);
    expect(res.status).toBe(400);
    expect(res.body.details.length).toBeGreaterThan(0);
  });

  it('accepts boundary values (99 / 50 chars)', async () => {
    const res = await request(app)
      .post('/artworks')
      .send({ ...valid, title: 'a'.repeat(99), artist: 'b'.repeat(50), price: 0.01 });
    expect(res.status).toBe(201);
  });

  it('returns 400 for malformed JSON', async () => {
    const res = await request(app)
      .post('/artworks')
      .set('Content-Type', 'application/json')
      .send('{"title": ');
    expect(res.status).toBe(400);
  });
});

describe('PUT /artworks/:id', () => {
  it('updates an artwork', async () => {
    const res = await request(app)
      .put('/artworks/1')
      .send({ ...valid, price: 9999 });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: '1', price: 9999 });
    expect((await request(app).get('/artworks/1')).body.price).toBe(9999);
  });

  it('validates the body like POST', async () => {
    expect((await request(app).put('/artworks/1').send({ ...valid, price: -1 })).status).toBe(400);
  });

  it('returns 404 for unknown id', async () => {
    expect((await request(app).put('/artworks/nope').send(valid)).status).toBe(404);
  });
});

describe('DELETE /artworks/:id', () => {
  it('deletes an artwork', async () => {
    expect((await request(app).delete('/artworks/2')).status).toBe(204);
    expect((await request(app).get('/artworks/2')).status).toBe(404);
    expect((await request(app).get('/artworks')).body).toHaveLength(3);
  });

  it('returns 404 for unknown id', async () => {
    expect((await request(app).delete('/artworks/nope')).status).toBe(404);
  });
});
