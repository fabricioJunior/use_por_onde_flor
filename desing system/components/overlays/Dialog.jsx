import React from 'react';

export function Dialog({ open, onClose, title, children, footer }) {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'oklch(20% 0.01 75 / 0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }} onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--surface-card)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)',
          padding: 'var(--space-6)', minWidth: '360px', maxWidth: '480px', fontFamily: 'var(--font-sans)',
        }}
      >
        {title && <div style={{ font: 'var(--text-h3)', color: 'var(--text-primary)', marginBottom: 'var(--space-4)' }}>{title}</div>}
        <div style={{ font: 'var(--text-body)', color: 'var(--text-secondary)' }}>{children}</div>
        {footer && <div style={{ marginTop: 'var(--space-5)', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>{footer}</div>}
      </div>
    </div>
  );
}
