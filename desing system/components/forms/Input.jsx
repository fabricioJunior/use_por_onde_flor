import React from 'react';

export function Input({ label, helper, error, style, id, ...rest }) {
  const inputId = id || React.useId();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontFamily: 'var(--font-sans)', ...style }}>
      {label && <label htmlFor={inputId} style={{ font: 'var(--text-body-sm)', color: 'var(--text-secondary)' }}>{label}</label>}
      <input
        id={inputId}
        style={{
          font: 'var(--text-body)',
          padding: '12px 14px',
          borderRadius: 'var(--radius-sm)',
          border: `1px solid ${error ? 'var(--state-error)' : 'var(--border-default)'}`,
          background: 'var(--surface-card)',
          color: 'var(--text-primary)',
          outline: 'none',
        }}
        {...rest}
      />
      {(helper || error) && (
        <span style={{ font: 'var(--text-caption)', color: error ? 'var(--state-error)' : 'var(--text-muted)' }}>
          {error || helper}
        </span>
      )}
    </div>
  );
}
