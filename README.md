# react-email-mso

MSO conditional comments for [react-email](https://react.email). Outlook-safe rendering with zero dependencies.

React can't output HTML comments, which makes `<!--[if mso]>` impossible. This package solves it with custom HTML elements that pass through React's renderer untouched, then a simple string post-processor converts them to real MSO conditional comments.

~20 lines of code. Zero dependencies. Works with react-email, jsx-email, or plain `react-dom/server`.

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
import { Outlook, processConditionals } from 'react-email-mso';

const Email = () => (
  <Html>
    <Body>
      <Outlook fallback={<table><tbody><tr><td width="600">Ghost table for Outlook</td></tr></tbody></table>}>
        <div style={{ maxWidth: 600 }}>Modern layout</div>
      </Outlook>
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

One component, two modes.

#### Paired mode (most common)

Use `fallback` to provide Outlook-specific markup alongside your modern default. Children are the default (modern clients), `fallback` is what Outlook gets.

```tsx
<Outlook fallback={<table><tbody><tr><td>Outlook gets this</td></tr></tbody></table>}>
  <div>Modern clients see this</div>
</Outlook>
```

#### Standalone mode

Render content for only Outlook, or only non-Outlook clients.

```tsx
<Outlook>
  <table><tbody><tr><td>Only Outlook sees this</td></tr></tbody></table>
</Outlook>

<Outlook not>
  <div>Everything except Outlook sees this</div>
</Outlook>
```

The `not` prop uses the [downlevel-revealed](https://learn.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/compatibility/ms537512(v=vs.85)) comment pattern, which is required for non-MSO clients to see the content. Do not use `expr="!mso"` for this — it produces a normal conditional comment that is invisible to all clients.

#### Version targeting

Target specific Outlook versions with `expr`.

```tsx
<Outlook expr="gte mso 9">
  <style>{'body { font-family: Calibri; }'}</style>
</Outlook>
{/* Output: <!--[if gte mso 9]><style>...</style><![endif]--> */}
```

Works with `fallback` too:

```tsx
<Outlook expr="gte mso 9" fallback={<table><tbody><tr><td>Outlook 9+ gets this</td></tr></tbody></table>}>
  <div>Everyone else sees this</div>
</Outlook>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | required | Default content (modern clients in paired mode, Outlook content in standalone mode) |
| `not` | `boolean` | `false` | Use downlevel-revealed pattern — content visible to non-Outlook clients |
| `expr` | `string` | `'mso'` | Conditional expression (e.g. `"gte mso 9"`) |
| `fallback` | `ReactNode` | — | Outlook-specific content (enables paired mode when provided) |

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

Higher-level components that use `<Outlook>` internally to automatically render the right markup for each client.

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

## How It Works

React can't output HTML comments. Every attempt — string interpolation, `dangerouslySetInnerHTML` — gets escaped or stripped.

**The insight:** Custom HTML elements (names with a hyphen) pass through every React renderer untouched. React treats them as web components and renders them literally.

This package uses two custom elements as markers:

| Element | Becomes |
|---------|---------|
| `<mso-expr data-expr="X">` | `<!--[if X]>...<![endif]-->` |
| `<mso-else-expr data-expr="X">` | `<!--[if X]><!-->...<!--<![endif]-->` |

`<Outlook>` emits these custom elements based on its props. Then `processConditionals()` does a single-pass regex replacement on the final HTML — no AST parsing, no rehype pipeline, no custom renderer.

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
