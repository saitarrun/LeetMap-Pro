# SEO Action Plan

## Completed in this remediation

- Quality-gated the sitemap and applied `noindex,follow` to thin programmatic pages.
- Removed the inherited homepage canonical from non-home routes.
- Made site search URLs functional for the WebSite `SearchAction`.
- Matched FAQ JSON-LD to visible FAQ content on company, SQL, and pattern pages.
- Added About/methodology, source provenance, correction guidance, Dataset schema, public data APIs, and stable RSS/Atom feeds.
- Corrected stale catalog counts, social image text, privacy disclosures, heading order, text contrast, and the AdSense CSP allowlist.
- Preserved crawl access to noindexed account/auth routes so crawlers can see their page-level directives.
- Aligned the protected IndexNow submission with the quality-gated sitemap and scheduled it after daily data publication.
- Submitted all 303 canonical URLs to IndexNow and Bing (HTTP 200) and successfully resubmitted the sitemap in Google Search Console.
- Deferred AdSense loading and verified the production build, lint, TypeScript, and dependency security audit.

## P0 — after deployment

1. Wait for Search Console to read the resubmitted sitemap and replace its former 764-page discovered count with the 303-page quality-gated set.
2. Inspect one high-value company URL, one pattern URL, and one SQL URL, then request indexing after confirming the live canonical and rendered HTML.
3. Start validation for “Crawled – currently not indexed” and “Discovered – currently not indexed” after the new sitemap is read.
4. Set the apex-domain redirect to permanent in Vercel’s domain settings.
5. Re-run the authenticated indexing audit after Google reports a new last-read date.

## P1 — improve Google’s index selection

1. Use Search Console query/impression data to prioritize the top 50 company pages.
2. Add genuinely company-specific editorial notes only where supported by source data; do not manufacture interview claims.
3. Add contextual links from relevant pattern and SQL guides to priority company pages.
4. Keep the sitemap threshold under review and exclude pages that cannot provide distinct search value.
5. Compare index counts weekly; avoid repeatedly changing sitemap timestamps unless the underlying dataset changed.

## P2 — measurement and authority

1. Connect authenticated Search Console and CrUX data to verify field Core Web Vitals.
2. Earn relevant editorial backlinks to the methodology, pattern guides, and data resource rather than mass-linking individual thin pages.
3. Publish evidence-based research summaries from the dataset that can attract citations from both search engines and LLM answers.
4. Record a new crawl/Lighthouse/Search Console baseline after Google has recrawled the release.

## Success criteria

- Lighthouse SEO remains 100 on all representative templates.
- No indexable sitemap URL returns non-200, a foreign canonical, or `noindex`.
- Search Console discovered-not-indexed and crawled-not-indexed totals trend downward after validation.
- Field Core Web Vitals pass once sufficient real-user data is available.
- Public methodology and machine-readable sources remain synchronized with each dataset release.
