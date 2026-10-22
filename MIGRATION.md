# Retiring the old TaleCrafter website

Deploy this directory to the OLD Vercel project serving talecrafterai.tech.
Do not deploy it to the new talecrafterai.com project.

- Middleware permanently redirects known pages and verified published story URLs to https://www.talecrafterai.com using HTTP 308.
- Unknown URLs return HTTP 410 with a branded migration notice and noindex directives. They do not redirect to unrelated stories.
- Old APIs and non-GET/HEAD requests return 410. Payment callbacks, authentication tokens and generation requests are never forwarded.
- Redirects use a committed public URL map; visitors trigger no database or AI calls.
- robots.txt permits crawling so Google can see the redirects and removed pages. Do not add a blanket Disallow rule.

## Deployment checklist

1. Deploy to the existing old-domain project and test the homepage, an old story URL, an unmatched URL, robots.txt and an old API endpoint.
2. Keep both old-domain variants attached to that project with working DNS and HTTPS.
3. Verify ownership of both domains in Google Search Console. Submit the new sitemap and use Change of Address for the domain move.
4. Keep the old domain and redirects active for at least a year if possible. Once the domain expires, neither redirects nor this notice can be guaranteed.
5. Retire unused old billing webhooks and rotate/revoke old app credentials after confirming nothing else depends on them. Middleware does not revoke credentials embedded in previously downloaded clients.

Google indexing changes are not immediate or guaranteed. Monitor the old URLs and new canonical URLs in Search Console.

## Refresh the story mapping

From this folder in the combined workspace, run `node scripts/build-migration-map.mjs`.
The operator script reads ignored `../server/.env` using the current app's installed tooling. It requires LEGACY_DATABASE_URL and PRODUCTION_DATABASE_URL and performs SELECT queries only. Only published production matches are included. No credentials or private user records are written into the map.

Run `node --test scripts/retirement.test.mjs` before deploying.
