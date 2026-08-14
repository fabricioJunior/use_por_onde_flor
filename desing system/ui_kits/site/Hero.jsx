import React from 'react';

export function Hero({ onCta }) {
  return (
    <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '560px' }}>
      <div style={{
        background: 'repeating-linear-gradient(135deg, var(--color-neutral-100) 0 14px, var(--color-neutral-200) 14px 28px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--text-muted)' }}>foto de campanha — still, fundo neutro</span>
      </div>
      <div style={{ background: 'var(--brand-tint)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'var(--container-padding)', gap: 'var(--space-5)' }}>
        <h1 style={{ font: 'var(--text-display)', color: 'var(--brand-primary)', margin: 0, letterSpacing: 'var(--tracking-tight)' }}>Peças atemporais para o dia a dia</h1>
        <p style={{ font: 'var(--text-h3)', color: 'var(--brand-primary-deep)', margin: 0, fontWeight: 400 }}>Para mulheres que vivem o básico com estilo</p>
        <p style={{ font: 'var(--text-body-lg)', color: 'var(--text-secondary)', margin: 0, maxWidth: '420px' }}>
          <strong style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>Atemporal</strong> · <strong style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>Jeans</strong> · <strong style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>Casual</strong> · <strong style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>Elegante</strong>
        </p>
        <button onClick={onCta} style={{
          font: 'var(--text-button)', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#fff',
          background: 'var(--brand-primary-deep)', border: 'none', borderRadius: 'var(--radius-sm)',
          padding: '16px 32px', width: 'fit-content', cursor: 'pointer',
        }}>Ver coleção</button>
      </div>
    </section>
  );
}
