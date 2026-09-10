import { UserProfile } from '@/types';

const GUEST_KEY = 'grindmap_solved_guest';
const LEGACY_KEY = 'grindmap_solved_problems';
const ACTIVE_USER_KEY = 'grindmap_active_user';

export function getActiveUser(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(ACTIVE_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function setActiveUser(user: UserProfile | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (user) {
      localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(ACTIVE_USER_KEY);
    }
  } catch (e) {
    console.error('Failed to update active user in storage:', e);
  }
  // Notify all components that active profile/progress changed
  window.dispatchEvent(new CustomEvent('grindmap-solved-updated', { detail: { count: getSolvedCount() } }));
}

export function getStorageKey(username?: string): string {
  if (username) {
    return `grindmap_solved_${username.toLowerCase()}`;
  }
  const user = getActiveUser();
  if (user?.username) {
    return `grindmap_solved_${user.username.toLowerCase()}`;
  }
  return GUEST_KEY;
}

export function getSolvedProblems(username?: string): Set<string> {
  if (typeof window === 'undefined') return new Set();
  const key = getStorageKey(username);
  try {
    let raw = localStorage.getItem(key);

    // Auto-migration from legacy single-user key if guest/active storage is empty
    if (!raw && key === GUEST_KEY) {
      const legacy = localStorage.getItem(LEGACY_KEY);
      if (legacy) {
        localStorage.setItem(GUEST_KEY, legacy);
        raw = legacy;
      }
    }

    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch (e) {
    console.error(`Failed to parse solved problems for key ${key}:`, e);
    return new Set();
  }
}

export function isProblemSolved(slug: string, username?: string): boolean {
  return getSolvedProblems(username).has(slug);
}

export function toggleProblemSolved(slug: string, username?: string): boolean {
  if (typeof window === 'undefined') return false;
  const key = getStorageKey(username);
  const set = getSolvedProblems(username);
  let solved = false;

  if (set.has(slug)) {
    set.delete(slug);
    solved = false;
  } else {
    set.add(slug);
    solved = true;
  }

  try {
    localStorage.setItem(key, JSON.stringify(Array.from(set)));
    window.dispatchEvent(
      new CustomEvent('grindmap-solved-updated', {
        detail: { slug, solved, count: set.size, key },
      })
    );
  } catch (e) {
    console.error(`Failed to save solved problems for key ${key}:`, e);
  }

  return solved;
}

export function getSolvedCount(username?: string): number {
  return getSolvedProblems(username).size;
}

/**
 * Optionally migrate solved problems from guest mode into the signed-in user's profile.
 */
export function migrateGuestToUser(targetUsername: string): number {
  if (typeof window === 'undefined' || !targetUsername) return 0;
  const guestSet = getSolvedProblems(undefined); // guest
  if (guestSet.size === 0) return 0;

  const userSet = getSolvedProblems(targetUsername);
  let merged = 0;
  guestSet.forEach((slug) => {
    if (!userSet.has(slug)) {
      userSet.add(slug);
      merged++;
    }
  });

  const userKey = getStorageKey(targetUsername);
  localStorage.setItem(userKey, JSON.stringify(Array.from(userSet)));
  window.dispatchEvent(new CustomEvent('grindmap-solved-updated', { detail: { count: userSet.size } }));
  return merged;
}
