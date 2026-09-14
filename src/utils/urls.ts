const LEETCODE_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function getLeetCodeProblemUrl(slug: string): string {
  const normalizedSlug = slug.toLowerCase().trim();
  if (!LEETCODE_SLUG_PATTERN.test(normalizedSlug)) return 'https://leetcode.com/problemset/';
  return `https://leetcode.com/problems/${normalizedSlug}/`;
}

export function getProblemOutboundUrl(slug: string): string {
  const normalizedSlug = slug.toLowerCase().trim();
  if (!LEETCODE_SLUG_PATTERN.test(normalizedSlug)) return '/out/leetcode';
  return `/out/leetcode/${normalizedSlug}`;
}

