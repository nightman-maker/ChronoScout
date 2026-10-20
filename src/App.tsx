import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header.tsx';
import { LiveRadarBanner } from './components/LiveRadarBanner.tsx';
import { MetricsBar } from './components/MetricsBar.tsx';
import { FilterBar } from './components/FilterBar.tsx';
import { WatchCard } from './components/WatchCard.tsx';
import { WatchDetailModal } from './components/WatchDetailModal.tsx';
import { NasDeployModal } from './components/NasDeployModal.tsx';
import { EbayPresetsModal } from './components/EbayPresetsModal.tsx';
import { LiveDataModal } from './components/LiveDataModal.tsx';
import { AddWatchModal } from './components/AddWatchModal.tsx';
import { WatchListing, SortField, filterAndSortWatches } from './utils/gemEvaluator.ts';
import { generateLiveListings } from './data/mockListings.ts';
import {
  Clock,
  Sparkles,
  RefreshCw,
  Search,
  ExternalLink,
  ShieldCheck,
  Server,
  Layers,
  Flame,
  Zap,
} from 'lucide-react';

export default function App() {
  // Navigation & View state
  const [activeTab, setActiveTab] = useState<'all' | 'auctions' | 'bin' | 'watchlist' | 'presets' | 'nas'>('all');
  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'EUR' | 'CHF' | 'GBP'>('USD');

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [originCountry, setOriginCountry] = useState('ALL');
  const [brand, setBrand] = useState('ALL');
  const [listingType, setListingType] = useState<'all' | 'auction' | 'buy_it_now'>('all');
  const [maxPrice, setMaxPrice] = useState(2500);
  const [movementType, setMovementType] = useState('ALL');
  const [onlyZeroBids, setOnlyZeroBids] = useState(false);
  const [onlyUrgentEnding, setOnlyUrgentEnding] = useState(false);
  const [sortBy, setSortBy] = useState<SortField>('gem_score');

  // Modals state
  const [inspectWatch, setInspectWatch] = useState<WatchListing | null>(null);
  const [showNasModal, setShowNasModal] = useState(false);
  const [showPresetsModal, setShowPresetsModal] = useState(false);
  const [showLiveDataModal, setShowLiveDataModal] = useState(false);
  const [showAddWatchModal, setShowAddWatchModal] = useState(false);
  const [ebayStatus, setEbayStatus] = useState({
    isConfigured: false,
    mode: 'smart_radar_mode',
    marketplace: 'EBAY_DE',
  });

  // Fetch eBay status
  useEffect(() => {
    fetch('/api/ebay/status')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setEbayStatus({
            isConfigured: data.isConfigured,
            mode: data.mode,
            marketplace: data.marketplace,
          });
        }
      })
      .catch(() => {});
  }, []);

  // Data state
  const [watches, setWatches] = useState<WatchListing[]>(() => generateLiveListings(Date.now()));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [watchlistIds, setWatchlistIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('chronoscout_watchlist');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Keep localStorage updated
  useEffect(() => {
    try {
      localStorage.setItem('chronoscout_watchlist', JSON.stringify(Array.from(watchlistIds)));
    } catch {
      // ignore local storage errors
    }
  }, [watchlistIds]);

  // Fetch from API or fallback
  const fetchWatches = useCallback(async () => {
    try {
      const res = await fetch('/api/watches');
      if (res.ok) {
        const data = await res.json();
        if (data.watches && Array.isArray(data.watches)) {
          setWatches(data.watches);
          return;
        }
      }
    } catch {
      // fallback to generated client side data
    }
    setWatches(generateLiveListings(Date.now()));
  }, []);

  useEffect(() => {
    fetchWatches();
  }, [fetchWatches]);

  // Handle Tab changes
  useEffect(() => {
    if (activeTab === 'presets') {
      setShowPresetsModal(true);
    } else if (activeTab === 'nas') {
      setShowNasModal(true);
    } else if (activeTab === 'auctions') {
      setListingType('auction');
      setOnlyUrgentEnding(false);
    } else if (activeTab === 'bin') {
      setListingType('buy_it_now');
    } else if (activeTab === 'all') {
      setListingType('all');
    }
  }, [activeTab]);

  // Handle manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetch('/api/watches/refresh', { method: 'POST' });
    } catch {
      // ignore
    }
    await fetchWatches();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // Watchlist toggle
  const handleToggleWatchlist = (id: string) => {
    setWatchlistIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

    // Notify backend
    fetch('/api/watchlist/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    }).catch(() => {});
  };

  // Add custom evaluated watch
  const handleAddWatch = (newWatch: WatchListing) => {
    setWatches((prev) => [newWatch, ...prev]);
    setWatchlistIds((prev) => new Set([newWatch.id, ...prev]));
    setInspectWatch(newWatch);
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setOriginCountry('ALL');
    setBrand('ALL');
    setListingType('all');
    setMaxPrice(2500);
    setMovementType('ALL');
    setOnlyZeroBids(false);
    setOnlyUrgentEnding(false);
    setSortBy('gem_score');
  };

  // Count active non-default filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim() !== '') count++;
    if (originCountry !== 'ALL') count++;
    if (brand !== 'ALL') count++;
    if (listingType !== 'all') count++;
    if (maxPrice < 2500) count++;
    if (movementType !== 'ALL') count++;
    if (onlyZeroBids) count++;
    if (onlyUrgentEnding) count++;
    return count;
  }, [
    searchQuery,
    originCountry,
    brand,
    listingType,
    maxPrice,
    movementType,
    onlyZeroBids,
    onlyUrgentEnding,
  ]);

  // Filtered watches
  const filteredWatches = useMemo(() => {
    let currentList = watches;

    // Filter by watchlist tab
    if (activeTab === 'watchlist') {
      currentList = currentList.filter((w) => watchlistIds.has(w.id));
    }

    return filterAndSortWatches(
      currentList,
      {
        searchQuery,
        brand,
        originCountry,
        listingType: activeTab === 'auctions' ? 'auction' : activeTab === 'bin' ? 'buy_it_now' : listingType,
        maxPriceUsd: maxPrice,
        movementType,
        onlyZeroOrLowBids: onlyZeroBids,
        onlyUrgentEnding,
      },
      sortBy,
      Date.now()
    );
  }, [
    watches,
    activeTab,
    watchlistIds,
    searchQuery,
    brand,
    originCountry,
    listingType,
    maxPrice,
    movementType,
    onlyZeroBids,
    onlyUrgentEnding,
    sortBy,
  ]);

  // Aggregate stats
  const stats = useMemo(() => {
    const auctions = watches.filter((w) => w.listingType === 'auction');
    const zeroBids = auctions.filter((w) => w.bidsCount === 0);
    const urgent = auctions.filter((w) => {
      const remainingMs = new Date(w.endTime).getTime() - Date.now();
      return remainingMs > 0 && remainingMs < 2 * 3600 * 1000;
    });

    const discounts = watches.map((w) =>
      Math.round(((w.estimatedValueUsd - w.currentPriceUsd) / w.estimatedValueUsd) * 100)
    );
    const avgDiscount = Math.round(discounts.reduce((a, b) => a + b, 0) / (discounts.length || 1));

    const swissCount = watches.filter((w) => w.location.countryCode === 'CH').length;
    const germanCount = watches.filter((w) => w.location.countryCode === 'DE').length;

    return {
      totalMonitored: watches.length,
      zeroBidsCount: zeroBids.length,
      endingSoonCount: urgent.length,
      averageDiscountPercent: avgDiscount,
      swissCount,
      germanCount,
    };
  }, [watches]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'presets') setShowPresetsModal(true);
          if (tab === 'nas') setShowNasModal(true);
        }}
        watchlistCount={watchlistIds.size}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        selectedCurrency={selectedCurrency}
        setSelectedCurrency={setSelectedCurrency}
        onOpenLiveData={() => setShowLiveDataModal(true)}
        onOpenAddWatch={() => setShowAddWatchModal(true)}
      />

      {/* Live Radar Pulse Banner */}
      <LiveRadarBanner
        zeroBidsCount={stats.zeroBidsCount}
        endingSoonCount={stats.endingSoonCount}
        onSelectZeroBids={() => {
          setListingType('auction');
          setOnlyZeroBids(true);
          setActiveTab('all');
        }}
        onSelectEndingSoon={() => {
          setListingType('auction');
          setOnlyUrgentEnding(true);
          setActiveTab('all');
        }}
        onSelectBuyItNow={() => {
          setListingType('buy_it_now');
          setActiveTab('bin');
        }}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Top Summary Banner */}
        <MetricsBar
          stats={stats}
          onFilterZeroBids={() => {
            setListingType('auction');
            setOnlyZeroBids(true);
            setOnlyUrgentEnding(false);
          }}
          onFilterEndingSoon={() => {
            setListingType('auction');
            setOnlyUrgentEnding(true);
            setOnlyZeroBids(false);
          }}
          onFilterSwiss={() => {
            setOriginCountry('CH');
          }}
          onFilterGerman={() => {
            setOriginCountry('DE');
          }}
        />

        {/* Filter Toolbar */}
        <FilterBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          originCountry={originCountry}
          setOriginCountry={setOriginCountry}
          brand={brand}
          setBrand={setBrand}
          listingType={listingType}
          setListingType={setListingType}
          maxPrice={maxPrice}
          setMaxPrice={setMaxPrice}
          movementType={movementType}
          setMovementType={setMovementType}
          onlyZeroBids={onlyZeroBids}
          setOnlyZeroBids={setOnlyZeroBids}
          onlyUrgentEnding={onlyUrgentEnding}
          setOnlyUrgentEnding={setOnlyUrgentEnding}
          sortBy={sortBy}
          setSortBy={setSortBy}
          onResetFilters={handleResetFilters}
          activeFilterCount={activeFilterCount}
        />

        {/* Section Heading & Result Count */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <h1 className="text-base font-bold text-slate-100 font-serif">
              {activeTab === 'watchlist'
                ? `Your Saved Watchlist (${filteredWatches.length})`
                : activeTab === 'auctions'
                ? `Ending Soon Auctions (${filteredWatches.length})`
                : activeTab === 'bin'
                ? `Buy It Now Hidden Gems (${filteredWatches.length})`
                : `Discovered European & Swiss Horology Gems (${filteredWatches.length})`}
            </h1>
            {onlyZeroBids && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                0 Bids Filter Active
              </span>
            )}
          </div>

          <div className="text-xs text-slate-400">
            Showing {filteredWatches.length} of {watches.length} available items
          </div>
        </div>

        {/* Watch Grid */}
        {filteredWatches.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredWatches.map((watch) => (
              <WatchCard
                key={watch.id}
                watch={watch}
                selectedCurrency={selectedCurrency}
                onInspect={setInspectWatch}
                onToggleWatchlist={handleToggleWatchlist}
                isWatchlisted={watchlistIds.has(watch.id)}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16 px-4 bg-slate-900/40 rounded-3xl border border-slate-800/80 max-w-xl mx-auto my-6">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Search className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-200 mb-1 font-serif">No Matching Watches Found</h3>
            <p className="text-xs text-slate-400 mb-6 max-w-md mx-auto leading-relaxed">
              No Swiss or Glashütte watches match the current filters ({searchQuery ? `"${searchQuery}"` : 'selected criteria'}). Try relaxing the price limit or clearing active filters.
            </p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-sm"
              >
                Reset All Filters
              </button>
              <button
                onClick={() => setShowPresetsModal(true)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition-colors"
              >
                Browse Live eBay Presets
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5 text-slate-300 font-semibold font-serif">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>ChronoScout</span>
            </div>
            <span>•</span>
            <span>Self-Contained Swiss &amp; Glashütte Wristwatch Gem Hunter</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-slate-400">
            <button
              onClick={() => setShowNasModal(true)}
              aria-label="View UGREEN NAS Docker Guide in footer"
              className="text-emerald-400 hover:underline flex items-center space-x-1"
            >
              <Server className="w-3.5 h-3.5" />
              <span>UGREEN NAS Docker Guide</span>
            </button>
            <span>•</span>
            <button
              onClick={() => setShowLiveDataModal(true)}
              aria-label="Open Live Data Guide in footer"
              className="text-amber-400 hover:underline flex items-center space-x-1"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Live Data Guide</span>
            </button>
            <span>•</span>
            <button
              onClick={() => setShowPresetsModal(true)}
              className="text-amber-400 hover:underline flex items-center space-x-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Live eBay Portals</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <WatchDetailModal
        watch={inspectWatch}
        onClose={() => setInspectWatch(null)}
        selectedCurrency={selectedCurrency}
        onToggleWatchlist={handleToggleWatchlist}
        isWatchlisted={inspectWatch ? watchlistIds.has(inspectWatch.id) : false}
      />

      <NasDeployModal
        isOpen={showNasModal}
        onClose={() => {
          setShowNasModal(false);
          if (activeTab === 'nas') setActiveTab('all');
        }}
      />

      <EbayPresetsModal
        isOpen={showPresetsModal}
        onClose={() => {
          setShowPresetsModal(false);
          if (activeTab === 'presets') setActiveTab('all');
        }}
      />

      <LiveDataModal
        isOpen={showLiveDataModal}
        onClose={() => setShowLiveDataModal(false)}
        apiStatus={ebayStatus}
      />
    </div>
  );
}
