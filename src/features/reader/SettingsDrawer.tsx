/**
 * Pace PWA — Reader mid-session SettingsDrawer.
 *
 * A bottom-sheet surface that docks inside the reader stage (6 px inset
 * left/right, flush to the bottom) and exposes the tunables a reader
 * reaches for mid-session: WPM, font size, pin color. The full Settings
 * screen lives under /settings; this drawer is the quick-access subset
 * described in the brief §6.6.
 *
 * Preferences are read live from Dexie via `useLiveQuery` and written
 * through `setPreference`, so the render cycle here is fully reactive —
 * no local state for the drawn values.
 *
 * See: .gsd/milestones/M001/slices/S05/S05-PLAN.md
 */
import { useRef, type CSSProperties, type PointerEvent } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, DEFAULT_PREFERENCES, type UserPreferences } from '@/core/persistence/schema';
import { setPreference } from '@/core/persistence/preferences';

export interface SettingsDrawerProps {
  open: boolean;
  onClose: () => void;
}

const WPM_MIN = 150;
const WPM_MAX = 800;
const WPM_STEP = 10;
const FONT_SIZE_MIN = 36;
const FONT_SIZE_MAX = 120;
const FONT_SIZE_STEP = 2;

const PIN_PRESETS: ReadonlyArray<{ hex: string; name: string }> = [
  { hex: '#D94050', name: 'CRIMSON' },
  { hex: '#E0A04A', name: 'AMBER' },
  { hex: '#6FAE6A', name: 'SAGE' },
  { hex: '#5C8AE6', name: 'COBALT' },
  { hex: '#F0F0F2', name: 'BONE' },
];

function usePreferences(): UserPreferences {
  const prefs = useLiveQuery(() => db.preferences.get('singleton'), [], DEFAULT_PREFERENCES);
  return prefs ?? DEFAULT_PREFERENCES;
}

function pinColorName(hex: string): string {
  const match = PIN_PRESETS.find((preset) => preset.hex.toLowerCase() === hex.toLowerCase());
  return match ? match.name : 'CUSTOM';
}

function clampToStep(raw: number, min: number, max: number, step: number): number {
  const bounded = Math.min(Math.max(raw, min), max);
  const snapped = Math.round((bounded - min) / step) * step + min;
  return Math.min(Math.max(snapped, min), max);
}

interface SliderProps {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (next: number) => void;
}

function Slider({ value, min, max, step, onChange }: SliderProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const percent = ((value - min) / (max - min)) * 100;

  function updateFromEvent(event: PointerEvent<HTMLDivElement>): void {
    const node = trackRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    if (rect.width <= 0) return;
    const ratio = (event.clientX - rect.left) / rect.width;
    const next = clampToStep(min + ratio * (max - min), min, max, step);
    if (next !== value) onChange(next);
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>): void {
    event.currentTarget.setPointerCapture(event.pointerId);
    updateFromEvent(event);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>): void {
    if (event.buttons === 0) return;
    updateFromEvent(event);
  }

  const rootStyle: CSSProperties = {
    position: 'relative', height: 12, width: '100%', touchAction: 'none', cursor: 'pointer',
    marginTop: 10,
  };
  const trackStyle: CSSProperties = {
    position: 'absolute', top: 5, left: 0, right: 0, height: 2, background: 'var(--line-2)',
  };
  const fillStyle: CSSProperties = {
    position: 'absolute', top: 5, left: 0, height: 2,
    width: `${percent}%`, background: 'var(--accent)',
  };
  const thumbStyle: CSSProperties = {
    position: 'absolute', top: 1, left: `calc(${percent}% - 5px)`,
    width: 10, height: 10, borderRadius: '50%',
    background: 'var(--accent)', border: '2px solid var(--reader)',
    boxShadow: '0 0 0 1px var(--accent)',
  };

  return (
    <div ref={trackRef} style={rootStyle}
      onPointerDown={handlePointerDown} onPointerMove={handlePointerMove}
      role="slider" aria-valuemin={min} aria-valuemax={max} aria-valuenow={value}>
      <div style={trackStyle} />
      <div style={fillStyle} />
      <div style={thumbStyle} />
    </div>
  );
}

