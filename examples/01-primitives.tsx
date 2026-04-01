/**
 * Example 1: Primitives — <Outlook>, <NotOutlook>, <OutlookExpr>
 *
 * Shows the core building blocks for MSO conditional rendering.
 * Run: npx tsx examples/01-primitives.tsx
 */
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Section,
  Text,
} from '@react-email/components';
import { render } from '@react-email/render';
import { NotOutlook, Outlook, OutlookExpr, processConditionals } from '../src';

const PrimitivesEmail = () => (
  <Html>
    <Head>
      {/* Force 96 DPI in Outlook to prevent scaling issues */}
      <OutlookExpr expr="gte mso 9">
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
      </OutlookExpr>
    </Head>
    <Body style={{ backgroundColor: '#f6f9fc', fontFamily: 'sans-serif' }}>
      {/* Outlook gets a fixed-width table; modern clients get a fluid div */}
      <Outlook>
        <table
          role="presentation"
          cellSpacing={0}
          cellPadding={0}
          border={0}
          width={600}
          style={{ margin: '0 auto' }}
        >
          <tbody>
            <tr>
              <td>
                <p style={{ fontFamily: 'sans-serif', fontSize: 14 }}>
                  You are reading this in <strong>Microsoft Outlook</strong>.
                  This content is wrapped in a fixed-width table.
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </Outlook>

      <NotOutlook>
        <Container style={{ maxWidth: 600, margin: '0 auto' }}>
          <Section style={{ padding: '40px 20px' }}>
            <Heading as="h1" style={{ color: '#1a1a1a', fontSize: 24 }}>
              Welcome
            </Heading>
            <Text style={{ color: '#4a4a4a', fontSize: 16, lineHeight: '24px' }}>
              You are reading this in a <strong>modern email client</strong>.
              This content uses a responsive container with max-width.
            </Text>
          </Section>
        </Container>
      </NotOutlook>
    </Body>
  </Html>
);

async function main() {
  const html = processConditionals(await render(<PrimitivesEmail />));

  console.log('=== Primitives Example ===\n');
  console.log(html);
  console.log('\n=== Key sections ===\n');

  if (html.includes('<!--[if mso]>')) {
    console.log('[OK] <!--[if mso]> conditional found');
  }
  if (html.includes('<!--[if !mso]><!-->')) {
    console.log('[OK] <!--[if !mso]><!--> conditional found');
  }
  if (html.includes('<!--[if gte mso 9]>')) {
    console.log('[OK] <!--[if gte mso 9]> expression found');
  }
  if (!html.includes('<mso-if') && !html.includes('<mso-else') && !html.includes('<mso-expr')) {
    console.log('[OK] No leftover custom elements');
  }
}

main();
