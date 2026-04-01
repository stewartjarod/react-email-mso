/**
 * Example 3: Columns Block
 *
 * Responsive multi-column layout using the <Columns> / <Column> block.
 * Ghost tables for Outlook handled automatically — no dangerouslySetInnerHTML needed.
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
import { Column, Columns, processConditionals } from '../src';

const ColumnsEmail = () => (
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

        <Columns gap={20}>
          <Column width={280}>
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
          </Column>
          <Column width={280}>
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
          </Column>
        </Columns>
      </Container>
    </Body>
  </Html>
);

async function main() {
  const html = processConditionals(await render(<ColumnsEmail />));

  console.log('=== Columns Block Example ===\n');
  console.log(html);
  console.log('\n=== Validation ===\n');

  const checks = [
    ['<!--[if mso]>', 'MSO conditional comments'],
    ['<![endif]-->', 'MSO closing comments'],
    ['width="280"', 'Fixed column widths for Outlook'],
    ['max-width:280px', 'Fluid max-width for modern clients'],
    ['inline-block', 'Inline-block columns for modern clients'],
    ['width="20"', 'Ghost table gap spacer'],
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
