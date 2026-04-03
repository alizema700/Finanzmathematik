import React, { useState, useRef } from 'react';
import { Shield, ShieldAlert, ShieldCheck, AlertTriangle, Search, Clock, Globe, ChevronDown, ChevronUp, Zap } from 'lucide-react';

const SEVERITY_CONFIG = {
  high:   { label: 'Hoch',     bg: 'bg-red-500/10',    border: 'border-red-500/30',    text: 'text-red-400',    dot: 'bg-red-500' },
  medium: { label: 'Mittel',   bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', dot: 'bg-yellow-500' },
  low:    { label: 'Niedrig',  bg: 'bg-blue-500/10',   border: 'border-blue-500/30',   text: 'text-blue-400',   dot: 'bg-blue-400' },
};

const VERDICT_CONFIG = {
  safe:    { label: 'Vermutlich sicher', icon: ShieldCheck,  ring: '#22c55e', glow: 'shadow-green-500/20',  text: 'text-green-400',  bg: 'bg-green-500/10',  border: 'border-green-500/30' },
  warning: { label: 'Verdachtig',        icon: ShieldAlert,  ring: '#eab308', glow: 'shadow-yellow-500/20', text: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
  danger:  { label: 'Gefahrlich',        icon: ShieldAlert,  ring: '#ef4444', glow: 'shadow-red-500/20',    text: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/30' },
};

function RiskGauge({ score, verdictLevel }) {
  const radius = 70;
  const stroke = 8;
  const normalised = radius - stroke / 2;
  const circumference = Math.PI * normalised; // half circle
  const offset = circumference - (score / 100) * circumference;

  const color = verdictLevel === 'safe' ? '#22c55e' : verdictLevel === 'warning' ? '#eab308' : '#ef4444';

  return (
    <div className="flex flex-col items-center">
      <svg width={160} height={90} viewBox="0 0 160 90">
        {/* Track */}
        <path
          d={`M ${stroke / 2} 80 A ${normalised} ${normalised} 0 0 1 ${160 - stroke / 2} 80`}
          fill="none"
          stroke="#1e293b"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        {/* Progress */}
        <path
          d={`M ${stroke / 2} 80 A ${normalised} ${normalised} 0 0 1 ${160 - stroke / 2} 80`}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease, stroke 0.5s ease', filter: `drop-shadow(0 0 6px ${color})` }}
        />
        {/* Score text */}
        <text x="80" y="72" textAnchor="middle" fill={color} fontSize="28" fontWeight="bold" fontFamily="monospace">{score}</text>
        <text x="80" y="84" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="sans-serif">RISIKO-SCORE</text>
      </svg>
    </div>
  );
}

function IndicatorCard({ indicator }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = SEVERITY_CONFIG[indicator.severity] || SEVERITY_CONFIG.low;

  return (
    <div className={`rounded-lg border ${cfg.bg} ${cfg.border} p-3 transition-all`}>
      <button className="w-full flex items-center gap-3 text-left" onClick={() => setExpanded(v => !v)}>
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
        <span className="flex-1 text-sm font-medium text-slate-200">{indicator.name}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.border} ${cfg.text} flex-shrink-0`}>{cfg.label}</span>
        {expanded ? <ChevronUp className="w-4 h-4 text-slate-500 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />}
      </button>
      {expanded && (
        <p className="mt-2 ml-5 text-xs text-slate-400 leading-relaxed">{indicator.desc}</p>
      )}
    </div>
  );
}

function ScanAnimation({ scanning }) {
  if (!scanning) return null;
  return (
    <div className="flex flex-col items-center gap-4 py-12">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 animate-ping" />
        <div className="absolute inset-2 rounded-full border-2 border-cyan-500/40 animate-ping" style={{ animationDelay: '0.2s' }} />
        <div className="absolute inset-4 rounded-full border-2 border-cyan-500 animate-spin" />
        <Shield className="absolute inset-0 m-auto w-8 h-8 text-cyan-400" />
      </div>
      <div className="text-cyan-400 font-mono text-sm tracking-widest animate-pulse">SCANNING...</div>
      <div className="text-slate-500 text-xs">Analysiere URL-Muster und Sicherheitsindikatoren</div>
    </div>
  );
}

function ResultPanel({ result }) {
  const cfg = VERDICT_CONFIG[result.verdictLevel];
  const VerdictIcon = cfg.icon;
  const highCount   = result.indicators.filter(i => i.severity === 'high').length;
  const mediumCount = result.indicators.filter(i => i.severity === 'medium').length;
  const lowCount    = result.indicators.filter(i => i.severity === 'low').length;

  return (
    <div className="space-y-6">
      {/* Verdict header */}
      <div className={`rounded-xl border ${cfg.bg} ${cfg.border} p-5 flex flex-col sm:flex-row items-center gap-6 shadow-lg ${cfg.glow}`}>
        <RiskGauge score={result.score} verdictLevel={result.verdictLevel} />
        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <VerdictIcon className={`w-6 h-6 ${cfg.text}`} />
            <span className={`text-xl font-bold ${cfg.text}`}>{cfg.label}</span>
          </div>
          <div className="text-xs text-slate-400 font-mono break-all">{result.url}</div>
          <div className="flex flex-wrap gap-3 justify-center sm:justify-start mt-2">
            <Stat label="Hoch" value={highCount} color="text-red-400" />
            <Stat label="Mittel" value={mediumCount} color="text-yellow-400" />
            <Stat label="Niedrig" value={lowCount} color="text-blue-400" />
            <Stat label="Gesamt" value={result.indicators.length} color="text-slate-300" />
          </div>
        </div>
        <div className="hidden sm:flex flex-col items-end gap-1 text-xs text-slate-500">
          <div className="flex items-center gap-1"><Globe className="w-3 h-3" />{result.domain}</div>
          <div className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(result.checkedAt).toLocaleTimeString('de-DE')}</div>
        </div>
      </div>

      {/* Indicators */}
      {result.indicators.length === 0 ? (
        <div className="text-center text-slate-500 text-sm py-6">
          <ShieldCheck className="w-8 h-8 text-green-500 mx-auto mb-2" />
          Keine verdachtigen Muster gefunden.
        </div>
      ) : (
        <div>
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Erkannte Indikatoren ({result.indicators.length})
          </h3>
          <div className="space-y-2">
            {result.indicators.map((ind, i) => (
              <IndicatorCard key={i} indicator={ind} />
            ))}
          </div>
        </div>
      )}

      {/* Education box */}
      <div className="rounded-lg border border-slate-700 bg-slate-800/40 p-4 text-xs text-slate-400 space-y-1">
        <div className="text-slate-300 font-semibold mb-2 flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-cyan-400" /> Wie funktioniert das?</div>
        <p>Dieser Scanner analysiert die URL anhand von uber 13 heuristischen Regeln — ohne externe Datenbanken. Er pruft Muster wie verdachtige Schlusselworter, ungewohnliche Domains, URL-Struktur und bekannte Phishing-Techniken.</p>
        <p className="text-yellow-500/70 mt-2">Hinweis: Kein automatischer Scanner ist 100 % zuverlassig. Im Zweifel keine personlichen Daten eingeben.</p>
      </div>
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div className="flex flex-col items-center">
      <span className={`text-lg font-bold ${color}`}>{value}</span>
      <span className="text-xs text-slate-500">{label}</span>
    </div>
  );
}

const EXAMPLE_URLS = [
  'https://google.com',
  'http://paypa1-secure.login.verify.xyz/account/confirm@evil.com',
  'https://bit.ly/3xAb12z',
  'http://192.168.1.1/login',
  'https://sparkasse-sicherheit.tk/konto-verify',
];

export default function PhishingDetector() {
  const [url, setUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const scan = async (targetUrl) => {
    const toScan = (targetUrl ?? url).trim();
    if (!toScan) return;
    setResult(null);
    setError(null);
    setScanning(true);

    // Minimum animation time so it feels like a real scan
    const [res] = await Promise.all([
      fetch('/api/phishing-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: toScan }),
      }),
      new Promise(r => setTimeout(r, 1200)),
    ]);

    setScanning(false);
    const data = await res.json();
    if (!res.ok) { setError(data.error || 'Unbekannter Fehler'); return; }
    setResult(data);
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter') scan(); };

  const loadExample = (ex) => {
    setUrl(ex);
    setResult(null);
    setError(null);
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-full bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/80 px-6 py-5">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Phishing URL Detektor</h1>
              <p className="text-xs text-slate-400">Analysiert URLs auf Phishing-Muster in Echtzeit</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        {/* Input */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                ref={inputRef}
                type="text"
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="URL eingeben, z. B. https://beispiel.com"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 font-mono"
                disabled={scanning}
                autoComplete="off"
                spellCheck={false}
              />
            </div>
            <button
              onClick={() => scan()}
              disabled={scanning || !url.trim()}
              className="px-5 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-2 flex-shrink-0"
            >
              <Zap className="w-4 h-4" />
              Scannen
            </button>
          </div>

          {/* Example URLs */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-slate-500">Beispiele:</span>
            {EXAMPLE_URLS.map((ex, i) => (
              <button
                key={i}
                onClick={() => loadExample(ex)}
                className="text-xs text-slate-400 hover:text-cyan-400 bg-slate-800/60 hover:bg-slate-800 border border-slate-700 rounded px-2 py-1 font-mono transition-colors truncate max-w-[180px]"
                title={ex}
              >
                {ex.length > 30 ? ex.slice(0, 30) + '…' : ex}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Scanning animation */}
        <ScanAnimation scanning={scanning} />

        {/* Result */}
        {!scanning && result && <ResultPanel result={result} />}

        {/* Empty state */}
        {!scanning && !result && !error && (
          <div className="text-center py-16 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-slate-800/60 border border-slate-700 flex items-center justify-center">
              <Shield className="w-8 h-8 text-slate-600" />
            </div>
            <div className="text-slate-500 text-sm">Gib eine URL ein und klicke auf <span className="text-cyan-400">Scannen</span></div>
            <div className="grid grid-cols-3 gap-4 mt-6 max-w-sm mx-auto text-xs text-slate-600">
              <div className="text-center space-y-1">
                <div className="text-2xl font-bold text-slate-500">13+</div>
                <div>Pruf-Regeln</div>
              </div>
              <div className="text-center space-y-1">
                <div className="text-2xl font-bold text-slate-500">0ms</div>
                <div>Latenz</div>
              </div>
              <div className="text-center space-y-1">
                <div className="text-2xl font-bold text-slate-500">100%</div>
                <div>Lokal</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
