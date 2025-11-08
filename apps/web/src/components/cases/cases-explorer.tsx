'use client';

import { AnimatePresence } from 'framer-motion';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from 'react';
import type {
  Case,
  CaseListResult,
  CaseListResponsePayload,
  GetCasesParams,
} from '../../lib/api';
import { normalizeCaseListResponse } from '../../lib/api';
import { CaseCard } from './case-card';
import { CaseCardSkeleton } from './case-card-skeleton';
import { CaseDetailOverlay } from './case-detail-overlay';
import { useDebouncedValue } from './use-debounced-value';

const SUPPORTED_CATEGORIES = ['MY_SKLAD', 'BITRIX24', 'TELEPHONY'] as const;
type ServiceCategory = (typeof SUPPORTED_CATEGORIES)[number];
type CategoryValue = 'ALL' | ServiceCategory;

type CasesExplorerProps = {
  initialData: CaseListResult;
  initialFilters?: {
    category?: ServiceCategory | null;
    search?: string | null;
  };
};

const CATEGORY_OPTIONS: Array<{ label: string; value: CategoryValue }> = [
  { label: 'Все', value: 'ALL' },
  { label: 'Мой Склад', value: 'MY_SKLAD' },
  { label: 'Bitrix24', value: 'BITRIX24' },
  { label: 'Телефония', value: 'TELEPHONY' },
];

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

const isSupportedCategory = (value: unknown): value is ServiceCategory =>
  typeof value === 'string' && SUPPORTED_CATEGORIES.includes(value as ServiceCategory);

