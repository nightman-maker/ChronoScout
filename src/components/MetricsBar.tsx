import React from 'react';
import { Sparkles, AlertCircle, Clock, Percent, ShieldCheck } from 'lucide-react';

interface StatsData {
  totalMonitored: number;
  zeroBidsCount: number;
  endingSoonCount: number;
  averageDiscountPercent: number;
  swissCount: number;
  germanCount: number;
}

interface MetricsBarProps {
  stats: StatsData;
  onFilterZeroBids: () => void;
  onFilterEndingSoon: () => void;
  onFilterSwiss: () => void;
  onFilterGerman: () => void;
}

export const MetricsBar: React.FC<MetricsBarProps> = ({
  stats,
  onFilterZeroBids,
  onFilterEndingSoon,
  onFilterSwiss,
  onFilterGerman,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 py-4">
      {/* 0 Bids Overlooked Card */}
      <button
        onClick={onFilterZeroBids}
        className="flex flex-col text-left p-3.5 rounded-xl bg-slate-900/90 border border-red-500/30 hover:border-red-500/60 hover:bg-slate-800/80 transition-all group shadow-sm"
      >
        <div className="flex items-center justify-between text-xs text-red-400 font-medium mb-1">
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <span>Zero Bids Radar</span>
          </span>
          <AlertCircle className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold font-mono text-slate-100">{stats.zeroBidsCount}</span>
          <span className="text-[11px] text-slate-400">unnoticed deals</span>
        </div>
        <span className="text-[10px] text-slate-500 mt-1">Auctions with no bids</span>
      </button>

      {/* Ending < 2 Hours */}
      <button
        onClick={onFilterEndingSoon}
        className="flex flex-col text-left p-3.5 rounded-xl bg-slate-900/90 border border-amber-500/30 hover:border-amber-500/60 hover:bg-slate-800/80 transition-all group shadow-sm"
      >
        <div className="flex items-center justify-between text-xs text-amber-400 font-medium mb-1">
          <span>Ending &lt; 2 Hours</span>
          <Clock className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold font-mono text-slate-100">{stats.endingSoonCount}</span>
          <span className="text-[11px] text-slate-400">critical countdowns</span>
        </div>
        <span className="text-[10px] text-slate-500 mt-1">Sniper window open</span>
      </button>

      {/* Avg Discount */}
      <div className="flex flex-col text-left p-3.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 hover:border-emerald-500/60 transition-all shadow-sm">
        <div className="flex items-center justify-between text-xs text-emerald-400 font-medium mb-1">
          <span>Average Discount</span>
          <Percent className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold font-mono text-emerald-400">~{stats.averageDiscountPercent}%</span>
          <span className="text-[11px] text-slate-400">under baseline</span>
        </div>
        <span className="text-[10px] text-slate-500 mt-1">Vs collector market price</span>
      </div>

      {/* Swiss Provenance */}
      <button
        onClick={onFilterSwiss}
        className="flex flex-col text-left p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 hover:bg-slate-800/80 transition-all group shadow-sm"
      >
        <div className="flex items-center justify-between text-xs text-slate-300 font-medium mb-1">
          <span>🇨🇭 Swiss Origin</span>
          <ShieldCheck className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold font-mono text-slate-100">{stats.swissCount}</span>
          <span className="text-[11px] text-slate-400">local items</span>
        </div>
        <span className="text-[10px] text-slate-500 mt-1">Biel, Geneva, Le Locle</span>
      </button>

      {/* Glashütte / German Origin */}
      <button
        onClick={onFilterGerman}
        className="col-span-2 md:col-span-1 flex flex-col text-left p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 hover:bg-slate-800/80 transition-all group shadow-sm"
      >
        <div className="flex items-center justify-between text-xs text-slate-300 font-medium mb-1">
          <span>🇩🇪 German &amp; Saxon</span>
          <Sparkles className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold font-mono text-slate-100">{stats.germanCount}</span>
          <span className="text-[11px] text-slate-400">pieces</span>
        </div>
        <span className="text-[10px] text-slate-500 mt-1">Glashütte, Dresden, Munich</span>
      </button>
    </div>
  );
};
