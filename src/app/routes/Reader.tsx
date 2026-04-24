import ReaderView from '@/features/reader/ReaderView';

export default function Reader() {
  // S02 demo ignores the :id param — the route loads the hardcoded sample.
  // S03 will read the id, look up the text in Dexie, and pass tokens down.
  return <ReaderView />;
}
