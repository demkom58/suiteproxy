export interface SuitemakerCreds {
  cookie: string;
  at: string;
  api_key: string;
  build: string;
  flow_id: string;
  nonce: string;
  toggles: string[];
  authUser?: string;        // Optional: Google account index (0-9)
  userAgent?: string;       // Optional: User agent string
  session_token?: string;   // Optional: Active session token
}

export type SuitemakerRPCRequest = [
  string,          // 0: Model Name (e.g. "models/gemini-1.5-flash")
  any[],           // 1: Contents (History)
  any,             // 2: System Instruction
  any[],           // 3: Generation Config
  string | null,   // 4: at token (SNlM0e)
  null,            // 5: Padding
  null,            // 6: Padding
  null,            // 7: Padding
  null,            // 8: Padding
  null,            // 9: Padding
  number           // 10: Purpose/Flag
];

export interface AccountRecord {
  id: string;
  creds: string;
  last_sync: number;
  limited_until: number;
  /** JSON-serialized FingerprintConfig, or null for auto-generated. */
  fingerprint: string | null;
  /** JSON-serialized ProxyConfig, or null for direct connection. */
  proxy: string | null;
}

// ── Per-Account Fingerprint Configuration ───────────────────────────────

export type FingerprintOS = 'windows' | 'macos' | 'linux';

export interface FingerprintConfig {
  /** Target OS for fingerprint generation. Null = auto (random). */
  os?: FingerprintOS | FingerprintOS[] | null;
  /** Fixed window size [width, height]. Null = random within screen bounds. */
  window?: [number, number] | null;
  /** Screen dimension constraints. */
  screen?: {
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
  } | null;
  /** WebGL vendor/renderer pair. Null = auto-generated. */
  webgl?: [string, string] | null;
  /** Custom navigator/screen overrides (e.g. {"navigator.hardwareConcurrency": 8}). */
  config?: Record<string, string | number | boolean> | null;
  /** Browser locale(s). Null = auto. */
  locale?: string | string[] | null;
  /** Custom font list. Null = auto. */
  fonts?: string[] | null;
  /** Block WebRTC to prevent IP leaks. */
  blockWebrtc?: boolean;
  /** Enable humanized cursor movements (max seconds per movement). 0 = disabled. */
  humanize?: number;
}

// ── Per-Account Proxy Configuration ─────────────────────────────────────

export type ProxyProtocol = 'http' | 'https' | 'socks4' | 'socks5';

/** A single proxy server in a chain. */
export interface ProxyEntry {
  /** Protocol type. */
  protocol: ProxyProtocol;
  /** Hostname or IP address. */
  host: string;
  /** Port number. */
  port: number;
  /** Username for authenticated proxies. */
  username?: string;
  /** Password for authenticated proxies. */
  password?: string;
}

export interface ProxyConfig {
  /** Enable proxy for this account. */
  enabled: boolean;
  /** Proxy chain — requests go through each proxy in order. First entry is used for Camoufox (browser). */
  chain: ProxyEntry[];
  /** Auto-detect geolocation from proxy IP and spoof timezone/locale to match. */
  geoip?: boolean;
  /** Comma-separated list of hosts to bypass proxy. */
  bypass?: string;
  /** Rotation strategy: 'none' (use first), 'round-robin', 'random'. */
  rotation?: 'none' | 'round-robin' | 'random';
}

export interface GoogleCookie {
  name: string;
  value: string;
  domain: string;
  path: string;
  secure: boolean;
  httpOnly: boolean;
}

export interface WizData {
  SNlM0e: string; // at
  PeqOqb: string; // api_key
  cfb2h: string;   // build
  FdrFJe: string; // flow_id
  WZsZ1e: string; // nonce
}
