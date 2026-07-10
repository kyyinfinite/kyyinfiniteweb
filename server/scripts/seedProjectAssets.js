/**
 * seedProjectAssets.js
 * ---------------------------------------------------------------------------
 * Seed script untuk model ProjectAsset. Jalankan dengan:
 *
 *   MONGODB_URI=mongodb://localhost:27017/kyyinfinite \
 *     node server/scripts/seedProjectAssets.js
 *
 * Atau import lewat repl/runner project Anda. Script ini idempotent:
 * melakukan upsert berdasarkan slug, jadi aman dijalankan ulang.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../config/db.js');
const ProjectAsset = require('../models/ProjectAsset.js');

const seedData = [
  {
    name: 'KyyBot WhatsApp Pro',
    slug: 'kyybot-wa-pro',
    category: 'whatsapp-bot',
    shortDescription:
      'Bot WhatsApp serbaguna berbasis Baileys dengan fitur auto-reply, antispam, dan dashboard admin.',
    longDescription:
      'KyyBot WhatsApp Pro adalah script bot otomasi berbasis library Baileys. Mendukung multi-device, plugin command modular, antispam pintar, dan integrasi QRIS untuk monetisasi. Cocok untuk komunitas, agen, dan reseller.',
    platform: 'WhatsApp Multi-Device',
    tags: ['baileys', 'esm', 'auto-reply', 'antispam', 'admin-dashboard'],
    isPublished: true,
    changelogs: [
      {
        version: '2.4.1',
        releaseDate: new Date('2026-07-08'),
        notes: [
          'FEAT: tambah command /weather dengan cache 5 menit',
          'FEAT: integrasi QRIS dynamic untuk command premium',
          'FIX: memory leak pada long-running socket',
          'CHORE: bump baileys ke 6.7.x',
        ],
        fileUrl: 'https://cdn.kyyinfinite.my.id/assets/kyybot-wa-pro/v2.4.1.zip',
      },
      {
        version: '2.4.0',
        releaseDate: new Date('2026-06-22'),
        notes: [
          'FEAT: dashboard admin berbasis Express + EJS',
          'FEAT: rate limiter per-jid untuk antispam',
          'BREAKING: struktur folder config/ dipecah per-environment',
        ],
        fileUrl: 'https://cdn.kyyinfinite.my.id/assets/kyybot-wa-pro/v2.4.0.zip',
      },
      {
        version: '2.3.5',
        releaseDate: new Date('2026-05-30'),
        notes: [
          'FIX: pair code gagal pada nomor baru',
          'FIX: pesan tidak terkirim saat battery saver aktif',
        ],
        fileUrl: 'https://cdn.kyyinfinite.my.id/assets/kyybot-wa-pro/v2.3.5.zip',
      },
      {
        version: '2.3.0',
        releaseDate: new Date('2026-04-18'),
        notes: [
          'FEAT: modular command loader otomatis dari folder commands/',
          'FEAT: support sticker animated (webp)',
          'CHORE: drop Node 16 support, minimum Node 18',
        ],
        fileUrl: 'https://cdn.kyyinfinite.my.id/assets/kyybot-wa-pro/v2.3.0.zip',
      },
    ],
  },
  {
    name: 'Node Snippet Pack: HTTP Toolkit',
    slug: 'snippet-http-toolkit',
    category: 'snippet',
    shortDescription:
      'Kumpulan helper HTTP Node.js: retry exponential, rate limiter, dan parser URL cerdas.',
    longDescription:
      'Paket snippet reusable untuk aplikasi Node.js production. Berisi utilitas fetch dengan retry, queue berbasis Redis (opsional), dan parser URL yang aman terhadap unicode.',
    platform: 'Node.js 18+',
    tags: ['node', 'http', 'fetch', 'retry', 'esm'],
    isPublished: true,
    changelogs: [
      {
        version: '1.2.0',
        releaseDate: new Date('2026-07-05'),
        notes: [
          'FEAT: tambah helper fetchJSON dengan timeout bawaan',
          'FEAT: parser URL support IDN (international domain)',
          'DOCS: contoh integrasi dengan Express middleware',
        ],
        fileUrl: 'https://cdn.kyyinfinite.my.id/assets/snippets/http-toolkit/v1.2.0.zip',
      },
      {
        version: '1.1.0',
        releaseDate: new Date('2026-06-12'),
        notes: [
          'FEAT: rate limiter token bucket',
          'FEAT: retry exponential backoff dengan jitter',
        ],
        fileUrl: 'https://cdn.kyyinfinite.my.id/assets/snippets/http-toolkit/v1.1.0.zip',
      },
      {
        version: '1.0.0',
        releaseDate: new Date('2026-05-02'),
        notes: [
          'INIT: rilis awal dengan 12 helper core',
        ],
        fileUrl: 'https://cdn.kyyinfinite.my.id/assets/snippets/http-toolkit/v1.0.0.zip',
      },
    ],
  },
  {
    name: 'TheoTown Region Pack — Neon District',
    slug: 'theotown-neon-district',
    category: 'plugin',
    shortDescription:
      'Plugin region TheoTown bertema cyberpunk: 12 building custom, road glow, dan preset road layout.',
    longDescription:
      'Region pack untuk TheoTown dengan estetika neon. Berisi 12 building kustom (residential, commercial, industrial), road skin glow-in-the-dark, dan 3 layout preset siap pakai.',
    platform: 'TheoTown 1.10+',
    tags: ['theotown', 'region', 'cyberpunk', 'buildings', 'road-skin'],
    isPublished: true,
    changelogs: [
      {
        version: '3.0.2',
        releaseDate: new Date('2026-07-09'),
        notes: [
          'FIX: collision building #7 salah ukuran',
          'FIX: road glow tidak muncul pada theme gelap',
          'CHORE: optimasi texture atlas (size turun 18%)',
        ],
        fileUrl: 'https://cdn.kyyinfinite.my.id/assets/theotown/neon-district/v3.0.2.zip',
      },
      {
        version: '3.0.0',
        releaseDate: new Date('2026-06-28'),
        notes: [
          'FEAT: 4 building baru bertema megacorp',
          'FEAT: preset road layout "Downtown Grid"',
          'BREAKING: minimum TheoTown 1.10',
        ],
        fileUrl: 'https://cdn.kyyinfinite.my.id/assets/theotown/neon-district/v3.0.0.zip',
      },
      {
        version: '2.2.0',
        releaseDate: new Date('2026-05-15'),
        notes: [
          'FEAT: road skin neon biru',
          'FEAT: 3 building residential baru',
        ],
        fileUrl: 'https://cdn.kyyinfinite.my.id/assets/theotown/neon-district/v2.2.0.zip',
      },
    ],
  },
  {
    name: 'Minecraft Plugin — KyyEconomy',
    slug: 'mc-kyyeconomy',
    category: 'plugin',
    shortDescription:
      'Plugin ekonomi Minecraft Java dengan vault hook, shop GUI, dan transaction log.',
    longDescription:
      'KyyEconomy adalah plugin ekonomi Minecraft Java Edition. Terintegrasi dengan Vault, mendukung shop GUI berbasis chest, dan menyimpan semua transaksi di SQLite untuk audit.',
    platform: 'Minecraft Java 1.20+ (Paper / Spigot)',
    tags: ['minecraft', 'economy', 'vault', 'gui', 'sqlite'],
    isPublished: true,
    changelogs: [
      {
        version: '1.4.0',
        releaseDate: new Date('2026-07-03'),
        notes: [
          'FEAT: shop GUI multi-page',
          'FEAT: command /balance top untuk leaderboard',
          'FIX: race condition saat transfer antar player',
        ],
        fileUrl: 'https://cdn.kyyinfinite.my.id/assets/mc/kyyeconomy/v1.4.0.jar',
      },
      {
        version: '1.3.2',
        releaseDate: new Date('2026-06-10'),
        notes: [
          'FIX: vault hook crash saat economy provider tidak ada',
          'CHORE: migrasi config ke YAML 1.2',
        ],
        fileUrl: 'https://cdn.kyyinfinite.my.id/assets/mc/kyyeconomy/v1.3.2.jar',
      },
      {
        version: '1.3.0',
        releaseDate: new Date('2026-05-20'),
        notes: [
          'FEAT: transaction log SQLite',
          'FEAT: API event KyyEconomyTransactionEvent untuk integrasi pihak ketiga',
        ],
        fileUrl: 'https://cdn.kyyinfinite.my.id/assets/mc/kyyeconomy/v1.3.0.jar',
      },
    ],
  },
];

async function run() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI env var is required.');
    process.exit(1);
  }

  await connectDB();

  let upserted = 0;
  for (const item of seedData) {
    await ProjectAsset.updateOne(
      { slug: item.slug },
      { $set: item },
      { upsert: true }
    );
    upserted += 1;
    console.log(`  [ok] ${item.slug}`);
  }

  console.log(`\nSeed complete. ${upserted} asset(s) upserted.`);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
