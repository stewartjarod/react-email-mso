import { describe, expect, it } from 'vitest';
import { processConditionals } from './process';

describe('processConditionals', () => {
  it('converts mso-expr to conditional comment', () => {
    const input = '<mso-expr data-expr="mso"><table><tr><td>Outlook only</td></tr></table></mso-expr>';
    const result = processConditionals(input);
    expect(result).toBe(
      '<!--[if mso]><table><tr><td>Outlook only</td></tr></table><![endif]-->'
    );
  });

  it('converts mso-else-expr to downlevel-revealed pattern', () => {
    const input = '<mso-else-expr data-expr="!mso"><div>Modern clients only</div></mso-else-expr>';
    const result = processConditionals(input);
    expect(result).toBe(
      '<!--[if !mso]><!--><div>Modern clients only</div><!--<![endif]-->'
    );
  });

  it('converts custom expression', () => {
    const input = '<mso-expr data-expr="gte mso 9"><table></table></mso-expr>';
    const result = processConditionals(input);
    expect(result).toBe('<!--[if gte mso 9]><table></table><![endif]-->');
  });

  it('leaves non-MSO HTML completely untouched', () => {
    const input = '<html><body><div>Hello</div></body></html>';
    const result = processConditionals(input);
    expect(result).toBe(input);
  });

  it('handles multiple MSO blocks in one HTML string', () => {
    const input = [
      '<div>',
      '<mso-expr data-expr="mso"><table><tr><td>Ghost table</td></tr></table></mso-expr>',
      '<mso-else-expr data-expr="!mso"><div>Modern layout</div></mso-else-expr>',
      '</div>',
    ].join('');
    const result = processConditionals(input);
    expect(result).toContain('<!--[if mso]><table>');
    expect(result).toContain('<!--[if !mso]><!-->');
    expect(result).toContain('<!--<![endif]-->');
  });

  it('tolerates unexpected attributes on custom elements', () => {
    const input = '<mso-expr data-expr="mso" data-foo="bar"><p>content</p></mso-expr>';
    const result = processConditionals(input);
    expect(result).toBe('<!--[if mso]><p>content</p><![endif]-->');
  });
});
