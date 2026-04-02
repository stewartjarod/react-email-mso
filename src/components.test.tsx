import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Outlook } from './components';
import { processConditionals } from './process';

describe('Outlook', () => {
  it('renders mso-only content by default', () => {
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
    const result = processConditionals(html);
    expect(result).toContain('<!--[if mso]>');
    expect(result).toContain('Outlook content');
    expect(result).not.toContain('<mso-');
  });

  it('renders versioned content when expr is set', () => {
    const html = renderToStaticMarkup(
      <Outlook expr="gte mso 9">
        <style>{'body { font-family: Calibri; }'}</style>
      </Outlook>
    );
    const result = processConditionals(html);
    expect(result).toContain('<!--[if gte mso 9]>');
    expect(result).not.toContain('<mso-');
  });

  it('not prop uses downlevel-revealed pattern (visible to non-MSO clients)', () => {
    const html = renderToStaticMarkup(
      <Outlook not>
        <div>Modern only</div>
      </Outlook>
    );
    const result = processConditionals(html);
    expect(result).toContain('<!--[if !mso]><!-->');
    expect(result).toContain('<!--<![endif]-->');
    expect(result).toContain('Modern only');
    expect(result).not.toContain('<mso-');
  });

  it('renders paired fallback + children blocks', () => {
    const html = renderToStaticMarkup(
      <Outlook fallback={<table><tbody><tr><td width="600">Ghost table</td></tr></tbody></table>}>
        <div style={{ maxWidth: 600 }}>Modern layout</div>
      </Outlook>
    );
    const result = processConditionals(html);
    expect(result).toMatch(/<!--\[if mso\]>.*Ghost table.*<!\[endif\]-->/s);
    expect(result).toMatch(/<!--\[if !mso\]><!-->.*Modern layout.*<!--<!\[endif\]-->/s);
    expect(result).not.toContain('<mso-');
  });

  it('fallback + expr: targets specific Outlook version', () => {
    const html = renderToStaticMarkup(
      <Outlook expr="gte mso 9" fallback={<table><tbody><tr><td>Outlook 9+</td></tr></tbody></table>}>
        <div>Everyone else</div>
      </Outlook>
    );
    const result = processConditionals(html);
    expect(result).toMatch(/<!--\[if gte mso 9\]>.*Outlook 9\+.*<!\[endif\]-->/s);
    expect(result).toMatch(/<!--\[if !\(gte mso 9\)\]><!-->.*Everyone else.*<!--<!\[endif\]-->/s);
    expect(result).not.toContain('<mso-');
  });
});
