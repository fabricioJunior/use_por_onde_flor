import React from 'react';

export function Checkbox({ label, checked, onChange, style }) {
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', fontFamily: 'var(--font-sans)', font: 'var(--text-body-sm)', color: 'var(--text-primary)', cursor: 'pointer', ...style }}>
      <span style={{
        width: '18px', height: '18px', borderRadius: '4px',
        border: `1px solid ${checked ? 'var(--brand-primary-deep)' : 'var(--border-default)'}`,
        background: checked ? 'var(--brand-primary-deep)' : 'var(--surface-card)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        transition: 'background var(--duration-fast) var(--ease-standard)',
      }}>
        {checked && <span style={{ color: '#fff', fontSize: '12px', lineHeight: 1 }}>✓</span>}
      </span>
      <input type="checkbox" checked={checked} onChange={onChange} style={{ display: 'none' }} />
      {label}
    </label>
  );
}
