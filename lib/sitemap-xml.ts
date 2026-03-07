import { SITE_URL } from "@/lib/seo";

export const STORY_SITEMAP_PAGE_SIZE = 50000;

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export const buildUrlSetXml = (
  entries: Array<{ loc: string; lastmod?: string; changefreq?: string; priority?: number }>
) => {
  const body = entries
    .map((entry) => {
      const lastmod = entry.lastmod ? `<lastmod>${escapeXml(entry.lastmod)}</lastmod>` : "";
      const changefreq = entry.changefreq
        ? `<changefreq>${escapeXml(entry.changefreq)}</changefreq>`
        : "";
      const priority =
        typeof entry.priority === "number" ? `<priority>${entry.priority.toFixed(1)}</priority>` : "";

      return `<url><loc>${escapeXml(entry.loc)}</loc>${lastmod}${changefreq}${priority}</url>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`;
};

export const buildSitemapIndexXml = (locs: string[]) => {
  const now = new Date().toISOString();
  const body = locs
    .map((loc) => `<sitemap><loc>${escapeXml(loc)}</loc><lastmod>${escapeXml(now)}</lastmod></sitemap>`)
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</sitemapindex>`;
};

export const staticSitemapEntries = () => {
  const now = new Date().toISOString();
  return [
    { loc: SITE_URL, lastmod: now, changefreq: "weekly", priority: 1.0 },
    { loc: `${SITE_URL}/about`, lastmod: now, changefreq: "monthly", priority: 0.8 },
    { loc: `${SITE_URL}/explore`, lastmod: now, changefreq: "daily", priority: 0.9 },
    { loc: `${SITE_URL}/create-story`, lastmod: now, changefreq: "weekly", priority: 0.9 },
    {
      loc: `${SITE_URL}/ai-fantasy-story-generator`,
      lastmod: now,
      changefreq: "weekly",
      priority: 0.9,
    },
    {
      loc: `${SITE_URL}/ai-bedtime-story-generator`,
      lastmod: now,
      changefreq: "weekly",
      priority: 0.9,
    },
  ];
};
