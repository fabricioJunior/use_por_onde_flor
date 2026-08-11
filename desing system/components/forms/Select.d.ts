import * as React from 'react';

export interface SelectOption { value: string; label: string; }

/** Seletor nativo estilizado — usado para tamanho, cor, ordenação. */
export interface SelectProps {
  label?: string;
  options: SelectOption[];
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLSelectElement>;
  style?: React.CSSProperties;
}

export declare function Select(props: SelectProps): JSX.Element;
