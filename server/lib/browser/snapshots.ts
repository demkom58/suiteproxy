/**
 * Error snapshot saving — captures page state on failure for debugging.
 * Saves screenshot + HTML to data/snapshots/ directory.
 */
import type { Page } from 'playwright-core';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const SNAPSHOT_DIR = 'data/snapshots';
const MAX_SNAPSHOTS = 50;

/**
 * Save a debug snapshot (screenshot + HTML) when an error occurs.
 * Non-fatal — silently catches all errors to avoid interfering with recovery.
 */
export async function saveErrorSnapshot(
  label: string,
  page?: Page | null,
): Promise<string | null> {
  if (!page) {
    console.warn(`[Snapshot] No page available for snapshot: ${label}`);
    return null;
  }

  try {
    await mkdir(SNAPSHOT_DIR, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const sanitizedLabel = label.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50);
    const baseName = `${timestamp}_${sanitizedLabel}`;

    // Save screenshot
    const screenshotPath = join(SNAPSHOT_DIR, `${baseName}.png`);
    await page.screenshot({
      path: screenshotPath,
      fullPage: false, // Just viewport — full page can be huge
      timeout: 10_000,
    });

    // Save page HTML
    const htmlPath = join(SNAPSHOT_DIR, `${baseName}.html`);
    const html = await page.content().catch(() => '<failed to get HTML>');
    await writeFile(htmlPath, html, 'utf-8');

    // Save page URL
    const url = page.url();

    console.log(`[Snapshot] Saved: ${screenshotPath} (URL: ${url})`);

    // Cleanup old snapshots (keep last MAX_SNAPSHOTS)
    await cleanupOldSnapshots().catch(() => {});

    return screenshotPath;
  } catch (error) {
    console.warn(`[Snapshot] Failed to save snapshot for '${label}':`, error);
    return null;
  }
}

async function cleanupOldSnapshots(): Promise<void> {
  const { readdir, unlink, stat } = await import('node:fs/promises');

  const files = await readdir(SNAPSHOT_DIR);
  const pngFiles = files.filter(f => f.endsWith('.png'));

  if (pngFiles.length <= MAX_SNAPSHOTS) return;

  // Sort by modification time, oldest first
  const fileStats = await Promise.all(
    pngFiles.map(async f => ({
      name: f,
      mtime: (await stat(join(SNAPSHOT_DIR, f))).mtimeMs,
    })),
  );
  fileStats.sort((a, b) => a.mtime - b.mtime);

  // Delete oldest files (both .png and .html)
  const toDelete = fileStats.slice(0, fileStats.length - MAX_SNAPSHOTS);
  for (const file of toDelete) {
    await unlink(join(SNAPSHOT_DIR, file.name)).catch(() => {});
    await unlink(join(SNAPSHOT_DIR, file.name.replace('.png', '.html'))).catch(() => {});
  }
}
