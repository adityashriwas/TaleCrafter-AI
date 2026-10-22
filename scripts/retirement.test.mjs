import test from "node:test";
import assert from "node:assert/strict";
import { retirementResponse, NEW_ORIGIN } from "../lib/retirement.mjs";
import stories from "../lib/story-redirects.json" with { type: "json" };

const request = (path, method = "GET") =>
  retirementResponse(
    new Request(`https://talecrafterai.tech${path}`, { method }),
  );

test("known pages permanently redirect without forwarding credentials or redirect parameters", () => {
  for (const [path, target] of [
    ["/", "/"],
    ["/buy-credits", "/pricing"],
    [
      "/sign-in/callback?token=secret&redirect_url=https://example.com",
      "/sign-in",
    ],
  ]) {
    const result = request(path);
    assert.equal(result.status, 308);
    assert.equal(result.headers.get("location"), `${NEW_ORIGIN}${target}`);
    assert.equal(result.headers.get("x-robots-tag"), null);
  }
});

test("every verified story maps to its new canonical page", () => {
  assert.ok(Object.keys(stories).length > 0);
  for (const [path, target] of Object.entries(stories)) {
    assert.match(target, /^\/story\//);
    assert.equal(request(path).status, 308);
    assert.equal(
      request(path).headers.get("location"),
      `${NEW_ORIGIN}${target}`,
    );
  }
});

test("retired URLs show a non-indexable migration notice, including HEAD", async () => {
  const result = request("/story/unmatched-story");
  assert.equal(result.status, 410);
  assert.equal(result.headers.get("x-robots-tag"), "noindex, follow");
  assert.match(await result.text(), /Visit the new TaleCrafter/);
  assert.equal(await request("/story/unmatched-story", "HEAD").text(), "");
});

test("old APIs and write requests are retired, not forwarded", () => {
  for (const [path, method] of [
    ["/api/gemini", "POST"],
    ["/api/feedback", "GET"],
    ["/create-story", "POST"],
    ["/", "DELETE"],
  ]) {
    const result = request(path, method);
    assert.equal(result.status, 410);
    assert.equal(result.headers.get("location"), null);
  }
});

test("crawlers can discover redirects and the new sitemap", async () => {
  assert.match(
    await request("/robots.txt").text(),
    /Allow: \/\nSitemap: https:\/\/www.talecrafterai.com\/sitemap.xml/,
  );
  assert.equal(
    request("/sitemap-stories-1.xml").headers.get("location"),
    `${NEW_ORIGIN}/sitemap.xml`,
  );
});

test("notice assets and Search Console verification remain accessible", () => {
  assert.equal(request("/app_logo.png"), null);
  assert.equal(request("/google0f5026721a8a8ce7.html"), null);
  assert.equal(request("/favicon.ico"), null);
});
