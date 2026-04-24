import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function Share() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const title = params.get('title') ?? '';
    const text = params.get('text') ?? '';
    const url = params.get('url') ?? '';

    // If we got a URL without body text, treat the URL as the text (the user
    // is sharing a link; v1 doesn't extract articles — paste the URL so the
    // user sees what they shared).
    const body = text || url;

    // Stash for PasteTextView to pick up. Using sessionStorage so it survives
    // the navigate call but is scoped to this browsing session.
    sessionStorage.setItem(
      'pace:shareDraft',
      JSON.stringify({ title, content: body }),
    );
    navigate('/new/paste?from=share', { replace: true });
  }, [params, navigate]);

  return <div style={{ minHeight: '100dvh', background: 'var(--stage)' }} />;
}
