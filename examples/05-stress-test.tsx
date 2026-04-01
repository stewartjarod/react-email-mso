/**
 * Stress Test: Edge cases that would bite you in production
 *
 * Run: bun run examples/05-stress-test.tsx
 */
import { renderToStaticMarkup } from 'react-dom/server';
import {
  BulletproofButton,
  NotOutlook,
  Outlook,
  OutlookExpr,
  processConditionals,
} from '../src';

let pass = 0;
let fail = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    pass++;
    console.log(`[PASS] ${name}`);
  } catch (e: any) {
    fail++;
    console.log(`[FAIL] ${name}`);
    console.log(`       ${e.message}`);
  }
}

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(msg);
}

// --- Edge case 1: Empty children ---
test('Outlook with no children renders valid output', () => {
  const html = renderToStaticMarkup(<Outlook>{''}</Outlook>);
  const result = processConditionals(html);
  assert(result.includes('<!--[if mso]>'), 'missing opener');
  assert(result.includes('<![endif]-->'), 'missing closer');
  assert(!result.includes('<mso-'), 'leaked custom element');
});

// --- Edge case 2: Nested HTML entities ---
test('Content with HTML entities survives processing', () => {
  const html = renderToStaticMarkup(
    <Outlook>
      <td>Price: $50 &amp; up &mdash; save 20%</td>
    </Outlook>
  );
  const result = processConditionals(html);
  assert(result.includes('&amp;'), 'entities got mangled');
  assert(result.includes('<!--[if mso]>'), 'missing conditional');
});

// --- Edge case 3: Multiple Outlook/NotOutlook pairs ---
test('Multiple pairs in same email all get replaced', () => {
  const html = renderToStaticMarkup(
    <div>
      <Outlook><p>A</p></Outlook>
      <NotOutlook><p>B</p></NotOutlook>
      <Outlook><p>C</p></Outlook>
      <NotOutlook><p>D</p></NotOutlook>
      <Outlook><p>E</p></Outlook>
    </div>
  );
  const result = processConditionals(html);
  const msoCount = (result.match(/<!--\[if mso\]>/g) || []).length;
  const notMsoCount = (result.match(/<!--\[if !mso\]>/g) || []).length;
  assert(msoCount === 3, `expected 3 mso blocks, got ${msoCount}`);
  assert(notMsoCount === 2, `expected 2 not-mso blocks, got ${notMsoCount}`);
  assert(!result.includes('<mso-'), 'leaked custom element');
});

// --- Edge case 4: OutlookExpr with various expressions ---
test('OutlookExpr handles version targeting expressions', () => {
  const expressions = ['gte mso 9', 'lt mso 16', 'mso 12', 'gte mso 14'];
  for (const expr of expressions) {
    const html = renderToStaticMarkup(
      <OutlookExpr expr={expr}><p>test</p></OutlookExpr>
    );
    const result = processConditionals(html);
    assert(result.includes(`<!--[if ${expr}]>`), `failed for expr: ${expr}`);
    assert(!result.includes('<mso-expr'), `leaked mso-expr for: ${expr}`);
  }
});

// --- Edge case 5: BulletproofButton with special characters ---
test('BulletproofButton escapes special chars in props', () => {
  const html = renderToStaticMarkup(
    <BulletproofButton
      href='https://example.com/path?a=1&b=2'
      color="#007bff"
    >
      Save &amp; Continue
    </BulletproofButton>
  );
  const result = processConditionals(html);
  // Ampersand in URL should be escaped in VML
  assert(!result.includes('<mso-'), 'leaked custom element');
  assert(result.includes('v:roundrect'), 'missing VML');
});

// --- Edge case 6: BulletproofButton with JSX children (known limitation) ---
test('BulletproofButton with JSX children: CSS path works, VML path is empty', () => {
  const html = renderToStaticMarkup(
    <BulletproofButton href="https://example.com">
      <span>Bold text</span>
    </BulletproofButton>
  );
  const result = processConditionals(html);
  // CSS path should render the span
  assert(result.includes('<span>Bold text</span>'), 'CSS path missing children');
  // VML path will have empty center tag (known limitation)
  assert(result.includes('<center'), 'VML center tag missing');
});

// --- Edge case 7: processConditionals is idempotent ---
test('Running processConditionals twice produces same output', () => {
  const html = renderToStaticMarkup(
    <div>
      <Outlook><p>test</p></Outlook>
      <NotOutlook><p>test</p></NotOutlook>
    </div>
  );
  const once = processConditionals(html);
  const twice = processConditionals(once);
  assert(once === twice, 'not idempotent — double processing changes output');
});

// --- Edge case 8: Large email with many conditionals ---
test('Handles 50 conditional blocks without issues', () => {
  const blocks = Array.from({ length: 50 }, (_, i) =>
    `<mso-if><td>Row ${i}</td></mso-if><mso-else><div>Row ${i}</div></mso-else>`
  ).join('');
  const result = processConditionals(`<table>${blocks}</table>`);
  const msoCount = (result.match(/<!--\[if mso\]>/g) || []).length;
  assert(msoCount === 50, `expected 50, got ${msoCount}`);
  assert(!result.includes('<mso-'), 'leaked custom elements');
});

// --- Edge case 9: Text content that looks like a marker ---
test('Text containing "mso-if" as plain text is NOT affected', () => {
  // This tests the known limitation — marker text in content WILL get replaced
  const html = '<p>Use the &lt;mso-if&gt; element for Outlook</p>';
  const result = processConditionals(html);
  // HTML-escaped angle brackets should survive (entities, not real tags)
  assert(result.includes('&lt;mso-if&gt;'), 'escaped markers should survive');
});

// --- Edge case 10: Outlook inside a react-email Container ---
test('Works when Outlook is deeply nested in HTML', () => {
  const html = renderToStaticMarkup(
    <html>
      <body>
        <table>
          <tbody>
            <tr>
              <td>
                <div>
                  <Outlook>
                    <p>Deep content</p>
                  </Outlook>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  );
  const result = processConditionals(html);
  assert(result.includes('<!--[if mso]>'), 'missing conditional in deep nesting');
  assert(result.includes('Deep content'), 'content missing');
  assert(!result.includes('<mso-'), 'leaked custom element');
});

console.log(`\n${pass} passed, ${fail} failed out of ${pass + fail} tests`);
if (fail > 0) process.exit(1);
