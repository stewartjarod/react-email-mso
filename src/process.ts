export function processConditionals(html: string): string {
  return html.replace(
    /<(\/?)(mso-(?:else-)?expr)([^>]*)>/g,
    (_, slash, tag, attrs) => {
      const isElse = tag === 'mso-else-expr';
      if (slash) return isElse ? '<!--<![endif]-->' : '<![endif]-->';
      const expr = attrs.match(/data-expr="([^"]+)"/)?.[1] ?? 'mso';
      return isElse ? `<!--[if ${expr}]><!-->` : `<!--[if ${expr}]>`;
    },
  );
}
