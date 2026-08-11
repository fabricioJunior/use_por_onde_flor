import React from 'react';

export function Tag({ children, onRemove, style }) {
  return (
    <span style={{
      fontFamily: 'var(--font-sans)',
      font: 'var(--text-body-sm)',
      color: 'var(--text-primary)',
      background: 'var(--surface-card)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-pill)',
      padding: '6px 8px 6px 14px',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      ...style,
    }}>
      {children}
      {onRemove && (
        <button
          onClick={onRemove}
          aria-label="Remover"
          style={{
            width: '18px', height: '18px', borderRadius: '50%', border: 'none',
            background: 'var(--surface-sunken)', color: 'var(--text-secondary)',
            cursor: 'pointer', fontSize: '12px', lineHeight: 1, display: 'flex',
            alignItems: 'center', justifyContent: 'center', padding: 0,
          }}
        >×</button>
      )}
    </span>
  );
}
