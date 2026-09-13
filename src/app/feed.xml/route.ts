import fs from 'fs';
import path from 'path';

export const dynamic = 'force-static';
export const revalidate = 86400; // 24 hours

const BASE_URL = 'https://www.leetmap-pro.com';

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const isAtom = searchParams.get('format') === 'atom';
  const pubDate = new Date().toUTCString();
  const isoDate = new Date().toISOString();

  // Load top companies
  const companiesPath = path.join(process.cwd(), 'public', 'data', 'companies.json');
  let topCompanies: Array<{ slug: string; name: string; total: number; easy: number; medium: number; hard: number }> = [];
  if (fs.existsSync(companiesPath)) {
    try {
      const all = JSON.parse(fs.readFileSync(companiesPath, 'utf8'));
      topCompanies = all.slice(0, 30);
    } catch {}
  }

  // Load patterns
  const patternsPath = path.join(process.cwd(), 'public', 'data', 'patterns.json');
  let patterns: Array<{ slug: string; name: string; tagline: string; total: number }> = [];
  if (fs.existsSync(patternsPath)) {
    try {
      patterns = JSON.parse(fs.readFileSync(patternsPath, 'utf8'));
    } catch {}
  }

  if (isAtom) {
    const entries = [
      `
      <entry>
        <title>LeetMap Pro Strategy &amp; Prerequisite Roadmap</title>
        <link href="${BASE_URL}/strategy" />
        <id>${BASE_URL}/strategy</id>
        <updated>${isoDate}</updated>
        <summary>Master 18 core coding interview patterns in optimal dependency order.</summary>
      </entry>`,
      `
      <entry>
        <title>LeetMap Pro SQL Interview Hub</title>
        <link href="${BASE_URL}/sql" />
        <id>${BASE_URL}/sql</id>
        <updated>${isoDate}</updated>
        <summary>Company-wise SQL database interview questions and solution guides.</summary>
      </entry>`,
      ...topCompanies.map(
        (c) => `
      <entry>
        <title>${escapeXml(c.name)} LeetCode Interview Questions (${c.total} Problems)</title>
        <link href="${BASE_URL}/company/${c.slug}" />
        <id>${BASE_URL}/company/${c.slug}</id>
        <updated>${isoDate}</updated>
        <summary>Practice ${c.total} technical interview problems asked at ${escapeXml(c.name)}, ranked by frequency: ${c.easy} Easy, ${c.medium} Medium, ${c.hard} Hard.</summary>
      </entry>`
      ),
      ...patterns.map(
        (p) => `
      <entry>
        <title>${escapeXml(p.name)} Pattern (${p.total} Problems)</title>
        <link href="${BASE_URL}/patterns/${p.slug}" />
        <id>${BASE_URL}/patterns/${p.slug}</id>
        <updated>${isoDate}</updated>
        <summary>${escapeXml(p.tagline || 'Master coding interview problems in this pattern.')}</summary>
      </entry>`
      ),
    ].join('\n');

    const atomXml = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>LeetMap Pro | Company Wise Leetcode and SQL Questions</title>
  <subtitle>Browse coding interview problems asked by 680+ tech companies, ranked by frequency and recency.</subtitle>
  <link href="${BASE_URL}/feed.xml?format=atom" rel="self" />
  <link href="${BASE_URL}" />
  <id>${BASE_URL}/</id>
  <updated>${isoDate}</updated>
  <author>
    <name>LeetMap Pro</name>
    <uri>${BASE_URL}</uri>
  </author>
  ${entries}
</feed>`;

    return new Response(atomXml, {
      headers: {
        'Content-Type': 'application/atom+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  }

  // Default: RSS 2.0
  const items = [
    `
    <item>
      <title>LeetMap Pro Strategy &amp; Prerequisite Roadmap</title>
      <link>${BASE_URL}/strategy</link>
      <guid>${BASE_URL}/strategy</guid>
      <pubDate>${pubDate}</pubDate>
      <description>Master 18 core coding interview patterns in optimal dependency order.</description>
    </item>`,
    `
    <item>
      <title>LeetMap Pro SQL Interview Hub</title>
      <link>${BASE_URL}/sql</link>
      <guid>${BASE_URL}/sql</guid>
      <pubDate>${pubDate}</pubDate>
      <description>Company-wise SQL database interview questions and solution guides.</description>
    </item>`,
    ...topCompanies.map(
      (c) => `
    <item>
      <title>${escapeXml(c.name)} LeetCode Interview Questions (${c.total} Problems)</title>
      <link>${BASE_URL}/company/${c.slug}</link>
      <guid>${BASE_URL}/company/${c.slug}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>Practice ${c.total} technical interview problems asked at ${escapeXml(c.name)}, ranked by frequency: ${c.easy} Easy, ${c.medium} Medium, ${c.hard} Hard.</description>
    </item>`
    ),
    ...patterns.map(
      (p) => `
    <item>
      <title>${escapeXml(p.name)} Pattern (${p.total} Problems)</title>
      <link>${BASE_URL}/patterns/${p.slug}</link>
      <guid>${BASE_URL}/patterns/${p.slug}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(p.tagline || 'Master coding interview problems in this pattern.')}</description>
    </item>`
    ),
  ].join('\n');

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>LeetMap Pro | Company Wise Leetcode and SQL Questions</title>
    <link>${BASE_URL}</link>
    <description>Browse coding interview problems asked by 680+ tech companies, ranked by frequency and recency. Free interactive strategy roadmap and curated SQL problems.</description>
    <language>en-US</language>
    <lastBuildDate>${pubDate}</lastBuildDate>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;

  return new Response(rssXml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
