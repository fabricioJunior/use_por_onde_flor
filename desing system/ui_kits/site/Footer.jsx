import React from 'react';

export function Footer() {
  return (
    <footer style={{ background: 'var(--surface-inverse)', color: 'var(--text-on-inverse)' }}>
      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: 'var(--space-8) var(--container-padding)', display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 'var(--space-6)' }}>
        <div>
          <div style={{ font: 'var(--text-h3)', fontWeight: 300, marginBottom: 'var(--space-3)' }}>Por Onde Flor</div>
          <p style={{ font: 'var(--text-body-sm)', color: 'var(--color-neutral-300)', maxWidth: '260px' }}>Básico que acompanha,combina e transforma</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', font: 'var(--text-body-sm)', color: 'var(--color-neutral-300)' }}>
          <span style={{ color: 'var(--text-on-inverse)', font: 'var(--text-eyebrow)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-eyebrow)' }}>Loja</span>
          <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Novidades</a>
          <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Roupas</a>
          <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Acessórios</a>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', font: 'var(--text-body-sm)', color: 'var(--color-neutral-300)' }}>
          <span style={{ color: 'var(--text-on-inverse)', font: 'var(--text-eyebrow)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-eyebrow)' }}>Ajuda</span>
          <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Trocas e devoluções</a>
          <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Guia de medidas</a>
          <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Contato</a>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <span style={{ font: 'var(--text-eyebrow)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-eyebrow)' }}>Newsletter</span>
          <input placeholder="seu e-mail" style={{ padding: '10px 12px', border: '1px solid var(--color-neutral-600)', background: 'transparent', color: 'var(--text-on-inverse)', borderRadius: 'var(--radius-sm)', font: 'var(--text-body-sm)' }} />
        </div>
      </div>
      <div style={{ borderTop: '1px solid var(--color-neutral-800)', padding: 'var(--space-4) var(--container-padding)', font: 'var(--text-caption)', color: 'var(--color-neutral-400)', textAlign: 'center' }}>© 2026 Por Onde Flor</div>
    </footer>
  );
}
