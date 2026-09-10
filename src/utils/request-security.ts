const SAME_ORIGIN_FETCH_SITES = new Set(['same-origin', 'none']);

export function isTrustedMutationRequest(request: Request): boolean {
  const fetchSite = request.headers.get('sec-fetch-site');
  if (fetchSite && !SAME_ORIGIN_FETCH_SITES.has(fetchSite)) return false;

  const origin = request.headers.get('origin');
  if (!origin) return true;

  try {
    return origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}
