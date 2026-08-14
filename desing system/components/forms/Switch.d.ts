import * as React from 'react';

export interface SwitchProps {
  checked: boolean;
  onChange?: (e: { target: { checked: boolean } }) => void;
  label?: string;
  style?: React.CSSProperties;
}

export declare function Switch(props: SwitchProps): JSX.Element;
