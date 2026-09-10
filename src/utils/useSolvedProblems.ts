'use client';

import { useMemo, useSyncExternalStore } from 'react';
import { getStorageKey } from '@/utils/progress';

const EMPTY_SOLVED = '[]';

function subscribe(onStoreChange: () => void): () => void {
  window.addEventListener('leetmap-solved-updated', onStoreChange);
  window.addEventListener('storage', onStoreChange);
  return () => {
    window.removeEventListener('leetmap-solved-updated', onStoreChange);
    window.removeEventListener('storage', onStoreChange);
  };
}

function getSnapshot(): string {
  return localStorage.getItem(getStorageKey()) || EMPTY_SOLVED;
}

function getServerSnapshot(): string {
  return EMPTY_SOLVED;
}

export function useSolvedProblems(): Set<string> {
  const serialized = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return useMemo(() => {
    try {
      const parsed: unknown = JSON.parse(serialized);
      return new Set(
        Array.isArray(parsed)
          ? parsed.filter((slug): slug is string => typeof slug === 'string')
          : []
      );
    } catch {
      return new Set<string>();
    }
  }, [serialized]);
}
