"use client";
// City dropdown list for events section
import {
  memo,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { Check, ChevronDown, MapPin, Search } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Config                                                                    */
/* -------------------------------------------------------------------------- */

const COUNTRY_CODE = "IN";
const PAGE_SIZE = 30; // rows rendered per batch
const LOAD_MORE_MARGIN = "120px"; // start the next batch this far before the end

const CACHE_KEY = "india-cities:v2"; // bump if the cached shape changes
const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

/* -------------------------------------------------------------------------- */
/*  Data store (module-level, shared by every instance)                       */
/*                                                                            */
/*  country-state-city ships the whole world's data (~8 MB minified), so:     */
/*   - it is imported dynamically, never in the main bundle                   */
/*   - only India is kept, as a compact [city, state] list in localStorage    */
/*   - after the first visit the package isn't loaded at all                  */
/* -------------------------------------------------------------------------- */

export type CityItem = {
  uid: string; // unique per row (city names repeat between states)
  name: string;
  stateName: string;
  lname: string; // normalised city name, for prefix ranking
  key: string; // normalised "city state", for searching
};

type Snapshot = {
  cities: CityItem[];
  status: "idle" | "loading" | "ready" | "error";
};

/** lowercase + strip accents, so input is forgiving */
const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

/** rows: [cityName, stateName], already sorted by city name */
function buildItems(rows: [string, string][]): CityItem[] {
  return rows.map(([name, stateName], i) => {
    const lname = normalize(name);
    return {
      uid: String(i),
      name,
      stateName,
      lname,
      key: `${lname} ${normalize(stateName)}`,
    };
  });
}

const EMPTY: Snapshot = { cities: [], status: "idle" };
let snapshot: Snapshot = EMPTY;
const listeners = new Set<() => void>();

function setSnapshot(next: Snapshot) {
  snapshot = next;
  listeners.forEach((listener) => listener());
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

function readCache(): [string, string][] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { t: number; d: [string, string][] };
    if (Date.now() - parsed.t > CACHE_TTL_MS || !parsed.d?.length) return null;
    return parsed.d;
  } catch {
    return null;
  }
}

function writeCache(rows: [string, string][]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), d: rows }));
  } catch {
    /* storage full or unavailable: still works, just not cached */
  }
}

let loading: Promise<void> | null = null;

export function prefetchIndiaCities(): Promise<void> {
  if (snapshot.status === "ready") return Promise.resolve();
  if (loading) return loading;

  loading = (async () => {
    setSnapshot({ cities: [], status: "loading" });

    try {
      // Fast path: India-only list cached from a previous visit.
      let rows = readCache();

      if (!rows) {
        // Cold path: pull the dataset in as a separate chunk, keep only India.
        const { City, State } = await import("country-state-city");

        const stateNames = new Map<string, string>();
        for (const state of State.getStatesOfCountry(COUNTRY_CODE)) {
          stateNames.set(state.isoCode, state.name);
        }

        rows = City.getCitiesOfCountry(COUNTRY_CODE)?.map(
          (city): [string, string] => [
            city.name,
            stateNames.get(city.stateCode) ?? city.stateCode,
          ]
        ) ?? [];

        rows.sort((a, b) => a[0].localeCompare(b[0]));
        if (rows.length > 0) writeCache(rows);
      }

      if (rows.length === 0) throw new Error("No cities found for India");
      setSnapshot({ cities: buildItems(rows), status: "ready" });
    } catch (error) {
      console.warn("Failed to load cities:", error);
      setSnapshot({ cities: [], status: "error" });
    }
  })().finally(() => {
    loading = null;
  });

  return loading;
}

/* -------------------------------------------------------------------------- */
/*  Row                                                                       */
/* -------------------------------------------------------------------------- */

