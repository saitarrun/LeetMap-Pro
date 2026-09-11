import { NextResponse } from 'next/server';
import type { DailyChallenge } from '@/types';

const LEETCODE_GRAPHQL_URL = 'https://leetcode.com/graphql';
const MAX_TIME_ZONE_LENGTH = 100;

const DAILY_CHALLENGE_QUERY = `
  query questionOfToday {
    activeDailyCodingChallengeQuestion {
      date
      link
      question {
        questionFrontendId
        title
        titleSlug
        difficulty
        topicTags {
          name
        }
      }
    }
  }
`;

interface LeetCodeDailyChallengeResponse {
  data?: {
    activeDailyCodingChallengeQuestion?: {
      date?: unknown;
      link?: unknown;
      question?: {
        questionFrontendId?: unknown;
        title?: unknown;
        titleSlug?: unknown;
        difficulty?: unknown;
        topicTags?: Array<{ name?: unknown }>;
      };
    };
  };
}

function normalizeTimeZone(value: string | null): string {
  const timeZone = value?.trim().slice(0, MAX_TIME_ZONE_LENGTH) || 'UTC';
  try {
    new Intl.DateTimeFormat('en-US', { timeZone }).format();
    return timeZone;
  } catch {
    return 'UTC';
  }
}

function parseDailyChallenge(payload: LeetCodeDailyChallengeResponse): DailyChallenge | null {
  const challenge = payload.data?.activeDailyCodingChallengeQuestion;
  const question = challenge?.question;
  if (!challenge || !question) return null;

  const date = typeof challenge.date === 'string' ? challenge.date : '';
  const linkPath = typeof challenge.link === 'string' ? challenge.link : '';
  const id = typeof question.questionFrontendId === 'string' ? question.questionFrontendId : '';
  const title = typeof question.title === 'string' ? question.title.trim() : '';
  const slug = typeof question.titleSlug === 'string' ? question.titleSlug : '';
  const difficulty = typeof question.difficulty === 'string' ? question.difficulty.toUpperCase() : '';

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    !/^\/problems\/[a-z0-9-]+\/?$/.test(linkPath) ||
    !/^\d+$/.test(id) ||
    !title ||
    !/^[a-z0-9-]+$/.test(slug) ||
    !['EASY', 'MEDIUM', 'HARD'].includes(difficulty)
  ) {
    return null;
  }

  return {
    date,
    link: `https://leetcode.com${linkPath}`,
    id,
    title: title.slice(0, 300),
    slug,
    difficulty: difficulty as DailyChallenge['difficulty'],
    topics: (question.topicTags ?? [])
      .map((topic) => (typeof topic.name === 'string' ? topic.name.trim().slice(0, 100) : ''))
      .filter(Boolean)
      .slice(0, 30),
    fetchedAt: Date.now(),
  };
}

export async function GET(request: Request) {
  const timeZone = normalizeTimeZone(new URL(request.url).searchParams.get('timeZone'));

  try {
    const response = await fetch(LEETCODE_GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'leetmap-pro/1.0',
      },
      body: JSON.stringify({ query: DAILY_CHALLENGE_QUERY }),
      cache: 'no-store',
      signal: AbortSignal.timeout(8_000),
    });

    if (!response.ok) {
      throw new Error(`LeetCode responded with ${response.status}`);
    }

    const challenge = parseDailyChallenge(
      (await response.json()) as LeetCodeDailyChallengeResponse
    );
    if (!challenge) {
      throw new Error('LeetCode returned an invalid daily challenge');
    }

    return NextResponse.json(challenge, {
      headers: {
        'Cache-Control': 'private, no-store',
        'X-LeetMap-Time-Zone': timeZone,
      },
    });
  } catch (error) {
    console.error('Failed to refresh the LeetCode daily challenge:', error);
    return NextResponse.json(
      { error: 'Daily challenge is temporarily unavailable' },
      {
        status: 503,
        headers: { 'Cache-Control': 'private, no-store' },
      }
    );
  }
}
