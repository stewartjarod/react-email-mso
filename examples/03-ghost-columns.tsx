/**
 * Example 3: Ghost Columns
 *
 * Responsive two-column layout using primitives directly.
 * Outlook gets a fixed-width ghost table; modern clients get
 * inline-block divs that stack on mobile.
 *
 * Ghost tables require partial HTML fragments (open a <td> in one
 * conditional, close it in another). Since JSX can't express partial
 * tags, we use dangerouslySetInnerHTML for the ghost table scaffolding.
 *
 * Run: bun run examples/03-ghost-columns.tsx
 */
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Text,
} from '@react-email/components';
import { render } from '@react-email/render';
import { NotOutlook, Outlook, processConditionals } from '../src';

const GhostColumnsEmail = () => (
  <Html>
    <Head>
      <style>{`
        @media screen and (max-width: 600px) {
          .column { display: block !important; width: 100% !important; }
        }
      `}</style>
    </Head>
    <Body style={{ backgroundColor: '#f6f9fc', fontFamily: 'sans-serif' }}>
      <Container style={{ maxWidth: 600, margin: '0 auto', padding: '40px 20px' }}>
        <Heading as="h1" style={{ color: '#1a1a1a', fontSize: 24, textAlign: 'center' }}>
          This Week's Picks
        </Heading>

        {/* Ghost table opener for Outlook */}
        <Outlook>
          <div
            dangerouslySetInnerHTML={{
              __html:
                '<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"><tr><td width="280" valign="top">',
            }}
          />
        </Outlook>

        {/* Column 1 — visible in all clients */}
        <div
          className="column"
          style={{
            display: 'inline-block',
            width: '100%',
            maxWidth: 280,
            verticalAlign: 'top',
          }}
        >
          <Img
            src="https://placehold.co/280x180/e2e8f0/475569?text=Product+1"
            width={280}
            height={180}
            alt="Product 1"
            style={{ display: 'block', borderRadius: 8 }}
          />
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1a1a1a' }}>
            Wireless Headphones
          </Text>
          <Text style={{ fontSize: 14, color: '#666666' }}>
            Premium noise-canceling with 30hr battery. $199.
          </Text>
        </div>

        {/* Ghost table: close col 1, spacer, open col 2 */}
        <Outlook>
          <div
            dangerouslySetInnerHTML={{
              __html: '</td><td width="20">&nbsp;</td><td width="280" valign="top">',
            }}
          />
        </Outlook>

        {/* Spacer for modern clients */}
        <NotOutlook>
          <div style={{ display: 'inline-block', width: 20 }}>&nbsp;</div>
        </NotOutlook>

        {/* Column 2 — visible in all clients */}
        <div
          className="column"
          style={{
            display: 'inline-block',
            width: '100%',
            maxWidth: 280,
            verticalAlign: 'top',
          }}
        >
          <Img
            src="https://placehold.co/280x180/e2e8f0/475569?text=Product+2"
            width={280}
            height={180}
            alt="Product 2"
            style={{ display: 'block', borderRadius: 8 }}
          />
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1a1a1a' }}>
            Smart Watch
          </Text>
          <Text style={{ fontSize: 14, color: '#666666' }}>
            Fitness tracking, notifications, 5-day battery. $299.
          </Text>
        </div>

        {/* Ghost table closer */}
        <Outlook>
          <div dangerouslySetInnerHTML={{ __html: '</td></tr></table>' }} />
        </Outlook>
      </Container>
    </Body>
  </Html>
);

async function main() {
  const html = processConditionals(await render(<GhostColumnsEmail />));

  console.log('=== Ghost Columns Example ===\n');
  console.log(html);
  console.log('\n=== Validation ===\n');

  const checks = [
    ['<!--[if mso]>', 'MSO conditional comments'],
    ['<![endif]-->', 'MSO closing comments'],
    ['width="280"', 'Fixed column widths for Outlook'],
    ['max-width:280px', 'Fluid max-width for modern clients'],
    ['inline-block', 'Inline-block columns for modern clients'],
    ['Wireless Headphones', 'Column 1 content'],
    ['Smart Watch', 'Column 2 content'],
    ['@media screen', 'Responsive media query'],
  ] as const;

  for (const [search, label] of checks) {
    const found = html.includes(search);
    console.log(`${found ? '[OK]' : '[FAIL]'} ${label}`);
  }
}

main();
