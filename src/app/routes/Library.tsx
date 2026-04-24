import Wordmark from '@/design-system/components/Wordmark';
import Eyebrow from '@/design-system/components/Eyebrow';
import { RouteStub } from './_stub';

export default function Library() {
  return (
    <RouteStub>
      <Wordmark size="header" as="h1" />
      <Eyebrow style={{ marginTop: 32 }}>LIBRARY · TBD</Eyebrow>
    </RouteStub>
  );
}
