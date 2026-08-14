import * as React from 'react';

/** Rótulo curto para estado/categoria (ex: "Nova coleção", "Esgotado"). */
export interface BadgeProps {
  children: React.ReactNode;
  /** @default "neutral" */
  tone?: 'neutral' | 'brand' | 'inverse';
  style?: React.CSSProperties;
}

export declare function Badge(props: BadgeProps): JSX.Element;
