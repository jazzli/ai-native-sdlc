import fs from 'node:fs';
import path from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

export interface CardSpec {
  kind: 'note' | 'page';
  title: string;
  status?: 'working-answer' | 'open' | 'parked';
  updated?: string;
  subtitle?: string;
}

const C = {
  ground: '#15201e',
  fg: '#e9efec',
  muted: '#9fb3ac',
  square: '#74d6bf',
  working: '#4cc38a',
  open: '#f0a35e',
  parked: '#9a9a9a',
};

// Read from the project root (site/), not via import.meta.url: Astro's
// prerender build step for API-route getStaticPaths bundles/relocates this
// module into dist/.prerender/chunks/, which breaks a URL resolved relative
// to the module's own location. process.cwd() is the site/ root for both
// astro (dev/build) and vitest, matching CONTENT's path convention below.
const fontFile = (f: string) =>
  fs.readFileSync(path.join(process.cwd(), 'src/og-fonts', f));
const FONTS = [
  {
    name: 'Inter',
    data: fontFile('inter-latin-400-normal.woff'),
    weight: 400 as const,
    style: 'normal' as const,
  },
  {
    name: 'Inter',
    data: fontFile('inter-latin-700-normal.woff'),
    weight: 700 as const,
    style: 'normal' as const,
  },
  {
    name: 'JetBrains Mono',
    data: fontFile('jetbrains-mono-latin-400-normal.woff'),
    weight: 400 as const,
    style: 'normal' as const,
  },
];

// Satori consumes plain element objects; no JSX/React needed.
export type CardElement = {
  type: string;
  props: { style?: Record<string, unknown>; children?: unknown };
};
const el = (
  type: string,
  style: Record<string, unknown>,
  children?: unknown,
): CardElement => ({
  type,
  props: { style, children },
});

const chipColor = (s: NonNullable<CardSpec['status']>) =>
  s === 'working-answer' ? C.working : s === 'open' ? C.open : C.parked;

// Vendored fonts are latin + latin-1-supplement subsets only. Anything outside
// printable ASCII, latin-1 supplement, and this slice of general punctuation
// (hyphens/dashes/quotes through per-mille and the angle quotation marks) is
// tofu at render time — fail the build instead of shipping it silently.
const UNCOVERED_CHAR = /[^ -~ -ÿ‐-‧‰-›×]/;

export function normalizeCardText(s: string): string {
  const normalized = s.replace(/→/g, '›').replace(/←/g, '‹');
  const match = UNCOVERED_CHAR.exec(normalized);
  if (match) {
    const ch = match[0];
    const codePoint = ch
      .codePointAt(0)!
      .toString(16)
      .toUpperCase()
      .padStart(4, '0');
    throw new Error(
      `unsupported character in card text: "${ch}" (U+${codePoint})`,
    );
  }
  return normalized;
}

export function cardElement(spec: CardSpec): CardElement {
  if (spec.kind === 'note' && (!spec.status || !spec.updated)) {
    throw new Error(`note card requires status and updated: "${spec.title}"`);
  }
  if (spec.kind === 'page' && !spec.subtitle) {
    throw new Error(`page card requires a subtitle: "${spec.title}"`);
  }

  const titleText = normalizeCardText(spec.title);
  const subtitleText =
    spec.kind === 'page' ? normalizeCardText(spec.subtitle!) : undefined;

  const meta =
    spec.kind === 'note'
      ? el(
          'div',
          {
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            fontFamily: 'JetBrains Mono',
            fontSize: 24,
          },
          [
            el(
              'div',
              {
                display: 'flex',
                color: chipColor(spec.status!),
                border: `2px solid ${chipColor(spec.status!)}`,
                borderRadius: 999,
                padding: '4px 18px',
                textTransform: 'uppercase',
                letterSpacing: 2,
              },
              spec.status,
            ),
            el(
              'div',
              { display: 'flex', color: C.muted },
              `updated ${spec.updated}`,
            ),
          ],
        )
      : el('div', { display: 'flex' });

  // display: 'block' (not 'flex') is required here — satori's line-clamp
  // engine only engages on block-display elements; a flex display silently
  // disables lineClamp and lets the title/subtitle overflow uncontrolled.
  const title = el(
    'div',
    {
      display: 'block',
      fontSize: spec.title.length > 70 ? 52 : 64,
      fontWeight: 700,
      color: C.fg,
      lineHeight: 1.15,
      lineClamp: 3,
      marginTop: 28,
    },
    titleText,
  );

  const subtitle =
    spec.kind === 'page'
      ? el(
          'div',
          {
            display: 'block',
            fontSize: 30,
            color: C.muted,
            marginTop: 24,
            lineClamp: 2,
          },
          subtitleText,
        )
      : el('div', { display: 'flex' });

  const root = el(
    'div',
    {
      width: 1200,
      height: 630,
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: C.ground,
      padding: 64,
      fontFamily: 'Inter',
    },
    [
      el('div', { display: 'flex', alignItems: 'center', gap: 24 }, [
        el('div', {
          display: 'flex',
          width: 40,
          height: 40,
          backgroundColor: C.square,
        }),
        meta,
      ]),
      title,
      subtitle,
      el('div', { display: 'flex', flexGrow: 1 }),
      el(
        'div',
        {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
        },
        [
          el(
            'div',
            { display: 'flex', fontSize: 28, fontWeight: 700, color: C.fg },
            'AI-Native SDLC',
          ),
          el(
            'div',
            {
              display: 'flex',
              fontSize: 22,
              fontFamily: 'JetBrains Mono',
              color: C.muted,
            },
            'jazzli.github.io/ai-native-sdlc',
          ),
        ],
      ),
    ],
  );

  return root;
}

export async function renderCard(spec: CardSpec): Promise<Buffer> {
  const root = cardElement(spec);
  const svg = await satori(root as never, {
    width: 1200,
    height: 630,
    fonts: FONTS,
  });
  return Buffer.from(new Resvg(svg).render().asPng());
}
