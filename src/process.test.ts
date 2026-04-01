import { describe, expect, it } from 'vitest';
import { processConditionals } from './process';

describe('processConditionals', () => {
  it('converts mso-if to Outlook conditional comment', () => {
    const input = '<mso-if><table><tr><td>Outlook only</td></tr></table></mso-if>';
    const result = processConditionals(input);
    expect(result).toBe(
      '<!--[if mso]><table><tr><td>Outlook only</td></tr></table><![endif]-->'
    );
  });

  it('converts mso-else to not-mso downlevel-revealed pattern', () => {
    const input = '<mso-else><div>Modern clients only</div></mso-else>';
    const result = processConditionals(input);
    expect(result).toBe(
      '<!--[if !mso]><!--><div>Modern clients only</div><!--<![endif]-->'
    );
  });

  it('converts mso-expr to custom conditional expression', () => {
    const input = '<mso-expr data-expr="gte mso 9"><table></table></mso-expr>';
    const result = processConditionals(input);
    expect(result).toBe('<!--[if gte mso 9]><table></table><![endif]-->');
  });

  it('handles whitespace inside tags from Prettier formatting', () => {
    const input = '<mso-if\n><div>content</div></mso-if\n>';
    const result = processConditionals(input);
    expect(result).toBe('<!--[if mso]><div>content</div><![endif]-->');
  });

  it('leaves non-MSO HTML completely untouched', () => {
    const input = '<html><body><div>Hello</div></body></html>';
    const result = processConditionals(input);
    expect(result).toBe(input);
  });

  it('handles multiple MSO blocks in one HTML string', () => {
    const input = [
      '<div>',
      '<mso-if><table><tr><td>Ghost table</td></tr></table></mso-if>',
      '<mso-else><div>Modern layout</div></mso-else>',
      '</div>',
    ].join('');
    const result = processConditionals(input);
    expect(result).toContain('<!--[if mso]><table>');
    expect(result).toContain('<!--[if !mso]><!-->');
    expect(result).toContain('<!--<![endif]-->');
  });
});
