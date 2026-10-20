import React, { useState } from 'react';
import { PlusCircle, Sparkles, Check, Clock, DollarSign, MapPin, Tag } from 'lucide-react';
import { WatchListing, calculateGemScore, classifyAttentionLevel, buildEbayLiveSearchUrl } from '../utils/gemEvaluator.ts';
import { detectBrandFromTitle, detectMovementFromTitle, estimateMarketBaseline } from '../utils/ebayParser.ts';

interface AddWatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWatch: (watch: WatchListing) => void;
}

export const AddWatchModal: React.FC<AddWatchModalProps> = ({ isOpen, onClose, onAddWatch }) => {
  const [title, setTitle] = useState('');
  const [currentPrice, setCurrentPrice] = useState('180');
  const [currency, setCurrency] = useState<'EUR' | 'CHF' | 'USD' | 'GBP'>('EUR');
  const [minutesRemaining, setMinutesRemaining] = useState('45');
  const [listingType, setListingType] = useState<'auction' | 'buy_it_now'>('auction');
  const [bidsCount, setBidsCount] = useState('0');
  const [countryCode, setCountryCode] = useState<'CH' | 'DE' | 'FR' | 'IT'>('CH');
  const [caliber, setCaliber] = useState('');

  if (!isOpen) return null;

  const handleQuickDetect = (rawTitle: string) => {
    setTitle(rawTitle);
    const detectedMovement = detectMovementFromTitle(rawTitle);
    if (rawTitle.toLowerCase().includes('7734') || rawTitle.toLowerCase().includes('7733')) {
      setCaliber('Valjoux 7734');
    } else if (rawTitle.toLowerCase().includes('spezimatic')) {
      setCaliber('GUB Kal. 75 Spezimatic');
    } else if (rawTitle.toLowerCase().includes('601')) {
      setCaliber('Omega Cal. 601');
    } else if (rawTitle.toLowerCase().includes('microtor') || rawTitle.toLowerCase().includes('215')) {
      setCaliber('Universal Genève Cal. 215');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const brand = detectBrandFromTitle(title);
    const movement = detectMovementFromTitle(title);
    const priceNum = parseFloat(currentPrice) || 150;
    const nowMs = Date.now();
    const durationMins = parseInt(minutesRemaining, 10) || 60;
    const endTime = new Date(nowMs + durationMins * 60 * 1000).toISOString();
    const bids = parseInt(bidsCount, 10) || 0;

    const priceUsd = currency === 'USD' ? priceNum : Math.round(priceNum * (currency === 'CHF' ? 1.13 : currency === 'EUR' ? 1.08 : 1.29));
    const estimatedValueUsd = estimateMarketBaseline(brand, movement, priceUsd);

    const { score, reasons, discountPercent } = calculateGemScore({
      listingType,
      currentPriceUsd: priceUsd,
      estimatedValueUsd,
      bidsCount: bids,
      endTimeIso: endTime,
      brand,
      caliber: caliber || undefined,
      countryCode,
      nowMs,
    });

    const diffSec = Math.max(0, Math.floor((new Date(endTime).getTime() - nowMs) / 1000));
    const attentionLevel = classifyAttentionLevel(listingType, bids, diffSec, discountPercent);

    const domainMap: Record<string, 'ebay.ch' | 'ebay.de' | 'ebay.fr' | 'ebay.it'> = {
      CH: 'ebay.ch',
      DE: 'ebay.de',
      FR: 'ebay.fr',
      IT: 'ebay.it',
    };
    const ebayDomain = domainMap[countryCode] || 'ebay.ch';
    const searchQuery = `${brand} ${movement}`;
    const ebayLiveSearchUrl = buildEbayLiveSearchUrl({
      domain: ebayDomain,
      keywords: searchQuery,
      listingType,
      maxPrice: Math.round(priceNum * 1.5),
      sort: listingType === 'auction' ? 'ending_soonest' : 'newly_listed',
    });

    const newWatch: WatchListing = {
      id: `custom-${Date.now()}`,
      title: title.trim(),
      brand,
      summary: `User-imported watch listing located in ${countryCode === 'CH' ? 'Switzerland' : 'Germany'}. Evaluated for vintage horological gem value.`,
      listingType,
      currentPriceUsd: priceUsd,
      originalPrice: priceNum,
      originalCurrency: currency,
      estimatedValueUsd,
      bidsCount: bids,
      endTime,
      seller: {
        username: 'european_seller',
        feedbackScore: 150,
        feedbackPercent: 100,
        isPrivateSeller: true,
      },
      location: {
        city: countryCode === 'CH' ? 'Geneva / Biel' : 'Munich / Dresden',
        country: countryCode === 'CH' ? 'Switzerland' : 'Germany',
        countryCode,
        shipsTo: 'Europe, Switzerland',
        shippingCostUsd: 15,
      },
      specs: {
        movement,
        caliber: caliber || undefined,
        caseDiameter: 'Vintage Standard',
        caseMaterial: 'Stainless Steel',
        yearEstimate: 'Vintage',
      },
      imageUrl: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80',
      galleryUrls: ['https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80'],
      ebayUrl: ebayLiveSearchUrl,
      ebayLiveSearchUrl,
      ebaySearchQuery: searchQuery,
      ebayItemNumber: String(Date.now()).slice(-8),
      ebayDomain,
      gemScore: score,
      gemReasons: reasons,
      attentionLevel,
      dateAdded: new Date(nowMs).toISOString(),
    };

    onAddWatch(newWatch);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md">
      <div
        className="relative w-full max-w-xl bg-slate-900 border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-watch-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 id="add-watch-title" className="text-base font-bold text-slate-100 flex items-center space-x-2">
                <span>Evaluate &amp; Track Any eBay Watch</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  No API Key Required
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Paste any watch title or item to calculate its gem score and add a live countdown
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close add watch modal"
            className="p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-slate-100 border border-slate-700 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto">
          {/* Quick presets / paste */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Watch Title / Description</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => handleQuickDetect(e.target.value)}
              placeholder="e.g. Vintage Omega Geneve Cal 601 Stahl Handaufzug 1968"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-slate-200 text-xs focus:outline-none focus:border-amber-500/60"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-[10px] text-slate-500">Quick test:</span>
              <button
                type="button"
                onClick={() => handleQuickDetect('Vintage Omega Seamaster Automatic Cal 565 Stahl')}
                className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded"
              >
                Omega Seamaster
              </button>
              <button
                type="button"
                onClick={() => handleQuickDetect('GUB Glashütte Spezimatic Bison 26 Rubis Kaliber 75')}
                className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded"
              >
                Glashütte Spezimatic
              </button>
              <button
                type="button"
                onClick={() => handleQuickDetect('Chronographe Suisse Valjoux 7734 Double Compteur')}
                className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded"
              >
                Valjoux Chrono
              </button>
            </div>
          </div>

          {/* Pricing & Currency Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Current Price / Bid</label>
              <div className="relative">
                <input
                  type="number"
                  required
                  value={currentPrice}
                  onChange={(e) => setCurrentPrice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-slate-200 text-xs focus:outline-none focus:border-amber-500/60"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-slate-200 text-xs focus:outline-none focus:border-amber-500/60"
              >
                <option value="EUR">EUR (€)</option>
                <option value="CHF">CHF (₣)</option>
                <option value="USD">USD ($)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>

          {/* Listing Format & Provenance */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Listing Format</label>
              <select
                value={listingType}
                onChange={(e) => setListingType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-slate-200 text-xs focus:outline-none focus:border-amber-500/60"
              >
                <option value="auction">Auction (Ending Soon)</option>
                <option value="buy_it_now">Buy It Now (Fixed Price)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Location / eBay Site</label>
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-slate-200 text-xs focus:outline-none focus:border-amber-500/60"
              >
                <option value="CH">🇨🇭 Switzerland (ebay.ch)</option>
                <option value="DE">🇩🇪 Germany (ebay.de)</option>
                <option value="FR">🇫🇷 France (ebay.fr)</option>
                <option value="IT">🇮🇹 Italy (ebay.it)</option>
              </select>
            </div>
          </div>

          {/* Auction specifics */}
          {listingType === 'auction' && (
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Bids Count</label>
                <input
                  type="number"
                  min="0"
                  value={bidsCount}
                  onChange={(e) => setBidsCount(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-1.5 px-2.5 text-slate-200 text-xs"
                />
                <span className="text-[10px] text-slate-500">0 bids gives maximum gem score</span>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Minutes Remaining</label>
                <input
                  type="number"
                  min="1"
                  value={minutesRemaining}
                  onChange={(e) => setMinutesRemaining(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-1.5 px-2.5 text-slate-200 text-xs"
                />
                <span className="text-[10px] text-slate-500">Countdown timer will start ticking</span>
              </div>
            </div>
          )}

          {/* Caliber input */}
          <div>
            <label className="block text-slate-400 font-medium mb-1">Known Caliber (Optional)</label>
            <input
              type="text"
              value={caliber}
              onChange={(e) => setCaliber(e.target.value)}
              placeholder="e.g. Valjoux 7734, Omega 601, GUB 75"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-slate-200 text-xs focus:outline-none focus:border-amber-500/60"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Evaluate &amp; Track Watch</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
