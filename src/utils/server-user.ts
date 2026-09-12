import fs from 'fs';
import path from 'path';
import { get } from '@vercel/blob';
import { clerkClient } from '@clerk/nextjs/server';
import { SolvedProblemRecord } from '@/types';

export interface PublicUserProfileData {
  user: {
    id: string;
    username: string;
    name: string;
    avatarUrl: string;
    createdAt?: number;
  };
  stats: {
    totalSolved: number;
    easyCount: number;
    mediumCount: number;
    hardCount: number;
    currentStreak: number;
    longestStreak: number;
    dailyHistory: Record<string, number>;
  };
  recentActivity: Array<{
    slug: string;
    title?: string;
    difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
    solvedAt: string;
    date: string;
  }>;
  patternsBreakdown: Array<{
    slug: string;
    name: string;
    icon?: string;
    solved: number;
    total: number;
  }>;
  topCompaniesBreakdown: Array<{
    slug: string;
    name: string;
    domain?: string;
    solved: number;
    total: number;
  }>;
}

interface StoredUserData {
  userId?: string;
  username?: string;
  solvedSlugs: string[];
  activityRecords: SolvedProblemRecord[];
  updatedAt: string;
}

function getBlobPath(id: string): string {
  const safe = id.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  return `user-progress/${safe}.json`;
}

function getLocalFilePath(id: string): string {
  const safe = id.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  return path.join(process.cwd(), 'data', 'user-progress', `${safe}.json`);
}

async function readUserRaw(id: string): Promise<StoredUserData | null> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const blob = await get(getBlobPath(id), { access: 'private', useCache: false });
      if (blob && blob.statusCode === 200) {
        const text = await new Response(blob.stream).text();
        return JSON.parse(text);
      }
    } catch {
      // ignore
    }
  }

  const filePath = getLocalFilePath(id);
  if (fs.existsSync(filePath)) {
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch {
      // ignore
    }
  }

  return null;
}

