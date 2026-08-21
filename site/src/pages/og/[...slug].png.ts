import type { APIRoute } from 'astro';
import { renderCard } from '../../lib/og-card';
import { allCardTargets } from '../../lib/og-slug';

export function getStaticPaths() {
  return allCardTargets().map((t) => ({
    params: { slug: t.slug },
    props: { spec: t.spec },
  }));
}

export const GET: APIRoute = async ({ props }) =>
  new Response(new Uint8Array(await renderCard(props.spec)), {
    headers: { 'Content-Type': 'image/png' },
  });
