export function processConditionals(html: string): string {
  let depth = 0;
  return html.replace(
    /<(\/?)(mso-(?:else-)?expr)([^>]*)>/g,
    (_, slash, tag, attrs) => {
      const isElse = tag === 'mso-else-expr';
      if (slash) {
        depth = Math.max(0, depth - 1);
        if (depth === 0) return isElse ? '<!--<![endif]-->' : '<![endif]-->';
        return '<![endif]>';
      }
      const expr = attrs.match(/data-expr="([^"]+)"/)?.[1] ?? 'mso';
      const atTop = depth === 0;
      depth += 1;
      if (atTop) return isElse ? `<!--[if ${expr}]><!-->` : `<!--[if ${expr}]>`;
      return `<![if ${expr}]>`;
    },
  );
}
