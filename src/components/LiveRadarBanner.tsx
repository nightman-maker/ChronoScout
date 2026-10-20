import React from 'react';
import { Radio, Flame, Sparkles, Clock, ShieldCheck } from 'lucide-react';

interface LiveRadarBannerProps {
  zeroBidsCount: number;
  endingSoonCount: number;
  onSelectZeroBids: () => void;
  onSelectEndingSoon: () => void;
  onSelectBuyItNow: () => void;
}

export const LiveRadarBanner: React.FC<LiveRadarBannerProps> = ({
  zeroBidsCount,
  endingSoonCount,
  onSelectZeroBids,
  onSelectEndingSoon,
  onSelectBuyItNow,
}) => {
  return (
    <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950 border-b border-amber-500/20 py-2.5 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        {/* Radar Pulse Status */}
        <div className="flex items-center space-x-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-slate-200 flex items-center space-x-1.5">
            <Radio className="w-3.5 h-3.5 text-amber-400" />
            <span>Active eBay Radar:</span>
          </span>
          <span className="text-slate-400">
            Monitoring <strong className="text-slate-300">ebay.ch</strong>,{' '}
            <strong className="text-slate-300">ebay.de</strong>,{' '}
            <strong className="text-slate-300">ebay.fr</strong> for unnoticed Swiss &amp; Saxon gems
          </span>
        </div>

        {/* Quick Sniper Filters */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={onSelectZeroBids}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-500/30 transition-colors font-medium text-[11px]"
          >
            <Flame className="w-3 h-3 text-red-400" />
            <span>{zeroBidsCount} Zero-Bid Deals</span>
          </button>

          <button
            onClick={onSelectEndingSoon}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border border-amber-500/30 transition-colors font-medium text-[11px]"
          >
            <Clock className="w-3 h-3 text-amber-400" />
            <span>{endingSoonCount} Ending Soon</span>
          </button>

          <button
            onClick={onSelectBuyItNow}
            className="hidden md:flex items-center space-x-1 px-2.5 py-1 rounded-md bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 transition-colors font-medium text-[11px]"
          >
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>BIN Steals</span>
          </button>
        </div>
      </div>
    </div>
  );
};