const CityRow = memo(function CityRow({
  city,
  index,
  isSelected,
  isActive,
  onPick,
}: {
  city: CityItem;
  index: number;
  isSelected: boolean;
  isActive: boolean;
  onPick: (city: CityItem) => void;
}) {
  return (
    <li
      id={`city-opt-${index}`}
      role="option"
      aria-selected={isSelected}
      onClick={() => onPick(city)}
      className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 hover:bg-pink-50 ${
        isActive ? "bg-pink-50" : ""
      }`}
    >
      <div className="min-w-0">
        <p
          className={`truncate text-sm ${
            isSelected ? "font-semibold text-pink-600" : "font-medium text-gray-800"
          }`}
        >
          {city.name}
        </p>
        <p className="truncate text-xs text-gray-500">{city.stateName}</p>
      </div>

      {isSelected && <Check size={16} className="shrink-0 text-pink-500" />}
    </li>
  );
});

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

type CityDropdownProps = {
  selectedCity: string;
  /** Second argument is the city's state, in case you want to store it too. */
  onSelect: (cityName: string, stateName?: string) => void;
};

export function CityDropdown({ selectedCity, onSelect }: CityDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const { cities, status } = useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => EMPTY
  );

  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const sentinelRef = useRef<HTMLLIElement>(null);
  const fromKeyboard = useRef(false);

  /* ------------------------------ Prefetching ------------------------------ */

  // Start loading when the browser is idle after mount, so the list is
  // usually ready before the first tap.
  useEffect(() => {
    const run = () => void prefetchIndiaCities();
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(run, { timeout: 1500 });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(run, 200);
    return () => window.clearTimeout(id);
  }, []);

  // Hover / focus means a tap is coming: start now if idle hasn't fired yet.
  const prefetch = useCallback(() => void prefetchIndiaCities(), []);

  /* ----------------------------- Search + paging ---------------------------- */

  const deferredQuery = useDeferredValue(query);

  const matches = useMemo(() => {
    const q = normalize(deferredQuery);
    if (!q) return cities;

    // Names starting with the query first, then every other city (or state)
    // containing it, so all similar names show up.
    const startsWith: CityItem[] = [];
    const contains: CityItem[] = [];
    for (const city of cities) {
      if (city.lname.startsWith(q)) startsWith.push(city);
      else if (city.key.includes(q)) contains.push(city);
    }
    return startsWith.concat(contains);
  }, [cities, deferredQuery]);

  const visible = useMemo(
    () => matches.slice(0, visibleCount),
    [matches, visibleCount]
  );
  const hasMore = visibleCount < matches.length;

  const loadMore = useCallback(() => {
    setVisibleCount((count) => count + PAGE_SIZE);
  }, []);

  // Infinite scroll: observe a sentinel row at the end of the list and append
  // the next batch just before it scrolls into view.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    const root = listRef.current;
    if (!isOpen || !hasMore || !sentinel || !root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { root, rootMargin: LOAD_MORE_MARGIN }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
    // visibleCount: re-observe after each batch so a still-visible sentinel fires again
  }, [isOpen, hasMore, visibleCount, loadMore]);

  /* ------------------------------- Open / close ---------------------------- */

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery("");
    setVisibleCount(PAGE_SIZE);
    setActiveIndex(0);
  }, []);

  const pick = useCallback(
    (city: CityItem) => {
      onSelect(city.name, city.stateName);
      close();
    },
    [onSelect, close]
  );

  // Close on outside click.
  useEffect(() => {
    if (!isOpen) return;
    const handler = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        close();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, close]);

  // Focus the search box as soon as the panel opens.
  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  // New search: reset highlight, batch size and scroll position.
  useEffect(() => {
    setActiveIndex(0);
    setVisibleCount(PAGE_SIZE);
    if (listRef.current) listRef.current.scrollTop = 0;
  }, [deferredQuery]);

  // Keep the keyboard-highlighted row visible.
  useEffect(() => {
    if (!isOpen || !fromKeyboard.current) return;
    document
      .getElementById(`city-opt-${activeIndex}`)
      ?.scrollIntoView({ block: "nearest" });
    fromKeyboard.current = false;
  }, [activeIndex, isOpen, visible]);

  /* --------------------------------- Events -------------------------------- */

  const onSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      fromKeyboard.current = true;
      const next = Math.max(0, Math.min(activeIndex + 1, matches.length - 1));
      setActiveIndex(next);
      if (hasMore && next >= visibleCount - 5) loadMore();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      fromKeyboard.current = true;
      setActiveIndex(Math.max(activeIndex - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (matches[activeIndex]) pick(matches[activeIndex]);
    } else if (event.key === "Escape") {
      close();
    }
  };

  /* --------------------------------- Render -------------------------------- */

  const renderBody = () => {
    if (status === "error") {
      return (
        <li className="px-3 py-6 text-center text-sm text-gray-500">
          <p>Couldn&apos;t load cities.</p>
          <button
            type="button"
            onClick={prefetch}
            className="mt-2 rounded-full bg-pink-500 px-3 py-1 text-xs font-medium text-white hover:bg-pink-600"
          >
            Try again
          </button>
        </li>
      );
    }

    if (status !== "ready") {
      return (
        <li className="px-3 py-8 text-center text-sm text-gray-500">
          Loading cities...
        </li>
      );
    }

    if (visible.length === 0) {
      return (
        <li className="px-3 py-8 text-center text-sm text-gray-500">
          No cities found
        </li>
      );
    }

    return (
      <>
        {visible.map((city, index) => (
          <CityRow
            key={city.uid}
            city={city}
            index={index}
            isSelected={city.name === selectedCity}
            isActive={index === activeIndex}
            onPick={pick}
          />
        ))}
        {hasMore && <li ref={sentinelRef} aria-hidden className="h-1" />}
      </>
    );
  };

  return (
    <div className="relative flex-1 sm:flex-none" ref={rootRef}>
      <button
        type="button"
        onClick={() => (isOpen ? close() : setIsOpen(true))}
        onPointerEnter={prefetch}
        onFocus={prefetch}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-full border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-800 hover:border-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 sm:w-auto sm:justify-start"
      >
        <MapPin size={16} className="shrink-0 text-pink-500" />
        <span className="max-w-[9rem] truncate">{selectedCity || "Select city"}</span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-gray-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 z-50 mt-2 w-72 max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl sm:left-auto sm:right-0">
          <div className="border-b border-gray-100 p-2">
            <div className="relative">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={onSearchKeyDown}
                placeholder="Search any city in India"
                aria-label="Search cities"
                aria-controls="city-listbox"
                aria-activedescendant={
                  matches.length ? `city-opt-${activeIndex}` : undefined
                }
                autoComplete="off"
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-pink-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-100"
              />
            </div>
          </div>

          <ul
            ref={listRef}
            id="city-listbox"
            role="listbox"
            className="max-h-64 overflow-y-auto overflow-x-hidden p-1.5"
          >
            {renderBody()}
          </ul>
        </div>
      )}
    </div>
  );
}
