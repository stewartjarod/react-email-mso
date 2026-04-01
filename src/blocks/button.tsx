import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Outlook } from '../components';

export type BulletproofButtonProps = {
  href: string;
  children: ReactNode;
  color?: string;
  textColor?: string;
  width?: number;
  height?: number;
  borderRadius?: number;
  fontFamily?: string;
  fontSize?: number;
};

function escapeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function BulletproofButton({
  href,
  children,
  color = '#007bff',
  textColor = '#ffffff',
  width = 200,
  height = 40,
  borderRadius = 4,
  fontFamily = 'sans-serif',
  fontSize = 16,
}: BulletproofButtonProps) {
  const arcsize = Math.min(
    Math.round((borderRadius / (Math.min(width, height) / 2)) * 100),
    100,
  );

  const safeHref = escapeAttr(href);
  const safeColor = escapeAttr(color);
  const safeTextColor = escapeAttr(textColor);
  const safeFontFamily = escapeAttr(fontFamily);
  const buttonText = typeof children === 'string'
    ? escapeAttr(children)
    : renderToStaticMarkup(<>{children}</>);

  const vmlButton = (
    <table
      role="presentation"
      cellSpacing={0}
      cellPadding={0}
      border={0}
    >
      <tbody>
        <tr>
          <td
            align="center"
            style={{ borderRadius }}
            dangerouslySetInnerHTML={{
              __html: `<v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${safeHref}" style="height:${height}px;v-text-anchor:middle;width:${width}px;" arcsize="${arcsize}%" stroke="f" fillcolor="${safeColor}"><w:anchorlock/><center style="color:${safeTextColor};font-family:${safeFontFamily};font-size:${fontSize}px;">${buttonText}</center></v:roundrect>`,
            }}
          />
        </tr>
      </tbody>
    </table>
  );

  return (
    <Outlook fallback={vmlButton}>
      <a
        href={href}
        style={{
          backgroundColor: color,
          borderRadius,
          color: textColor,
          display: 'inline-block',
          fontFamily,
          fontSize,
          fontWeight: 'bold',
          lineHeight: `${height}px`,
          textAlign: 'center',
          textDecoration: 'none',
          width,
        }}
      >
        {children}
      </a>
    </Outlook>
  );
}
