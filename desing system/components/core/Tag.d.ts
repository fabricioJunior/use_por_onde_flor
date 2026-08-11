import * as React from 'react';

/** Chip removível — usado em filtros ativos (tamanho, cor, categoria). */
export interface TagProps {
  children: React.ReactNode;
  onRemove?: () => void;
  style?: React.CSSProperties;
}

export declare function Tag(props: TagProps): JSX.Element;
