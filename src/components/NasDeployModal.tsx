import React, { useState } from 'react';
import { Server, Copy, Check, Terminal, ExternalLink, HardDrive, ShieldCheck, CheckCircle2, X } from 'lucide-react';

interface NasDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NasDeployModal: React.FC<NasDeployModalProps> = ({ isOpen, onClose }) => {
  const [copiedCompose, setCopiedCompose] = useState(false);
  const [copiedRun, setCopiedRun] = useState(false);

  if (!isOpen) return null;

  const dockerComposeYaml = `version: '3.8'

services:
  chronoscout:
    image: chronoscout:latest
    build: .
    container_name: ugreen-chronoscout
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
    volumes:
      # Persistent watchlists and custom alert criteria
      - ./data:/app/data
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:3000/api/stats"]
      interval: 30s
      timeout: 5s
      retries: 3
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"`;

  const dockerRunCmd = `docker run -d \\
  --name ugreen-chronoscout \\
  --restart unless-stopped \\
  -p 3000:3000 \\
  -v /volume1/docker/chronoscout/data:/app/data \\
  chronoscout:latest`;

  const copyToClipboard = (text: string, type: 'compose' | 'run') => {
    navigator.clipboard.writeText(text);
    if (type === 'compose') {
      setCopiedCompose(true);
      setTimeout(() => setCopiedCompose(false), 2000);
    } else {
      setCopiedRun(true);
      setTimeout(() => setCopiedRun(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md">
      <div
        className="relative w-full max-w-3xl bg-slate-900 border border-emerald-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="nas-deploy-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 id="nas-deploy-title" className="text-base font-bold text-slate-100 flex items-center space-x-2">
                <span>UGREEN NAS (UGOS) Docker Deployment</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Ready to Deploy
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Self-contained container instructions for running 24/7 on your local NAS
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close deployment guide"
            className="p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-slate-100 border border-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-6 text-xs text-slate-300">
          {/* Overview Banner */}
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-start space-x-3">
            <HardDrive className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-emerald-300 text-sm block mb-1">
                Optimized for Ugreen NAS UGOS Docker Manager
              </span>
              <p className="text-slate-300 leading-relaxed">
                ChronoScout is packaged with an ultra-lightweight Node 22 Alpine multi-stage Docker build, health checks, and persistent data volume mounts. It runs independently on your home network without requiring external subscription servers.
              </p>
            </div>
          </div>

          {/* Quick Step Guide */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">
              Deployment in 3 Simple Steps on UGREEN UGOS:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <div className="flex items-center space-x-1.5 text-amber-400 font-bold">
                  <span>1. Open Docker App</span>
                </div>
                <p className="text-slate-400 leading-normal">
                  In your UGREEN NAS Desktop (UGOS), launch the built-in <strong>Docker</strong> application.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <div className="flex items-center space-x-1.5 text-amber-400 font-bold">
                  <span>2. Add Compose Project</span>
                </div>
                <p className="text-slate-400 leading-normal">
                  Navigate to <strong>Project / Compose</strong> &rarr; <strong>Create</strong>, name it <code>chronoscout</code>, and paste the YAML below.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <div className="flex items-center space-x-1.5 text-amber-400 font-bold">
                  <span>3. Access UI</span>
                </div>
                <p className="text-slate-400 leading-normal">
                  Click Deploy! Access anytime at <code>http://&lt;your-ugreen-ip&gt;:3000</code> from any computer or phone on your home LAN.
                </p>
              </div>
            </div>
          </div>

          {/* Docker Compose YAML Block */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-200 flex items-center space-x-1.5">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>docker-compose.yml</span>
              </span>
              <button
                onClick={() => copyToClipboard(dockerComposeYaml, 'compose')}
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
            <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto leading-relaxed">
              {dockerComposeYaml}
            </pre>
          </div>

          {/* One-Line Docker Run */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-200 flex items-center space-x-1.5">
                <Terminal className="w-4 h-4 text-amber-400" />
                <span>Alternative: One-Line SSH / Docker Run Command</span>
              </span>
              <button
                onClick={() => copyToClipboard(dockerRunCmd, 'run')}
                className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs transition-colors"
              >
                {copiedRun ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Command</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-amber-300/90 overflow-x-auto">
              {dockerRunCmd}
            </pre>
          </div>

          {/* Health & Resources Specs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">RAM Usage</span>
              <span className="font-semibold text-emerald-400 font-mono">~45 MB</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">CPU Overhead</span>
              <span className="font-semibold text-emerald-400 font-mono">&lt; 0.2%</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Default Port</span>
              <span className="font-semibold text-slate-200 font-mono">3000</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Auto-Restart</span>
              <span className="font-semibold text-slate-200 font-mono">unless-stopped</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/90">
          <span className="text-xs text-slate-400">
            Files <code>Dockerfile</code> &amp; <code>docker-compose.yml</code> are included in the app root.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
