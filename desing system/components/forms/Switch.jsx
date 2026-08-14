import React from 'react';

export function Switch({ checked, onChange, label, style }) {
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', fontFamily: 'var(--font-sans)', font: 'var(--text-body-sm)', color: 'var(--text-primary)', cursor: 'pointer', ...style }}>
      <span
        onClick={() => onChange && onChange({ target: { checked: !checked } })}
        style={{
          width: '38px', height: '22px', borderRadius: 'var(--radius-pill)',
          background: checked ? 'var(--brand-primary-deep)' : 'var(--color-neutral-300)',
          position: 'relative', transition: 'background var(--duration-fast) var(--ease-standard)', flexShrink: 0,
        }}
      >
        <span style={{
          position: 'absolute', top: '2px', left: checked ? '18px' : '2px',
          width: '18px', height: '18px', borderRadius: '50%', background: '#fff',
          transition: 'left var(--duration-fast) var(--ease-standard)', boxShadow: 'var(--shadow-sm)',
        }} />
      </span>
      {label}
    </label>
  );
}
