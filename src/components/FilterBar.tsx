import React from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { SortField } from '../utils/gemEvaluator.ts';

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  originCountry: string;
  setOriginCountry: (c: string) => void;
  brand: string;
  setBrand: (b: string) => void;
  listingType: 'all' | 'auction' | 'buy_it_now';
  setListingType: (t: 'all' | 'auction' | 'buy_it_now') => void;
  maxPrice: number;
  setMaxPrice: (p: number) => void;
  movementType: string;
  setMovementType: (m: string) => void;
  onlyZeroBids: boolean;
  setOnlyZeroBids: (v: boolean) => void;
  onlyUrgentEnding: boolean;
  setOnlyUrgentEnding: (v: boolean) => void;
  sortBy: SortField;
  setSortBy: (s: SortField) => void;
  onResetFilters: () => void;
  activeFilterCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  setSearchQuery,
  originCountry,
  setOriginCountry,
  brand,
  setBrand,
  listingType,
  setListingType,
  maxPrice,
  setMaxPrice,
  movementType,
  setMovementType,
  onlyZeroBids,
  setOnlyZeroBids,
  onlyUrgentEnding,
  setOnlyUrgentEnding,
  sortBy,
  setSortBy,
  onResetFilters,
  activeFilterCount,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg mb-6 backdrop-blur-md">
      {/* Primary search bar + quick controls */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reference, caliber (e.g. Valjoux, Lemania, Spezimatic), model..."
            className="w-full pl-10 pr-9 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              aria-label="Clear search query"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Origin Country Filter */}
        <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none py-1 md:py-0">
          {[
            { code: 'ALL', label: 'All Europe' },
            { code: 'CH', label: '🇨🇭 Switzerland' },
            { code: 'DE', label: '🇩🇪 Germany' },
            { code: 'FR', label: '🇫🇷 France' },
            { code: 'IT', label: '🇮🇹 Italy' },
          ].map((item) => (
            <button
              key={item.code}
              onClick={() => setOriginCountry(item.code)}
              className={`px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap font-medium transition-all ${
                originCountry === item.code
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-950/50 text-slate-400 hover:text-slate-200 border border-slate-800/80'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Sort selector */}
        <div className="flex items-center space-x-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortField)}
            aria-label="Sort watch listings"
            className="bg-slate-950/80 border border-slate-800 rounded-xl text-xs py-2 px-3 text-amber-300 focus:outline-none focus:border-amber-500/50 cursor-pointer"
          >
            <option value="gem_score">Sort: Highest Gem Value</option>
            <option value="ending_soonest">Sort: Ending Soonest</option>
            <option value="bids_lowest">Sort: Lowest Bids (Overlooked)</option>
            <option value="price_low">Sort: Price: Low to High</option>
            <option value="price_high">Sort: Price: High to Low</option>
            <option value="discount_high">Sort: Highest % Discount</option>
          </select>

          {/* Expand more filters */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
              isExpanded || activeFilterCount > 0
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Expanded filters drawer */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          {/* Brand */}
          <div>
            <label className="block text-slate-400 font-medium mb-1.5">Brand</label>
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-2.5 text-slate-200 focus:outline-none focus:border-amber-500/50"
            >
              <option value="ALL">All Brands</option>
              <option value="Omega">Omega</option>
              <option value="Glashütte">Glashütte (GUB)</option>
              <option value="Zenith">Zenith</option>
              <option value="Longines">Longines</option>
              <option value="Universal Genève">Universal Genève</option>
              <option value="Certina">Certina</option>
              <option value="Enicar">Enicar</option>
              <option value="Tissot">Tissot</option>
              <option value="Doxa">Doxa</option>
              <option value="Nomos Glashütte">Nomos Glashütte</option>
              <option value="Nivada Grenchen">Nivada Grenchen</option>
            </select>
          </div>

          {/* Movement Type */}
          <div>
            <label className="block text-slate-400 font-medium mb-1.5">Movement Type</label>
            <select
              value={movementType}
              onChange={(e) => setMovementType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-2.5 text-slate-200 focus:outline-none focus:border-amber-500/50"
            >
              <option value="ALL">All Mechanical &amp; Vintage</option>
              <option value="Manual Wind">Manual Wind</option>
              <option value="Automatic">Automatic</option>
              <option value="Chronograph">Chronograph</option>
            </select>
          </div>

          {/* Listing Format */}
          <div>
            <label className="block text-slate-400 font-medium mb-1.5">Listing Format</label>
            <select
              value={listingType}
              onChange={(e) => setListingType(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-2.5 text-slate-200 focus:outline-none focus:border-amber-500/50"
            >
              <option value="all">All Formats</option>
              <option value="auction">Auctions Only</option>
              <option value="buy_it_now">Buy It Now Only</option>
            </select>
          </div>

          {/* Max Price Slider */}
          <div>
            <div className="flex justify-between text-slate-400 font-medium mb-1.5">
              <span>Max Price</span>
              <span className="text-amber-300 font-mono">${maxPrice}</span>
            </div>
            <input
              type="range"
              min="100"
              max="2500"
              step="50"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Quick Checkboxes */}
          <div className="sm:col-span-2 md:col-span-4 flex flex-wrap items-center justify-between pt-2">
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center space-x-2 cursor-pointer text-slate-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={onlyZeroBids}
                  onChange={(e) => setOnlyZeroBids(e.target.checked)}
                  className="rounded border-slate-700 text-amber-500 focus:ring-0 accent-amber-500"
                />
                <span>Show overlooked only (≤ 2 bids)</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer text-slate-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={onlyUrgentEnding}
                  onChange={(e) => setOnlyUrgentEnding(e.target.checked)}
                  className="rounded border-slate-700 text-amber-500 focus:ring-0 accent-amber-500"
                />
                <span>Ending within 4 hours</span>
              </label>
            </div>

            {activeFilterCount > 0 && (
              <button
                onClick={onResetFilters}
                className="text-xs text-amber-400/80 hover:text-amber-300 underline mt-2 sm:mt-0"
              >
                Reset all filters
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
