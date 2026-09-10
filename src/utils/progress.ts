const STORAGE_KEY = 'grindmap_solved_problems';

export function getSolvedProblems(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch (e) {
    console.error('Failed to parse solved problems:', e);
    return new Set();
  }
}

export function isProblemSolved(slug: string): boolean {
  return getSolvedProblems().has(slug);
}

export function toggleProblemSolved(slug: string): boolean {
  if (typeof window === 'undefined') return false;
  const set = getSolvedProblems();
  let solved = false;
  if (set.has(slug)) {
    set.delete(slug);
    solved = false;
  } else {
    set.add(slug);
    solved = true;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
    window.dispatchEvent(new CustomEvent('grindmap-solved-updated', { detail: { slug, solved, count: set.size } }));
  } catch (e) {
    console.error('Failed to save solved problems:', e);
  }
  return solved;
}

export function getSolvedCount(): number {
  return getSolvedProblems().size;
}
