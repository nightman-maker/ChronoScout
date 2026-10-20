import React, { useState } from 'react';
import { ExternalLink, Compass, Search, Filter, ShieldCheck, Zap } from 'lucide-react';

interface EbayPresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EbayPresetsModal: React.FC<EbayPresetsModalProps> = ({ isOpen, onClose }) => {
  const [customKeyword, setCustomKeyword] = useState('Omega vintage');
  const [customPortal, setCustomPortal] = useState<'ebay.de' | 'ebay.ch' | 'ebay.fr' | 'ebay.it'>('ebay.ch');
  const [customFormat, setCustomFormat] = useState<'auction' | 'bin' | 'all'>('auction');
  const [customMaxPrice, setCustomMaxPrice] = useState('500');
  const [customSort, setCustomSort] = useState<'ending_soon' | 'newly_listed'>('ending_soon');

  if (!isOpen) return null;

  const presets = [
    {
      id: 'ch-ending-soon',
      title: '🇨🇭 Swiss Auctions Ending Soonest (ebay.ch)',
      description: 'Finds Swiss mechanical watches ending within hours with low competition from Swiss sellers.',
      portal: 'ebay.ch',
      url: 'https://www.ebay.ch/sch/i.html?_nkw=(Vintage+Swiss%2COmega%2CTissot%2CLongines%2CCertina%2CZenith)+Armbanduhr+-quartz+-batterie&_sop=1&LH_Auction=1&_udhi=600',
      badge: 'Sniper Focus',
    },
    {
      id: 'de-glashuette-no-bids',
      title: '🇩🇪 Glashütte (GUB Spezimatic / Spezichron) on ebay.de',
      description: 'Filters historical Saxon GDR & Glashütte Original pieces on German eBay ending soonest.',
      portal: 'ebay.de',
      url: 'https://www.ebay.de/sch/i.html?_nkw=(Glashutte%2CGUB%2CSpezimatic%2CSpezichron%2CKaliber)+Armbanduhr+-quarz+-damenuhr&_sop=1&LH_Auction=1&_udhi=450',
      badge: 'Saxon Classics',
    },
    {
      id: 'de-misspelled-gems',
      title: '🕵️ Misspelled Brand Typo Radar (ebay.de & ebay.ch)',
      description: 'Uncovers listings with typos ("Omga", "Glashutte", "Tisso", "Longins", "Valjoux 7733") that slip past normal watch alerts.',
      portal: 'ebay.de',
      url: 'https://www.ebay.de/sch/i.html?_nkw=(Omga%2CGashutte%2CTisso%2CLongins%2CValjoux+7733)+Armbanduhr&_sop=1',
      badge: 'Zero Competition',
    },
    {
      id: 'eu-underpriced-bin',
      title: '⚡ Newly Listed Buy It Now Underpriced Swiss Mechanicals',
      description: 'Monitors newly listed European "Sofort-Kaufen" items priced under market baseline before dealers spot them.',
      portal: 'ebay.de',
      url: 'https://www.ebay.de/sch/i.html?_nkw=(Omega%2CZenith%2CLongines%2CUniversal+Geneve%2CEnicar)+Handaufzug+Automatik&_sop=10&LH_BIN=1&_udhi=550',
      badge: 'Immediate Steals',
    },
    {
      id: 'fr-besancon-chronos',
      title: '🇫🇷 French Border & Besançon Horology Estates (ebay.fr)',
      description: 'Targets mechanical chronographs (Landeron, Valjoux, Venus) from the historic French-Swiss watchmaking border.',
      portal: 'ebay.fr',
      url: 'https://www.ebay.fr/sch/i.html?_nkw=(Chronographe+Suisse%2CValjoux%2CLanderon)+Montre+-quartz&_sop=1&LH_Auction=1&_udhi=650',
      badge: 'Vintage Chronos',
    },
  ];

