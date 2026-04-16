import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Outlook } from '../components';
import { processConditionals } from '../process';
import { GhostTable } from './ghost-table';

describe('GhostTable', () => {
  it('wraps children in Outlook-only scaffolding and renders universally otherwise', () => {
    const html = renderToStaticMarkup(
      <GhostTable
        wrapper={(slot) => (
          <table role="presentation" cellSpacing={0} cellPadding={0} border={0}>
            <tbody>
              <tr>
                <td width={600}>{slot}</td>
              </tr>
            </tbody>
          </table>
        )}
      >
        <div style={{ maxWidth: 600 }}>Universal content</div>
      </GhostTable>,
    );
    const result = processConditionals(html);

    expect(result).toContain('<!--[if mso]>');
    expect(result).toContain('<table');
    expect(result).toContain('width="600"');
    expect(result).toContain('<![endif]-->');
    expect(result).toContain('Universal content');
    expect(result).not.toContain('<ghost-slot-marker');
    expect(result).not.toContain('<mso-');
  });

  it('emits opening scaffolding before children and closing after', () => {
    const html = renderToStaticMarkup(
      <GhostTable
        wrapper={(slot) => (
          <table>
            <tbody>
              <tr>
                <td>{slot}</td>
              </tr>
            </tbody>
          </table>
        )}
      >
        <p>content</p>
      </GhostTable>,
    );
    const result = processConditionals(html);

    const openIdx = result.indexOf('<!--[if mso]><table');
    const contentIdx = result.indexOf('<p>content</p>');
    const closeIdx = result.indexOf('</table><![endif]-->');

    expect(openIdx).toBeGreaterThanOrEqual(0);
    expect(contentIdx).toBeGreaterThan(openIdx);
    expect(closeIdx).toBeGreaterThan(contentIdx);
  });

  it('accepts custom expr for version-targeted conditionals', () => {
    const html = renderToStaticMarkup(
      <GhostTable
        expr="gte mso 9"
        wrapper={(slot) => (
          <table>
            <tbody>
              <tr>
                <td>{slot}</td>
              </tr>
            </tbody>
          </table>
        )}
      >
        <div>content</div>
      </GhostTable>,
    );
    const result = processConditionals(html);
    expect(result).toContain('<!--[if gte mso 9]>');
    expect(result).not.toContain('<!--[if mso]>');
  });

  it('renders children exactly once (universal visibility)', () => {
    const html = renderToStaticMarkup(
      <GhostTable
        wrapper={(slot) => (
          <table>
            <tbody>
              <tr>
                <td>{slot}</td>
              </tr>
            </tbody>
          </table>
        )}
      >
        <div data-test="unique-body" />
      </GhostTable>,
    );
    const result = processConditionals(html);
    const matches = result.match(/data-test="unique-body"/g) ?? [];
    expect(matches.length).toBe(1);
  });

  it('supports Outlook components inside children (universal slot)', () => {
    const html = renderToStaticMarkup(
      <GhostTable
        wrapper={(slot) => (
          <table>
            <tbody>
              <tr>
                <td>{slot}</td>
              </tr>
            </tbody>
          </table>
        )}
      >
        <Outlook not>
          <div>non-mso only</div>
        </Outlook>
      </GhostTable>,
    );
    const result = processConditionals(html);
    expect(result).toContain('<!--[if mso]>');
    expect(result).toContain('<!--[if !mso]><!-->');
    expect(result).toContain('non-mso only');
  });

  it('throws when wrapper does not render the slot', () => {
    expect(() =>
      renderToStaticMarkup(
        <GhostTable
          wrapper={() => (
            <table>
              <tbody>
                <tr>
                  <td>missing slot</td>
                </tr>
              </tbody>
            </table>
          )}
        >
          <div>content</div>
        </GhostTable>,
      ),
    ).toThrow(/slot/);
  });

  it('throws when wrapper renders the slot more than once', () => {
    expect(() =>
      renderToStaticMarkup(
        <GhostTable
          wrapper={(slot) => (
            <table>
              <tbody>
                <tr>
                  <td>{slot}</td>
                  <td>{slot}</td>
                </tr>
              </tbody>
            </table>
          )}
        >
          <div>content</div>
        </GhostTable>,
      ),
    ).toThrow(/exactly once/);
  });
});
