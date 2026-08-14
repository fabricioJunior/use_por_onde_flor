import React from 'react';

export function Select({ label, options = [], style, id, ...rest }) {
  const selectId = id || React.useId();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontFamily: 'var(--font-sans)', ...style }}>
      {label && <label htmlFor={selectId} style={{ font: 'var(--text-body-sm)', color: 'var(--text-secondary)' }}>{label}</label>}
      <select
        id={selectId}
        style={{
          font: 'var(--text-body)',
          padding: '12px 14px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-default)',
          background: 'var(--surface-card)',
          color: 'var(--text-primary)',
          outline: 'none',
        }}
        {...rest}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
