export interface Problem {
  id?: string;
  title: string;
  slug: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  frequency: number;
  acceptance: number;
  topics: string[];
  isSql?: boolean;
  verifiedSources?: string[];
}

interface ProblemWindow {
  name: string;
  key: '30_days' | '3_months' | '6_months' | 'more_than_6_months' | 'all';
  count: number;
  problems: Problem[];
}

export interface CompanyDetail {
  name: string;
  slug: string;
  domain: string;
  total: number;
  easy: number;
  medium: number;
  hard: number;
  sqlTotal?: number;
  sqlEasy?: number;
  sqlMedium?: number;
  sqlHard?: number;
  windows: ProblemWindow[];
  sqlWindowsCount?: {
    '30_days': number;
    '3_months': number;
    '6_months': number;
    'more_than_6_months': number;
    'all': number;
  };
  isTruncated?: boolean;
}

export interface CompanySummary {
  name: string;
  slug: string;
  domain: string;
  total: number;
  easy: number;
  medium: number;
  hard: number;
  sqlTotal?: number;
  sqlEasy?: number;
  sqlMedium?: number;
  sqlHard?: number;
  windowsCount: {
    '30_days': number;
    '3_months': number;
    '6_months': number;
    'more_than_6_months': number;
    'all': number;
  };
  sqlWindowsCount?: {
    '30_days': number;
    '3_months': number;
    '6_months': number;
    'more_than_6_months': number;
    'all': number;
  };
}

export interface SqlCompanySummary {
  name: string;
  slug: string;
  domain: string;
  total: number;
  sqlTotal: number;
  sqlEasy: number;
  sqlMedium: number;
  sqlHard: number;
  windowsCount: {
    '30_days': number;
    '3_months': number;
    '6_months': number;
    'more_than_6_months': number;
    'all': number;
  };
  sqlWindowsCount: {
    '30_days': number;
    '3_months': number;
    '6_months': number;
    'more_than_6_months': number;
    'all': number;
  };
}

export interface SqlProblem {
  id?: string;
  title: string;
  slug: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  acceptance: number;
  topics: string[];
  isSql: boolean;
  maxFrequency: number;
  companiesCount: number;
  companies: Array<{
    name: string;
    slug: string;
    frequency: number;
  }>;
}

export interface SqlCatalog {
  totalSqlProblems: number;
  lastUpdated: number;
  problems: SqlProblem[];
}

export interface SyncStatus {
  status: 'success' | 'pending' | 'failed';
  lastSynced: number;
  lastSyncedISO: string;
  commitSha: string;
  sources?: Array<{
    name: string;
    commit?: string;
    companies?: number;
    tagsCount?: number;
    problemsCount?: number;
    dailyProblem?: string;
    description?: string;
  }>;
  companiesCount: number;
  uniqueProblemsCount: number;
  sqlProblemsCount?: number;
  patternsCount?: number;
  durationSeconds: number;
}

export interface PatternProblem {
  id?: string;
  title: string;
  slug: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  acceptance: number;
  topics: string[];
  maxFrequency: number;
  companiesCount: number;
  companies: Array<{
    name: string;
    slug: string;
    frequency: number;
  }>;
}

export type PatternCategory =
  | 'Arrays & Strings'
  | 'Linked Lists'
  | 'Trees & Tries'
  | 'Graphs'
  | 'Dynamic Programming'
  | 'Stacks & Queues'
  | 'Heaps & Intervals'
  | 'Advanced & Greedy'
  | 'Fundamentals'
  | 'Data Structures'
  | 'Trees & Graphs'
  | 'Advanced & DP';

export interface PatternSummary {
  slug: string;
  name: string;
  category: PatternCategory;
  icon: string;
  tagline: string;
  total: number;
  easy: number;
  medium: number;
  hard: number;
  topCompanies: string[];
}

export interface PatternDetail extends PatternSummary {
  strategy: string;
  clues: string[];
  problems: PatternProblem[];
}

export interface UserProfile {
  id: string;
  username: string;
  name: string;
  avatarUrl: string;
  email?: string;
}

export interface SolvedProblemRecord {
  id?: string;
  slug: string;
  solvedAt: string;
  date: string; // "YYYY-MM-DD"
  title?: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
}

export interface UserActivityStats {
  totalSolved: number;
  dsaSolved: number;
  sqlSolved: number;
  todaySolved: number;
  currentStreak: number;
  maxStreak: number;
  dailyHistory: Record<string, number>;
  recentSolved: SolvedProblemRecord[];
}

export interface DailyChallenge {
  date: string;
  link: string;
  id: string;
  title: string;
  slug: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  topics: string[];
  fetchedAt: number;
}
