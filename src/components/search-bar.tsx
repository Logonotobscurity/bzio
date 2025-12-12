
'use client';

import { useCallback, useRef, useState } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { searchProducts, getSuggestions, type SearchResult } from '@/services/searchService';
import { Search, X, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useRouter } from 'next/navigation';

export function SearchBar() {
  const router = useRouter();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const {
    searchQuery,
    setSearchQuery,
    isSearchOpen,
    toggleSearch,
  } = useUIStore();

  const MIN_CHARS = 3;

  // Search handler with debounce
  const handleSearch = useCallback(
    async (query: string) => {
      setSearchQuery(query);
      setIsSearching(true);

      try {
        if (query.length >= MIN_CHARS) {
          const searchResults = await searchProducts(query, MIN_CHARS);
          setResults(searchResults);
        } else {
          setResults([]);
        }

        // Get suggestions for autocomplete
        if (query.length >= 2) {
          const sug = await getSuggestions(query);
          setSuggestions(sug);
        } else {
          setSuggestions([]);
        }

        setShowDropdown(query.length > 0);
      } finally {
        setIsSearching(false);
      }
    },
    [setSearchQuery]
  );

  // Handle input change with debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.length === 0) {
      setResults([]);
      setSuggestions([]);
      setShowDropdown(false);
      setIsSearching(false);
      return;
    }
    
    handleSearch(value);
  };

  // Clear search
  const handleClear = useCallback(() => {
    setSearchQuery('');
    setResults([]);
    setSuggestions([]);
    setShowDropdown(false);
    searchInputRef.current?.focus();
  }, [setSearchQuery]);

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (searchQuery.length >= MIN_CHARS) {
        setShowDropdown(false);
        router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
        if (isMobile) toggleSearch();
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
      searchInputRef.current?.blur();
    }
  };

  // Handle blur - collapse on desktop
  const handleBlur = () => {
    setTimeout(() => {
      setShowDropdown(false);
    }, 200);
  };

  // Handle focus
  const handleFocus = () => {
    if (searchQuery.length > 0) {
      setShowDropdown(true);
    }
  };

  // Handle result click
  const handleResultClick = () => {
    setShowDropdown(false);
    setSearchQuery('');
    setResults([]);
    setSuggestions([]);
    if (isMobile) toggleSearch();
  };

  if (isMobile) {
    // Mobile: Full-width search in menu
    return (
      <div className="w-full">
        <button
          onClick={() => {
            toggleSearch();
            setTimeout(() => searchInputRef.current?.focus(), 0);
          }}
          className="w-full flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-primary transition-colors"
          aria-label="Open search"
        >
          <Search className="h-5 w-5" />
          <span className="text-sm">Search products...</span>
        </button>

        {isSearchOpen && (
          <div className="p-4 border-t border-slate-200 bg-white space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Search products, brands, categories..."
                className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                aria-label="Search for products"
              />
              {isSearching ? (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="h-4 w-4 text-primary animate-spin" />
                </div>
              ) : searchQuery ? (
                <button
                  onClick={handleClear}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>

            {/* Mobile Results */}
            {results.length > 0 && (
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wide px-1">
                  Products ({results.length})
                </p>
                <div className="space-y-1">
                  {results.map((result) => (
                    <Link
                      key={result.id}
                      href={`/products/${result.slug}`}
                      onClick={handleResultClick}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 active:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
                    >
                      <div className="relative h-14 w-14 rounded-lg border border-slate-200 overflow-hidden flex-shrink-0 bg-white">
                        <Image
                          src={result.imageUrl}
                          alt={result.name}
                          fill
                          className="object-contain p-1.5"
                          sizes="56px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {result.name}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">{result.brand}</p>
                        <p className="text-sm font-bold text-primary mt-1">
                          ₦{result.price.toLocaleString()}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
                <Link
                  href={`/products?search=${encodeURIComponent(searchQuery)}`}
                  onClick={handleResultClick}
                  className="flex items-center justify-center gap-1 py-3 text-sm font-bold text-primary hover:text-primary-dark transition-colors rounded-xl hover:bg-primary/5"
                >
                  View All Results
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            )}

            {/* Mobile Suggestions */}
            {!results.length && suggestions.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wide px-1">
                  Suggestions
                </p>
                <div className="space-y-1">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => handleSearch(suggestion)}
                      className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-50 active:bg-slate-100 transition-colors text-sm text-slate-700 font-medium border border-transparent hover:border-slate-200 flex items-center gap-2"
                    >
                      <Search className="h-3.5 w-3.5 text-slate-400" />
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {searchQuery.length > 0 &&
              searchQuery.length < MIN_CHARS &&
              !isSearching && (
                <div className="text-center py-6">
                  <Search className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">
                    Type at least {MIN_CHARS} characters to search
                  </p>
                </div>
              )}

            {searchQuery.length >= MIN_CHARS &&
              !isSearching &&
              results.length === 0 &&
              suggestions.length === 0 && (
                <div className="text-center py-6">
                  <Search className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-600">
                    No results found
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Try different keywords
                  </p>
                </div>
              )}
          </div>
        )}
      </div>
    );
  }

  // Desktop: Expand on click, collapse on blur
  return (
    <div className="relative w-full max-w-xs">
      <div
        className={cn(
          'relative flex items-center gap-2 px-3 py-2 border rounded-lg transition-all duration-200 bg-white',
          showDropdown
            ? 'ring-2 ring-primary border-primary'
            : 'border-slate-300 hover:border-slate-400'
        )}
      >
        <Search className="h-5 w-5 text-slate-400 flex-shrink-0" />
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Search products..."
          className="flex-1 bg-transparent outline-none text-sm placeholder:text-slate-400 min-w-0"
          aria-label="Search for products"
        />
        {isSearching ? (
          <Loader2 className="h-4 w-4 text-primary animate-spin flex-shrink-0" />
        ) : searchQuery ? (
          <button
            onClick={handleClear}
            className="text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {/* Desktop Dropdown */}
      {showDropdown && (results.length > 0 || suggestions.length > 0 || searchQuery.length >= MIN_CHARS) && (
        <div
          id="search-results"
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden"
        >
          {results.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase">
                Products ({results.length})
              </div>
              <div className="divide-y divide-slate-100">
                {results.map((result) => (
                  <Link
                    key={result.id}
                    href={`/products/${result.slug}`}
                    onClick={handleResultClick}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors group"
                  >
                    <div className="relative h-10 w-10 rounded border border-slate-200 overflow-hidden flex-shrink-0">
                      <Image
                        src={result.imageUrl}
                        alt={result.name}
                        fill
                        className="object-contain p-1"
                        sizes="40px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 group-hover:text-primary transition-colors truncate">
                        {result.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {result.brand} • {result.category}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-primary flex-shrink-0">
                      ₦{result.price.toLocaleString()}
                    </span>
                  </Link>
                ))}
              </div>
              <Link
                href={`/products?search=${encodeURIComponent(searchQuery)}`}
                onClick={handleResultClick}
                className="flex items-center justify-center gap-1 px-4 py-3 text-sm font-semibold text-primary hover:text-primary-dark hover:bg-slate-50 transition-colors border-t border-slate-200"
              >
                View All Results
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          )}

          {!results.length && suggestions.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase">
                Suggestions
              </div>
              <div className="divide-y divide-slate-100">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSearch(suggestion)}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 transition-colors text-sm text-slate-700 hover:text-primary"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {searchQuery.length > 0 &&
            searchQuery.length < MIN_CHARS &&
            !isSearching && (
              <div className="px-4 py-6 text-center text-sm text-slate-500">
                Type at least {MIN_CHARS} characters to search
              </div>
            )}

          {searchQuery.length >= MIN_CHARS &&
            !isSearching &&
            results.length === 0 &&
            suggestions.length === 0 && (
              <div className="px-4 py-6 text-center text-sm text-slate-500">
                No products found matching "{searchQuery}"
              </div>
            )}
        </div>
      )}
    </div>
  );
}
