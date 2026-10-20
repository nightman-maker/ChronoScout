import React, { useState, useEffect } from 'react';
import {
  X,
  ExternalLink,
  Bookmark,
  Clock,
  Sparkles,
  ShieldCheck,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Award,
  Copy,
  Check,
} from 'lucide-react';
import { WatchListing, formatTimeRemaining, convertFromUsd } from '../utils/gemEvaluator.ts';

interface WatchDetailModalProps {
  watch: WatchListing | null;
  onClose: () => void;
  selectedCurrency: 'USD' | 'EUR' | 'CHF' | 'GBP';
  onToggleWatchlist: (watchId: string) => void;
  isWatchlisted: boolean;
}

export const WatchDetailModal: React.FC<WatchDetailModalProps> = ({
  watch,
  onClose,
  selectedCurrency,
  onToggleWatchlist,
  isWatchlisted,
}) => {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [copiedQuery, setCopiedQuery] = useState(false);

  useEffect(() => {
    setActiveImageIdx(0);
  }, [watch]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!watch) return null;

  const timeState = formatTimeRemaining(watch.endTime);
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

  const discountPercent = Math.max(
    0,
    Math.round(((watch.estimatedValueUsd - watch.currentPriceUsd) / watch.estimatedValueUsd) * 100)
  );

  const images = watch.galleryUrls?.length > 0 ? watch.galleryUrls : [watch.imageUrl];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md">
      <div
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="watch-detail-title"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase tracking-widest font-bold text-amber-400 font-serif">
              {watch.brand}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400 font-mono">Item #{watch.ebayItemNumber}</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onToggleWatchlist(watch.id)}
              aria-label={isWatchlisted ? 'Remove from watchlist' : 'Save to watchlist'}
              className={`p-2 rounded-xl border transition-colors ${
                isWatchlisted
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isWatchlisted ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-slate-100 hover:bg-slate-800 border border-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Image Gallery */}
            <div className="space-y-3">
              <div className="relative aspect-4/3 w-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-800">
                <img
                  src={images[activeImageIdx] || watch.imageUrl}
                  alt={watch.title}
                  className="w-full h-full object-cover"
                />

                {/* Overlaid Badges */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-950/80 border border-amber-500/40 text-amber-300 backdrop-blur-md">
                    GEM SCORE: {watch.gemScore}/100
                  </span>
                  {watch.bidsCount === 0 && watch.listingType === 'auction' && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-600/90 text-white backdrop-blur-md flex items-center space-x-1">
                      <Flame className="w-3 h-3" />
                      <span>0 BIDS (OVERLOOKED)</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex space-x-2">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImageIdx(i)}
                      className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                        activeImageIdx === i ? 'border-amber-400 scale-105' : 'border-slate-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Provenance & Seller Box */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center space-x-1.5">
                    <MapPin className="w-4 h-4 text-amber-400" />
                    <span className="font-medium">Origin Location</span>
                  </span>
                  <span className="font-semibold text-slate-100">
                    {watch.location.city}, {watch.location.country}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center space-x-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Seller Profile</span>
                  </span>
                  <span className="text-slate-200">
                    {watch.seller.username} ({watch.seller.feedbackScore}) •{' '}
                    <span className="text-emerald-400 font-semibold">{watch.seller.feedbackPercent}% pos</span>
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Shipping to Europe/CH</span>
                  <span className="text-slate-300">
                    {watch.location.shippingCostUsd > 0 ? `~$${watch.location.shippingCostUsd} (${watch.location.shipsTo})` : 'Free shipping'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Listing Details & Forensic Gem Analysis */}
            <div className="space-y-5">
              <div>
                <h2
                  id="watch-detail-title"
                  className="text-lg font-bold text-slate-100 leading-snug mb-2 font-serif"
                >
                  {watch.title}
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {watch.summary}
                </p>
              </div>

              {/* Price & Timing Box */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-amber-500/30">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400">
                      {watch.listingType === 'auction' ? 'Current Auction Bid' : 'Buy It Now Price'}
                    </span>
                    <div className="flex items-baseline space-x-2 mt-0.5">
                      <span className="text-3xl font-bold font-mono text-amber-400">
                        {currencySymbol}{displayPrice}
                      </span>
                      <span className="text-xs text-slate-500 line-through">
                        ${watch.estimatedValueUsd}
                      </span>
                    </div>
                    {watch.originalCurrency !== selectedCurrency && (
                      <span className="text-[11px] text-slate-400">
                        Listed as {watch.originalPrice} {watch.originalCurrency} on {watch.ebayDomain}
                      </span>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold">
                      -{discountPercent}% BELOW MARKET
                    </span>
                    <div className="text-[11px] text-slate-400 mt-1 font-mono">
                      Potential gain: +${watch.estimatedValueUsd - watch.currentPriceUsd}
                    </div>
                  </div>
                </div>

                {/* Auction countdown or BIN notice */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  {watch.listingType === 'auction' ? (
                    <>
                      <div className="flex items-center space-x-1.5 text-amber-300 font-mono">
                        <Clock className="w-4 h-4 text-amber-400" />
                        <span>Auction Closes: {timeState.text}</span>
                      </div>
                      <span className="text-slate-400 font-medium">
                        Total bids: <strong className="text-slate-200">{watch.bidsCount}</strong>
                      </span>
                    </>
                  ) : (
                    <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Immediate purchase available • No bidding needed</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Technical Specifications Table */}
              <div>
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Horological Specifications
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Movement</span>
                    <span className="font-semibold text-slate-200">{watch.specs.movement}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Caliber</span>
                    <span className="font-semibold text-amber-300 font-mono">{watch.specs.caliber || 'In-House'}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Case Dimensions</span>
                    <span className="font-semibold text-slate-200">{watch.specs.caseDiameter} (Lug: {watch.specs.lugWidth || '18mm'})</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Case Material</span>
                    <span className="font-semibold text-slate-200">{watch.specs.caseMaterial}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Estimated Era</span>
                    <span className="font-semibold text-slate-200">{watch.specs.yearEstimate}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Reference</span>
                    <span className="font-semibold text-slate-200 font-mono">{watch.specs.referenceNumber || 'Vintage Estate'}</span>
                  </div>
                </div>
              </div>

              {/* Why This is a Gem Radar Analysis */}
              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                <div className="flex items-center space-x-1.5 text-xs font-semibold text-amber-300">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Hidden Gem Evaluation Factors</span>
                </div>
                <ul className="text-xs text-slate-300 space-y-1 pl-4 list-disc marker:text-amber-400">
                  {watch.gemReasons.map((reason, idx) => (
                    <li key={idx} className="leading-relaxed">{reason}</li>
                  ))}
                  {watch.misspelledOrObscure && (
                    <li className="text-amber-300 font-medium">
                      Listing title has typoes or generic descriptions that shield it from collector automated alerts.
                    </li>
                  )}
                </ul>
              </div>

              {/* Sniper Recommendation */}
              {watch.listingType === 'auction' && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start space-x-2 text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-200">Sniper Strategy:</span>
                    <p className="text-slate-400 mt-0.5">
                      Do not bid early to avoid triggering counter-bids. Place your maximum bid ({currencySymbol}{Math.round(displayPrice * 1.35)}) at T-30 seconds directly on {watch.ebayDomain}.
                    </p>
                  </div>
                </div>
              )}
              {/* Verified Live Search Link Notice */}
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center space-x-2 text-xs text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>Live Search Link:</strong> Opens active, existing items on {watch.ebayDomain} without expired 404 listing errors.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-slate-800 bg-slate-950/90">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span>Query:</span>
            <code className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-amber-300 font-mono text-[11px]">
              {watch.ebaySearchQuery}
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(watch.ebaySearchQuery);
                setCopiedQuery(true);
                setTimeout(() => setCopiedQuery(false), 2000);
              }}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300 transition-colors flex items-center space-x-1"
              title="Copy query keywords"
            >
              {copiedQuery ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[10px] text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="text-[10px]">Copy</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Close Dossier
            </button>

            <a
              href={watch.ebayUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all"
            >
              <span>Search Active on {watch.ebayDomain}</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
