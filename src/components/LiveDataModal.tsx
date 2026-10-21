import React from 'react';
import { Key, ShieldCheck, Zap, Globe, HardDrive, CheckCircle2, ArrowRight, X } from 'lucide-react';

interface LiveDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiStatus: {
    isConfigured: boolean;
    mode: string;
    marketplace: string;
  };
  onOpenKeysetModal?: () => void;
}

export const LiveDataModal: React.FC<LiveDataModalProps> = ({
  isOpen,
  onClose,
  apiStatus,
  onOpenKeysetModal,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md">
      <div
        className="relative w-full max-w-3xl bg-slate-900 border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="live-data-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 id="live-data-title" className="text-base font-bold text-slate-100 flex items-center space-x-2">
                <span>How Live eBay Data Works in ChronoScout</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                  apiStatus.isConfigured
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}>
                  {apiStatus.isConfigured ? 'Live Browse API Active' : 'Smart Live Radar Mode'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Understanding live data streams, the official eBay Browse API, and NAS home network deployment
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close live data modal"
            className="p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-slate-100 border border-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-6 text-xs text-slate-300">
          {/* Current Status Box */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
              <span className="flex items-center space-x-2">
                <span className={`w-2.5 h-2.5 rounded-full ${apiStatus.isConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                <span>Active Data Architecture</span>
              </span>
              <span className="font-mono text-amber-300">Current Marketplace: {apiStatus.marketplace}</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              ChronoScout supports two complementary ways of getting live watch listings from eBay Switzerland (`ebay.ch`) and eBay Germany (`ebay.de`).
            </p>
          </div>

          {/* Mode 1: Smart Live Search Routing */}
          <div className="p-5 rounded-2xl bg-slate-950/70 border border-amber-500/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-amber-300 flex items-center space-x-2">
                <Globe className="w-4 h-4 text-amber-400" />
                <span>Mode 1: No API Key Required — Smart Radar & Live Deep-Links</span>
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full font-semibold border border-emerald-500/30">
                Active & Ready Now
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              <strong>You do NOT need an eBay API key or Client ID.</strong> ChronoScout is built to work immediately without any API configuration using three zero-setup methods:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="font-semibold text-amber-400 block text-xs">1. Live Precision Snipers</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Every card and preset generates live eBay links with sniper operators (<code className="text-amber-300">_sop=1</code> ending soonest, <code className="text-amber-300">LH_Auction=1</code>, negative filters) opening active live items on <code className="text-amber-300">ebay.ch</code> and <code className="text-amber-300">ebay.de</code>.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="font-semibold text-amber-400 block text-xs">2. Quick Deal Evaluator</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Click <strong>&quot;Evaluate Deal&quot;</strong> in the top bar to plug in any watch listing you find on eBay. It instantly scores its horological value, caliber, and fair discount.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="font-semibold text-amber-400 block text-xs">3. Mobile Push Alerts</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Open any query from the <strong>eBay Live Snipers</strong> tab on eBay and click <strong>&quot;Save this search&quot;</strong> (❤️) to get instant phone push notifications from eBay!
                </p>
              </div>
            </div>
          </div>

          {/* Mode 2: Official eBay Developer Browse API */}
          <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-200 flex items-center space-x-2">
                <Key className="w-4 h-4 text-emerald-400" />
                <span>Mode 2: Official eBay Developer Keyset (Live Background Browse API)</span>
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                apiStatus.isConfigured
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400'
              }`}>
                {apiStatus.isConfigured ? 'Connected' : 'Optional Keyset'}
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              If you want automated background querying directly against official eBay Browse API endpoints:
            </p>

            <div className="space-y-2 pt-1">
              <ol className="list-decimal pl-5 space-y-1.5 text-slate-400">
                <li>
                  <strong className="text-slate-200">100% Free:</strong> Go to{' '}
                  <a href="https://developer.ebay.com/signin" target="_blank" rel="noopener noreferrer" className="text-amber-400 underline">
                    developer.ebay.com
                  </a>{' '}
                  and sign in with your normal eBay account.
                </li>
                <li>
                  <strong className="text-slate-200">Generate Keyset:</strong> Click <em>&quot;Create a Keyset&quot;</em> to get your <strong>App ID (Client ID)</strong> and <strong>Cert ID (Client Secret)</strong>.
                </li>
                <li>
                  <strong className="text-slate-200">Add to ChronoScout:</strong> Click the button below to paste your keys, test the connection live, and activate official API streaming!
                </li>
              </ol>
            </div>

            {onOpenKeysetModal && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenKeysetModal();
                  }}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-sm"
                >
                  <Key className="w-4 h-4" />
                  <span>Configure eBay Keyset Now &rarr;</span>
                </button>
              </div>
            )}
          </div>

          {/* Home NAS Advantage */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-start space-x-3">
            <HardDrive className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-200 text-xs block mb-1">
                UGREEN NAS (UGOS) Deployment Advantage
              </span>
              <p className="text-slate-400 leading-relaxed text-xs">
                ChronoScout runs inside a lightweight (~80MB) Docker container on your UGREEN NAS. Running on your local network means it operates from your <strong>home residential IP</strong>, keeping your watch monitors active 24/7 without cloud server restrictions.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/90">
          <span className="text-xs text-slate-500">
            Official eBay Developer API gives 5,000–25,000 free live queries per day.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
