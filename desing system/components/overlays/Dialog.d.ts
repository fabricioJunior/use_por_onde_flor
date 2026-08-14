import * as React from 'react';

/** Modal centralizado com overlay escuro semitransparente. */
export interface DialogProps {
  open: boolean;
  onClose?: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export declare function Dialog(props: DialogProps): JSX.Element | null;
