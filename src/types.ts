import type { ReactNode } from 'react';

export type OutlookProps = {
  children: ReactNode;
};

export type NotOutlookProps = {
  children: ReactNode;
};

export type OutlookExprProps = {
  expr: string;
  children: ReactNode;
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
