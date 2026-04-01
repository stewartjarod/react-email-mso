import type { OutlookProps } from './types';

export function Outlook({ children, not, expr, fallback }: OutlookProps) {
  if (fallback) {
    return (
      <>
        <mso-if>{fallback}</mso-if>
        <mso-else>{children}</mso-else>
      </>
    );
  }
  if (expr) return <mso-expr data-expr={expr}>{children}</mso-expr>;
  if (not) return <mso-else>{children}</mso-else>;
  return <mso-if>{children}</mso-if>;
}

/** @deprecated Use `<Outlook not>` instead */
export function NotOutlook({ children }: { children: React.ReactNode }) {
  return <Outlook not>{children}</Outlook>;
}

/** @deprecated Use `<Outlook expr="...">` instead */
export function OutlookExpr({ expr, children }: { expr: string; children: React.ReactNode }) {
  return <Outlook expr={expr}>{children}</Outlook>;
}
