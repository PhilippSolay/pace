import Wordmark from '@/design-system/components/Wordmark';
import Eyebrow from '@/design-system/components/Eyebrow';
import { RouteStub } from './_stub';

export default function Welcome() {
  return (
    <RouteStub>
      <Wordmark size="hero" as="h1" />
      <Eyebrow style={{ marginTop: 20 }}>WELCOME · TBD</Eyebrow>
    </RouteStub>
  );
}
