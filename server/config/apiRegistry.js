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
];
