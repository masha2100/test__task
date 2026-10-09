import { useCallback, useEffect, useState } from 'react';
import { artworkService } from './api';
import { AddArtworkModal } from './components/AddArtworkModal';
import { ArtworkCard } from './components/ArtworkCard';
import { Toolbar } from './components/Toolbar';
import { useDebouncedValue } from './hooks';
import type { Artwork, ArtworkInput, ArtworkQuery } from './types';

const INITIAL_QUERY: ArtworkQuery = { artist: '', type: '', price: '' };

export default function App() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [query, setQuery] = useState<ArtworkQuery>(INITIAL_QUERY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState('');

  // debounce only the free-text field; selects apply instantly
  const artist = useDebouncedValue(query.artist, 250);
  const { type, price } = query;

  const load = useCallback(async () => {
    setError('');
    try {
      setArtworks(await artworkService.list({ artist, type, price }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load artworks');
    } finally {
      setLoading(false);
    }
  }, [artist, type, price]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const closeModal = useCallback(() => setModalOpen(false), []);

  const handleCreate = async (input: ArtworkInput) => {
    const created = await artworkService.create(input);
    await load();
    setToast(`“${created.title}” added to the gallery`);
  };

  const handleDelete = async (id: string) => {
    try {
      await artworkService.remove(id);
      setArtworks((list) => list.filter((a) => a.id !== id));
      setToast('Artwork removed');
    } catch (e) {
      setToast(e instanceof Error ? e.message : 'Could not remove the artwork');
      throw e;
    }
  };

  const filtered = Boolean(query.artist || query.type);

  return (
    <div className="app">
      <header className="header">
        <div className="container header__inner">
          <span className="logo">
            <span className="logo__mark" aria-hidden="true" />
            ArtGalleryManager
          </span>
          <span className="mode" title="Where the gallery data is stored">
            {artworkService.mode === 'api' ? 'Connected to API' : 'Saved in this browser'}
          </span>
        </div>
      </header>

      <main className="container main">
        <div className="main__head">
          <h1>Explore Our Collection</h1>
          <button type="button" className="btn btn--primary" onClick={() => setModalOpen(true)}>
            + Add New Artwork
          </button>
        </div>

        <Toolbar query={query} onChange={setQuery} />

        {!loading && !error && (
          <p className="count" aria-live="polite">
            {artworks.length} {artworks.length === 1 ? 'artwork' : 'artworks'}
          </p>
        )}

        {loading ? (
          <div className="grid">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="card card--skeleton" />
            ))}
          </div>
        ) : error ? (
          <div className="state state--error">
            <p>{error}</p>
            <button type="button" className="btn btn--outline" onClick={load}>
              Try again
            </button>
          </div>
        ) : artworks.length === 0 ? (
          <div className="state">
            <p>{filtered ? 'No artworks match these filters.' : 'The gallery is empty.'}</p>
            {filtered ? (
              <button type="button" className="btn btn--outline" onClick={() => setQuery(INITIAL_QUERY)}>
                Clear filters
              </button>
            ) : (
              <button type="button" className="btn btn--primary" onClick={() => setModalOpen(true)}>
                Add the first artwork
              </button>
            )}
          </div>
        ) : (
          <div className="grid">
            {artworks.map((a) => (
              <ArtworkCard key={a.id} artwork={a} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </main>

      <footer className="footer">
        <div className="container">
          <strong>ArtGalleryManager</strong>
          <p>Your go-to platform for managing and exploring exquisite art pieces.</p>
        </div>
      </footer>

      {modalOpen && <AddArtworkModal onClose={closeModal} onSubmit={handleCreate} />}
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}
