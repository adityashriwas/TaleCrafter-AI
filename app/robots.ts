import type { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/','/about','/explore','/create-story','/view-story/'],
        disallow: [
          '/private/',
          '/admin',
          '/dashboard',
          '/users',
          '/buy-credits',
          '/sign-in',
          '/sign-up',
        ],
      },
    ],
    sitemap: 'https://www.talecrafterai.tech/sitemap.xml',
  }
}
