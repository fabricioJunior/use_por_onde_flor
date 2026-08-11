import * as React from 'react';

/** Campo de texto com label, helper text e estado de erro opcionais. */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helper?: string;
  error?: string;
  style?: React.CSSProperties;
}

/**
 * @startingPoint section="Components" subtitle="Campo de texto com label e erro" viewport="700x140"
 */
export declare function Input(props: InputProps): JSX.Element;
