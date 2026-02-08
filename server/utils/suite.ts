/// <reference types="bun-types" />
import { Database } from "bun:sqlite";
import { existsSync, mkdirSync } from "node:fs";

if (!existsSync("./data")) {
    mkdirSync("./data");
}

const db = new Database("./data/accounts.sqlite");

db.run(`CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,    
    creds TEXT, 
    last_sync INTEGER, 
    limited_until INTEGER DEFAULT 0,
    fingerprint TEXT DEFAULT NULL,
    proxy TEXT DEFAULT NULL
)`);

// Migration: add fingerprint & proxy columns to existing databases
try {
  db.run(`ALTER TABLE accounts ADD COLUMN fingerprint TEXT DEFAULT NULL`);
} catch { /* column already exists */ }
try {
  db.run(`ALTER TABLE accounts ADD COLUMN proxy TEXT DEFAULT NULL`);
} catch { /* column already exists */ }

export const useDb = () => db;

export async function generateTripleHash(sapisid: string): Promise<string> {
    const ts = Math.floor(Date.now() / 1000);
    const origin = "https://aistudio.google.com";
    const input = `${ts} ${sapisid} ${origin}`;
    
    const hash = new Bun.CryptoHasher("sha1").update(input).digest("hex");
    const sig = `${ts}_${hash}`;
    
    return `SAPISIDHASH ${sig} SAPISID1PHASH ${sig} SAPISID3PHASH ${sig}`;
}

export function getSapiFromCookie(cookie: string): string | null {
    const match3p = cookie.match(/__Secure-3PSAPISID=([^;]+)/);
    if (match3p && match3p[1]) return match3p[1].replace(/"/g, '').trim();

    const match = cookie.match(/SAPISID=([^;]+)/);
    return match && match[1] ? match[1].replace(/"/g, '').trim() : null;
}