import * as React from 'react';

export interface RadioProps {
  label?: string;
  checked: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  style?: React.CSSProperties;
}

export declare function Radio(props: RadioProps): JSX.Element;
