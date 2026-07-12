const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const { snap } = require('../config/midtrans');
const Order = require('../models/Order');
const Product = require('../models/Product');
const ProjectAsset = require('../models/ProjectAsset');
const PurchasedPanel = require('../models/PurchasedPanel');
const LicenseKey = require('../models/LicenseKey');
const ApiKeyOrder = require('../models/ApiKeyOrder');
const { provisionServer } = require('../services/pterodactylService');
const { generateLicenseKey } = require('../utils/licenseKeyGenerator');
const { issueApiKeyForOrder, ORDER_ID_PREFIX } = require('./apiKeyOrderController');

async function createOrder(req, res) {
  try {
    const { guestEmail, productId, assetId } = req.body;

    if (!guestEmail || (!productId && !assetId)) {
      return res.status(400).json({ message: 'guestEmail and productId or assetId are required' });
    }

    const orderType = assetId ? 'asset' : 'panel';
    let grossAmount;
    let target;

    if (orderType === 'asset') {
      target = await ProjectAsset.findById(assetId);
      if (!target || !target.isPublished || !target.isPremium) {
        return res.status(404).json({ message: 'Asset not found or not purchasable' });
      }
      grossAmount = target.price;
    } else {
      target = await Product.findById(productId);
      if (!target || !target.isActive) {
        return res.status(404).json({ message: 'Product not found or unavailable' });
      }
      grossAmount = target.price;
    }

    const orderId = `KYY-${Date.now()}-${uuidv4().slice(0, 8)}`;

    const order = await Order.create({
      orderId,
      guestEmail,
      orderType,
      product: orderType === 'panel' ? target._id : undefined,
      asset: orderType === 'asset' ? target._id : undefined,
      grossAmount,
      paymentStatus: 'pending',
    });

    const transaction = await snap.createTransaction({
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount,
      },
      customer_details: { email: guestEmail },
      enabled_payments: ['qris', 'gopay'],
    });

    return res.status(201).json({
      orderId: order.orderId,
      redirectUrl: transaction.redirect_url,
      token: transaction.token,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create order', error: error.message });
  }
}

function verifySignature({ order_id, status_code, gross_amount, signature_key }) {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  const expected = crypto
    .createHash('sha512')
    .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
    .digest('hex');
  return expected === signature_key;
}

async function issueLicenseKey(order) {
  const asset = await ProjectAsset.findById(order.asset);
  if (!asset) return null;

  let key = generateLicenseKey();
  // Tabrakan sangat tidak mungkin (entropi tinggi), tapi tetap dijaga.
  // eslint-disable-next-line no-await-in-loop
  while (await LicenseKey.exists({ key })) {
    key = generateLicenseKey();
  }

  const expiresAt = asset.licenseDurationDays
    ? new Date(Date.now() + asset.licenseDurationDays * 24 * 60 * 60 * 1000)
    : null;

  return LicenseKey.create({
    key,
    asset: asset._id,
    order: order._id,
    buyerEmail: order.guestEmail,
    maxActivations: asset.maxActivations,
    expiresAt,
  });
}

async function handleApiKeyOrderWebhook(payload, res) {
  const { order_id, transaction_status, fraud_status } = payload;

  const order = await ApiKeyOrder.findOne({ orderId: order_id });
  if (!order) {
    return res.status(404).json({ message: 'API key order not found' });
  }

  order.rawWebhookData = payload;

  const isSettled =
    transaction_status === 'settlement' || (transaction_status === 'capture' && fraud_status === 'accept');

  if (isSettled && order.paymentStatus !== 'completed') {
    order.paymentStatus = 'completed';
    order.midtransTransactionId = payload.transaction_id;
    await order.save();
    await issueApiKeyForOrder(order);
  } else if (['deny', 'cancel', 'expire'].includes(transaction_status)) {
    order.paymentStatus = 'failed';
    await order.save();
  } else {
    await order.save();
  }

  return res.status(200).json({ message: 'Webhook processed' });
}

async function handleWebhook(req, res) {
  try {
    const payload = req.body;
    const { order_id, transaction_status, fraud_status } = payload;

    const isValid = verifySignature(payload);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid signature' });
    }

    if (order_id.startsWith(ORDER_ID_PREFIX)) {
      return handleApiKeyOrderWebhook(payload, res);
    }

    const order = await Order.findOne({ orderId: order_id }).populate('product').populate('asset');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.rawWebhookData = payload;

    const isSettled =
      transaction_status === 'settlement' ||
      (transaction_status === 'capture' && fraud_status === 'accept');

    if (isSettled && order.paymentStatus !== 'completed') {
      order.paymentStatus = 'completed';
      order.midtransTransactionId = payload.transaction_id;
      await order.save();

      if (order.orderType === 'asset') {
        await issueLicenseKey(order);
      } else {
        const provisioned = await provisionServer({
          guestEmail: order.guestEmail,
          product: order.product,
          orderId: order.orderId,
        });

        await PurchasedPanel.create({
          guestEmail: order.guestEmail,
          order: order._id,
          pterodactylUserId: provisioned.pterodactylUserId,
          pterodactylServerId: provisioned.pterodactylServerId,
          serverIdentifier: provisioned.serverIdentifier,
          status: 'active',
        });
      }
    } else if (['deny', 'cancel', 'expire'].includes(transaction_status)) {
      order.paymentStatus = 'failed';
      await order.save();
    } else {
      await order.save();
    }

    return res.status(200).json({ message: 'Webhook processed' });
  } catch (error) {
    return res.status(500).json({ message: 'Webhook processing failed', error: error.message });
  }
}

async function getOrderStatus(req, res) {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne({ orderId }).populate('product').populate('asset');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const response = {
      orderId: order.orderId,
      orderType: order.orderType,
      paymentStatus: order.paymentStatus,
      productName: order.orderType === 'asset' ? order.asset?.name : order.product?.name,
    };

    if (order.orderType === 'asset' && order.paymentStatus === 'completed') {
      const license = await LicenseKey.findOne({ order: order._id });
      if (license) {
        response.licenseKey = license.key;
        response.expiresAt = license.expiresAt;
        response.maxActivations = license.maxActivations;
      }
    }

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch order status', error: error.message });
  }
}

module.exports = { createOrder, handleWebhook, getOrderStatus };
