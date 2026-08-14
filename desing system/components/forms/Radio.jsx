import React from 'react';

export function Radio({ label, checked, onChange, style }) {
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', fontFamily: 'var(--font-sans)', font: 'var(--text-body-sm)', color: 'var(--text-primary)', cursor: 'pointer', ...style }}>
      <span style={{
        width: '18px', height: '18px', borderRadius: '50%',
        border: `1px solid ${checked ? 'var(--brand-primary-deep)' : 'var(--border-default)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        {checked && <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--brand-primary-deep)' }} />}
      </span>
      <input type="radio" checked={checked} onChange={onChange} style={{ display: 'none' }} />
      {label}
    </label>
  );
}
