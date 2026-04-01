import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { processConditionals } from '../process';
import { BulletproofButton } from './button';

describe('BulletproofButton', () => {
  it('renders VML roundrect for Outlook and styled <a> for modern clients', () => {
    const html = renderToStaticMarkup(
      <BulletproofButton href="https://example.com">
        Click me
      </BulletproofButton>
    );
    // Should contain mso-if with VML
    expect(html).toContain('<mso-if>');
    expect(html).toContain('v:roundrect');
    expect(html).toContain('https://example.com');
    expect(html).toContain('Click me');
    // Should contain mso-else with styled <a>
    expect(html).toContain('<mso-else>');
    expect(html).toContain('<a');
    // mso-hide:all is unnecessary — <NotOutlook> conditional already hides from Outlook
  });

  it('applies custom props to both VML and CSS output', () => {
    const html = renderToStaticMarkup(
      <BulletproofButton
        href="https://example.com"
        color="#EB7035"
        textColor="#000000"
        width={250}
        height={50}
        borderRadius={8}
        fontSize={18}
        fontFamily="Helvetica, Arial, sans-serif"
      >
        Sign Up
      </BulletproofButton>
    );
    // VML should use custom values
    expect(html).toContain('fillcolor="#EB7035"');
    expect(html).toContain('width:250px');
    expect(html).toContain('height:50px');
    expect(html).toContain('color:#000000');
    expect(html).toContain('Sign Up');
    // CSS <a> should use matching values
    expect(html).toContain('background-color:#EB7035');
    expect(html).toContain('font-size:18px');
  });

  it('full pipeline: processConditionals produces valid MSO output', () => {
    const html = renderToStaticMarkup(
      <BulletproofButton href="https://example.com" color="#556270">
        Go
      </BulletproofButton>
    );
    const result = processConditionals(html);
    // MSO conditional comments present
    expect(result).toContain('<!--[if mso]>');
    expect(result).toContain('<![endif]-->');
    expect(result).toContain('<!--[if !mso]><!-->');
    expect(result).toContain('<!--<![endif]-->');
    // VML inside mso block
    expect(result).toContain('v:roundrect');
    // No leftover custom elements
    expect(result).not.toContain('<mso-if');
    expect(result).not.toContain('<mso-else');
  });

  it('escapes HTML in props to prevent XSS in VML output', () => {
    const html = renderToStaticMarkup(
      <BulletproofButton
        href={'" onmouseover="alert(1)" x="'}
        color={'#fff" onclick="alert(2)'}
      >
        {'<script>alert(3)</script>'}
      </BulletproofButton>
    );
    // Quotes in href should be escaped so injection stays inside the attribute value
    // The VML output (dangerouslySetInnerHTML) uses our escapeAttr
    expect(html).toContain('&quot; onmouseover=');
    // No unescaped double-quote breakout in the VML href
    expect(html).not.toMatch(/href="[^"]*" onmouseover="/);
    // Script tags in children should be escaped in VML
    expect(html).toContain('&lt;script&gt;');
  });

  it('renders JSX children in both VML and CSS paths', () => {
    const html = renderToStaticMarkup(
      <BulletproofButton href="https://example.com">
        <span style={{ fontWeight: 'bold' }}>Bold text</span>
      </BulletproofButton>
    );
    const result = processConditionals(html);
    // CSS path renders JSX children
    expect(result).toContain('<span style="font-weight:bold">Bold text</span>');
    // VML path also renders the children (via renderToStaticMarkup)
    expect(result).toContain('Bold text');
    // VML center tag should not be empty
    const vmlSection = result.split('<!--[if mso]>')[1].split('<![endif]-->')[0];
    expect(vmlSection).toContain('Bold text');
  });

  it('clamps arcsize to 100% for large borderRadius', () => {
    const html = renderToStaticMarkup(
      <BulletproofButton href="https://example.com" borderRadius={100} height={40}>
        Pill
      </BulletproofButton>
    );
    expect(html).toContain('arcsize="100%"');
    expect(html).not.toContain('arcsize="500%"');
  });
});
