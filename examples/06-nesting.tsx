/**
 * Example 6: Nested <Outlook> for Version-Gated Content
 *
 * The outer <Outlook> hides a block from non-MSO clients. The inner <Outlook>
 * narrows that block to a specific Outlook version. The processor emits the
 * outer as a commented conditional and the inner as short form — valid inside
 * an already-hidden scope.
 *
 * Run: bun run examples/06-nesting.tsx
 */
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Text,
} from '@react-email/components';
import { render } from '@react-email/render';
import { Outlook, processConditionals } from '../src';

const NestedEmail = () => (
  <Html>
    <Head />
    <Body style={{ backgroundColor: '#f6f9fc', fontFamily: 'sans-serif' }}>
      <Container style={{ maxWidth: 600, margin: '0 auto' }}>
        <Heading as="h1">Version-gated Outlook content</Heading>
        <Text>Everyone sees this paragraph.</Text>

        <Outlook>
          <Text>
            <strong>All Outlook versions</strong> see this block — wrapped in{' '}
            <code>&lt;!--[if mso]&gt;</code>.
          </Text>

          <Outlook expr="gte mso 16">
            <Text>
              <strong>Only Outlook 2016+</strong> sees this nested block —
              wrapped in the short form <code>&lt;![if gte mso 16]&gt;</code>{' '}
              that is valid inside the outer comment-hidden scope.
            </Text>
          </Outlook>

          <Outlook expr="lt mso 16">
            <Text>
              <strong>Only pre-2016 Outlook</strong> sees this nested block —
              useful for legacy fallbacks.
            </Text>
          </Outlook>
        </Outlook>
      </Container>
    </Body>
  </Html>
);

async function main() {
  const html = processConditionals(await render(<NestedEmail />));

  console.log('=== Nested Outlook Example ===\n');
  console.log(html);
  console.log('\n=== Key sections ===\n');

  if (html.includes('<!--[if mso]>')) {
    console.log('[OK] Outer <!--[if mso]> conditional found');
  }
  if (html.includes('<![if gte mso 16]>')) {
    console.log('[OK] Inner short-form <![if gte mso 16]> found');
  }
  if (html.includes('<![if lt mso 16]>')) {
    console.log('[OK] Inner short-form <![if lt mso 16]> found');
  }
  if (!html.includes('<!--[if gte mso 16]>')) {
    console.log('[OK] Inner did NOT emit commented form (would break nesting)');
  }
  if (!html.includes('<mso-')) {
    console.log('[OK] No leftover custom elements');
  }
}

main();
