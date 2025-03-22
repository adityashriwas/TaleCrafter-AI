import type { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '*',
      disallow: '/private/',
    },
    sitemap: 'https://talecrafter-ai.vercel.app/sitemap.xml',
  }
}