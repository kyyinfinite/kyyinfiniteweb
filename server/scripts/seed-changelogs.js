/**
 * seed-changelogs.js
 * ------------------
 * One-off helper script that connects to MongoDB and seeds a few demo
 * `changelogs` entries onto an existing ProjectAsset document so the
 * ChangelogsPage UI has something to render during local testing.
 *
 * Usage:
 *   MONGODB_URI=mongodb://localhost:27017/kyyinfinite \
 *   ASSET_ID=<some-projectasset-id> \
 *   node server/scripts/seed-changelogs.js
 *
 * Safe to run multiple times — it replaces the changelogs array each invocation.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const ProjectAsset = require('../models/ProjectAsset');

const SAMPLE_CHANGELOGS = [
  {
    version: '2.3.0',
    releaseDate: new Date('2026-07-08'),
    notes: [
      'Added multi-device session recovery',
      'Reduced cold start memory footprint by 38%',
      'New webhook event for group join/leave',
    ],
    fileUrl: 'https://storage.googleapis.com/kyyinfinite-assets/sample/v2.3.0.zip',
  },
  {
    version: '2.2.1',
    releaseDate: new Date('2026-06-22'),
    notes: [
      'Hotfix: reconnection loop on transient 503s',
      'Bumped baileys dependency to 6.7.0',
    ],
    fileUrl: 'https://storage.googleapis.com/kyyinfinite-assets/sample/v2.2.1.zip',
  },
  {
    version: '2.2.0',
    releaseDate: new Date('2026-06-10'),
    notes: [
      'Sticker maker now supports animated WebP',
      'Added /translate slash command',
      'Configurable rate-limit per JID',
    ],
    fileUrl: 'https://storage.googleapis.com/kyyinfinite-assets/sample/v2.2.0.zip',
  },
  {
    version: '2.1.0',
    releaseDate: new Date('2026-05-15'),
    notes: [
      'Initial public release of the modular plugin loader',
      'Shipped built-in antispam module',
    ],
    fileUrl: 'https://storage.googleapis.com/kyyinfinite-assets/sample/v2.1.0.zip',
  },
];

async function run() {
  const assetId = process.env.ASSET_ID;
  if (!assetId) {
    console.error('ASSET_ID env var is required');
    process.exit(1);
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('MONGODB_URI env var is required');
    process.exit(1);
  }

  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');

  const asset = await ProjectAsset.findById(assetId);
  if (!asset) {
    console.error(`Asset ${assetId} not found`);
    process.exit(1);
  }

  asset.changelogs = SAMPLE_CHANGELOGS;
  asset.currentVersion = SAMPLE_CHANGELOGS[0].version;
  asset.version = SAMPLE_CHANGELOGS[0].version;
  asset.downloadUrl = SAMPLE_CHANGELOGS[0].fileUrl;
  asset.firebaseCdnUrl = SAMPLE_CHANGELOGS[0].fileUrl;
  await asset.save();

  console.log(`Seeded ${SAMPLE_CHANGELOGS.length} changelog entries onto ${asset.name || asset.title}`);
  await mongoose.disconnect();
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
