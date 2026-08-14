import * as React from 'react';

/** Contêiner base — borda fina por padrão; `elevated` troca para sombra suave (sem borda). */
export interface CardProps {
  children: React.ReactNode;
  padding?: string;
  elevated?: boolean;
  style?: React.CSSProperties;
}

/**
 * @startingPoint section="Components" subtitle="Contêiner base com borda ou sombra suave" viewport="700x160"
 */
export declare function Card(props: CardProps): JSX.Element;
