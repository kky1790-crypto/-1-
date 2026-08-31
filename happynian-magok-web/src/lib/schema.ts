import { SITE_URL, BRAND, CONTACT, withBase } from '@/data/site';
import { primaryDesigner } from '@/data/designers';

/**
 * Resolves a path against the site origin as-is — no base-path handling.
 * Use this directly only for strings that already include the base
 * (asset URLs returned by astro:assets' getImage(), which are base-aware
 * automatically). For a logical page path like '/work/foo/', wrap it in
 * withBase() first — see absoluteBasePath() below for the common case.
 */
export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}

/** absoluteUrl(withBase(path)) — the right choice for any logical page path. */
export function absoluteBasePath(path: string): string {
  return absoluteUrl(withBase(path));
}

/**
 * Person schema for 강윤. The 11-year-experience line is only appended
 * when `includeExperience` is true — pass it solely on pages where that
 * fact is actually shown in the visible body copy (the homepage ABOUT
 * section), so JSON-LD never states something the page doesn't display.
 */
export function personSchema(includeExperience: boolean) {
  const description = includeExperience
    ? `${primaryDesigner.name} — ${primaryDesigner.role}. ${primaryDesigner.yearsExperience}년 경력.`
    : `${primaryDesigner.name} — ${primaryDesigner.role}.`;

  return {
    '@type': 'Person',
    '@id': absoluteBasePath('/#kangyoon'),
    name: primaryDesigner.name,
    jobTitle: primaryDesigner.role,
    description,
    worksFor: { '@id': absoluteBasePath('/#happynian-magok') },
    sameAs: [CONTACT.instagramUrl, CONTACT.naverBookingUrl],
  };
}

export function hairSalonSchema(imageUrl: string) {
  return {
    '@type': 'HairSalon',
    '@id': absoluteBasePath('/#happynian-magok'),
    name: BRAND.shopName,
    image: imageUrl,
    url: absoluteBasePath('/'),
    address: {
      '@type': 'PostalAddress',
      streetAddress: CONTACT.streetAddress,
      addressLocality: CONTACT.addressLocality,
      addressRegion: CONTACT.addressRegion,
      addressCountry: 'KR',
    },
    sameAs: [CONTACT.instagramUrl, CONTACT.naverBookingUrl, CONTACT.naverMapUrl],
  };
}

export interface CrumbItem {
  name: string;
  path: string;
}

export function breadcrumbSchema(items: CrumbItem[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteBasePath(item.path),
    })),
  };
}

export interface ArticleSchemaInput {
  headline: string;
  description: string;
  path: string;
  datePublished: string;
  dateModified: string;
  authorName: string;
}

export function articleSchema(input: ArticleSchemaInput) {
  return {
    '@type': 'Article',
    headline: input.headline,
    description: input.description,
    mainEntityOfPage: absoluteBasePath(input.path),
    datePublished: input.datePublished,
    dateModified: input.dateModified,
    inLanguage: 'ko',
    author: {
      '@type': 'Person',
      name: input.authorName,
    },
    publisher: {
      '@type': 'HairSalon',
      name: BRAND.shopName,
    },
  };
}

export function withContext(nodes: object[]) {
  return {
    '@context': 'https://schema.org',
    '@graph': nodes,
  };
}
