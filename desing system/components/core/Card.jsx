import React from 'react';

export function Card({ children, padding = 'var(--space-5)', elevated = false, style }) {
  return (
    <div style={{
      background: 'var(--surface-card)',
      border: elevated ? 'none' : '1px solid var(--border-subtle)',
      boxShadow: elevated ? 'var(--shadow-md)' : 'none',
      borderRadius: 'var(--radius-md)',
      padding,
      ...style,
    }}>
      {children}
    </div>
  );
}