export async function fetchPublicUserProfile(rawUsername: string): Promise<PublicUserProfileData | null> {
  const cleanUsername = rawUsername.trim().toLowerCase();
  if (!cleanUsername) return null;

  let clerkUser: {
    id: string;
    username: string;
    name: string;
    avatarUrl: string;
    createdAt?: number;
  } | null = null;

  try {
    const client = await clerkClient();

    if (cleanUsername.startsWith('user_')) {
      try {
        const u = await client.users.getUser(cleanUsername);
        if (u) {
          const uName = u.username || u.primaryEmailAddress?.emailAddress?.split('@')[0] || u.id;
          clerkUser = {
            id: u.id,
            username: uName,
            name: u.fullName || u.firstName || uName,
            avatarUrl: u.imageUrl,
            createdAt: u.createdAt,
          };
        }
      } catch {
        // ignore
      }
    }

    if (!clerkUser) {
      try {
        const list = await client.users.getUserList({
          username: [cleanUsername],
          limit: 1,
        });
        if (list.data.length > 0) {
          const u = list.data[0];
          const uName = u.username || cleanUsername;
          clerkUser = {
            id: u.id,
            username: uName,
            name: u.fullName || u.firstName || uName,
            avatarUrl: u.imageUrl,
            createdAt: u.createdAt,
          };
        }
      } catch {
        // ignore
      }
    }

    if (!clerkUser) {
      try {
        const search = await client.users.getUserList({
          query: cleanUsername,
          limit: 10,
        });
        const found = search.data.find((u) => {
          const directUsername = u.username?.toLowerCase();
          const emailPrefix = u.primaryEmailAddress?.emailAddress?.split('@')[0]?.toLowerCase();
          const fullEmail = u.primaryEmailAddress?.emailAddress?.toLowerCase();
          const anyEmail = u.emailAddresses?.some(
            (e) =>
              e.emailAddress.toLowerCase() === cleanUsername ||
              e.emailAddress.toLowerCase().split('@')[0] === cleanUsername
          );
          return (
            directUsername === cleanUsername ||
            emailPrefix === cleanUsername ||
            fullEmail === cleanUsername ||
            Boolean(anyEmail) ||
            u.id.toLowerCase() === cleanUsername
          );
        });
        if (found) {
          const uName = found.username || found.primaryEmailAddress?.emailAddress?.split('@')[0] || found.id;
          clerkUser = {
            id: found.id,
            username: uName,
            name: found.fullName || found.firstName || uName,
            avatarUrl: found.imageUrl,
            createdAt: found.createdAt,
          };
        }
      } catch {
        // ignore
      }
    }

    if (!clerkUser && !cleanUsername.includes('@')) {
      try {
        const emailSearch = await client.users.getUserList({
          emailAddress: [cleanUsername, `${cleanUsername}@gmail.com`],
          limit: 2,
        });
        if (emailSearch.data.length > 0) {
          const found = emailSearch.data[0];
          const uName = found.username || found.primaryEmailAddress?.emailAddress?.split('@')[0] || found.id;
          clerkUser = {
            id: found.id,
            username: uName,
            name: found.fullName || found.firstName || uName,
            avatarUrl: found.imageUrl,
            createdAt: found.createdAt,
          };
        }
      } catch {
        // ignore
      }
    }
  } catch (error) {
    console.error('Clerk client error in fetchPublicUserProfile', error);
  }

  // Fallback: If Clerk is not reachable or user exists in local seed storage
  if (!clerkUser) {
    const localRaw = await readUserRaw(cleanUsername);
    if (localRaw) {
      clerkUser = {
        id: localRaw.userId || cleanUsername,
        username: cleanUsername,
        name: cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1),
        avatarUrl: `https://avatar.vercel.sh/${cleanUsername}`,
      };
    }
  }

  if (!clerkUser) return null;

  // Retrieve storage data (try user.id first, then user.username, then cleanUsername)
  let storage = await readUserRaw(clerkUser.id);
  if (!storage && clerkUser.username) {
    storage = await readUserRaw(clerkUser.username);
  }
  if (!storage && cleanUsername !== clerkUser.username?.toLowerCase()) {
    storage = await readUserRaw(cleanUsername);
  }

  const solvedSlugs = Array.isArray(storage?.solvedSlugs) ? storage.solvedSlugs : [];
  const activityRecords = Array.isArray(storage?.activityRecords) ? storage.activityRecords : [];
  const solvedSet = new Set(solvedSlugs);

  // Compute daily history and streaks
  const dailyHistory: Record<string, number> = {};
  activityRecords.forEach((r) => {
    if (r.date) {
      dailyHistory[r.date] = (dailyHistory[r.date] || 0) + 1;
    }
  });

  const sortedDates = Object.keys(dailyHistory).sort();
  let currentStreak = 0;
  let maxStreak = 0;

  if (sortedDates.length > 0) {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

    if (dailyHistory[todayStr]) {
      currentStreak = 1;
      let check = new Date(today);
      while (true) {
        check.setDate(check.getDate() - 1);
        const dateStr = `${check.getFullYear()}-${String(check.getMonth() + 1).padStart(2, '0')}-${String(check.getDate()).padStart(2, '0')}`;
        if (dailyHistory[dateStr]) {
          currentStreak++;
        } else {
          break;
        }
      }
    } else if (dailyHistory[yesterdayStr]) {
      currentStreak = 1;
      let check = new Date(yesterday);
      while (true) {
        check.setDate(check.getDate() - 1);
        const dateStr = `${check.getFullYear()}-${String(check.getMonth() + 1).padStart(2, '0')}-${String(check.getDate()).padStart(2, '0')}`;
        if (dailyHistory[dateStr]) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    let temp = 0;
    let prev: Date | null = null;
    sortedDates.forEach((d) => {
      const cur = new Date(`${d}T12:00:00`);
      if (!prev) {
        temp = 1;
      } else {
        const diffDays = Math.round((cur.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          temp++;
        } else {
          temp = 1;
        }
      }
      prev = cur;
      if (temp > maxStreak) maxStreak = temp;
    });
  }

  if (currentStreak > maxStreak) maxStreak = currentStreak;

  // Compute difficulty distribution
  let easyCount = 0;
  let mediumCount = 0;
  let hardCount = 0;

  activityRecords.forEach((r) => {
    if (r.difficulty === 'EASY') easyCount++;
    else if (r.difficulty === 'MEDIUM') mediumCount++;
    else if (r.difficulty === 'HARD') hardCount++;
  });

  // Calculate pattern breakdown
  const patternsBreakdown: PublicUserProfileData['patternsBreakdown'] = [];
  try {
    const patternSlugsPath = path.join(process.cwd(), 'public', 'data', 'pattern-problem-slugs.json');
    const patternsMetaPath = path.join(process.cwd(), 'public', 'data', 'patterns.json');

    if (fs.existsSync(patternSlugsPath) && fs.existsSync(patternsMetaPath)) {
      const patternProblemSlugs: Record<string, string[]> = JSON.parse(fs.readFileSync(patternSlugsPath, 'utf8'));
      const patternsMeta: Array<{ slug: string; name: string; icon?: string; total: number }> = JSON.parse(
        fs.readFileSync(patternsMetaPath, 'utf8')
      );

      patternsMeta.forEach((p) => {
        const problemSlugs = patternProblemSlugs[p.slug] || [];
        let solved = 0;
        problemSlugs.forEach((s) => {
          if (solvedSet.has(s)) solved++;
        });

        patternsBreakdown.push({
          slug: p.slug,
          name: p.name,
          icon: p.icon,
          solved,
          total: p.total || problemSlugs.length,
        });
      });
    }
  } catch (error) {
    console.error('Failed to compute patterns breakdown', error);
  }

  // Calculate top companies breakdown
  const topCompaniesBreakdown: PublicUserProfileData['topCompaniesBreakdown'] = [];
  try {
    const companiesPath = path.join(process.cwd(), 'public', 'data', 'companies.json');
    if (fs.existsSync(companiesPath)) {
      const companies: Array<{ slug: string; name: string; domain?: string; total: number }> = JSON.parse(
        fs.readFileSync(companiesPath, 'utf8')
      );

      // Take top 12 firms by popularity
      const targetSlugs = ['google', 'meta', 'amazon', 'microsoft', 'apple', 'bloomberg', 'citadel', 'uber', 'netflix', 'tiktok', 'goldman-sachs', 'salesforce'];
      
      targetSlugs.forEach((slug) => {
        const company = companies.find((c) => c.slug === slug);
        if (!company) return;

        // Check company detail file to find solved problems count
        let solved = 0;
        try {
          const detailPath = path.join(process.cwd(), 'public', 'data', 'companies', `${slug}.json`);
          if (fs.existsSync(detailPath)) {
            const detail = JSON.parse(fs.readFileSync(detailPath, 'utf8'));
            const problems: Array<{ slug: string }> = detail.windows?.find((w: { key: string }) => w.key === 'all')?.problems || [];
            problems.forEach((prob) => {
              if (solvedSet.has(prob.slug)) solved++;
            });
          }
        } catch {}

        topCompaniesBreakdown.push({
          slug: company.slug,
          name: company.name,
          domain: company.domain,
          solved,
          total: company.total,
        });
      });
    }
  } catch (error) {
    console.error('Failed to compute company breakdown', error);
  }

  return {
    user: clerkUser,
    stats: {
      totalSolved: solvedSet.size,
      easyCount,
      mediumCount,
      hardCount,
      currentStreak,
      longestStreak: maxStreak,
      dailyHistory,
    },
    recentActivity: activityRecords.slice(-15).reverse(),
    patternsBreakdown,
    topCompaniesBreakdown,
  };
}
