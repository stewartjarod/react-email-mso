# react-email-mso

MSO conditional comments for [react-email](https://react.email). Outlook-safe rendering with zero dependencies.

React can't output HTML comments, which makes `<!--[if mso]>` impossible. This package solves it with custom HTML elements that pass through React's renderer untouched, then a simple string post-processor converts them to real MSO conditional comments.

~30 lines of code. Zero dependencies. Works with react-email, jsx-email, or plain `react-dom/server`.

## Install

```bash
npm install react-email-mso
# or
bun add react-email-mso
```

Requires React 19+.

## Quick Start

```tsx
import { render } from '@react-email/render';
import { Outlook, NotOutlook, processConditionals } from 'react-email-mso';

const Email = () => (
  <Html>
    <Body>
      <Outlook>
        <table><tbody><tr><td width="600">Ghost table for Outlook</td></tr></tbody></table>
      </Outlook>
      <NotOutlook>
        <div style={{ maxWidth: 600 }}>Modern layout</div>
      </NotOutlook>
    </Body>
  </Html>
);

const html = processConditionals(await render(<Email />));
```

Output:

```html
<!--[if mso]>
  <table><tbody><tr><td width="600">Ghost table for Outlook</td></tr></tbody></table>
<![endif]-->
<!--[if !mso]><!-->
  <div style="max-width:600px">Modern layout</div>
<!--<![endif]-->
```

## API

### `<Outlook>`

Wraps children in `<!--[if mso]>...<![endif]-->`. Content is only visible in Outlook (Word rendering engine).

```tsx
<Outlook>
  <table><tbody><tr><td>Only Outlook sees this</td></tr></tbody></table>
</Outlook>
```

### `<NotOutlook>`

Wraps children in `<!--[if !mso]><!-->...<!--<![endif]-->`. Content is visible in every client _except_ Outlook.

```tsx
<NotOutlook>
  <div>Everything except Outlook sees this</div>
</NotOutlook>
```

### `<OutlookExpr>`

Wraps children in a custom MSO conditional expression. Use for targeting specific Outlook versions.

```tsx
<OutlookExpr expr="gte mso 9">
  <style>{'body { font-family: Calibri; }'}</style>
</OutlookExpr>
{/* Output: <!--[if gte mso 9]><style>...</style><![endif]--> */}
```

#### Outlook Version Numbers

| Outlook Version | MSO Number |
|-----------------|------------|
| Outlook 2000 | 9 |
| Outlook 2002/XP | 10 |
| Outlook 2003 | 11 |
| Outlook 2007 | 12 |
| Outlook 2010 | 14 |
| Outlook 2013 | 15 |
| Outlook 2016 / 2019 / 365 | 16 |

Operators: `gt`, `lt`, `gte`, `lte`, `!`

### `processConditionals(html: string): string`

Converts custom elements to MSO conditional comments. Call this on the HTML string returned by `render()`.

```tsx
import { render } from '@react-email/render';
import { processConditionals } from 'react-email-mso';

const html = processConditionals(await render(<MyEmail />));
```

**Important:** If using `render({ pretty: true })`, the pretty-printing runs inside `render()` before `processConditionals` sees the output. This is the correct order — Prettier handles custom elements fine but would break MSO conditional comment syntax.

## Blocks

Higher-level components that use the primitives internally to automatically render the right markup for each client.

### `<BulletproofButton>`

A button that renders VML `v:roundrect` for Outlook and a styled `<a>` tag for modern clients.

```tsx
import { BulletproofButton, processConditionals } from 'react-email-mso';

const Email = () => (
  <BulletproofButton
    href="https://example.com"
    color="#EB7035"
    textColor="#ffffff"
    width={200}
    height={44}
    borderRadius={4}
    fontSize={16}
    fontFamily="Helvetica, Arial, sans-serif"
  >
    Get Started
  </BulletproofButton>
);
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `href` | `string` | required | Button link URL |
| `children` | `ReactNode` | required | Button text (strings or JSX) |
| `color` | `string` | `'#007bff'` | Background color |
| `textColor` | `string` | `'#ffffff'` | Text color |
| `width` | `number` | `200` | Width in pixels |
| `height` | `number` | `40` | Height in pixels |
| `borderRadius` | `number` | `4` | Border radius in pixels (converted to VML `arcsize`) |
| `fontFamily` | `string` | `'sans-serif'` | Font family |
| `fontSize` | `number` | `16` | Font size in pixels |

#### What it renders

**Outlook** (inside `<!--[if mso]>`):

```html
<v:roundrect href="https://example.com"
  style="height:44px;v-text-anchor:middle;width:200px;"
  arcsize="18%" stroke="f" fillcolor="#EB7035">
  <w:anchorlock/>
  <center style="color:#ffffff;font-family:Helvetica, Arial, sans-serif;font-size:16px;">
    Get Started
  </center>
</v:roundrect>
```

**Modern clients** (inside `<!--[if !mso]><!-->`):

```html
<a href="https://example.com"
  style="background-color:#EB7035;border-radius:4px;color:#ffffff;
         display:inline-block;font-family:Helvetica, Arial, sans-serif;
         font-size:16px;font-weight:bold;line-height:44px;
         text-align:center;text-decoration:none;width:200px">
  Get Started
</a>
```

### `<Columns>` / `<Column>`

Responsive multi-column layout. Outlook gets a fixed-width ghost table; modern clients get inline-block divs that stack on mobile.

```tsx
import { Columns, Column, processConditionals } from 'react-email-mso';

const Email = () => (
  <Columns gap={20}>
    <Column width={280}>
      <img src="product1.jpg" width={280} />
      <p>Wireless Headphones — $199</p>
    </Column>
    <Column width={280}>
      <img src="product2.jpg" width={280} />
      <p>Smart Watch — $299</p>
    </Column>
  </Columns>
);
```

#### Props

**Columns:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `Column[]` | required | Column elements |
| `gap` | `number` | `0` | Gap between columns in pixels |

**Column:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `width` | `number` | required | Column width in pixels |
| `children` | `ReactNode` | required | Column content |

#### What it renders

**Outlook** (ghost table):

```html
<!--[if mso]>
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
  <tr>
    <td width="280" valign="top">
<![endif]-->
      <div style="display:inline-block;width:100%;max-width:280px">
        <!-- Column 1 content -->
      </div>
<!--[if mso]>
    </td>
    <td width="20">&nbsp;</td>
    <td width="280" valign="top">
<![endif]-->
      <div style="display:inline-block;width:100%;max-width:280px">
        <!-- Column 2 content -->
      </div>
<!--[if mso]>
    </td>
  </tr>
</table>
<![endif]-->
```

**Modern clients:** Inline-block divs that respect `max-width` and stack on mobile with a media query:

```css
@media screen and (max-width: 600px) {
  .column { display: block !important; width: 100% !important; }
}
```

## How It Works

React can't output HTML comments. Every attempt — string interpolation, `dangerouslySetInnerHTML` — gets escaped or stripped.

**The insight:** Custom HTML elements (names with a hyphen) pass through every React renderer untouched. React treats them as web components and renders them literally.

This package uses three custom elements as markers:

| Element | Becomes |
|---------|---------|
| `<mso-if>...</mso-if>` | `<!--[if mso]>...<![endif]-->` |
| `<mso-else>...</mso-else>` | `<!--[if !mso]><!-->...<!--<![endif]-->` |
| `<mso-expr data-expr="X">...</mso-expr>` | `<!--[if X]>...<![endif]-->` |

The React components (`<Outlook>`, `<NotOutlook>`, `<OutlookExpr>`) emit these custom elements. Then `processConditionals()` does a simple string replacement on the final HTML — no AST parsing, no rehype pipeline, no custom renderer.

## vs jsx-email

jsx-email's `<Conditional>` component solves the same problem with a 200+ line, two-phase architecture: placeholder custom elements → rehype AST transformation → raw HTML comment injection. It requires jsx-email's custom renderer and has had duplication bugs and closer corruption bugs. Its `<![endif]/-->` closer syntax [breaks Classic Outlook](https://github.com/shellscape/jsx-email/issues/403).

| | jsx-email | react-email-mso |
|---|---|---|
| Lines of code | ~200+ across 5 files | ~30 |
| Dependencies | rehype, rehype-stringify, hast-util-* | None |
| Renderer | Custom only (jsxToString) | Any (react-email, react-dom, jsx-email) |
| Bug surface | AST walking, plugin ordering | Simple string replacement |
| Closer syntax | `<![endif]/-->` (broken) | `<![endif]-->` (correct) |

## Constraints

- **React 19+ required.** React 18's SSR silently drops children of custom elements ([facebook/react#27403](https://github.com/facebook/react/issues/27403)). React 19 fixed this. react-email v2 already uses React 19 streaming renderers.
- **Don't nest `<Outlook>` inside `<Outlook>`.** MSO conditional comments can't be nested — Outlook's parser will misinterpret it. Use a single `<Outlook>` wrapper per block.
- **VML requires XML namespace declarations** on your `<html>` tag for Outlook to render VML elements:

```html
<html xmlns:v="urn:schemas-microsoft-com:vml"
      xmlns:o="urn:schemas-microsoft-com:office:office">
```

## License

MIT
