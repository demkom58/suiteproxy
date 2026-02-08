import { Database } from "bun:sqlite";
import { existsSync, mkdirSync } from "node:fs";

// Ensure data dir exists for Docker volumes
if (!existsSync("./data")) mkdirSync("./data");

const db = new Database("./data/accounts.sqlite", { create: true });

db.run(`CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,    
    creds TEXT, 
    last_sync INTEGER, 
    limited_until INTEGER DEFAULT 0
)`);

export const useDb = () => db;

export async function generateTripleHash(sapisid: string): Promise<string> {
    const ts = Math.floor(Date.now() / 1000);
    const origin = "https://aistudio.google.com";
    const input = `${ts} ${sapisid} ${origin}`;
    const hash = new Bun.CryptoHasher("sha1").update(input).digest("hex");
    
    const sig = `${ts}_${hash}`;
    return `SAPISIDHASH ${sig} SAPISID1PHASH ${sig} SAPISID3PHASH ${sig}`;
}