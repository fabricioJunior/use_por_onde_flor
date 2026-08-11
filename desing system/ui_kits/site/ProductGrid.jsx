import React from 'react';

const PRODUCTS = [
  { name: 'Vestido Linho Areia', price: 'R$ 349', badge: 'Novo' },
  { name: 'Calça Alfaiataria Bege', price: 'R$ 299', badge: null },
  { name: 'Camisa Seda Off-white', price: 'R$ 259', badge: null },
  { name: 'Blazer Atemporal Verde', price: 'R$ 429', badge: 'Novo' },
];

export function ProductGrid({ onAdd }) {
  return (
    <section style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: 'var(--space-9) var(--container-padding)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 'var(--space-6)' }}>
        <h2 style={{ font: 'var(--text-h2)', color: 'var(--text-primary)', margin: 0 }}>Novidades</h2>
        <a href="#" style={{ font: 'var(--text-body-sm)', color: 'var(--link-color)' }}>Ver tudo</a>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-5)' }}>
        {PRODUCTS.map((p) => (
          <div key={p.name} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div style={{
              position: 'relative', aspectRatio: '3/4',
              background: 'repeating-linear-gradient(135deg, var(--color-neutral-100) 0 12px, var(--color-neutral-200) 12px 24px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-md)',
            }}>
              <span style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--text-muted)' }}>foto do produto</span>
              {p.badge && (
                <span style={{ position: 'absolute', top: '10px', left: '10px', font: 'var(--text-caption)', textTransform: 'uppercase', letterSpacing: '0.06em', background: 'var(--surface-card)', color: 'var(--brand-primary-deep)', padding: '4px 10px', borderRadius: 'var(--radius-pill)' }}>{p.badge}</span>
              )}
            </div>
            <div style={{ font: 'var(--text-body)', color: 'var(--text-primary)' }}>{p.name}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ font: 'var(--text-body-sm)', color: 'var(--text-secondary)' }}>{p.price}</span>
              <button onClick={() => onAdd(p)} style={{
                font: 'var(--text-caption)', textTransform: 'uppercase', letterSpacing: '0.04em',
                background: 'none', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)',
                padding: '8px 14px', cursor: 'pointer', color: 'var(--text-primary)',
              }}>Adicionar</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
