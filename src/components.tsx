import type { NotOutlookProps, OutlookExprProps, OutlookProps } from './types';

export function Outlook({ children }: OutlookProps) {
  return <mso-if>{children}</mso-if>;
}

export function NotOutlook({ children }: NotOutlookProps) {
  return <mso-else>{children}</mso-else>;
}

export function OutlookExpr({ expr, children }: OutlookExprProps) {
  return <mso-expr data-expr={expr}>{children}</mso-expr>;
}
