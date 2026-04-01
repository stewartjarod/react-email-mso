import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { processConditionals } from '../process';
import { Column, Columns } from './columns';

describe('Columns', () => {
  it('renders ghost table for Outlook and inline-block divs for modern clients', () => {
    const html = renderToStaticMarkup(
      <Columns>
        <Column width={280}>
          <p>Left</p>
        </Column>
        <Column width={280}>
          <p>Right</p>
        </Column>
      </Columns>
    );
    const result = processConditionals(html);
    // Outlook ghost table
    expect(result).toContain('<!--[if mso]>');
    expect(result).toContain('width="280"');
    expect(result).toContain('valign="top"');
    // Modern inline-block
    expect(result).toContain('max-width:280px');
    expect(result).toContain('inline-block');
    // Content in both paths
    expect(result).toContain('Left');
    expect(result).toContain('Right');
    // No leaked custom elements
    expect(result).not.toContain('<mso-');
  });

  it('renders gap spacers between columns', () => {
    const html = renderToStaticMarkup(
      <Columns gap={20}>
        <Column width={280}>
          <p>A</p>
        </Column>
        <Column width={280}>
          <p>B</p>
        </Column>
      </Columns>
    );
    const result = processConditionals(html);
    // Outlook: gap td
    expect(result).toContain('width="20"');
    // Modern: gap div
    expect(result).toContain('width:20px');
  });

  it('handles three columns', () => {
    const html = renderToStaticMarkup(
      <Columns gap={10}>
        <Column width={180}>
          <p>One</p>
        </Column>
        <Column width={180}>
          <p>Two</p>
        </Column>
        <Column width={180}>
          <p>Three</p>
        </Column>
      </Columns>
    );
    const result = processConditionals(html);
    const tdCount = (result.match(/width="180"/g) || []).length;
    expect(tdCount).toBeGreaterThanOrEqual(3);
    expect(result).toContain('One');
    expect(result).toContain('Two');
    expect(result).toContain('Three');
    expect(result).not.toContain('<mso-');
  });
});
