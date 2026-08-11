import React from 'react';

export function Header({ cartCount = 0 }) {
  const [open, setOpen] = React.useState(false);
  const linkStyle = { color: 'var(--text-primary)', font: 'var(--text-body-sm)', textDecoration: 'none', letterSpacing: '0.02em' };
  return (
    <header style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--surface-card)' }}>
      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: '0 var(--container-padding)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '84px' }}>
        <img src="../../assets/logo/logo-primary-color.png" alt="Por Onde Flor" style={{ height: '56px' }} />
        <nav style={{ display: 'flex', gap: '32px' }}>
          <a href="#" style={linkStyle}>Novidades</a>
          <a href="#" style={linkStyle}>Roupas</a>
          <a href="#" style={linkStyle}>Acessórios</a>
          <a href="#" style={linkStyle}>Sobre</a>
        </nav>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <span style={{ font: 'var(--text-body-sm)', color: 'var(--text-secondary)' }}>Buscar</span>
          <span style={{ position: 'relative', font: 'var(--text-body-sm)', color: 'var(--text-primary)' }}>
            Sacola
            {cartCount > 0 && (
              <span style={{ position: 'absolute', top: '-8px', right: '-14px', background: 'var(--brand-primary-deep)', color: '#fff', borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{cartCount}</span>
            )}
          </span>
        </div>
      </div>
    </header>
  );
}
