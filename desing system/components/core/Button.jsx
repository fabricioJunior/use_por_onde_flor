import React from 'react';

const sizes = {
  sm: { padding: '8px 16px', fontSize: '13px' },
  md: { padding: '12px 24px', fontSize: '14px' },
  lg: { padding: '16px 32px', fontSize: '15px' },
};

const variants = {
  primary: { background: 'var(--brand-primary-deep)', color: 'var(--text-on-brand)', border: '1px solid var(--brand-primary-deep)' },
  secondary: { background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border-default)' },
  ghost: { background: 'transparent', color: 'var(--text-primary)', border: '1px solid transparent' },
};

const variantsHover = {
  primary: { background: 'var(--brand-primary)', border: '1px solid var(--brand-primary)' },
  secondary: { background: 'var(--surface-sunken)' },
  ghost: { background: 'var(--surface-sunken)' },
};

export function Button({ children, variant = 'primary', size = 'md', disabled = false, icon = null, onClick, style, ...rest }) {
  const [hover, setHover] = React.useState(false);
  const base = variants[variant] || variants.primary;
  const hoverStyle = !disabled && hover ? variantsHover[variant] : {};
  return (
    <button
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      disabled={disabled}
      style={{
        fontFamily: 'var(--font-sans)',
        font: 'var(--text-button)',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        borderRadius: 'var(--radius-sm)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'background var(--duration-fast) var(--ease-standard), border-color var(--duration-fast) var(--ease-standard)',
        opacity: disabled ? 0.45 : 1,
        ...sizes[size],
        ...base,
        ...hoverStyle,
        ...style,
      }}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
