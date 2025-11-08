import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://tbgroup.kz';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    '',
    '/services',
    '/cases',
    '/reviews',
    '/about',
    '/contact',
  ].map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
  }));
}
