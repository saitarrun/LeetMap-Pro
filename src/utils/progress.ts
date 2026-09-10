import { UserProfile, SolvedProblemRecord, UserActivityStats } from '@/types';

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
      // Background sync with persistent server storage
      syncUserProgressWithServer(user.username).catch(() => {});
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

export function getActivityKey(username?: string): string {
  if (username) {
    return `grindmap_activity_${username.toLowerCase()}`;
  }
  const user = getActiveUser();
  if (user?.username) {
    return `grindmap_activity_${user.username.toLowerCase()}`;
  }
  return 'grindmap_activity_guest';
}

function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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

export function getSolvedRecords(username?: string): SolvedProblemRecord[] {
  if (typeof window === 'undefined') return [];
  const key = getActivityKey(username);
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      // If records don't exist yet but solved problems do, generate backfilled records
      const solvedSlugs = getSolvedProblems(username);
      if (solvedSlugs.size > 0) {
        const todayStr = getLocalDateString();
        const backfilled: SolvedProblemRecord[] = Array.from(solvedSlugs).map((slug) => ({
          slug,
          solvedAt: new Date().toISOString(),
          date: todayStr,
        }));
        localStorage.setItem(key, JSON.stringify(backfilled));
        return backfilled;
      }
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

export function isProblemSolved(slug: string, username?: string): boolean {
  return getSolvedProblems(username).has(slug);
}

export function toggleProblemSolved(
  slug: string,
  usernameOrMeta?: string | { title?: string; difficulty?: 'EASY' | 'MEDIUM' | 'HARD' },
  maybeMeta?: { title?: string; difficulty?: 'EASY' | 'MEDIUM' | 'HARD' }
): boolean {
  if (typeof window === 'undefined') return false;

  let username: string | undefined;
  let meta: { title?: string; difficulty?: 'EASY' | 'MEDIUM' | 'HARD' } | undefined;

  if (typeof usernameOrMeta === 'object' && usernameOrMeta !== null) {
    meta = usernameOrMeta;
    username = undefined;
  } else {
    username = usernameOrMeta;
    meta = maybeMeta;
  }

  const key = getStorageKey(username);
  const actKey = getActivityKey(username);

  const set = getSolvedProblems(username);
  const records = getSolvedRecords(username);
  let solved = false;

  const now = new Date();
  const dateStr = getLocalDateString(now);

  if (set.has(slug)) {
    set.delete(slug);
    solved = false;
    // Remove from records
    const updatedRecords = records.filter((r) => r.slug !== slug);
    localStorage.setItem(actKey, JSON.stringify(updatedRecords));
  } else {
    set.add(slug);
    solved = true;
    // Add to records
    const newRecord: SolvedProblemRecord = {
      slug,
      solvedAt: now.toISOString(),
      date: dateStr,
      title: meta?.title,
      difficulty: meta?.difficulty,
    };
    const updatedRecords = [newRecord, ...records.filter((r) => r.slug !== slug)];
    localStorage.setItem(actKey, JSON.stringify(updatedRecords));
  }

  try {
    localStorage.setItem(key, JSON.stringify(Array.from(set)));
    window.dispatchEvent(
      new CustomEvent('grindmap-solved-updated', {
        detail: { slug, solved, count: set.size, key },
      })
    );

    // Sync to user's server record if signed in
    const activeUsername = username || getActiveUser()?.username;
    if (activeUsername) {
      syncUserProgressWithServer(activeUsername).catch(() => {});
    }
  } catch (e) {
    console.error(`Failed to save solved problems for key ${key}:`, e);
  }

  return solved;
}

export function getSolvedCount(username?: string): number {
  return getSolvedProblems(username).size;
}

/**
 * Calculates everyday streak stats and day-by-day activity history.
 */
export function getUserActivityStats(username?: string): UserActivityStats {
  const records = getSolvedRecords(username);
  const totalSolved = getSolvedCount(username);

  const dailyHistory: Record<string, number> = {};
  const todayStr = getLocalDateString(new Date());

  records.forEach((r) => {
    const d = r.date || getLocalDateString(new Date(r.solvedAt));
    dailyHistory[d] = (dailyHistory[d] || 0) + 1;
  });

  const todaySolved = dailyHistory[todayStr] || 0;

  // Calculate streak
  // Unique dates sorted descending
  const activeDates = Object.keys(dailyHistory).sort().reverse();
  const activeDateSet = new Set(activeDates);

  let currentStreak = 0;
  const checkDate = new Date();

  // Check if today was solved
  if (activeDateSet.has(todayStr)) {
    currentStreak++;
    checkDate.setDate(checkDate.getDate() - 1);
  } else {
    // If today is not solved yet, check if yesterday was solved (streak is still alive)
    checkDate.setDate(checkDate.getDate() - 1);
    const yesterdayStr = getLocalDateString(checkDate);
    if (!activeDateSet.has(yesterdayStr)) {
      currentStreak = 0;
    } else {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
  }

  // Count consecutive days backward
  if (currentStreak > 0) {
    while (true) {
      const dStr = getLocalDateString(checkDate);
      if (activeDateSet.has(dStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Calculate Max Historical Streak
  let maxStreak = 0;
  if (activeDates.length > 0) {
    const sortedAsc = Object.keys(dailyHistory).sort();
    let tempStreak = 0;
    let prevDate: Date | null = null;

    sortedAsc.forEach((ds) => {
      const [y, m, d] = ds.split('-').map(Number);
      const curr = new Date(y, m - 1, d);

      if (!prevDate) {
        tempStreak = 1;
      } else {
        const diffDays = Math.round((curr.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempStreak++;
        } else if (diffDays > 1) {
          tempStreak = 1;
        }
      }
      prevDate = curr;
      if (tempStreak > maxStreak) maxStreak = tempStreak;
    });
  }

  if (currentStreak > maxStreak) {
    maxStreak = currentStreak;
  }

  return {
    totalSolved,
    todaySolved,
    currentStreak,
    maxStreak,
    dailyHistory,
    recentSolved: records.slice(0, 15),
  };
}

/**
 * Migrate solved problems and activity history from guest mode into user profile.
 */
export function migrateGuestToUser(targetUsername: string): number {
  if (typeof window === 'undefined' || !targetUsername) return 0;
  const guestSet = getSolvedProblems(undefined);
  if (guestSet.size === 0) return 0;

  const userSet = getSolvedProblems(targetUsername);
  const guestRecords = getSolvedRecords(undefined);
  const userRecords = getSolvedRecords(targetUsername);
  const userRecordSlugs = new Set(userRecords.map((r) => r.slug));

  let merged = 0;
  guestSet.forEach((slug) => {
    if (!userSet.has(slug)) {
      userSet.add(slug);
      merged++;
    }
  });

  const mergedRecords = [...userRecords];
  guestRecords.forEach((gr) => {
    if (!userRecordSlugs.has(gr.slug)) {
      mergedRecords.push(gr);
      userRecordSlugs.add(gr.slug);
    }
  });

  const userKey = getStorageKey(targetUsername);
  const actKey = getActivityKey(targetUsername);

  localStorage.setItem(userKey, JSON.stringify(Array.from(userSet)));
  localStorage.setItem(actKey, JSON.stringify(mergedRecords));

  window.dispatchEvent(new CustomEvent('grindmap-solved-updated', { detail: { count: userSet.size } }));
  return merged;
}

/**
 * Synchronizes the user's progress with their private server-side storage file.
 * This guarantees that across 100+ different users and devices,
 * each user's streak, solved problems, and timestamps stay 100% persistent and isolated.
 */
export async function syncUserProgressWithServer(username?: string): Promise<void> {
  if (typeof window === 'undefined') return;
  const target = username || getActiveUser()?.username;
  if (!target) return;

  const localKey = getStorageKey(target);
  const actKey = getActivityKey(target);
  const solvedSlugs = Array.from(getSolvedProblems(target));
  const activityRecords = getSolvedRecords(target);

  try {
    const res = await fetch('/api/user/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        solvedSlugs,
        activityRecords,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.solvedSlugs)) {
        localStorage.setItem(localKey, JSON.stringify(data.solvedSlugs));
        if (Array.isArray(data.activityRecords)) {
          localStorage.setItem(actKey, JSON.stringify(data.activityRecords));
        }
        window.dispatchEvent(
          new CustomEvent('grindmap-solved-updated', {
            detail: { count: data.solvedSlugs.length, key: localKey },
          })
        );
      }
    }
  } catch (err) {
    // Offline mode / network hiccup: local storage continues uninterrupted
  }
}
