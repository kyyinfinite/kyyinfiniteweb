require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const assetRoutes = require('./routes/assetRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const productRoutes = require('./routes/productRoutes');
const adminRoutes = require('./routes/adminRoutes');
const changelogRoutes = require('./routes/changelogRoutes');
const snippetRoutes = require('./routes/snippetRoutes');
const licenseRoutes = require('./routes/licenseRoutes');
const proxyRoutes = require('./routes/proxyRoutes');
const apiKeyRoutes = require('./routes/apiKeyRoutes');
const userApiKeyRoutes = require('./routes/userApiKeyRoutes');
const userApiKeyOrderRoutes = require('./routes/userApiKeyOrderRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
app.use(express.json({ limit: '2mb' }));

// Midtrans's dashboard "Tes URL notifikasi" pings this URL with a plain GET
// and expects a fast response. It must NOT depend on the DB middleware below,
// since a cold Mongo connection can be slower than Midtrans's test timeout.
app.get('/api/payments/webhook', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Webhook endpoint is reachable. Use POST for real notifications.' });
});

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('Request blocked, database unavailable:', error.message);
    res.status(500).json({
      message: 'Database connection failed',
      error: error.message,
      hint: 'Check MONGODB_URI is set correctly in Vercel Project Settings and that your MongoDB Atlas Network Access allows 0.0.0.0/0',
    });
  }
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'kyyinfinite-api' });
});

app.use('/api/assets', assetRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/changelog', changelogRoutes);
app.use('/api/snippets', snippetRoutes);
app.use('/api/v1/license', licenseRoutes.publicRouter);
app.use('/api/admin/license-keys', licenseRoutes.adminRouter);
app.use('/api/v1', proxyRoutes);
app.use('/api/admin/api-keys', apiKeyRoutes);
app.use('/api/user/api-keys', userApiKeyRoutes);
app.use('/api/user/api-key-orders', userApiKeyOrderRoutes);
app.use('/api/user', userRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  connectDB()
    .then(() => {
      app.listen(PORT, () => console.log(`KyyInfinite API running on port ${PORT}`));
    })
    .catch((error) => {
      console.error('Failed to start server', error);
      process.exit(1);
    });
}

module.exports = app;
