import type { APIRoute } from 'astro';
import { SITE_URL, withBase } from '@/data/site';

export const GET: APIRoute = () => {
  const body = `User-agent: *
Allow: /

User-agent: OAI-SearchBot
Allow: /

Sitemap: ${new URL(withBase('/sitemap-index.xml'), SITE_URL).toString()}
`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
