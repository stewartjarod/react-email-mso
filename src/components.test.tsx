import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { NotOutlook, Outlook, OutlookExpr } from './components';
import { processConditionals } from './process';

describe('Outlook', () => {
  it('renders children wrapped in mso-if tags', () => {
    const html = renderToStaticMarkup(
      <Outlook>
        <table>
          <tbody>
            <tr>
              <td>Outlook content</td>
            </tr>
          </tbody>
        </table>
      </Outlook>
    );
    expect(html).toBe(
      '<mso-if><table><tbody><tr><td>Outlook content</td></tr></tbody></table></mso-if>'
    );
  });
});

describe('NotOutlook', () => {
  it('renders children wrapped in mso-else tags', () => {
    const html = renderToStaticMarkup(
      <NotOutlook>
        <div>Modern content</div>
      </NotOutlook>
    );
    expect(html).toBe('<mso-else><div>Modern content</div></mso-else>');
  });
});

describe('OutlookExpr', () => {
  it('renders children wrapped in mso-expr with data-expr attribute', () => {
    const html = renderToStaticMarkup(
      <OutlookExpr expr="gte mso 9">
        <style>{'body { font-family: Calibri; }'}</style>
      </OutlookExpr>
    );
    expect(html).toContain('data-expr="gte mso 9"');
    expect(html).toContain('<style>');
  });
});

describe('full pipeline', () => {
  it('Outlook component through processConditionals produces valid MSO output', () => {
    const html = renderToStaticMarkup(
      <div>
        <Outlook>
          <table>
            <tbody>
              <tr>
                <td width="600">Ghost table</td>
              </tr>
            </tbody>
          </table>
        </Outlook>
        <NotOutlook>
          <div style={{ maxWidth: 600 }}>Modern layout</div>
        </NotOutlook>
      </div>
    );
    const result = processConditionals(html);
    expect(result).toContain('<!--[if mso]>');
    expect(result).toContain('<![endif]-->');
    expect(result).toContain('<!--[if !mso]><!-->');
    expect(result).toContain('<!--<![endif]-->');
    expect(result).not.toContain('<mso-if>');
    expect(result).not.toContain('<mso-else>');
  });
});
