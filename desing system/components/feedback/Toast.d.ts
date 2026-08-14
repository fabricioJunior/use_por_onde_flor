import * as React from 'react';

/** Notificação temporária de canto de tela. */
export interface ToastProps {
  children: React.ReactNode;
  tone?: 'neutral' | 'success' | 'error';
  style?: React.CSSProperties;
}

export declare function Toast(props: ToastProps): JSX.Element;
