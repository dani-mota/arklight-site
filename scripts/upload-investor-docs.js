/**
 * Upload (or re-upload) the investor documents to the PRIVATE Vercel Blob store.
 *
 *   npm install @vercel/blob
 *   BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxx node scripts/upload-investor-docs.js
 *
 * (or: `vercel link && vercel env pull` to get the token into .env.local, then
 *  `node --env-file=.env.local scripts/upload-investor-docs.js`)
 *
 * Reads from ./data-room-assets (gitignored, local only) and uploads every file
 * listed in api/_docs.js. Re-running overwrites, so this is how you publish an
 * updated deck.
 *
 * The store is private: blobs have no public URL and require the token to read.
 * /api/doc reads them by pathname after checking the investor's session.
 */
const fs = require('fs');
const path = require('path');
const { DOCS, blobPath } = require('../api/_docs');

const SRC_DIR = path.join(__dirname, '..', 'data-room-assets');

(async () => {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    console.error(
      'Missing BLOB_READ_WRITE_TOKEN.\n\n' +
      'In Vercel: Storage > your Blob store > Connect / Settings, enable the\n' +
      'read-write token env var (the checkbox that was left unchecked), then either\n' +
      '  vercel link && vercel env pull      (writes .env.local)\n' +
      'or paste it inline:\n' +
      '  BLOB_READ_WRITE_TOKEN=... node scripts/upload-investor-docs.js\n'
    );
    process.exit(1);
  }

  let put;
  try {
    ({ put } = require('@vercel/blob'));
  } catch (e) {
    console.error('Missing dependency. Run:  npm install @vercel/blob');
    process.exit(1);
  }

  let uploaded = 0, skipped = 0;
  for (const [id, doc] of Object.entries(DOCS)) {
    const local = path.join(SRC_DIR, doc.file);
    if (!fs.existsSync(local)) {
      console.log('skip   ' + id.padEnd(8) + ' (no local file: ' + doc.file + ')');
      skipped++;
      continue;
    }

    const pathname = blobPath(doc);
    const result = await put(pathname, fs.readFileSync(local), {
      access: 'private',
      addRandomSuffix: false,   // deterministic path; privacy comes from the token
      allowOverwrite: true,     // re-running republishes an updated file
      contentType: 'application/pdf',
      token
    });
    console.log('upload ' + id.padEnd(8) + ' -> ' + (result.pathname || pathname));
    uploaded++;
  }

  console.log('\nDone. ' + uploaded + ' uploaded, ' + skipped + ' skipped.');
  console.log('These blobs are private. /api/doc is the only way to read them.');
})().catch(err => { console.error(err); process.exit(1); });
