import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Outlook } from './components';
import { processConditionals } from './process';

describe('Outlook', () => {
  it('wraps children in mso-if by default', () => {
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

  it('wraps children in mso-else when not prop is set', () => {
    const html = renderToStaticMarkup(
      <Outlook not>
        <div>Modern content</div>
      </Outlook>
    );
    expect(html).toBe('<mso-else><div>Modern content</div></mso-else>');
  });

  it('wraps children in mso-expr when expr prop is set', () => {
    const html = renderToStaticMarkup(
      <Outlook expr="gte mso 9">
        <style>{'body { font-family: Calibri; }'}</style>
      </Outlook>
    );
    expect(html).toContain('data-expr="gte mso 9"');
    expect(html).toContain('<style>');
  });

  it('renders fallback in mso-if and children in mso-else', () => {
    const html = renderToStaticMarkup(
      <Outlook fallback={<table><tbody><tr><td width="600">Ghost table</td></tr></tbody></table>}>
        <div style={{ maxWidth: 600 }}>Modern layout</div>
      </Outlook>
    );
    // fallback (Outlook content) goes in mso-if
    expect(html).toContain('<mso-if><table>');
    // children (modern content) goes in mso-else
    expect(html).toContain('<mso-else><div');
    expect(html).toContain('Ghost table');
    expect(html).toContain('Modern layout');
  });

  it('full pipeline: fallback mode produces both conditional blocks', () => {
    const html = renderToStaticMarkup(
      <Outlook fallback={<table><tbody><tr><td>Outlook</td></tr></tbody></table>}>
        <div>Modern</div>
      </Outlook>
    );
    const result = processConditionals(html);
    expect(result).toContain('<!--[if mso]>');
    expect(result).toContain('<![endif]-->');
    expect(result).toContain('<!--[if !mso]><!-->');
    expect(result).toContain('<!--<![endif]-->');
    // Outlook content inside mso block
    expect(result).toMatch(/<!--\[if mso\]>.*Outlook.*<!\[endif\]-->/s);
    // Modern content inside not-mso block
    expect(result).toMatch(/<!--\[if !mso\]><!-->.*Modern.*<!--<!\[endif\]-->/s);
    expect(result).not.toContain('<mso-');
  });

  it('full pipeline: not mode produces valid not-mso output', () => {
    const html = renderToStaticMarkup(
      <div>
        <Outlook>
          <p>Outlook only</p>
        </Outlook>
        <Outlook not>
          <p>Modern only</p>
        </Outlook>
      </div>
    );
    const result = processConditionals(html);
    expect(result).toContain('<!--[if mso]>');
    expect(result).toContain('<!--[if !mso]><!-->');
    expect(result).not.toContain('<mso-if>');
    expect(result).not.toContain('<mso-else>');
  });
});
