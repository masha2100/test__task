import { describe, expect, it } from 'vitest';
import { EMPTY_FORM, validateArtwork } from '../src/lib/validation';

const valid = { title: 'Water Lilies', artist: 'Claude Monet', type: 'painting', price: '4500', availability: true };

describe('validateArtwork', () => {
  it('accepts valid input and converts price to a number', () => {
    const r = validateArtwork(valid);
    expect(r).toEqual({ ok: true, data: { ...valid, price: 4500 } });
  });

  it('trims text fields', () => {
    const r = validateArtwork({ ...valid, title: '  A  ', artist: ' B ' });
    expect(r.ok && r.data).toMatchObject({ title: 'A', artist: 'B' });
  });

  it('reports every missing field on an empty form', () => {
    const r = validateArtwork(EMPTY_FORM);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.errors).sort()).toEqual(['artist', 'price', 'title', 'type']);
  });

  it('enforces title max length of 99', () => {
    expect(validateArtwork({ ...valid, title: 'a'.repeat(99) }).ok).toBe(true);
    expect(validateArtwork({ ...valid, title: 'a'.repeat(100) }).ok).toBe(false);
  });

  it('enforces artist max length of 50', () => {
    expect(validateArtwork({ ...valid, artist: 'a'.repeat(50) }).ok).toBe(true);
    expect(validateArtwork({ ...valid, artist: 'a'.repeat(51) }).ok).toBe(false);
  });

  it.each(['0', '0.0', '-5', 'abc', '12a', '1e3', '1,5', ' '])('rejects price %j', (price) => {
    expect(validateArtwork({ ...valid, price }).ok).toBe(false);
  });

  it.each(['1', '0.5', '4500', '99.99'])('accepts price %j', (price) => {
    expect(validateArtwork({ ...valid, price }).ok).toBe(true);
  });

  it('rejects unknown type', () => {
    expect(validateArtwork({ ...valid, type: 'poem' }).ok).toBe(false);
  });
});
