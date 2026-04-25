import { useEffect, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getPreferences } from '@/core/persistence/preferences';
import { seedDefaultTextsIfEmpty } from '@/core/persistence/seed';

/**
 * Guards the router: if the user hasn't completed Welcome, force them
 * onto "/". Once completed, this becomes a pass-through.
 *
 * Renders null on first paint while the preferences row loads — the
 * transition is fast enough that showing a skeleton would cause flicker.
 *
 * See `.gsd/milestones/M001/slices/S03/S03-PLAN.md`.
 */

interface FirstRunGateProps {
  children: ReactNode;
}

export default function FirstRunGate({ children }: FirstRunGateProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const prefs = await getPreferences();
      // Seed default texts the first time the library is empty so new
      // users have something to read on day one. Idempotent.
      await seedDefaultTextsIfEmpty();
      if (cancelled) return;
      setHasCompleted(prefs.hasCompletedWelcome);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (!hasCompleted && pathname !== '/') {
      navigate('/', { replace: true });
    }
  }, [ready, hasCompleted, pathname, navigate]);

  // Re-poll preferences when the route changes — cheap, handles the
  // post-welcome transition without a live-query subscription.
  useEffect(() => {
    if (!ready) return;
    getPreferences().then((prefs) => setHasCompleted(prefs.hasCompletedWelcome));
  }, [pathname, ready]);

  if (!ready) return null;
  return <>{children}</>;
}
