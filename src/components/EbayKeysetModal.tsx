import React, { useState, useEffect } from 'react';
import {
  Key,
  ShieldCheck,
  Zap,
  Globe,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Terminal,
  Copy,
  Check,
  Eye,
  EyeOff,
  ExternalLink,
  Trash2,
  Cpu,
  Layers,
  X,
} from 'lucide-react';
import {
  SUPPORTED_MARKETPLACES,
  EbayKeyset,
  generateDockerEnv,
  generateDockerComposeEnv,
} from '../utils/ebayKeyset.ts';

interface EbayKeysetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeysetUpdated: () => void;
}

export const EbayKeysetModal: React.FC<EbayKeysetModalProps> = ({
  isOpen,
  onClose,
  onKeysetUpdated,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'configure' | 'guide' | 'docker'>('configure');

  // Form State
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [devId, setDevId] = useState('');
  const [environment, setEnvironment] = useState<'PRODUCTION' | 'SANDBOX'>('PRODUCTION');
  const [marketplaceId, setMarketplaceId] = useState('EBAY_DE');
  const [enabled, setEnabled] = useState(true);

  // UI display state
  const [showSecret, setShowSecret] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    latencyMs?: number;
    statusCode?: number;
  } | null>(null);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [copiedCompose, setCopiedCompose] = useState(false);

  // Server status state
  const [serverStatus, setServerStatus] = useState<{
    isConfigured: boolean;
    mode: string;
    environment: 'PRODUCTION' | 'SANDBOX';
    marketplace: string;
    maskedClientId: string;
    hasDevId: boolean;
    lastTested: number | null;
    lastTestStatus: string | null;
    lastTestMessage: string | null;
  } | null>(null);

  // Fetch current keyset status from server
  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/ebay/status');
      if (res.ok) {
        const data = await res.json();
        setServerStatus(data);
        if (data.marketplace) setMarketplaceId(data.marketplace);
        if (data.environment) setEnvironment(data.environment);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
      setTestResult(null);
      setActionMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Live Test Connection
  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    setActionMessage(null);

    try {
      const res = await fetch('/api/ebay/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          clientSecret,
          devId,
          environment,
          marketplaceId,
        }),
      });

      const data = await res.json();
      setTestResult({
        success: data.success,
        message: data.message,
        latencyMs: data.latencyMs,
        statusCode: data.statusCode,
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Network failure testing credentials: ${err?.message || err}`,
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Handle Save Keyset
  const handleSaveKeyset = async () => {
    setIsSaving(true);
    setActionMessage(null);

    try {
      const res = await fetch('/api/ebay/keyset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          clientSecret,
          devId,
          environment,
          marketplaceId,
          enabled,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setActionMessage({ text: data.message, type: 'success' });
        await fetchStatus();
        onKeysetUpdated();
      } else {
        setActionMessage({
          text: data.message || 'Validation failed. Check your keys.',
          type: 'error',
        });
      }
    } catch (err: any) {
      setActionMessage({
        text: `Error saving keyset: ${err?.message || err}`,
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Disconnect
  const handleDisconnect = async () => {
    if (!confirm('Disconnect eBay Keyset and revert to Smart Radar Mode?')) return;
    try {
      const res = await fetch('/api/ebay/disconnect', { method: 'POST' });
      if (res.ok) {
        setClientId('');
        setClientSecret('');
        setDevId('');
        setTestResult(null);
        setActionMessage({
          text: 'eBay Keyset disconnected. App is in Smart Radar Mode.',
          type: 'success',
        });
        await fetchStatus();
        onKeysetUpdated();
      }
    } catch (err: any) {
      setActionMessage({ text: 'Failed to disconnect keyset', type: 'error' });
    }
  };

  const copyToClipboard = (text: string, type: 'env' | 'compose') => {
    navigator.clipboard.writeText(text);
    if (type === 'env') {
      setCopiedEnv(true);
      setTimeout(() => setCopiedEnv(false), 2000);
    } else {
      setCopiedCompose(true);
      setTimeout(() => setCopiedCompose(false), 2000);
    }
  };

  const currentConfigSample: Partial<EbayKeyset> = {
    clientId: clientId || (serverStatus?.isConfigured ? 'YOUR_CONFIGURED_APP_ID' : ''),
    clientSecret: clientSecret || (serverStatus?.isConfigured ? 'YOUR_CONFIGURED_CERT_ID' : ''),
    devId: devId || undefined,
    environment,
    marketplaceId,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md">
      <div
        className="relative w-full max-w-3xl bg-slate-900 border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ebay-keyset-title"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-800 bg-slate-950/90">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-inner shrink-0">
              <Key className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h2 id="ebay-keyset-title" className="text-sm sm:text-base font-bold text-slate-100 font-serif truncate">
                  eBay Keyset Integration
                </h2>
                <span
                  className={`text-[9px] sm:text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${
                    serverStatus?.isConfigured
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}
                >
                  {serverStatus?.isConfigured ? '🟢 Connected' : '⚪ Smart Radar'}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                Configure your official App ID, Cert ID, and marketplace
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close eBay keyset modal"
            className="p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-slate-100 border border-slate-700 transition-colors shrink-0 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950/60 px-4 sm:px-6 pt-2 overflow-x-auto scrollbar-none whitespace-nowrap">
          <button
            onClick={() => setActiveSubTab('configure')}
            className={`flex items-center space-x-1.5 py-2.5 px-3 sm:px-4 text-xs font-semibold border-b-2 transition-all shrink-0 ${
              activeSubTab === 'configure'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Configure Keyset</span>
          </button>
          <button
            onClick={() => setActiveSubTab('guide')}
            className={`flex items-center space-x-1.5 py-2.5 px-3 sm:px-4 text-xs font-semibold border-b-2 transition-all shrink-0 ${
              activeSubTab === 'guide'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>How to Get Keys</span>
          </button>
          <button
            onClick={() => setActiveSubTab('docker')}
            className={`flex items-center space-x-1.5 py-2.5 px-3 sm:px-4 text-xs font-semibold border-b-2 transition-all shrink-0 ${
              activeSubTab === 'docker'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>NAS / Docker Config</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6 text-xs text-slate-300">
          {/* TAB 1: CONFIGURE KEYSET */}
          {activeSubTab === 'configure' && (
            <div className="space-y-5">
              {/* Active Status Banner */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${serverStatus?.isConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                  <div>
                    <span className="font-semibold text-slate-200 text-xs block">
                      Current Server Mode:{' '}
                      <span className="text-amber-400 font-mono">
                        {serverStatus?.isConfigured
                          ? `Live Browse API (${serverStatus.environment})`
                          : 'Smart Live Radar Mode'}
                      </span>
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {serverStatus?.isConfigured
                        ? `Active App ID: ${serverStatus.maskedClientId} • Marketplace: ${serverStatus.marketplace}`
                        : 'No keys configured yet. Running with high-precision zero-setup deep searches.'}
                    </span>
                  </div>
                </div>

                {serverStatus?.isConfigured && (
                  <button
                    onClick={handleDisconnect}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/50 text-red-300 border border-red-500/30 text-xs transition-colors shrink-0"
                    title="Disconnect Keyset"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Disconnect</span>
                  </button>
                )}
              </div>

              {/* Action / Success Banner */}
              {actionMessage && (
                <div
                  className={`p-3.5 rounded-xl border flex items-center space-x-2 text-xs ${
                    actionMessage.type === 'success'
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : 'bg-red-950/40 border-red-500/40 text-red-300'
                  }`}
                >
                  {actionMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{actionMessage.text}</span>
                </div>
              )}

              {/* Form Grid */}
              <div className="space-y-4 bg-slate-950/40 p-5 rounded-2xl border border-slate-800">
                {/* Environment & Marketplace Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Environment Selector */}
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1 text-xs">
                      eBay Environment
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setEnvironment('PRODUCTION')}
                        className={`p-2 rounded-xl text-xs font-medium border text-center transition-all ${
                          environment === 'PRODUCTION'
                            ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold shadow-sm'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Production (Live)
                      </button>
                      <button
                        type="button"
                        onClick={() => setEnvironment('SANDBOX')}
                        className={`p-2 rounded-xl text-xs font-medium border text-center transition-all ${
                          environment === 'SANDBOX'
                            ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold shadow-sm'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Sandbox (Testing)
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Production connects to real eBay listings on ebay.de & ebay.ch.
                    </span>
                  </div>

                  {/* Marketplace Selector */}
                  <div>
                    <label htmlFor="ebay-marketplace-select" className="block text-slate-300 font-semibold mb-1 text-xs">
                      Primary European Marketplace
                    </label>
                    <select
                      id="ebay-marketplace-select"
                      value={marketplaceId}
                      onChange={(e) => setMarketplaceId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                    >
                      {SUPPORTED_MARKETPLACES.map((m) => (
                        <option key={m.id} value={m.id} className="bg-slate-900 text-slate-200">
                          {m.name} — {m.note}
                        </option>
                      ))}
                    </select>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Default marketplace headers sent with Browse API searches.
                    </span>
                  </div>
                </div>

                {/* App ID (Client ID) */}
                <div>
                  <label htmlFor="ebay-client-id" className="block text-slate-300 font-semibold mb-1 text-xs">
                    App ID (Client ID) <span className="text-amber-400">*</span>
                  </label>
                  <input
                    id="ebay-client-id"
                    type="text"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    placeholder="e.g. YourName-ChronoSc-PRD-12345678-abcdef12"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-400"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    Found in eBay Developer Portal under &quot;Application Keys&quot; &rarr; App ID (Client ID).
                  </span>
                </div>

                {/* Cert ID (Client Secret) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="ebay-client-secret" className="text-slate-300 font-semibold text-xs">
                      Cert ID (Client Secret) <span className="text-amber-400">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowSecret(!showSecret)}
                      className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center space-x-1"
                    >
                      {showSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showSecret ? 'Hide' : 'Reveal'}</span>
                    </button>
                  </div>
                  <input
                    id="ebay-client-secret"
                    type={showSecret ? 'text' : 'password'}
                    value={clientSecret}
                    onChange={(e) => setClientSecret(e.target.value)}
                    placeholder="e.g. PRD-12345678abcdef12-1234-1234-1234-abcd"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-400"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    Stored locally in your server memory or home NAS data volume.
                  </span>
                </div>

                {/* Dev ID (Optional) */}
                <div>
                  <label htmlFor="ebay-dev-id" className="block text-slate-300 font-semibold mb-1 text-xs">
                    Dev ID <span className="text-slate-500 font-normal">(Optional)</span>
                  </label>
                  <input
                    id="ebay-dev-id"
                    type="text"
                    value={devId}
                    onChange={(e) => setDevId(e.target.value)}
                    placeholder="e.g. 12345678-1234-1234-1234-123456789abc"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Enable toggle */}
                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="checkbox"
                    id="enable-keyset"
                    checked={enabled}
                    onChange={(e) => setEnabled(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-0"
                  />
                  <label htmlFor="enable-keyset" className="text-slate-300 text-xs font-medium cursor-pointer">
                    Enable Live Official eBay Browse API queries using this Keyset
                  </label>
                </div>
              </div>

              {/* Live Test Diagnostic Output */}
              {testResult && (
                <div
                  className={`p-4 rounded-2xl border space-y-1.5 animate-in fade-in duration-150 ${
                    testResult.success
                      ? 'bg-emerald-950/40 border-emerald-500/40'
                      : 'bg-red-950/40 border-red-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-bold flex items-center space-x-1.5 text-xs ${
                        testResult.success ? 'text-emerald-300' : 'text-red-300'
                      }`}
                    >
                      {testResult.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                      )}
                      <span>{testResult.success ? 'Authentication Succeeded' : 'Authentication Failed'}</span>
                    </span>
                    {testResult.latencyMs !== undefined && (
                      <span className="font-mono text-[10px] text-slate-400">
                        ⚡ {testResult.latencyMs} ms
                      </span>
                    )}
                  </div>
                  <p className="text-slate-300 leading-relaxed text-xs">{testResult.message}</p>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: STEP BY STEP GUIDE */}
          {activeSubTab === 'guide' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start space-x-3">
                <Zap className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-amber-300 text-xs block mb-1">
                    Free &amp; Instant Access (No Credit Card or Business Required)
                  </span>
                  <p className="text-slate-300 leading-relaxed text-xs">
                    eBay gives every standard user a developer keyset with <strong>5,000 to 25,000 free Browse API calls per day</strong>. Creating one takes less than 2 minutes.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="flex items-center space-x-2 text-slate-200 font-bold text-xs">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-mono">1</span>
                    <span>Sign into the eBay Developer Portal</span>
                  </div>
                  <p className="text-slate-400 text-xs pl-7">
                    Visit{' '}
                    <a
                      href="https://developer.ebay.com/signin"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-400 underline font-medium inline-flex items-center space-x-1"
                    >
                      <span>developer.ebay.com/signin</span>
                      <ExternalLink className="w-3 h-3 ml-0.5" />
                    </a>{' '}
                    and log in with your regular eBay account credentials.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="flex items-center space-x-2 text-slate-200 font-bold text-xs">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-mono">2</span>
                    <span>Generate a Keyset</span>
                  </div>
                  <p className="text-slate-400 text-xs pl-7 leading-relaxed">
                    Click <strong>&quot;User Keys&quot;</strong> or <strong>&quot;Application Keys&quot;</strong> &rarr; click <strong>&quot;Create a Keyset&quot;</strong> under <em>Production</em>. Fill in any contact name (e.g. ChronoScout).
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="flex items-center space-x-2 text-slate-200 font-bold text-xs">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-mono">3</span>
                    <span>Copy App ID &amp; Cert ID</span>
                  </div>
                  <p className="text-slate-400 text-xs pl-7 leading-relaxed">
                    Copy the <strong>App ID (Client ID)</strong> and <strong>Cert ID (Client Secret)</strong> into the &quot;Configure Keyset&quot; tab or your UGREEN NAS <code>docker-compose.yml</code> file.
                  </p>
                </div>
              </div>

              <div className="pt-2 text-center">
                <button
                  onClick={() => setActiveSubTab('configure')}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
                >
                  I Have My Keys &rarr; Configure Now
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: DOCKER / UGREEN NAS CONFIG */}
          {activeSubTab === 'docker' && (
            <div className="space-y-4">
              <p className="text-slate-300 leading-relaxed text-xs">
                To run ChronoScout 24/7 on your UGREEN NAS with your keyset pre-configured, add these environment variables into your Docker container:
              </p>

              {/* .env Block */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-slate-200 flex items-center space-x-1.5">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span>.env file snippet</span>
                  </span>
                  <button
                    onClick={() => copyToClipboard(generateDockerEnv(currentConfigSample), 'env')}
                    className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs transition-colors"
                  >
                    {copiedEnv ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy .env</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-amber-300/90 overflow-x-auto leading-relaxed">
                  {generateDockerEnv(currentConfigSample)}
                </pre>
              </div>

              {/* docker-compose.yml snippet */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-slate-200 flex items-center space-x-1.5">
                    <HardDrive className="w-4 h-4 text-emerald-400" />
                    <span>docker-compose.yml environment block</span>
                  </span>
                  <button
                    onClick={() => copyToClipboard(generateDockerComposeEnv(currentConfigSample), 'compose')}
                    className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs transition-colors"
                  >
                    {copiedCompose ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy YAML</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto leading-relaxed">
                  {generateDockerComposeEnv(currentConfigSample)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/95 gap-3 text-xs">
          {activeSubTab === 'configure' ? (
            <>
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting || (!clientId.trim() && !serverStatus?.isConfigured)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 disabled:opacity-50 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors flex items-center justify-center space-x-2 shadow-sm"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin text-amber-400' : ''}`} />
                <span>{isTesting ? 'Pinging eBay OAuth...' : 'Test Connection'}</span>
              </button>

              <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveKeyset}
                  disabled={isSaving || !clientId.trim() || !clientSecret.trim()}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs transition-colors shadow-sm flex items-center justify-center space-x-1.5"
                >
                  {isSaving ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <ShieldCheck className="w-3.5 h-3.5" />
                  )}
                  <span>{isSaving ? 'Saving & Verifying...' : 'Save & Activate Keyset'}</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <span className="text-slate-500 text-xs">
                Keys are transmitted solely to your local ChronoScout server and official eBay OAuth.
              </span>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition-colors"
              >
                Close
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
