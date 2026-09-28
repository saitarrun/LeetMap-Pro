# LeetMap Pro SEO Audit

Audit date: 2026-09-27  
Audited URL: https://www.leetmap-pro.com  
Method: complete sitemap crawl, repository and rendered-output inspection, mobile Lighthouse runs, robots/sitemap/feed checks, AI-crawler checks, and the supplied Google Search Console coverage export.

## Executive summary

**Lighthouse SEO: 100/100. Overall SEO health: 90/100.**

The site now has a sound technical SEO foundation: canonical public URLs return 200, sitemap pages are indexable and self-canonical, key pages are server-rendered, structured data matches visible content, and machine-readable discovery endpoints are available. The gap between the perfect Lighthouse SEO score and the broader health score is Google index selection, not a site-wide crawl block.

The latest row in the supplied Search Console export reports:

- 193 indexed URLs
- 581 not-indexed URLs
- 526 discovered but currently not indexed
- 53 crawled but currently not indexed
- 2 redirect URLs

Google discovery has therefore improved from 169 to 193 indexed URLs in the same export, but most previously submitted catalog URLs remain outside the index.

## Verified strengths

- All 302 URLs in the pre-remediation quality-gated sitemap returned HTTP 200, were indexable, and used self-referencing canonicals in the full crawl. The generated post-remediation sitemap contains 303 URLs after adding `/about`.
- The generated sitemap intentionally contains the strongest 262 company pages, 11 SQL detail pages, 24 pattern pages, and 6 other public pages. Thin company and SQL pages are accessible but marked `noindex,follow` and omitted from the sitemap.
- Mobile Lighthouse SEO scored 100 on the homepage and representative `/patterns`, `/sql`, `/strategy`, and pattern-detail pages.
- Mobile Lighthouse performance scored 94–100 on the sampled templates. Homepage lab metrics were approximately FCP 1.1 s, LCP 1.1–1.3 s, TBT 70 ms, and CLS 0.002.
- Titles, descriptions, canonicals, Open Graph metadata, sitemap dates, RSS/Atom dates, and generated social imagery use current dataset values.
- `robots.txt`, `sitemap.xml`, `llms.txt`, RSS, Atom, `humans.txt`, the About/methodology page, and public JSON APIs expose useful discovery and provenance signals.
- GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, PerplexityBot, Google-Extended, CCBot, and Bytespider can retrieve the public site.
- FAQ structured data on company, SQL, and pattern pages is generated from the same content users can see.
- The production build generates 790 routes successfully; lint, TypeScript, and the high-severity dependency audit pass.

## Findings by priority

### High: Google index selection backlog

Search Console still lists 526 discovered-not-indexed and 53 crawled-not-indexed URLs. The repository cannot force Google to index a URL. The deployed sitemap should be resubmitted, representative fixed URLs should be inspected, and validation should be started in Search Console. Index coverage must then be monitored over multiple crawls.

### Medium: programmatic-page differentiation

Indexable company pages now include company-specific counts, recent-question totals, top topics, difficulty distribution, visible provenance, refresh dates, and data-driven FAQs. They remain generated from a shared template, so the highest-demand companies should continue receiving genuinely unique editorial guidance and stronger contextual links. Low-volume pages should remain outside the sitemap until they pass the content threshold.

### Medium: field performance is unverified

Lighthouse lab results are strong, but the PageSpeed Insights API returned a quota error and no authenticated CrUX or Search Console Core Web Vitals data was available. Lab results do not prove real-user INP/LCP/CLS.

### Low: third-party JavaScript

AdSense and Clerk account for most measured unused JavaScript. AdSense now loads with `lazyOnload`, but further gains would require viewport-triggered ad loading and route-level isolation of authentication code. These are performance architecture changes, not crawlability defects.

### External configuration

The apex-domain redirect was observed as a temporary redirect at the hosting edge even though the repository proxy uses a permanent redirect. Configure `leetmap-pro.com` to redirect permanently to `www.leetmap-pro.com` in the Vercel domain dashboard. The retired `leetmap-hub.vercel.app` hostname returns 404; redirect it only if the deployment still owns that hostname.

## Audit matrix

| Area | Result |
|---|---|
| Technical | Pass: complete sitemap crawl returned 200, self-canonical, indexable pages. |
| On-page | Pass: unique titles/H1s and concise descriptions; ongoing editorial differentiation recommended. |
| Schema | Pass in code/render inspection: WebSite, Organization, CollectionPage, ItemList, Breadcrumb, FAQ, AboutPage, and Dataset entities are aligned with visible content. |
| Images | Pass: generated 1200×630 Open Graph imagery and local optimized assets are used. |
| Sitemap | Pass: 303 quality-gated canonical URLs with dataset-based modification dates. |
| GEO / LLM | Pass: open crawler policy, `llms.txt`, methodology, feeds, sitemap, and public JSON endpoints. |
| Performance | Strong lab results (94–100); field CWV unavailable. |
| Accessibility | Remediated sampled contrast and heading-order issues; verify again after deployment. |
| Programmatic SEO | Thresholding is active; high-value pages have richer data-driven context. |
| Hreflang | Not applicable to this single-locale English site. |
| Local / ecommerce | Not applicable to this product. |
| Backlinks | Not scored; no backlink-provider data was available. |
| Search Console | Needs post-deployment sitemap resubmission and validation. |

## Limitations

- No authenticated Google Search Console, GA4, CrUX, DataForSEO, or backlink-provider API access was available.
- Google Rich Results Test does not provide an automatable authenticated API in this environment; rendered JSON-LD was inspected directly.
- The supplied Search Console export contains aggregate issue counts but no example-URL table.
- Rankings and indexation are controlled by search engines; technical compliance and submission do not guarantee inclusion.
