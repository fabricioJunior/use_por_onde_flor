import * as React from 'react';

/** Dica contextual ao passar o mouse sobre o filho. */
export interface TooltipProps {
  children: React.ReactNode;
  label: string;
}

export declare function Tooltip(props: TooltipProps): JSX.Element;
