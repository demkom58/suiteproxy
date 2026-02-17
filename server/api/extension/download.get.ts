/**
 * GET /api/extension/download
 *
 * Serves the SuiteProxy Bridge Chrome extension as a downloadable ZIP.
 * The proxy URL is baked into the extension's background.js so it auto-discovers the server.
 *
 * The user extracts the ZIP and loads it as an "unpacked extension" in chrome://extensions.
 */
// Minimal ZIP file creation (no external deps)
// Supports Store method (no compression) for simplicity and reliability

export default defineEventHandler(async (event) => {
  const reqUrl = getRequestURL(event);
  const proxyOrigin = `${reqUrl.protocol}//${reqUrl.host}`;

  // Read all extension files from server assets
  const storage = useStorage('assets:server');

  const files: Array<{ name: string; data: Buffer }> = [];

  // Read each extension file
  const fileNames = [
    'extension/manifest.json',
    'extension/background.js',
    'extension/content.js',
    'extension/popup.html',
    'extension/popup.js',
    'extension/icon48.png',
    'extension/icon128.png',
  ];

  for (const fileName of fileNames) {
    const raw = await storage.getItemRaw(fileName);
    if (!raw) {
      console.warn(`[Extension] Missing asset: ${fileName}`);
      continue;
    }

    // Strip the "extension/" prefix for the ZIP entry name
    const entryName = fileName.replace('extension/', '');

    let data: Buffer;
    if (raw instanceof Buffer) {
      data = raw;
    } else if (raw instanceof Uint8Array) {
      data = Buffer.from(raw);
    } else if (typeof raw === 'string') {
      // For JS/HTML files, patch in the proxy URL
      let content = raw;
      if (entryName === 'background.js') {
        content = content.replace(
          'const DEFAULT_PROXY_URL = "http://localhost:3000"',
          `const DEFAULT_PROXY_URL = "${proxyOrigin}"`,
        );
      }
      data = Buffer.from(content, 'utf-8');
    } else {
      // Try to convert unknown types
      data = Buffer.from(String(raw), 'utf-8');
    }

    files.push({ name: entryName, data });
  }

  if (files.length === 0) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Extension assets not found',
    });
  }

  // Build ZIP file
  const zipBuffer = createZip(files);

  setResponseHeaders(event, {
    'Content-Type': 'application/zip',
    'Content-Disposition': 'attachment; filename="suiteproxy-bridge-extension.zip"',
    'Content-Length': String(zipBuffer.length),
    'Cache-Control': 'no-cache',
  });

  return zipBuffer;
});

// ── Minimal ZIP Creator ─────────────────────────────────────────────────

interface ZipEntry {
  name: string;
  data: Buffer;
}

function createZip(entries: ZipEntry[]): Buffer {
  const localHeaders: Buffer[] = [];
  const centralHeaders: Buffer[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBuffer = Buffer.from(entry.name, 'utf-8');
    const now = new Date();

    // DOS date/time
    const dosTime =
      ((now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1)) & 0xffff;
    const dosDate =
      ((((now.getFullYear() - 1980) & 0x7f) << 9) | ((now.getMonth() + 1) << 5) | now.getDate()) & 0xffff;

    // CRC-32
    const crc = crc32(entry.data);

    // Local file header (30 bytes + name + data)
    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0); // Local file header signature
    localHeader.writeUInt16LE(20, 4);          // Version needed (2.0)
    localHeader.writeUInt16LE(0, 6);           // General purpose bit flag
    localHeader.writeUInt16LE(0, 8);           // Compression method (Store)
    localHeader.writeUInt16LE(dosTime, 10);    // Last mod time
    localHeader.writeUInt16LE(dosDate, 12);    // Last mod date
    localHeader.writeUInt32LE(crc, 14);        // CRC-32
    localHeader.writeUInt32LE(entry.data.length, 18); // Compressed size
    localHeader.writeUInt32LE(entry.data.length, 22); // Uncompressed size
    localHeader.writeUInt16LE(nameBuffer.length, 26); // File name length
    localHeader.writeUInt16LE(0, 28);          // Extra field length

    const localEntry = Buffer.concat([localHeader, nameBuffer, entry.data]);
    localHeaders.push(localEntry);

    // Central directory header (46 bytes + name)
    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0); // Central directory signature
    centralHeader.writeUInt16LE(20, 4);          // Version made by
    centralHeader.writeUInt16LE(20, 6);          // Version needed
    centralHeader.writeUInt16LE(0, 8);           // General purpose bit flag
    centralHeader.writeUInt16LE(0, 10);          // Compression method (Store)
    centralHeader.writeUInt16LE(dosTime, 12);    // Last mod time
    centralHeader.writeUInt16LE(dosDate, 14);    // Last mod date
    centralHeader.writeUInt32LE(crc, 16);        // CRC-32
    centralHeader.writeUInt32LE(entry.data.length, 20); // Compressed size
    centralHeader.writeUInt32LE(entry.data.length, 24); // Uncompressed size
    centralHeader.writeUInt16LE(nameBuffer.length, 28); // File name length
    centralHeader.writeUInt16LE(0, 30);          // Extra field length
    centralHeader.writeUInt16LE(0, 32);          // File comment length
    centralHeader.writeUInt16LE(0, 34);          // Disk number start
    centralHeader.writeUInt16LE(0, 36);          // Internal file attributes
    centralHeader.writeUInt32LE(0, 38);          // External file attributes
    centralHeader.writeUInt32LE(offset, 42);     // Relative offset of local header

    centralHeaders.push(Buffer.concat([centralHeader, nameBuffer]));

    offset += localEntry.length;
  }

  // Central directory
  const centralDir = Buffer.concat(centralHeaders);
  const centralDirOffset = offset;

  // End of central directory (22 bytes)
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);                   // EOCD signature
  eocd.writeUInt16LE(0, 4);                             // Disk number
  eocd.writeUInt16LE(0, 6);                             // Disk with central dir
  eocd.writeUInt16LE(entries.length, 8);                // Entries on this disk
  eocd.writeUInt16LE(entries.length, 10);               // Total entries
  eocd.writeUInt32LE(centralDir.length, 12);            // Central dir size
  eocd.writeUInt32LE(centralDirOffset, 16);             // Central dir offset
  eocd.writeUInt16LE(0, 20);                            // Comment length

  return Buffer.concat([...localHeaders, centralDir, eocd]);
}

function crc32(buf: Buffer): number {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i]!;
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ -1) >>> 0;
}
