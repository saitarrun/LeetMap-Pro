export interface Problem {
  id?: string;
  title: string;
  slug: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  frequency: number;
  acceptance: number;
  link: string;
  topics: string[];
  isSql?: boolean;
  verifiedSources?: string[];
}

export interface ProblemWindow {
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
  windows: ProblemWindow[];
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
  windowsCount: {
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
  link: string;
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
  }>;
  companiesCount: number;
  uniqueProblemsCount: number;
  sqlProblemsCount?: number;
  durationSeconds: number;
}
