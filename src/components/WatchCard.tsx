import React, { useEffect, useState } from 'react';
import {
  Clock,
  ExternalLink,
  Bookmark,
  Sparkles,
  ShieldCheck,
  MapPin,
  Flame,
  Info,
} from 'lucide-react';
import { WatchListing, formatTimeRemaining, convertFromUsd } from '../utils/gemEvaluator.ts';

interface WatchCardProps {
  watch: WatchListing;
  selectedCurrency: 'USD' | 'EUR' | 'CHF' | 'GBP';
  onInspect: (watch: WatchListing) => void;
  onToggleWatchlist: (watchId: string) => void;
  isWatchlisted: boolean;
}

export const WatchCard: React.FC<WatchCardProps> = ({
  watch,
  selectedCurrency,
  onInspect,
  onToggleWatchlist,
  isWatchlisted,
}) => {
  // Live ticking countdown for auctions
  const [timeState, setTimeState] = useState(() =>
    formatTimeRemaining(watch.endTime)
  );

  useEffect(() => {
    if (watch.listingType !== 'auction') return;
    const interval = setInterval(() => {
      setTimeState(formatTimeRemaining(watch.endTime));
    }, 1000);
    return () => clearInterval(interval);
  }, [watch.endTime, watch.listingType]);

  // Display price in selected currency
  const displayPrice =
    selectedCurrency === 'USD'
      ? watch.currentPriceUsd
      : convertFromUsd(watch.currentPriceUsd, selectedCurrency);

  const currencySymbol =
    selectedCurrency === 'USD'
      ? '$'
      : selectedCurrency === 'EUR'
      ? '€'
      : selectedCurrency === 'CHF'
      ? 'CHF '
      : '£';

  // Discount percentage
  const discountPercent = Math.max(
    0,
    Math.round(((watch.estimatedValueUsd - watch.currentPriceUsd) / watch.estimatedValueUsd) * 100)
  );

  return (
    <div className="flex flex-col bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/5 group">
      {/* Visual Header / Image Container */}
      <div className="relative aspect-4/3 w-full bg-slate-950 overflow-hidden cursor-pointer" onClick={() => onInspect(watch)}>
        <img
          src={watch.imageUrl}
          alt={watch.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Gradient Overlay for badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/40"></div>

        {/* Top Badges & Actions */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
          {/* Attention Level or Format Badge */}
          {watch.listingType === 'auction' ? (
            watch.bidsCount === 0 ? (
              <span className="flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-600/90 text-white backdrop-blur-md shadow-md animate-pulse">
                <Flame className="w-3 h-3" />
                <span>0 BIDS • OVERLOOKED</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/90 text-slate-950 backdrop-blur-md shadow-md">
                <span>{watch.bidsCount} {watch.bidsCount === 1 ? 'BID' : 'BIDS'}</span>
              </span>
            )
          ) : (
            <span className="flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/90 text-slate-950 backdrop-blur-md shadow-md">
              <Sparkles className="w-3 h-3" />
              <span>BUY IT NOW STEAL</span>
            </span>
          )}

          {/* Right group: Gem Score Indicator + Bookmark Button */}
          <div className="flex items-center space-x-1.5">
            <div className="flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-slate-950/85 border border-amber-500/40 text-amber-300 backdrop-blur-md shadow-sm">
              <span className="text-[10px] uppercase font-semibold text-slate-400">GEM</span>
              <span className="text-xs font-bold font-mono text-amber-400">{watch.gemScore}</span>
              <span className="text-[10px] text-slate-500">/100</span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleWatchlist(watch.id);
              }}
              aria-label={isWatchlisted ? `Remove ${watch.title} from watchlist` : `Save ${watch.title} to watchlist`}
              className={`p-1.5 rounded-lg backdrop-blur-md border transition-all ${
                isWatchlisted
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md scale-105'
                  : 'bg-slate-950/80 text-slate-300 hover:text-amber-400 border-slate-700/80 hover:bg-slate-900'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isWatchlisted ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Bottom image overlay: Countdown & Location */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-xs">
          {/* Location Badge */}
          <span className="flex items-center space-x-1 text-slate-300 bg-slate-950/80 px-2 py-1 rounded-lg backdrop-blur-md border border-slate-800 text-[11px]">
            <MapPin className="w-3 h-3 text-amber-400" />
            <span className="truncate max-w-[130px]">{watch.location.city}, {watch.location.countryCode}</span>
          </span>

          {/* Auction Countdown or Fixed Price indicator */}
          {watch.listingType === 'auction' ? (
            <span
              className={`flex items-center space-x-1 font-mono font-semibold px-2.5 py-1 rounded-lg backdrop-blur-md border shadow-sm text-xs ${
                timeState.isUrgent
                  ? 'bg-red-950/90 text-red-300 border-red-500/60'
                  : 'bg-slate-950/90 text-amber-300 border-slate-800'
              }`}
            >
              <Clock className="w-3 h-3 text-amber-400" />
              <span>{timeState.text}</span>
            </span>
          ) : (
            <span className="text-emerald-400 font-semibold bg-slate-950/80 px-2 py-1 rounded-lg border border-emerald-500/30 text-[11px]">
              Instant Buy
            </span>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex flex-col flex-1">
        {/* Brand & Reference Era */}
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs uppercase tracking-wider font-semibold text-amber-400 font-serif">
            {watch.brand}
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            {watch.specs.yearEstimate} • {watch.specs.movement}
          </span>
        </div>

        {/* Listing Title */}
        <h3
          onClick={() => onInspect(watch)}
          className="text-sm font-semibold text-slate-100 hover:text-amber-300 transition-colors line-clamp-2 cursor-pointer mb-2"
          title={watch.title}
        >
          {watch.title}
        </h3>

        {/* Horological Summary / Forensic Highlights */}
        <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">
          {watch.summary}
        </p>

        {/* Caliber & Key Spec Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {watch.specs.caliber && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
              ⚙️ {watch.specs.caliber}
            </span>
          )}
          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
            {watch.specs.caseDiameter}
          </span>
          {watch.seller.isPrivateSeller && (
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300">
              Private Estate
            </span>
          )}
        </div>

        {/* Key Gem Reasons Pills */}
        {watch.gemReasons.length > 0 && (
          <div className="mb-3 p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center space-x-1 text-[10px] text-amber-400/90 font-medium mb-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Why it&apos;s a gem:</span>
            </div>
            <div className="text-[11px] text-slate-300 line-clamp-1">
              • {watch.gemReasons[0]}
            </div>
          </div>
        )}

        <div className="mt-auto pt-3 border-t border-slate-800/80">
          {/* Price & Value Row */}
          <div className="flex items-end justify-between mb-3">
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-[10px] uppercase font-semibold text-slate-400">
                  {watch.listingType === 'auction' ? 'Current Bid' : 'Price'}
                </span>
                {watch.originalCurrency !== selectedCurrency && (
                  <span className="text-[10px] text-slate-500">
                    ({watch.originalPrice} {watch.originalCurrency})
                  </span>
                )}
              </div>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-xl font-bold font-mono text-slate-100">
                  {currencySymbol}{displayPrice}
                </span>
                <span className="text-xs text-slate-500 font-mono line-through">
                  ${watch.estimatedValueUsd}
                </span>
              </div>
            </div>

            {/* Discount Badge */}
            {discountPercent > 0 && (
              <div className="text-right">
                <span className="inline-block px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono text-xs font-bold">
                  -{discountPercent}%
                </span>
                <div className="text-[10px] text-slate-500 mt-0.5">Below Market</div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onInspect(watch)}
              aria-label={`Inspect ${watch.title}`}
              data-testid={`inspect-btn-${watch.id}`}
              className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
            >
              <Info className="w-3.5 h-3.5 text-amber-400" />
              <span>Details</span>
            </button>

            <a
              href={watch.ebayUrl}
              target="_blank"
              rel="noopener noreferrer"
              title={`Open live active ${watch.brand} listings on ${watch.ebayDomain}`}
              className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold shadow-sm transition-colors"
            >
              <span>Live on {watch.ebayDomain}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
