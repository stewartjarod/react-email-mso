import type { OutlookProps } from './types';

export function Outlook({ children, not, expr, fallback }: OutlookProps) {
  const condition = expr ?? 'mso';
  const negated = expr ? `!(${expr})` : '!mso';

  if (fallback) {
    return (
      <>
        <mso-expr data-expr={condition}>{fallback}</mso-expr>
        <mso-else-expr data-expr={negated}>{children}</mso-else-expr>
      </>
    );
  }
  if (not) return <mso-else-expr data-expr={negated}>{children}</mso-else-expr>;
  return <mso-expr data-expr={condition}>{children}</mso-expr>;
}
