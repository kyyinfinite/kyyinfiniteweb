/**
 * Daftar semua endpoint /api/v1 yang di-proxy dari API pihak ketiga.
 * Nambah endpoint baru = tambah 1 object di sini (+ transformer kecil di
 * /transformers kalau strukturnya beda dari yang lain). Tidak perlu bikin
 * controller atau route baru tiap kali.
 *
 * path         - path publik yang dipanggil konsumen, digabung ke /api/v1
 * upstream.url - URL API pihak ketiga sesungguhnya (jangan pernah dibocorin ke konsumen)
 * paramsMap    - { queryParamPublik: queryParamUpstream }
 * responseType - 'json' (upstream balikin JSON, ditransform) atau 'binary' (gambar/video, di-stream apa adanya)
 * transformer  - nama transformer di /transformers (default dipakai kalau tidak diisi)
 * scope        - scope ApiKey yang wajib dimiliki buat akses endpoint ini
 * cache        - opsional, { ttlSeconds } — cuma untuk responseType 'json'
 */
module.exports = [
  {
    path: '/search/applemusic',
    title: 'Apple Music Search',
    description: 'Search Apple Music for tracks, albums, and artists by keyword.',
    upstream: { url: 'https://api.nexray.eu.cc/search/applemusic', method: 'GET' },
    paramsMap: { q: 'q' },
    paramsInfo: [{ name: 'q', required: true, description: 'Search keyword' }],
    responseType: 'json',
    scope: 'tools:search',
    cache: { ttlSeconds: 300 },
  },
  {
    path: '/search/spotify',
    title: 'Spotify Search',
    description: 'Search Spotify for tracks, albums, and artists by keyword.',
    upstream: { url: 'https://api.nexray.eu.cc/search/spotify', method: 'GET' },
    paramsMap: { q: 'q' },
    paramsInfo: [{ name: 'q', required: true, description: 'Search keyword, e.g. Laufey' }],
    responseType: 'json',
    scope: 'tools:search',
    cache: { ttlSeconds: 300 },
  },
  {
    path: '/search/tiktok',
    title: 'TikTok Video Search',
    description: 'Search TikTok for videos matching a keyword.',
    upstream: { url: 'https://api.nexray.eu.cc/search/tiktok', method: 'GET' },
    paramsMap: { q: 'q' },
    paramsInfo: [{ name: 'q', required: true, description: 'Search keyword, e.g. Ronaldo' }],
    responseType: 'json',
    scope: 'tools:search',
    cache: { ttlSeconds: 300 },
  },
  {
    path: '/search/tiktokphoto',
    title: 'TikTok Photo Search',
    description: 'Search TikTok for photo/slideshow posts matching a keyword.',
    upstream: { url: 'https://api.nexray.eu.cc/search/tiktokphoto', method: 'GET' },
    paramsMap: { q: 'q' },
    paramsInfo: [{ name: 'q', required: true, description: 'Search keyword, e.g. Nature' }],
    responseType: 'json',
    scope: 'tools:search',
    cache: { ttlSeconds: 300 },
  },
  {
    path: '/search/youtube',
    title: 'YouTube Search',
    description: 'Search YouTube for videos matching a keyword.',
    upstream: { url: 'https://api.nexray.eu.cc/search/youtube', method: 'GET' },
    paramsMap: { q: 'q' },
    paramsInfo: [{ name: 'q', required: true, description: 'Search keyword, e.g. Lemonade' }],
    responseType: 'json',
    scope: 'tools:search',
    cache: { ttlSeconds: 300 },
  },
  {
    path: '/maker/brat',
    title: 'Brat Image Maker',
    description: 'Generate a brat-style text image from a short string of text.',
    upstream: { url: 'https://api.nexray.eu.cc/maker/brat', method: 'GET' },
    paramsMap: { text: 'text' },
    paramsInfo: [{ name: 'text', required: true, description: 'Text to render on the image' }],
    responseType: 'binary',
    scope: 'tools:maker',
  },
  {
    path: '/maker/bratvid',
    title: 'Brat Video Maker',
    description: 'Generate a brat-style animated video from a short string of text.',
    upstream: { url: 'https://api.nexray.eu.cc/maker/bratvid', method: 'GET' },
    paramsMap: { text: 'text' },
    paramsInfo: [{ name: 'text', required: true, description: 'Text to render in the video' }],
    responseType: 'binary',
    scope: 'tools:maker',
  },
  {
    path: '/maker/iqc',
    title: 'Fake Phone Status Bar Maker',
    description: 'Generate a fake phone status bar image with custom carrier, time, and battery level.',
    upstream: { url: 'https://api.nexray.eu.cc/maker/v1/iqc', method: 'GET' },
    paramsMap: { text: 'text', provider: 'provider', jam: 'jam', baterai: 'baterai' },
    paramsInfo: [
      { name: 'text', required: true, description: 'Notification or status text' },
      { name: 'provider', required: true, description: 'Carrier name, e.g. Indosat' },
      { name: 'jam', required: true, description: 'Time to display, e.g. 12:00' },
      { name: 'baterai', required: true, description: 'Battery percentage, e.g. 50' },
    ],
    responseType: 'binary',
    scope: 'tools:maker',
  },
  {
    path: '/maker/fakelobyml',
    title: 'Fake Mobile Legends Lobby Maker',
    description: 'Generate a fake Mobile Legends lobby screenshot with a custom avatar and nickname.',
    upstream: { url: 'https://api.nexray.eu.cc/maker/fakelobyml', method: 'GET' },
    paramsMap: { avatar: 'avatar', nickname: 'nickname' },
    paramsInfo: [
      { name: 'avatar', required: true, description: 'Direct image URL for the avatar' },
      { name: 'nickname', required: true, description: 'In-game nickname to display' },
    ],
    responseType: 'binary',
    scope: 'tools:maker',
  },
  {
    path: '/maker/fakelobyff',
    title: 'Fake Free Fire Lobby Maker',
    description: 'Generate a fake Free Fire lobby screenshot with a custom nickname.',
    upstream: { url: 'https://api.nexray.eu.cc/maker/fakelobyff', method: 'GET' },
    paramsMap: { nickname: 'nickname' },
    paramsInfo: [{ name: 'nickname', required: true, description: 'In-game nickname to display' }],
    responseType: 'binary',
    scope: 'tools:maker',
  },
  {
    path: '/maker/fakedana',
    title: 'Fake DANA Balance Maker',
    description: 'Generate a fake DANA e-wallet balance screenshot with a custom amount.',
    upstream: { url: 'https://api.nexray.eu.cc/maker/fakedana', method: 'GET' },
    paramsMap: { nominal: 'nominal' },
    paramsInfo: [{ name: 'nominal', required: true, description: 'Balance amount, e.g. 50000' }],
    responseType: 'binary',
    scope: 'tools:maker',
  },
  {
    path: '/maker/fakebank-jago',
    title: 'Fake Bank Jago Balance Maker',
    description: 'Generate a fake Bank Jago balance screenshot with a custom name and amount.',
    upstream: { url: 'https://api.nexray.eu.cc/maker/fakebank-jago', method: 'GET' },
    paramsMap: { nama: 'nama', saldo: 'saldo' },
    paramsInfo: [
      { name: 'nama', required: true, description: 'Account holder name' },
      { name: 'saldo', required: true, description: 'Balance amount, e.g. 100000' },
    ],
    responseType: 'binary',
    scope: 'tools:maker',
  },
  {
    path: '/maker/smeme',
    title: 'Simple Meme Maker',
    description: 'Generate a top/bottom text meme over a custom background image.',
    upstream: { url: 'https://api.nexray.eu.cc/maker/smeme', method: 'GET' },
    paramsMap: { text_atas: 'text_atas', text_bawah: 'text_bawah', background: 'background' },
    paramsInfo: [
      { name: 'text_atas', required: true, description: 'Top text' },
      { name: 'text_bawah', required: true, description: 'Bottom text' },
      { name: 'background', required: true, description: 'Direct image URL for the background' },
    ],
    responseType: 'binary',
    scope: 'tools:maker',
  },
];
