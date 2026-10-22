import stories from "./story-redirects.json" with { type: "json" };

export const NEW_ORIGIN = "https://www.talecrafterai.com";
const pages = new Map([
  ["/", "/"],
  ["/about", "/about"],
  ["/explore", "/explore"],
  ["/create-story", "/create-story"],
  ["/dashboard", "/dashboard"],
  ["/admin", "/admin"],
  ["/users", "/dashboard"],
  ["/buy-credits", "/pricing"],
  ["/pricing", "/pricing"],
  ["/privacy-policy", "/privacy-policy"],
  ["/terms-and-conditions", "/terms-and-conditions"],
]);

const notice = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,follow"><title>TaleCrafter AI has moved</title><style>
*{box-sizing:border-box}body{margin:0;background:#091521;color:#f1eadb;font-family:system-ui,sans-serif;letter-spacing:0}main{max-width:1040px;min-height:100svh;margin:auto;padding:40px 28px;display:flex;flex-direction:column}header{display:flex;align-items:center;gap:12px;font-size:24px;font-weight:650}header img{object-fit:contain}section{margin:auto 0;padding:64px 0;max-width:720px}.eyebrow{color:#d8c69e;font-size:13px;font-weight:600}h1{font-size:48px;line-height:1.15;margin:18px 0 24px}p{font-size:18px;line-height:1.65;color:#bac3cc}a{color:#d8c69e}a:focus-visible{outline:3px solid #8bd8c4;outline-offset:5px}.cta{display:inline-block;background:#d8c69e;color:#091521;text-decoration:none;padding:14px 22px;border-radius:6px;font-weight:650;margin:16px 0}.note{font-size:14px;max-width:580px}footer{border-top:1px solid #34414c;padding-top:20px;font-size:14px}@media(max-width:600px){main{padding:24px 20px}header{font-size:21px}h1{font-size:34px}p{font-size:16px}section{padding:48px 0}}
</style></head><body><main><header><img src="/app_logo.png" alt="" width="48" height="48">TaleCrafter AI</header><section><p class="eyebrow">OUR NEW HOME</p><h1>Your next story starts at our new home.</h1><p>The new TaleCrafter AI is now available at <strong>www.talecrafterai.com</strong>. This old address is being retired and may stop working soon.</p><a class="cta" href="${NEW_ORIGIN}">Visit the new TaleCrafter &rarr;</a><p class="note">This old link is no longer available. Explore the latest stories on our new website, and update your bookmarks.</p></section><footer><a href="mailto:contact@talecrafterai.com">contact@talecrafterai.com</a></footer></main></body></html>`;

export function retirementResponse(request) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, "") || "/";
  const head = request.method === "HEAD";
  const retired = {
    "X-Robots-Tag": "noindex, follow",
    "Cache-Control": "no-store",
  };
  // Never forward old credentials, payment callbacks, or generation requests.
  if (
    !["GET", "HEAD"].includes(request.method) ||
    /^\/(api|trpc)(\/|$)/.test(path)
  ) {
    return new Response(
      head
        ? null
        : JSON.stringify({
            message:
              "This version of TaleCrafter AI has retired. Please visit our new website.",
            website: NEW_ORIGIN,
          }),
      {
        status: 410,
        headers: { ...retired, "Content-Type": "application/json" },
      },
    );
  }
  if (path === "/robots.txt") {
    return new Response(
      head
        ? null
        : `User-agent: *\nAllow: /\nSitemap: ${NEW_ORIGIN}/sitemap.xml\n`,
      {
        headers: {
          "Content-Type": "text/plain",
          "Cache-Control": "public, max-age=300",
        },
      },
    );
  }
  if (
    ["/app_logo.png", "/favicon.ico"].includes(path) ||
    /^\/google[a-z0-9]+\.html$/.test(path)
  )
    return null;
  let target =
    pages.get(path) ??
    (Object.hasOwn(stories, path) ? stories[path] : undefined);
  if (/^\/sign-(in|up)(\/|$)/.test(path))
    target = path.startsWith("/sign-in") ? "/sign-in" : "/sign-up";
  if (/^\/sitemap[^/]*\.xml$/.test(path)) target = "/sitemap.xml";
  if (target) {
    const destination = new URL(target, NEW_ORIGIN);
    if (path === "/explore" && url.searchParams.has("genre"))
      destination.searchParams.set("genre", url.searchParams.get("genre"));
    return new Response(null, {
      status: 308,
      headers: {
        Location: destination.href,
        "Cache-Control": "public, max-age=3600",
      },
    });
  }
  return new Response(head ? null : notice, {
    status: 410,
    headers: { ...retired, "Content-Type": "text/html; charset=utf-8" },
  });
}