async function fetchCasesClient(
  params: GetCasesParams,
  signal?: AbortSignal,
): Promise<CaseListResult> {
  const searchParams = new URLSearchParams();
  if (params.category) {
    searchParams.set('category', params.category);
  }
  if (params.serviceId) {
    searchParams.set('serviceId', params.serviceId);
  }
  if (params.search) {
    searchParams.set('search', params.search);
  }
  if (params.cursor) {
    searchParams.set('cursor', params.cursor);
  }
  if (typeof params.take === 'number') {
    searchParams.set('take', String(params.take));
  }
  if (typeof params.published === 'boolean') {
    searchParams.set('published', params.published ? 'true' : 'false');
  }

  const qs = searchParams.toString();
  const basePath = API_BASE_URL || '';
  const url = `${basePath}/api/cases${qs ? `?${qs}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    signal,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch cases: ${response.status}`);
  }

  const json = (await response.json()) as { data: CaseListResponsePayload };
  return normalizeCaseListResponse(json.data);
}

export function CasesExplorer({ initialData, initialFilters }: CasesExplorerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialCategory: CategoryValue = isSupportedCategory(initialFilters?.category)
    ? (initialFilters?.category as ServiceCategory)
    : 'ALL';
  const initialSearchValue = initialFilters?.search?.trim() ?? '';

  const [activeCategory, setActiveCategory] = useState<CategoryValue>(initialCategory);
  const [searchTerm, setSearchTerm] = useState(initialSearchValue);
  const [cases, setCases] = useState<Case[]>(initialData.items);
  const [nextCursor, setNextCursor] = useState<string | null>(initialData.nextCursor);
  const [activeCase, setActiveCase] = useState<Case | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isPending, startTransition] = useTransition();

  const debouncedSearch = useDebouncedValue(searchTerm, 300);
  const isFirstLoad = useRef(true);
  const latestCategoryRef = useRef<ServiceCategory | undefined>(
    isSupportedCategory(initialFilters?.category) ? (initialFilters?.category as ServiceCategory) : undefined,
  );
  const latestSearchRef = useRef(initialSearchValue);

  const categoryParam = activeCategory === 'ALL' ? undefined : activeCategory;
  const searchValue = debouncedSearch.trim();

  useEffect(() => {
    const params = new URLSearchParams();
    if (categoryParam) {
      params.set('category', categoryParam);
    }
    if (searchValue) {
      params.set('search', searchValue);
    }
    const newQuery = params.toString();
    const currentQuery = searchParams?.toString() ?? '';
    if (newQuery === currentQuery) {
      return;
    }
    const next = newQuery ? `${pathname}?${newQuery}` : pathname;
    router.replace(next, { scroll: false });
  }, [categoryParam, searchValue, pathname, router, searchParams]);

  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      latestCategoryRef.current = categoryParam;
      latestSearchRef.current = searchValue;
      return;
    }

    const controller = new AbortController();
    const filters: GetCasesParams = {
      category: categoryParam,
      search: searchValue || undefined,
    };

    setError(null);
    setIsFetching(true);

    fetchCasesClient(filters, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) {
          return;
        }
        latestCategoryRef.current = categoryParam;
        latestSearchRef.current = searchValue;
        startTransition(() => {
          setCases(result.items);
          setNextCursor(result.nextCursor);
        });
      })
      .catch((fetchError) => {
        if (controller.signal.aborted) {
          return;
        }
        setError(fetchError instanceof Error ? fetchError.message : 'Не удалось загрузить кейсы');
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsFetching(false);
        }
      });

    return () => controller.abort();
  }, [categoryParam, searchValue]);

  const handleCategoryChange = useCallback((value: CategoryValue) => {
    setActiveCategory(value);
  }, []);

  const handleLoadMore = useCallback(async () => {
    if (!nextCursor) {
      return;
    }
    setIsLoadingMore(true);
    setError(null);

    try {
      const result = await fetchCasesClient({
        category: latestCategoryRef.current,
        search: latestSearchRef.current ? latestSearchRef.current : undefined,
        cursor: nextCursor,
      });
      setCases((prev) => [...prev, ...result.items]);
      setNextCursor(result.nextCursor);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Не удалось загрузить кейсы');
    } finally {
      setIsLoadingMore(false);
    }
  }, [nextCursor]);

  const heading = useMemo(() => {
    switch (activeCategory) {
      case 'MY_SKLAD':
        return 'Кейсы по внедрению Мой Склад';
      case 'BITRIX24':
        return 'Кейсы по автоматизации в Bitrix24';
      case 'TELEPHONY':
        return 'Кейсы по корпоративной телефонии';
      default:
        return 'Наши кейсы';
    }
  }, [activeCategory]);

  const showSkeletons = isFetching;

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-blue-300/70">Портфолио</p>
          <h1 className="mt-3 text-4xl font-semibold text-white md:text-5xl">{heading}</h1>
          <p className="mt-3 max-w-3xl text-sm text-slate-300">
            Исследуйте реализованные проекты TB Group: от настройки CRM-процессов до связки телефонии,
            аналитики и автоматизации складов.
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <div className="flex rounded-full border border-white/10 bg-slate-900/70 p-1">
            {CATEGORY_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleCategoryChange(option.value)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  activeCategory === option.value
                    ? 'bg-blue-500 text-white shadow shadow-blue-500/30'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="relative">
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Поиск по клиенту или описанию"
              className="w-full rounded-full border border-white/10 bg-slate-900/70 px-4 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40 sm:w-72"
            />
            <svg
              className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M7 12a5 5 0 100-10 5 5 0 000 10zM15 15l-3.5-3.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {error ? (
        <div className="mt-6 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {showSkeletons
          ? Array.from({ length: 6 }).map((_, index) => <CaseCardSkeleton key={`skeleton-${index}`} />)
          : cases.map((caseItem) => (
              <CaseCard key={caseItem.id} caseItem={caseItem} onSelect={setActiveCase} />
            ))}
      </div>

      {!isFetching && cases.length === 0 ? (
        <div className="mt-12 rounded-3xl border border-white/10 bg-slate-900/50 p-10 text-center text-sm text-slate-300">
          Не найдено кейсов по указанным критериям. Попробуйте изменить фильтры или сбросить поиск.
        </div>
      ) : null}

      {nextCursor ? (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/70 px-5 py-2 text-sm font-medium text-slate-200 transition hover:border-blue-400/60 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:opacity-60"
          >
            {isLoadingMore ? 'Загрузка…' : 'Показать ещё'}
            {!isLoadingMore ? (
              <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M3 7h10m-5-5v10"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : null}
          </button>
        </div>
      ) : null}

      <AnimatePresence>
        {activeCase ? (
          <CaseDetailOverlay caseItem={activeCase} onClose={() => setActiveCase(null)} />
        ) : null}
      </AnimatePresence>

      {(isPending && !isFetching) || isLoadingMore ? (
        <span className="sr-only" aria-live="polite">
          Загрузка кейсов…
        </span>
      ) : null}
    </div>
  );
}
