import type { ReactNode } from 'react';

export type OutlookProps = {
  children: ReactNode;
  /** Emit the downlevel-revealed pattern so content is visible to non-MSO clients. */
  not?: boolean;
  expr?: string;
  fallback?: ReactNode;
};

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'mso-expr': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        'data-expr'?: string;
      };
      'mso-else-expr': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        'data-expr'?: string;
      };
    }
  }
}
