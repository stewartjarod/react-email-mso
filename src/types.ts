import type { ReactNode } from 'react';

export type OutlookProps = {
  children: ReactNode;
  not?: boolean;
  expr?: string;
  fallback?: ReactNode;
};

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'mso-if': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
      'mso-else': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
      'mso-expr': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        'data-expr'?: string;
      };
    }
  }
}
