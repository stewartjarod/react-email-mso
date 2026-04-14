/**
 * Example 4: Full Production Email
 *
 * A complete transactional email combining all patterns:
 * - DPI fix via Outlook expr
 * - SafeContainer via Outlook paired/standalone modes
 * - BulletproofButton
 * - Columns block for a two-column footer
 *
 * Run: bun run examples/04-full-email.tsx
 * Run + save: bun run examples/04-full-email.tsx > output.html
 */
import {
  Body,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Text,
} from '@react-email/components';
import { render } from '@react-email/render';
import {
  BulletproofButton,
  Column,
  Columns,
  Outlook,
  processConditionals,
} from '../src';

// Reusable safe container — fixed table for Outlook, fluid div for modern.
// Uses split-tag pattern (dangerouslySetInnerHTML) instead of fallback because
// children may contain their own conditional blocks. With fallback, children
// render twice and nested downlevel-revealed blocks leak through in Gmail.
function SafeContainer({
  children,
  width = 600,
}: {
  children: React.ReactNode;
  width?: number;
}) {
  return (
    <>
      <Outlook>
        <div
          dangerouslySetInnerHTML={{
            __html: `<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="${width}" style="margin:0 auto"><tr><td>`,
          }}
        />
      </Outlook>

      <Outlook not>
        <div
          dangerouslySetInnerHTML={{
            __html: `<div style="max-width:${width}px;margin:0 auto;padding:0 20px">`,
          }}
        />
      </Outlook>

      {children}

      <Outlook not>
        <div dangerouslySetInnerHTML={{ __html: '</div>' }} />
      </Outlook>

      <Outlook>
        <div dangerouslySetInnerHTML={{ __html: '</td></tr></table>' }} />
      </Outlook>
    </>
  );
}

const FullEmail = () => (
  <Html>
    <Head>
      <Outlook expr="gte mso 9">
        <noscript>
          <xml>
            <o:OfficeDocumentSettings
              xmlns:o="urn:schemas-microsoft-com:office:office"
            >
              <o:AllowPNG />
              <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
          </xml>
        </noscript>
      </Outlook>
      <style>{`
        @media screen and (max-width: 600px) {
          .footer-col { display: block !important; width: 100% !important; padding-bottom: 16px !important; }
        }
      `}</style>
    </Head>

    <Preview>Your invoice for March 2026 is ready</Preview>

    <Body style={{ backgroundColor: '#f6f9fc', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', margin: 0, padding: 0 }}>
      {/* Header */}
      <SafeContainer>
        <div style={{ padding: '32px 0 24px', textAlign: 'center' }}>
          <Img
            src="https://placehold.co/140x40/1a1a1a/ffffff?text=ACME"
            width={140}
            height={40}
            alt="Acme Inc"
          />
        </div>
      </SafeContainer>

      {/* Main card */}
      <SafeContainer>
        <div style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: '40px 32px', border: '1px solid #e2e8f0' }}>
          <Heading as="h1" style={{ color: '#1a1a1a', fontSize: 24, margin: '0 0 16px' }}>
            Invoice #INV-2026-0342
          </Heading>

          <Text style={{ color: '#4a4a4a', fontSize: 16, lineHeight: '26px', margin: '0 0 24px' }}>
            Hi Alex, your invoice for March 2026 is ready.
            The total amount of <strong>$2,450.00</strong> will be charged
            to your card ending in 4242.
          </Text>

          {/* Invoice summary table */}
          <table role="presentation" cellSpacing={0} cellPadding={0} border={0} width="100%" style={{ marginBottom: 32 }}>
            <tbody>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '12px 0', color: '#666666', fontSize: 14 }}>Pro Plan (monthly)</td>
                <td style={{ padding: '12px 0', color: '#1a1a1a', fontSize: 14, textAlign: 'right' as const }}>$1,200.00</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '12px 0', color: '#666666', fontSize: 14 }}>Additional seats (5)</td>
                <td style={{ padding: '12px 0', color: '#1a1a1a', fontSize: 14, textAlign: 'right' as const }}>$750.00</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '12px 0', color: '#666666', fontSize: 14 }}>API overage (12,000 calls)</td>
                <td style={{ padding: '12px 0', color: '#1a1a1a', fontSize: 14, textAlign: 'right' as const }}>$500.00</td>
              </tr>
              <tr>
                <td style={{ padding: '16px 0 0', color: '#1a1a1a', fontSize: 16, fontWeight: 'bold' }}>Total</td>
                <td style={{ padding: '16px 0 0', color: '#1a1a1a', fontSize: 16, fontWeight: 'bold', textAlign: 'right' as const }}>$2,450.00</td>
              </tr>
            </tbody>
          </table>

          <div style={{ textAlign: 'center' }}>
            <BulletproofButton
              href="https://example.com/invoices/INV-2026-0342"
              color="#0066ff"
              textColor="#ffffff"
              width={220}
              height={48}
              borderRadius={8}
              fontSize={16}
              fontFamily="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
            >
              View Invoice
            </BulletproofButton>
          </div>

          <Text style={{ color: '#999999', fontSize: 13, textAlign: 'center', margin: '24px 0 0' }}>
            Payment will be processed on April 5, 2026.
          </Text>
        </div>
      </SafeContainer>

      {/* Footer */}
      <SafeContainer>
        <div style={{ padding: '32px 0' }}>
          <Hr style={{ borderColor: '#e2e8f0', margin: '0 0 24px' }} />

          <Columns>
            <Column width={300}>
              <Text style={{ fontSize: 13, color: '#999999', margin: '0 0 4px' }}>
                Acme Inc, 123 Main St, San Francisco, CA 94102
              </Text>
              <Text style={{ fontSize: 13, color: '#999999', margin: '0' }}>
                <Link href="https://example.com/unsubscribe" style={{ color: '#999999' }}>
                  Unsubscribe
                </Link>{' '}
                &middot;{' '}
                <Link href="https://example.com/preferences" style={{ color: '#999999' }}>
                  Preferences
                </Link>
              </Text>
            </Column>
            <Column width={300}>
              <Text style={{ fontSize: 13, color: '#999999', margin: '0', textAlign: 'right' as const }}>
                Questions? Email{' '}
                <Link href="mailto:billing@example.com" style={{ color: '#666666' }}>
                  billing@example.com
                </Link>
              </Text>
            </Column>
          </Columns>
        </div>
      </SafeContainer>
    </Body>
  </Html>
);

async function main() {
  const html = processConditionals(await render(<FullEmail />));

  console.log(html);

  const checks = [
    ['<!--[if mso]>', 'MSO conditionals'],
    ['<!--[if !mso]><!-->', 'Not-MSO conditionals'],
    ['<!--[if gte mso 9]>', 'DPI fix expression'],
    ['v:roundrect', 'VML bulletproof button'],
    ['fillcolor="#0066ff"', 'Button VML color'],
    ['background-color:#0066ff', 'Button CSS color'],
    ['width="300"', 'Ghost column widths'],
    ['max-width:300px', 'Fluid column widths'],
    ['@media screen', 'Responsive media query'],
    ['Invoice #INV-2026-0342', 'Invoice content'],
    ['$2,450.00', 'Total amount'],
  ] as const;

  let allPassed = true;
  for (const [search, label] of checks) {
    const found = html.includes(search);
    if (!found) allPassed = false;
    process.stderr.write(`${found ? '[OK]' : '[FAIL]'} ${label}\n`);
  }

  process.stderr.write(
    allPassed
      ? '\nAll checks passed. Pipe to file: bun run examples/04-full-email.tsx > invoice.html\n'
      : '\nSome checks failed.\n'
  );
}

main();
