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

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
app.use(express.json({ limit: '2mb' }));

let dbConnected = false;
app.use(async (req, res, next) => {
  try {
    if (!dbConnected) {
      await connectDB();
      dbConnected = true;
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Database connection failed', error: error.message });
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

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  connectDB()
    .then(() => {
      dbConnected = true;
      app.listen(PORT, () => console.log(`KyyInfinite API running on port ${PORT}`));
    })
    .catch((error) => {
      console.error('Failed to start server', error);
      process.exit(1);
    });
}

module.exports = app;
