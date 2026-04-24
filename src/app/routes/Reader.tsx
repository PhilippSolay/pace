import { useParams } from 'react-router-dom';
import Eyebrow from '@/design-system/components/Eyebrow';
import { RouteStub } from './_stub';

export default function Reader() {
  const { id } = useParams<{ id: string }>();
  const label = id ? `READER · ${id.slice(0, 8)}` : 'READER · SAMPLE';
  return (
    <RouteStub background="var(--reader)">
      <Eyebrow>{label}</Eyebrow>
    </RouteStub>
  );
}