  // Build custom live URL
  const buildCustomUrl = () => {
    const encoded = encodeURIComponent(
      `(${customKeyword}) -quartz -batterie -quarz -damenuhr -fake -replica -parts`
    );
    let url = `https://www.${customPortal}/sch/i.html?_nkw=${encoded}`;

    if (customFormat === 'auction') {
      url += '&LH_Auction=1';
    } else if (customFormat === 'bin') {
      url += '&LH_BIN=1';
    }

    if (customSort === 'ending_soon') {
      url += '&_sop=1'; // Ending soonest
    } else {
      url += '&_sop=10'; // Newly listed
    }

    if (customMaxPrice && Number(customMaxPrice) > 0) {
      url += `&_udhi=${customMaxPrice}`;
    }

    return url;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md">
      <div
        className="relative w-full max-w-3xl bg-slate-900 border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ebay-presets-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 id="ebay-presets-title" className="text-base font-bold text-slate-100 flex items-center space-x-2">
                <span>Direct Live eBay Search Engine</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                  EU &amp; CH Portals
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Pre-configured sniper URLs with advanced boolean filters for European eBay sites
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close presets modal"
            className="p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-slate-100 border border-slate-700 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-6 text-xs text-slate-300">
          {/* Custom Query Generator */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Zap className="w-4 h-4" />
                <span>Launch Custom European Sniper Query</span>
              </span>
              <span className="text-[11px] text-slate-500">Auto-applies negative quartz/replica filters</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Keywords / Brand</label>
                <input
                  type="text"
                  value={customKeyword}
                  onChange={(e) => setCustomKeyword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-2.5 text-slate-200 focus:outline-none focus:border-amber-500/50"
                  placeholder="e.g. Omega, Spezimatic, Lemania"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">European Portal</label>
                <select
                  value={customPortal}
                  onChange={(e) => setCustomPortal(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-2.5 text-slate-200 focus:outline-none focus:border-amber-500/50"
                >
                  <option value="ebay.ch">🇨🇭 eBay Switzerland (ebay.ch)</option>
                  <option value="ebay.de">🇩🇪 eBay Germany (ebay.de)</option>
                  <option value="ebay.fr">🇫🇷 eBay France (ebay.fr)</option>
                  <option value="ebay.it">🇮🇹 eBay Italy (ebay.it)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Format</label>
                <select
                  value={customFormat}
                  onChange={(e) => setCustomFormat(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-2.5 text-slate-200 focus:outline-none focus:border-amber-500/50"
                >
                  <option value="auction">Auctions Only</option>
                  <option value="bin">Buy It Now Only</option>
                  <option value="all">All Formats</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Max Price</label>
                <input
                  type="number"
                  value={customMaxPrice}
                  onChange={(e) => setCustomMaxPrice(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-2.5 text-slate-200 focus:outline-none focus:border-amber-500/50"
                  placeholder="500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-3 text-slate-400">
                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="sortOrder"
                    checked={customSort === 'ending_soon'}
                    onChange={() => setCustomSort('ending_soon')}
                    className="accent-amber-500"
                  />
                  <span>Ending Soonest (_sop=1)</span>
                </label>
                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="sortOrder"
                    checked={customSort === 'newly_listed'}
                    onChange={() => setCustomSort('newly_listed')}
                    className="accent-amber-500"
                  />
                  <span>Newly Listed (_sop=10)</span>
                </label>
              </div>

              <a
                href={buildCustomUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-md"
              >
                <span>Search Live on {customPortal}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Curated Pre-Configured Snipers */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Curated European Sniper Presets
            </h3>
            <div className="space-y-2.5">
              {presets.map((preset) => (
                <div
                  key={preset.id}
                  className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-amber-500/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-slate-100 text-sm">{preset.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        {preset.badge}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed max-w-xl">
                      {preset.description}
                    </p>
                  </div>

                  <a
                    href={preset.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 font-medium text-xs transition-colors"
                  >
                    <span>Open on {preset.portal}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/90">
          <span className="text-xs text-slate-500">
            All queries automatically bypass generic quartz watches and replica listings.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
