"use client";

import {
  memo,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Check, ChevronDown, MapPin, Search } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Config                                                                    */
/* -------------------------------------------------------------------------- */

// Dataset used by react-country-state-city. It contains the whole world, so the
// first load is big. For a much faster load, self-host an India-only copy
// (see the script in the chat) and point this at it, e.g. "/india-cities.json".
// The component works with both because it only reads the India entry.
const CITIES_URL =
  "https://venkatvidyut.github.io/react-country-state-city/data/citiesminified.json";

const INDIA_ID = 101;

// Rows render in batches and more are appended as the user scrolls.
const PAGE_SIZE = 30;
const LOAD_MORE_THRESHOLD = 120;

/* -------------------------------------------------------------------------- */
/*  Data (fetched once per page session, shared by every instance)            */
/* -------------------------------------------------------------------------- */

type IndiaCity = {
  uid: string; // unique across states (city names repeat between states)
  name: string;
  stateName: string;
  key: string; // lowercase "city state", used for searching
};

type RawCountry = {
  id: number;
  name?: string;
  states?: {
    id: number;
    name: string;
    cities?: { id: number; name: string }[];
  }[];
};

let indiaCitiesPromise: Promise<IndiaCity[]> | null = null;

function loadIndiaCities(): Promise<IndiaCity[]> {
  if (!indiaCitiesPromise) {
    indiaCitiesPromise = fetch(CITIES_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load cities (${res.status})`);
        return res.json() as Promise<RawCountry[]>;
      })
      .then((countries) => {
        const india =
          countries.find((c) => c.id === INDIA_ID) ??
          countries.find((c) => c.name === "India");

        const list: IndiaCity[] = [];
        for (const state of india?.states ?? []) {
          for (const city of state.cities ?? []) {
            list.push({
              uid: `${state.id}-${city.id}`,
              name: city.name,
              stateName: state.name,
              key: `${city.name} ${state.name}`.toLowerCase(),
            });
          }
        }
        list.sort((a, b) => a.name.localeCompare(b.name));
        return list;
      })
      .catch((error) => {
        indiaCitiesPromise = null; // allow retry
        throw error;
      });
  }
  return indiaCitiesPromise;
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
  city: IndiaCity;
  index: number;
  isSelected: boolean;
  isActive: boolean;
  onPick: (name: string) => void;
}) {
  return (
    <li
      id={`city-opt-${index}`}
      role="option"
      aria-selected={isSelected}
      onClick={() => onPick(city.name)}
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
  onSelect: (cityName: string) => void;
};

export function CityDropdown({ selectedCity, onSelect }: CityDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const [cities, setCities] = useState<IndiaCity[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">(
    "idle"
  );

  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const fromKeyboard = useRef(false);

  /* ------------------------------ Data loading ----------------------------- */

  const fetchCities = useCallback(() => {
    setStatus("loading");
    loadIndiaCities()
      .then((list) => {
        setCities(list);
        setStatus("ready");
      })
      .catch((error) => {
        console.error("Failed to load cities:", error);
        setStatus("error");
      });
  }, []);

  // Load when first opened (cached afterwards).
  useEffect(() => {
    if (isOpen && status === "idle") fetchCities();
  }, [isOpen, status, fetchCities]);

  // Start downloading as soon as the user shows intent, so it's ready on click.
  const prefetch = useCallback(() => {
    if (status === "idle") fetchCities();
  }, [status, fetchCities]);

  /* -------------------------- Search + batch rendering --------------------- */

  const deferredQuery = useDeferredValue(query);

  const matches = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    return q ? cities.filter((c) => c.key.includes(q)) : cities;
  }, [cities, deferredQuery]);

  const visible = useMemo(
    () => matches.slice(0, visibleCount),
    [matches, visibleCount]
  );
  const hasMore = visibleCount < matches.length;

  const loadMore = useCallback(() => {
    setVisibleCount((count) => count + PAGE_SIZE);
  }, []);

  /* ------------------------------- Open / close ---------------------------- */

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery("");
    setVisibleCount(PAGE_SIZE);
    setActiveIndex(0);
  }, []);

  const pick = useCallback(
    (name: string) => {
      onSelect(name);
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

  // Focus the search box once the panel is open and data is ready.
  useEffect(() => {
    if (isOpen && status === "ready") inputRef.current?.focus();
  }, [isOpen, status]);

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

  const onListScroll = (event: React.UIEvent<HTMLUListElement>) => {
    if (!hasMore) return;
    const el = event.currentTarget;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < LOAD_MORE_THRESHOLD) {
      loadMore();
    }
  };

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
      if (matches[activeIndex]) pick(matches[activeIndex].name);
    } else if (event.key === "Escape") {
      close();
    }
  };

  /* --------------------------------- Render -------------------------------- */

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
          className={`shrink-0 text-gray-500 ${isOpen ? "rotate-180" : ""}`}
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
            onScroll={onListScroll}
            className="max-h-64 overflow-y-auto overflow-x-hidden p-1.5"
          >
            {status === "loading" || status === "idle" ? (
              <li className="px-3 py-8 text-center text-sm text-gray-500">
                Loading cities...
              </li>
            ) : status === "error" ? (
              <li className="px-3 py-6 text-center text-sm text-gray-500">
                <p>Couldn&apos;t load cities.</p>
                <button
                  type="button"
                  onClick={fetchCities}
                  className="mt-2 rounded-full bg-pink-500 px-3 py-1 text-xs font-medium text-white hover:bg-pink-600"
                >
                  Try again
                </button>
              </li>
            ) : visible.length === 0 ? (
              <li className="px-3 py-8 text-center text-sm text-gray-500">
                No cities found
              </li>
            ) : (
              visible.map((city, index) => (
                <CityRow
                  key={city.uid}
                  city={city}
                  index={index}
                  isSelected={city.name === selectedCity}
                  isActive={index === activeIndex}
                  onPick={pick}
                />
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
