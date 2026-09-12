'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { BookOpen, Building2, Command, Database, GitBranch, Search } from 'lucide-react';

const commands = [
  { label: 'DSA', description: 'Browse company interview questions and DSA problems', href: '/', Icon: Building2 },
  { label: 'Patterns', description: 'Study DSA patterns', href: '/patterns', Icon: GitBranch },
  { label: 'SQL', description: 'Practice SQL interview questions', href: '/sql', Icon: Database },
  { label: 'Time Complexity', description: 'Learn Big O and space analysis', href: '/patterns/time-complexity#time-complexity', Icon: BookOpen },
  { label: 'Python Essentials', description: 'Review Python LeetCode patterns', href: '/patterns/time-complexity#python-essentials', Icon: Command },
];

type SearchResult = (typeof commands)[number] & { type?: string; meta?: string };

export function CommandPalette() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const filteredCommands = commands.filter((command) => `${command.label} ${command.description}`.toLowerCase().includes(query.trim().toLowerCase()));

  const currentItems = query.trim().length >= 2 ? results : filteredCommands;

  useEffect(() => {
    setSelectedIndex(0);
  }, [query, results.length]);

  useEffect(() => {
    const normalizedQuery = query.trim();
    if (normalizedQuery.length < 2) {
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(normalizedQuery)}`, { signal: controller.signal });
        if (response.ok) setResults((await response.json()).results || []);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') setResults([]);
      } finally {
        setLoading(false);
      }
    }, 160);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [query]);

  const selectItem = (href: string) => {
    setOpen(false);
    if (href.startsWith('http')) {
      window.open(href, '_blank', 'noopener,noreferrer');
    } else {
      router.push(href);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen(true);
      }
      if (event.key === 'Escape') setOpen(false);

      if (open && currentItems.length > 0) {
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % currentItems.length);
        } else if (event.key === 'ArrowUp') {
          event.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + currentItems.length) % currentItems.length);
        } else if (event.key === 'Enter') {
          event.preventDefault();
          const target = currentItems[selectedIndex];
          if (target) {
            selectItem(target.href);
          }
        }
      }
    };
    const handleOpen = () => setOpen(true);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('leetmap-open-command-palette', handleOpen);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('leetmap-open-command-palette', handleOpen);
    };
  }, [open, currentItems, selectedIndex]);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  return (
    <>
      {open && (
        <div className="apple-modal-backdrop fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto bg-black/50 px-4 py-4 backdrop-blur-sm sm:pt-[10vh]" onMouseDown={() => setOpen(false)}>
          <div role="dialog" aria-modal="true" aria-label="Command menu" className="apple-modal-surface flex max-h-[calc(100vh-2rem)] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
            <div className="flex items-center gap-3 border-b border-[var(--border)] px-4">
              <Search className="size-4 shrink-0 text-[var(--text-muted)]" />
              <input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search companies, problems, patterns, SQL..." className="command-palette-input h-14 min-w-0 flex-1 bg-transparent text-sm text-[var(--text-main)] outline-none placeholder:text-[var(--text-light)]" aria-label="Search everything" />
              <kbd className="rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] px-2 py-1 font-mono text-[10px] text-[var(--text-muted)]">Esc</kbd>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-2" role="listbox">
              {query.trim().length >= 2 ? (loading ? <p className="px-3 py-8 text-center text-sm text-[var(--text-muted)]">Searching every problem...</p> : results.length > 0 ? results.map(({ label, description, href, meta, type }, idx) => {
                const isSelected = selectedIndex === idx;
                return (
                  <button
                    key={`${type}-${href}`}
                    type="button"
                    onClick={() => selectItem(href)}
                    onPointerEnter={() => setSelectedIndex(idx)}
                    className={`apple-press flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors cursor-pointer ${
                      isSelected ? 'bg-[var(--bg-subtle)] text-[var(--text-main)]' : 'hover:bg-[var(--bg-hover)]'
                    }`}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] text-[var(--text-muted)]"><Search className="size-4" /></span>
                    <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-[var(--text-main)] truncate">{label}</span><span className="block truncate text-xs text-[var(--text-muted)]">{description}</span></span>
                    {meta && <span className="ml-auto shrink-0 text-[10px] font-medium text-[var(--text-light)]">{meta}</span>}
                  </button>
                );
              }) : <p className="px-3 py-8 text-center text-sm text-[var(--text-muted)]">No matching companies, problems, patterns, or SQL questions</p>) : filteredCommands.length > 0 ? filteredCommands.map(({ label, description, href, Icon }, idx) => {
                const isSelected = selectedIndex === idx;
                return (
                  <button
                    key={href}
                    type="button"
                    onClick={() => selectItem(href)}
                    onPointerEnter={() => setSelectedIndex(idx)}
                    className={`apple-press flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors cursor-pointer ${
                      isSelected ? 'bg-[var(--bg-subtle)] text-[var(--text-main)]' : 'hover:bg-[var(--bg-hover)]'
                    } ${pathname === href && !isSelected ? 'opacity-80' : ''}`}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] text-[var(--text-muted)]"><Icon className="size-4" /></span>
                    <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-[var(--text-main)] truncate">{label}</span><span className="block truncate text-xs text-[var(--text-muted)]">{description}</span></span>
                  </button>
                );
              }) : <p className="px-3 py-8 text-center text-sm text-[var(--text-muted)]">No matching sections</p>}
            </div>
            <div className="border-t border-[var(--border)] px-4 py-2.5 flex items-center justify-between text-[10px] text-[var(--text-light)]">
              <span>Use <kbd className="font-mono text-[var(--text-muted)]">↑</kbd> <kbd className="font-mono text-[var(--text-muted)]">↓</kbd> to navigate, <kbd className="font-mono text-[var(--text-muted)]">Enter</kbd> to select</span>
              <span><kbd className="font-mono text-[var(--text-muted)]">⌘K</kbd> to search anytime</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
