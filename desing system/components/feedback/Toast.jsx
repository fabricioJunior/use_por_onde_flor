import React from 'react';

const tones = {
  neutral: { background: 'var(--surface-inverse)', color: 'var(--text-on-inverse)' },
  success: { background: 'var(--color-green-800)', color: '#fff' },
  error: { background: 'var(--state-error)', color: '#fff' },
};

export function Toast({ children, tone = 'neutral', style }) {
  const t = tones[tone] || tones.neutral;
  return (
    <div style={{
      fontFamily: 'var(--font-sans)',
      font: 'var(--text-body-sm)',
      padding: '14px 20px',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-lg)',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '10px',
      ...t,
      ...style,
    }}>
      {children}
    </div>
  );
}
