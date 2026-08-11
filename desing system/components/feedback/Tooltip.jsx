import React from 'react';

export function Tooltip({ children, label }) {
  const [show, setShow] = React.useState(false);
  return (
    <span
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <span style={{
          position: 'absolute', bottom: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)',
          background: 'var(--surface-inverse)', color: 'var(--text-on-inverse)',
          font: 'var(--text-caption)', padding: '6px 10px', borderRadius: 'var(--radius-sm)',
          whiteSpace: 'nowrap', boxShadow: 'var(--shadow-md)', fontFamily: 'var(--font-sans)',
        }}>
          {label}
        </span>
      )}
    </span>
  );
}
