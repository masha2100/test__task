import cors from 'cors';
import express, { type ErrorRequestHandler, type Request, type Response } from 'express';
import { ARTWORK_TYPES } from './artwork.js';
import type { ArtworkRepository } from './repository.js';
import { artworkInputSchema, artworkQuerySchema, formatZodError } from './validation.js';

export function createApp(repo: ArtworkRepository) {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '100kb' }));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  /** Predefined artwork types, so clients don't have to hard-code them. */
  app.get('/artwork-types', (_req, res) => {
    res.json(ARTWORK_TYPES);
  });

  app.get('/artworks', (req: Request, res: Response) => {
    const parsed = artworkQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid query parameters', details: formatZodError(parsed.error) });
      return;
    }
    res.json(repo.findAll(parsed.data));
  });

  app.get('/artworks/:id', (req, res) => {
    const artwork = repo.findById(req.params.id);
    if (!artwork) {
      res.status(404).json({ error: `Artwork with id "${req.params.id}" not found` });
      return;
    }
    res.json(artwork);
  });

  app.post('/artworks', (req, res) => {
    const parsed = artworkInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: formatZodError(parsed.error) });
      return;
    }
    const created = repo.create(parsed.data);
    res.status(201).location(`/artworks/${created.id}`).json(created);
  });

  app.put('/artworks/:id', (req, res) => {
    const parsed = artworkInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: formatZodError(parsed.error) });
      return;
    }
    const updated = repo.update(req.params.id, parsed.data);
    if (!updated) {
      res.status(404).json({ error: `Artwork with id "${req.params.id}" not found` });
      return;
    }
    res.json(updated);
  });

  app.delete('/artworks/:id', (req, res) => {
    if (!repo.delete(req.params.id)) {
      res.status(404).json({ error: `Artwork with id "${req.params.id}" not found` });
      return;
    }
    res.status(204).end();
  });

  app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
  });

  const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    // malformed JSON body
    if (err?.type === 'entity.parse.failed') {
      res.status(400).json({ error: 'Request body must be valid JSON' });
      return;
    }
    if (err?.type === 'entity.too.large') {
      res.status(413).json({ error: 'Request body is too large' });
      return;
    }
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  };
  app.use(errorHandler);

  return app;
}
