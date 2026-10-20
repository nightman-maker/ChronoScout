import React from 'react';
import { Clock, RefreshCw, Bookmark, Server, Globe2, Compass, Zap, PlusCircle } from 'lucide-react';

interface HeaderProps {
  activeTab: 'all' | 'auctions' | 'bin' | 'watchlist' | 'presets' | 'nas';
  setActiveTab: (tab: 'all' | 'auctions' | 'bin' | 'watchlist' | 'presets' | 'nas') => void;
  watchlistCount: number;
  onRefresh: () => void;
  isRefreshing: boolean;
  selectedCurrency: 'USD' | 'EUR' | 'CHF' | 'GBP';
  setSelectedCurrency: (c: 'USD' | 'EUR' | 'CHF' | 'GBP') => void;
  onOpenLiveData: () => void;
  onOpenAddWatch: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  watchlistCount,
  onRefresh,
  isRefreshing,
  selectedCurrency,
  setSelectedCurrency,
  onOpenLiveData,
  onOpenAddWatch,
}) => {
  return (
    <header className="border-b border-amber-900/30 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('all')}>
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-700/10 border border-amber-500/40 shadow-inner shadow-amber-500/20">
              <Clock className="w-6 h-6 text-amber-400 animate-[spin_60s_linear_infinite]" />
              <div className="absolute w-2 h-2 rounded-full bg-amber-400"></div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-slate-100 font-serif">
                  CHRONO<span className="text-amber-400">SCOUT</span>
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  EU &amp; CH RADAR
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Swiss &amp; Saxon Watch Gem Hunter for eBay
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'all'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              All Gems
            </button>
            <button
              onClick={() => setActiveTab('auctions')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1 ${
                activeTab === 'auctions'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              <span>Ending Soon</span>
            </button>
            <button
              onClick={() => setActiveTab('bin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'bin'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Buy It Now Steals
            </button>
            <button
              onClick={() => setActiveTab('watchlist')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
                activeTab === 'watchlist'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Watchlist</span>
              {watchlistCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400/30 text-amber-300 font-bold">
                  {watchlistCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('presets')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1 ${
                activeTab === 'presets'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>eBay Live Snipers</span>
            </button>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-3">
            {/* Currency Selector */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs text-slate-300">
              <Globe2 className="w-3.5 h-3.5 ml-2 text-slate-400" />
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value as any)}
                aria-label="Currency selector"
                className="bg-transparent text-xs py-1 px-2 text-amber-300 focus:outline-none cursor-pointer"
              >
                <option value="USD" className="bg-slate-900 text-slate-200">USD ($)</option>
                <option value="EUR" className="bg-slate-900 text-slate-200">EUR (€)</option>
                <option value="CHF" className="bg-slate-900 text-slate-200">CHF (₣)</option>
                <option value="GBP" className="bg-slate-900 text-slate-200">GBP (£)</option>
              </select>
            </div>

            {/* Quick Evaluate Deal Button */}
            <button
              onClick={onOpenAddWatch}
              aria-label="Evaluate and track any eBay watch"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-sm"
              title="Evaluate any eBay watch deal (No API Key needed)"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Evaluate Deal</span>
            </button>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              aria-label="Refresh listings"
              title="Rescan eBay European portals"
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-800 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
            </button>

            {/* Live Data Feed Guide Button */}
            <button
              onClick={onOpenLiveData}
              aria-label="Open Live Data settings and setup guide"
              className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-amber-300 text-xs transition-colors"
              title="What is needed for Live eBay Data?"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Live Data Feed</span>
            </button>

            {/* NAS Deployment Button */}
            <button
              onClick={() => setActiveTab('nas')}
              aria-label="Open Ugreen NAS deployment guide"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-950 to-slate-900 hover:from-emerald-900 border border-emerald-500/40 text-emerald-300 text-xs font-medium transition-all shadow-sm"
              title="Ugreen NAS Docker Deployment Guide"
            >
              <Server className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Ugreen NAS</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden overflow-x-auto space-x-2 pb-3 scrollbar-none">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded-lg text-xs whitespace-nowrap ${
              activeTab === 'all' ? 'bg-amber-500 text-slate-950 font-semibold' : 'bg-slate-900 text-slate-300'
            }`}
          >
            All Gems
          </button>
          <button
            onClick={() => setActiveTab('auctions')}
            className={`px-3 py-1 rounded-lg text-xs whitespace-nowrap flex items-center space-x-1 ${
              activeTab === 'auctions' ? 'bg-amber-500 text-slate-950 font-semibold' : 'bg-slate-900 text-slate-300'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            <span>Ending Soon</span>
          </button>
          <button
            onClick={() => setActiveTab('bin')}
            className={`px-3 py-1 rounded-lg text-xs whitespace-nowrap ${
              activeTab === 'bin' ? 'bg-amber-500 text-slate-950 font-semibold' : 'bg-slate-900 text-slate-300'
            }`}
          >
            Buy It Now
          </button>
          <button
            onClick={() => setActiveTab('watchlist')}
            className={`px-3 py-1 rounded-lg text-xs whitespace-nowrap ${
              activeTab === 'watchlist' ? 'bg-amber-500 text-slate-950 font-semibold' : 'bg-slate-900 text-slate-300'
            }`}
          >
            Watchlist ({watchlistCount})
          </button>
          <button
            onClick={() => setActiveTab('presets')}
            className={`px-3 py-1 rounded-lg text-xs whitespace-nowrap ${
              activeTab === 'presets' ? 'bg-amber-500 text-slate-950 font-semibold' : 'bg-slate-900 text-slate-300'
            }`}
          >
            Live Snipers
          </button>
          <button
            onClick={() => setActiveTab('nas')}
            className={`px-3 py-1 rounded-lg text-xs whitespace-nowrap text-emerald-300 ${
              activeTab === 'nas' ? 'bg-emerald-600 text-white font-semibold' : 'bg-slate-900'
            }`}
          >
            NAS Deploy
          </button>
        </div>
      </div>
    </header>
  );
};
