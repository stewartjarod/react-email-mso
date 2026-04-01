/**
 * Example 2: BulletproofButton
 *
 * A button that renders VML in Outlook and CSS everywhere else.
 * No more broken buttons when forwarding in Outlook.
 *
 * Run: npx tsx examples/02-bulletproof-button.tsx
 */
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Section,
  Text,
} from '@react-email/components';
import { render } from '@react-email/render';
import { BulletproofButton, processConditionals } from '../src';

const ButtonEmail = () => (
  <Html
    xmlns:v="urn:schemas-microsoft-com:vml"
    xmlns:o="urn:schemas-microsoft-com:office:office"
  >
    <Head />
    <Body style={{ backgroundColor: '#ffffff', fontFamily: 'Helvetica, Arial, sans-serif' }}>
      <Container style={{ maxWidth: 600, margin: '0 auto', padding: '40px 20px' }}>
        <Heading as="h1" style={{ color: '#1a1a1a', fontSize: 28 }}>
          Your order is confirmed
        </Heading>

        <Text style={{ color: '#4a4a4a', fontSize: 16, lineHeight: '26px' }}>
          Thanks for your purchase. Your order #12345 has been confirmed and
          will ship within 2 business days.
        </Text>

        <Section style={{ textAlign: 'center', margin: '32px 0' }}>
          <BulletproofButton
            href="https://example.com/orders/12345"
            color="#007bff"
            textColor="#ffffff"
            width={220}
            height={44}
            borderRadius={6}
            fontSize={16}
            fontFamily="Helvetica, Arial, sans-serif"
          >
            Track Your Order
          </BulletproofButton>
        </Section>

        <Hr style={{ borderColor: '#e6e6e6', margin: '32px 0' }} />

        <Text style={{ color: '#999999', fontSize: 14 }}>
          Need help? Reply to this email or contact support.
        </Text>

        {/* A second button with different styling */}
        <Section style={{ textAlign: 'center', margin: '24px 0' }}>
          <BulletproofButton
            href="https://example.com/support"
            color="#28a745"
            textColor="#ffffff"
            width={180}
            height={40}
            borderRadius={20}
            fontSize={14}
          >
            Contact Support
          </BulletproofButton>
        </Section>
      </Container>
    </Body>
  </Html>
);

async function main() {
  const html = processConditionals(await render(<ButtonEmail />));

  console.log('=== BulletproofButton Example ===\n');
  console.log(html);
  console.log('\n=== Validation ===\n');

  const checks = [
    ['v:roundrect', 'VML roundrect elements'],
    ['w:anchorlock', 'VML anchor locks'],
    ['fillcolor="#007bff"', 'Primary button color in VML'],
    ['fillcolor="#28a745"', 'Secondary button color in VML'],
    ['arcsize=', 'VML border radius'],
    ['background-color:#007bff', 'Primary button color in CSS'],
    ['background-color:#28a745', 'Secondary button color in CSS'],
    ['<!--[if mso]>', 'MSO conditional comments'],
    ['<!--[if !mso]><!-->', 'Not-MSO conditional comments'],
    ['Track Your Order', 'Button text'],
  ] as const;

  for (const [search, label] of checks) {
    const found = html.includes(search);
    console.log(`${found ? '[OK]' : '[FAIL]'} ${label}`);
  }
}

main();
