# LeetMap Pro SEO Audit

Audit date: 2026-09-27  
Audited URL: https://www.leetmap-pro.com  
Method: live HTTP checks, repository inspection, sitemap/robots inspection, representative page sampling, and the supplied Search Console coverage export.

## Executive summary

Estimated SEO health: **74/100**.

LeetMap Pro is technically crawlable and has strong metadata, structured data, canonical URLs, feeds, `llms.txt`, and a reachable sitemap. The current indexing problem is primarily a catalog-scale prioritization problem rather than a site-wide `noindex`, robots, or HTTP failure.

Search Console export (`https___www.leetmap-pro.com_-Coverage-2026-09-27.zip`) reports:

- 169 indexed URLs
- 603 not indexed URLs
- 526 discovered but not indexed
- 53 crawled but not indexed
- 2 redirect URLs

The sitemap exposes approximately 764 URLs. Representative homepage, company, pattern, SQL, and strategy pages all returned HTTP 200 with `index, follow` and self-referencing canonicals.

## Strengths

- Static/SSG generation is active for the catalog pages.
- Page titles, descriptions, canonicals, robots metadata, and Open Graph metadata are present.
- `robots.txt`, `sitemap.xml`, `ads.txt`, RSS, and `llms.txt` are reachable with HTTP 200.
- Structured data is present on sampled pages (four JSON-LD blocks observed per page).
- Security headers and CSP are strong and include the required Google ad domains.
- Company, pattern, and SQL pages contain substantial server-rendered HTML rather than empty client shells.

## Findings

### Critical

None found in the live technical sample. No broad robots block, no site-wide noindex, and no 4xx/5xx response was observed on sampled canonical pages.

### High

1. **Large discovered-not-indexed backlog.** Google has discovered most catalog URLs but has not selected them for crawling/indexing. Similar company and SQL directory pages compete for crawl and indexing priority.
2. **Catalog pages need stronger differentiation.** Company pages share a common template and may be judged as low-value or substantially similar when a company has a small problem set. Add unique, useful company-level summaries, methodology, recent-question insights, and internal links to the strongest related patterns.
3. **Search Console needs post-deployment validation.** The sitemap and robots changes must be deployed before validation; then submit the sitemap and validate the affected indexing states.

### Medium

1. Sitemap timestamps should only change when data changes. This was fixed in code to use `sync-status.json` rather than the request time.
2. Keep low-value utility/authentication URLs out of the sitemap. They are currently excluded, which is correct; continue checking generated sitemap diffs after data syncs.
3. Add an explicit indexation policy for very small company pages. Consider consolidating or noindexing pages that contain too little unique value, rather than asking Google to index every generated record.
4. Measure real Core Web Vitals with CrUX/Search Console or Lighthouse. This audit did not have Google API credentials or a browser performance runner, so CWV is unverified.

### Low

- Add visible “last updated” and data-source explanations consistently to catalog pages.
- Add breadcrumbs and `ItemList`/`CollectionPage` validation to a representative set in Rich Results Test.
- Continue building authoritative editorial links from pattern guides and strategy pages into high-value company pages.

## Technical SEO

- Homepage: HTTP 200, indexable, canonical to `/`.
- Company page sample: HTTP 200, indexable, canonical to its own URL.
- Pattern page sample: HTTP 200, indexable, canonical to its own URL.
- SQL page sample: HTTP 200, indexable, canonical to its own URL.
- Sitemap: HTTP 200, approximately 764 URLs.
- Robots: HTTP 200 and permits public content while excluding APIs, auth, settings, and outbound utility routes.
- No redirect chain was observed on canonical samples.

## Content and on-page SEO

Sampled pages have unique titles and H1s. The primary risk is programmatic similarity across hundreds of company pages, especially low-volume companies. Indexing should be prioritized around pages with meaningful demand, sufficient problem inventory, unique explanatory copy, and strong internal links.

## Structured data and AI readiness

JSON-LD appears on sampled pages, and `llms.txt` is available with links to the principal hubs, feed, and sitemap. Validate structured data externally after deployment; this audit did not have authenticated access to Google’s Rich Results Test or Search Console APIs.

## Limitations

- No authenticated Search Console, GA4, CrUX, backlink, or DataForSEO data was available.
- No browser-based Lighthouse or mobile visual run was available in this audit.
- The supplied coverage export contains aggregate counts, not the URL-level examples needed to diagnose every individual page.
- The crawl was sampled rather than a full 500-page crawl because the public sitemap contains more URLs and the site is a large generated catalog.

## Command-matrix results

| Audit | Result |
|---|---|
| Technical | Pass for sampled URLs; no crawl/noindex failure found. |
| Page/content | Strong titles and H1s; programmatic similarity is the main risk. |
| Schema | JSON-LD present on all samples; validate externally for warnings. |
| Images | Local `next/image` usage is good; sampled page image counts are low and most decorative assets are not an SEO dependency. |
| Sitemap | 764 URLs, no duplicate `<loc>` values observed; timestamps now use dataset publication time. |
| GEO/AI | `llms.txt`, RSS, descriptive hubs, and crawlable public pages are present. |
| Performance | HTTP TTFB samples were roughly 0.15–0.23s; full LCP/INP/CLS requires Lighthouse or CrUX. |
| Visual | Not measured with a browser screenshot runner; responsive classes and viewport metadata are present. |
| Programmatic | High scale and shared templates require minimum-value/indexation thresholds. |
| Competitor pages | No comparison/alternatives content strategy is currently evident; potential opportunity, not a defect. |
| Hreflang | No hreflang is needed for the current single-locale English site. |
| SXO | Clear user intent and direct task flows; strengthen internal links from hubs to priority pages. |
| Backlinks | Not measurable without backlink provider credentials; no authority score is inferred. |
| Cluster | Existing hubs are patterns, SQL, strategy, and company directories; expand spoke links and editorial context. |
| Drift | No prior baseline was available; this report is the initial baseline. |
