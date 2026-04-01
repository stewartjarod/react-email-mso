export function processConditionals(html: string): string {
  return html
    .replace(/<mso-if\s*>/g, '<!--[if mso]>')
    .replace(/<\/mso-if\s*>/g, '<![endif]-->')
    .replace(/<mso-else\s*>/g, '<!--[if !mso]><!-->')
    .replace(/<\/mso-else\s*>/g, '<!--<![endif]-->')
    .replace(/<mso-expr\s[^>]*data-expr="([^"]+)"[^>]*>/g, '<!--[if $1]>')
    .replace(/<\/mso-expr\s*>/g, '<![endif]-->');
}
