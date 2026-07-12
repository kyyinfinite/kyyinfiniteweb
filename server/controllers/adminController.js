const ProjectAsset = require('../models/ProjectAsset');
const Order = require('../models/Order');
const PurchasedPanel = require('../models/PurchasedPanel');
const Product = require('../models/Product');
const DownloadEvent = require('../models/DownloadEvent');

function buildLastNDays(n) {
  const days = [];
  for (let i = n - 1; i >= 0; i -= 1) {
    const date = new Date();
    date.setUTCHours(0, 0, 0, 0);
    date.setUTCDate(date.getUTCDate() - i);
    days.push(date.toISOString().slice(0, 10));
  }
  return days;
}

async function getMetricsTimeseries(req, res) {
  try {
    const rangeDays = 30;
    const since = new Date();
    since.setUTCHours(0, 0, 0, 0);
    since.setUTCDate(since.getUTCDate() - (rangeDays - 1));

    const [downloadAgg, revenueAgg] = await Promise.all([
      DownloadEvent.aggregate([
        { $match: { createdAt: { $gte: since } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
      ]),
      Order.aggregate([
        { $match: { paymentStatus: 'completed', createdAt: { $gte: since } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            total: { $sum: '$grossAmount' },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const downloadMap = new Map(downloadAgg.map((row) => [row._id, row.count]));
    const revenueMap = new Map(revenueAgg.map((row) => [row._id, { total: row.total, count: row.count }]));

    const days = buildLastNDays(rangeDays);
    const series = days.map((day) => ({
      date: day,
      downloads: downloadMap.get(day) || 0,
      revenue: revenueMap.get(day)?.total || 0,
      orders: revenueMap.get(day)?.count || 0,
    }));

    return res.status(200).json({ series });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load metrics timeseries', error: error.message });
  }
}

async function getMetrics(req, res) {
  try {
    const [downloadAgg, revenueAgg, activeServers, totalOrders, totalAssets] = await Promise.all([
      ProjectAsset.aggregate([{ $group: { _id: null, total: { $sum: '$downloadCount' } } }]),
      Order.aggregate([
        { $match: { paymentStatus: 'completed' } },
        { $group: { _id: null, total: { $sum: '$grossAmount' } } },
      ]),
      PurchasedPanel.countDocuments({ status: 'active' }),
      Order.countDocuments({}),
      ProjectAsset.countDocuments({}),
    ]);

    return res.status(200).json({
      totalDownloads: downloadAgg[0]?.total || 0,
      grossRevenue: revenueAgg[0]?.total || 0,
      activeServers,
      totalOrders,
      totalAssets,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load metrics', error: error.message });
  }
}

async function listOrders(req, res) {
  try {
    const orders = await Order.find({})
      .populate('product')
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();
    return res.status(200).json(orders);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to list orders', error: error.message });
  }
}

async function listPanels(req, res) {
  try {
    const panels = await PurchasedPanel.find({})
      .populate({ path: 'order', populate: { path: 'product' } })
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();
    return res.status(200).json(panels);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to list panels', error: error.message });
  }
}

async function listProductsAdmin(req, res) {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 }).lean();
    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to list products', error: error.message });
  }
}

async function createProduct(req, res) {
  try {
    const product = await Product.create(req.body);
    return res.status(201).json(product);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create product', error: error.message });
  }
}

async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, req.body, { new: true });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    return res.status(200).json(product);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update product', error: error.message });
  }
}

module.exports = {
  getMetrics,
  getMetricsTimeseries,
  listOrders,
  listPanels,
  listProductsAdmin,
  createProduct,
  updateProduct,
};
