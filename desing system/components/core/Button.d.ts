import * as React from 'react';

/** Botão de ação padrão da marca — variantes sóbrias, sem gradientes. */
export interface ButtonProps {
  children: React.ReactNode;
  /** @default "primary" */
  variant?: 'primary' | 'secondary' | 'ghost';
  /** @default "md" */
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  icon?: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
}

/**
 * @startingPoint section="Components" subtitle="Botão de ação — primary/secondary/ghost" viewport="700x160"
 */
export declare function Button(props: ButtonProps): JSX.Element;
