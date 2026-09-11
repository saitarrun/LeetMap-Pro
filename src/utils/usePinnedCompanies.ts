'use client';

import { useMemo, useSyncExternalStore } from 'react';

const PINNED_STORAGE_KEY = 'leetmap_pinned_companies';
const EMPTY_PINNED = '[]';
const PINNED_EVENT = 'leetmap-pinned-updated';

function subscribe(onStoreChange: () => void): () => void {
  window.addEventListener(PINNED_EVENT, onStoreChange);
  window.addEventListener('storage', onStoreChange);
  return () => {
    window.removeEventListener(PINNED_EVENT, onStoreChange);
    window.removeEventListener('storage', onStoreChange);
  };
}

function getSnapshot(): string {
  if (typeof window === 'undefined') return EMPTY_PINNED;
  return localStorage.getItem(PINNED_STORAGE_KEY) || EMPTY_PINNED;
}

function getServerSnapshot(): string {
  return EMPTY_PINNED;
}

export function getPinnedCompanies(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(PINNED_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === 'string') : []);
  } catch {
    return new Set();
  }
}

export function togglePinCompany(slug: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const current = getPinnedCompanies();
    const isCurrentlyPinned = current.has(slug);
    if (isCurrentlyPinned) {
      current.delete(slug);
    } else {
      current.add(slug);
    }
    const arr = Array.from(current);
    localStorage.setItem(PINNED_STORAGE_KEY, JSON.stringify(arr));
    window.dispatchEvent(new CustomEvent(PINNED_EVENT, { detail: { pinned: arr } }));
    return !isCurrentlyPinned;
  } catch (err) {
    console.error('Failed to toggle pin company:', err);
    return false;
  }
}

export function isCompanyPinned(slug: string): boolean {
  return getPinnedCompanies().has(slug);
}

export function usePinnedCompanies() {
  const serialized = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const pinnedSet = useMemo(() => {
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

  return {
    pinnedSet,
    isPinned: (slug: string) => pinnedSet.has(slug),
    togglePin: (slug: string) => togglePinCompany(slug),
    pinnedCount: pinnedSet.size,
  };
}
