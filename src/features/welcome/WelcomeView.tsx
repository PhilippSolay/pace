import { useNavigate } from 'react-router-dom';
import type { CSSProperties } from 'react';
import Wordmark from '@/design-system/components/Wordmark';
import { setPreference } from '@/core/persistence/preferences';

/**
 * First-run Welcome screen. Per D022, Apple + email buttons are visible
 * for layout fidelity but all three actions route the user into
 * anonymous-start. v2 will wire real auth.
 *
 * See `.gsd/milestones/M001/slices/S03/S03-PLAN.md`.
 */

export default function WelcomeView() {
  const navigate = useNavigate();

  async function handleStart() {
    await setPreference('hasCompletedWelcome', true);
    navigate('/library', { replace: true });
  }

  const frameStyle: CSSProperties = {
    minHeight: '100dvh',
    background: 'var(--stage)',
    display: 'flex',
    flexDirection: 'column',
    padding: '54px 24px 34px',
    position: 'relative',
    overflow: 'hidden',
  };

  const heroStyle: CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  };

  const subtitleStyle: CSSProperties = {
    fontFamily: 'var(--font-display)',
    fontStyle: 'italic',
    fontWeight: 300,
    fontSize: 16,
    color: 'var(--ink-2)',
    marginTop: 20,
    letterSpacing: '-0.01em',
  };

  const metaRowStyle: CSSProperties = {
    marginTop: 64,
    display: 'flex',
    gap: 14,
    alignItems: 'center',
  };

  const metaLabelStyle: CSSProperties = {
    fontFamily: 'var(--font-mono)',
    fontSize: 8.5,
    letterSpacing: '0.22em',
    color: 'var(--ink-3)',
    fontWeight: 500,
  };

  const metaDotStyle: CSSProperties = {
    width: 2,
    height: 2,
    borderRadius: '50%',
    background: 'var(--ink-3)',
  };

  const actionStackStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    marginBottom: 14,
  };

  const primaryButtonStyle: CSSProperties = {
    height: 44,
    borderRadius: 'var(--r-md)',
    border: 'none',
    background: 'var(--ink)',
    color: '#0A0A0A',
    fontFamily: 'var(--font-ui)',
    fontSize: 13,
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    cursor: 'pointer',
  };

  const secondaryButtonStyle: CSSProperties = {
    height: 44,
    borderRadius: 'var(--r-md)',
    background: 'transparent',
    border: '1px solid var(--line-2)',
    color: 'var(--ink)',
    fontFamily: 'var(--font-ui)',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
  };

  const ghostButtonStyle: CSSProperties = {
    background: 'transparent',
    border: 'none',
    color: 'var(--ink-2)',
    fontFamily: 'var(--font-ui)',
    fontSize: 12,
    fontWeight: 400,
    padding: '12px 0 4px',
    cursor: 'pointer',
  };

  const legalStyle: CSSProperties = {
    fontFamily: 'var(--font-ui)',
    fontSize: 9.5,
    color: 'var(--ink-3)',
    textAlign: 'center',
    lineHeight: 1.5,
    padding: '0 20px',
  };

  return (
    <div style={frameStyle}>
      <div style={heroStyle}>
        <Wordmark size="hero" as="h1" />
        <div style={subtitleStyle}>Read one word at a time.</div>

        <div style={metaRowStyle}>
          <span style={metaLabelStyle}>FOCUSED</span>
          <span style={metaDotStyle} aria-hidden />
          <span style={metaLabelStyle}>NO STREAKS</span>
          <span style={metaDotStyle} aria-hidden />
          <span style={metaLabelStyle}>LOCAL-FIRST</span>
        </div>
      </div>

      <div style={actionStackStyle}>
        <button type="button" style={primaryButtonStyle} onClick={handleStart}>
          <svg width="13" height="15" viewBox="0 0 13 15" fill="currentColor" aria-hidden>
            <path d="M10.5 11.8c-.5.8-1.2 1.6-2.1 1.6-.8 0-1-.5-1.9-.5s-1.2.5-1.9.5c-.9 0-1.5-.8-2.1-1.7C1.2 9.8.7 7.5 1.5 5.9c.7-1.4 2-2.1 3.2-2.1.9 0 1.3.5 2.2.5s1.2-.5 2.2-.5c1.1 0 2.3.6 3 1.8-2.6 1.4-2.2 5 .1 6.2zM7.7 2.8c.4-.5.7-1.2.6-1.9-.6 0-1.3.4-1.8.9-.4.4-.8 1.1-.7 1.8.7 0 1.4-.4 1.9-.8z" />
          </svg>
          Continue with Apple
        </button>
        <button type="button" style={secondaryButtonStyle} onClick={handleStart}>
          Continue with email
        </button>
        <button type="button" style={ghostButtonStyle} onClick={handleStart}>
          Use without an account
        </button>
      </div>

      <div style={legalStyle}>
        By continuing, you accept our{' '}
        <span style={{ color: 'var(--ink-2)', textDecoration: 'underline' }}>Terms</span>{' '}
        and{' '}
        <span style={{ color: 'var(--ink-2)', textDecoration: 'underline' }}>Privacy Notice</span>.
      </div>
    </div>
  );
}
