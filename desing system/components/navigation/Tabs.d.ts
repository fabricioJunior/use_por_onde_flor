import * as React from 'react';

export interface TabItem { value: string; label: string; }

/** Navegação por abas (ex: Descrição / Avaliações / Guia de medidas). */
export interface TabsProps {
  items: TabItem[];
  active: string;
  onChange?: (value: string) => void;
  style?: React.CSSProperties;
}

export declare function Tabs(props: TabsProps): JSX.Element;
