import type { ReactElement, ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

export type GhostTableProps = {
  /**
   * Render prop receiving a slot placeholder. The returned tree is the
   * Outlook-only scaffolding; the slot argument marks where `children`
   * should appear inside that tree.
   */
  wrapper: (slot: ReactNode) => ReactElement;
  /** Universal content — rendered once for every client. */
  children: ReactNode;
  /** Override the default `mso` condition expression. */
  expr?: string;
};

const SLOT_MARKUP = '<ghost-slot-marker></ghost-slot-marker>';

export function GhostTable({ wrapper, children, expr = 'mso' }: GhostTableProps) {
  const markup = renderToStaticMarkup(wrapper(<ghost-slot-marker />));
  const idx = markup.indexOf(SLOT_MARKUP);

  if (idx === -1) {
    throw new Error(
      'GhostTable: wrapper must render the slot argument inside its tree',
    );
  }
  if (markup.indexOf(SLOT_MARKUP, idx + SLOT_MARKUP.length) !== -1) {
    throw new Error('GhostTable: slot must appear exactly once in wrapper');
  }

  const before = markup.slice(0, idx);
  const after = markup.slice(idx + SLOT_MARKUP.length);

  return (
    <>
      <mso-expr
        data-expr={expr}
        dangerouslySetInnerHTML={{ __html: before }}
      />
      {children}
      <mso-expr
        data-expr={expr}
        dangerouslySetInnerHTML={{ __html: after }}
      />
    </>
  );
}
