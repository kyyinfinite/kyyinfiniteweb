/**
 * Paket API key premium. requestLimit null = unlimited (seumur hidup, tanpa batas total request).
 * Harga sengaja dibikin murah sesuai permintaan — ini bukan harga margin tinggi.
 */
const API_KEY_PLANS = {
  '1000': { id: '1000', label: '1,000 requests', requestLimit: 1000, grossAmount: 5000 },
  '10000': { id: '10000', label: '10,000 requests', requestLimit: 10000, grossAmount: 10000 },
  unlimited: { id: 'unlimited', label: 'Unlimited requests', requestLimit: null, grossAmount: 15000 },
};

module.exports = { API_KEY_PLANS };
