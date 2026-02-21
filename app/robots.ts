import type { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/','/about','/explore','/view-story/'],
        disallow: [
          '/private/',
          '/admin',
          '/dashboard',
          '/users',
          '/buy-credits',
          '/create-story',
          '/sign-in',
          '/sign-up',
        ],
      },
    ],
    sitemap: 'https://www.talecrafter.tech/sitemap.xml',
  }
}
