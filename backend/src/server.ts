import { createApp } from './app.js';
import { createDatabase } from './db.js';
import { ArtworkRepository } from './repository.js';

const PORT = Number(process.env.PORT ?? 8000);
const DB_PATH = process.env.DB_PATH ?? 'data/gallery.db';

const db = createDatabase(DB_PATH);
const app = createApp(new ArtworkRepository(db));

const server = app.listen(PORT, () => {
  console.log(`Art Gallery API listening on http://localhost:${PORT}`);
});

const shutdown = () => {
  server.close(() => {
    db.close();
    process.exit(0);
  });
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
