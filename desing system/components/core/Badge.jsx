import React from 'react';

const tones = {
  neutral: { background: 'var(--surface-sunken)', color: 'var(--text-secondary)' },
  brand: { background: 'var(--brand-tint)', color: 'var(--brand-primary-deep)' },
  inverse: { background: 'var(--surface-inverse)', color: 'var(--text-on-inverse)' },
};

export function Badge({ children, tone = 'neutral', style }) {
  const t = tones[tone] || tones.neutral;
  return (
    <span style={{
      fontFamily: 'var(--font-sans)',
      font: 'var(--text-caption)',
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      padding: '4px 10px',
      borderRadius: 'var(--radius-pill)',
      display: 'inline-block',
      ...t,
      ...style,
    }}>
      {children}
    </span>
  );
}