const EYEBROW_STYLE: CSSProperties = {
  fontFamily: 'var(--font-mono)', fontSize: 9,
  letterSpacing: '0.28em', color: 'var(--ink-3)', fontWeight: 500,
};
const ROW_LABEL_STYLE: CSSProperties = {
  fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--ink-2)',
};
const ROW_VALUE_STYLE: CSSProperties = {
  fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink)',
  fontWeight: 500, letterSpacing: '0.04em',
};
const SWATCH_BASE_STYLE: CSSProperties = {
  width: 24, height: 24, borderRadius: 'var(--r-sm)',
  border: '1px solid var(--line-2)', padding: 0, cursor: 'pointer',
};

export default function SettingsDrawer({ open, onClose }: SettingsDrawerProps) {
  const prefs = usePreferences();
  const customColorRef = useRef<HTMLInputElement | null>(null);

  if (!open) return null;

  const backdropStyle: CSSProperties = {
    position: 'fixed', inset: 0, background: 'transparent', zIndex: 40,
  };
  const sheetStyle: CSSProperties = {
    position: 'fixed', left: 6, right: 6, bottom: 0, zIndex: 41,
    background: 'rgba(22,22,28,0.96)', backdropFilter: 'blur(16px)',
    borderTopLeftRadius: 'var(--r-xl)', borderTopRightRadius: 'var(--r-xl)',
    borderTop: '1px solid var(--line-2)',
    borderLeft: '1px solid var(--line-2)',
    borderRight: '1px solid var(--line-2)',
    padding: '10px 20px 26px',
  };
  const handleStyle: CSSProperties = {
    width: 36, height: 3, background: 'var(--ink-3)', opacity: 0.5,
    borderRadius: 2, margin: '0 auto 16px',
  };

  // Stop pointer events from bubbling to the GestureLayer underneath —
  // otherwise dragging the WPM slider leftward registers as a swipe-left
  // and rewinds the reader 5 words on every release.
  const stopBubble = (event: PointerEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>) =>
    event.stopPropagation();

  return (
    <>
      <div
        style={backdropStyle}
        onClick={onClose}
        onPointerDown={stopBubble}
        onPointerUp={stopBubble}
        aria-hidden="true"
      />
      <div
        style={sheetStyle}
        role="dialog"
        aria-label="Reader settings"
        onClick={stopBubble}
        onPointerDown={stopBubble}
        onPointerMove={stopBubble}
        onPointerUp={stopBubble}
      >
        <div style={handleStyle} />

        <div style={EYEBROW_STYLE}>READING</div>

        <div style={{ marginTop: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div style={ROW_LABEL_STYLE}>Speed</div>
            <div style={ROW_VALUE_STYLE}>{prefs.wpm} WPM</div>
          </div>
          <Slider value={prefs.wpm} min={WPM_MIN} max={WPM_MAX} step={WPM_STEP}
            onChange={(v) => { void setPreference('wpm', v); }} />
        </div>

        <div style={{ marginTop: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div style={ROW_LABEL_STYLE}>Size</div>
            <div style={ROW_VALUE_STYLE}>{prefs.fontSize} PX</div>
          </div>
          <Slider value={prefs.fontSize} min={FONT_SIZE_MIN} max={FONT_SIZE_MAX} step={FONT_SIZE_STEP}
            onChange={(v) => { void setPreference('fontSize', v); }} />
        </div>

        <div style={{ ...EYEBROW_STYLE, marginTop: 22, marginBottom: 10 }}>
          PIN · {pinColorName(prefs.pinColor)}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {PIN_PRESETS.map((preset) => {
            const isActive = preset.hex.toLowerCase() === prefs.pinColor.toLowerCase();
            const swatchStyle: CSSProperties = {
              ...SWATCH_BASE_STYLE, background: preset.hex,
              boxShadow: isActive ? '0 0 0 2px var(--accent)' : 'none',
            };
            return (
              <button key={preset.hex} type="button" aria-label={`Pin color ${preset.name}`}
                aria-pressed={isActive} style={swatchStyle}
                onClick={() => { void setPreference('pinColor', preset.hex); }} />
            );
          })}
          <button type="button" aria-label="Custom pin color"
            style={{
              ...SWATCH_BASE_STYLE, border: '1px dashed var(--line-2)',
              background: 'transparent', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: 'var(--ink-3)',
            }}
            onClick={() => customColorRef.current?.click()}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
              <path d="M5 1v8M1 5h8" />
            </svg>
          </button>
          <input ref={customColorRef} type="color" value={prefs.pinColor}
            onChange={(e) => { void setPreference('pinColor', e.target.value); }}
            style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }}
            aria-hidden="true" tabIndex={-1} />
        </div>
      </div>
    </>
  );
}
