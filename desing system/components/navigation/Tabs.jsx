import React from 'react';

export function Tabs({ items = [], active, onChange, style }) {
  return (
    <div style={{ display: 'flex', gap: '28px', borderBottom: '1px solid var(--border-subtle)', fontFamily: 'var(--font-sans)', ...style }}>
      {items.map((item) => {
        const isActive = item.value === active;
        return (
          <button
            key={item.value}
            onClick={() => onChange && onChange(item.value)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 12px 0',
              font: 'var(--text-body-sm)', color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
              borderBottom: isActive ? '2px solid var(--brand-primary-deep)' : '2px solid transparent',
              marginBottom: '-1px',
            }}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
