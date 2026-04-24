import { useParams } from 'react-router-dom';
import Eyebrow from '@/design-system/components/Eyebrow';
import { RouteStub } from './_stub';

export default function Completion() {
  const { id } = useParams<{ id: string }>();
  const label = id ? `COMPLETION · ${id.slice(0, 8)}` : 'COMPLETION · TBD';
  return (
    <RouteStub>
      <Eyebrow>{label}</Eyebrow>
    </RouteStub>
  );
}
