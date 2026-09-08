const { v4: uuidv4 } = require('uuid');
const { coreApi } = require('../config/midtrans');
const { API_KEY_PLANS } = require('../config/apiKeyPlans');
const ApiKeyOrder = require('../models/ApiKeyOrder');
const ApiKey = require('../models/ApiKey');
const { generateApiKey } = require('../utils/apiKeyGenerator');

const ALLOWED_USER_SCOPES = ['tools:search', 'tools:maker', 'tools:downloader'];
const ORDER_ID_PREFIX = 'KYYKEY-';

/** POST /api/user/api-key-orders — mulai pembelian, langsung generate QRIS. */
async function createApiKeyOrder(req, res) {
  try {
    const { plan, label, scopes } = req.body;

    const planConfig = API_KEY_PLANS[plan];
    if (!planConfig) {
      return res.status(400).json({ message: `Invalid plan. Choose one of: ${Object.keys(API_KEY_PLANS).join(', ')}` });
    }

    if (!label || typeof label !== 'string' || !label.trim()) {
      return res.status(400).json({ message: 'label is required' });
    }

    const requestedScopes = Array.isArray(scopes) ? scopes.filter((s) => ALLOWED_USER_SCOPES.includes(s)) : [];
    if (requestedScopes.length === 0) {
      return res.status(400).json({ message: `Select at least one scope from: ${ALLOWED_USER_SCOPES.join(', ')}` });
    }

    const orderId = `${ORDER_ID_PREFIX}${Date.now()}-${uuidv4().slice(0, 8)}`;

    const order = await ApiKeyOrder.create({
      orderId,
      ownerUid: req.user.uid,
      ownerEmail: req.user.email,
      label: label.trim(),
      scopes: requestedScopes,
      plan: planConfig.id,
      grossAmount: planConfig.grossAmount,
      paymentStatus: 'pending',
    });

    const charge = await coreApi.charge({
      payment_type: 'qris',
      transaction_details: { order_id: orderId, gross_amount: planConfig.grossAmount },
      customer_details: { email: req.user.email || undefined },
    });

    const qrAction = (charge.actions || []).find((action) => action.name === 'generate-qr-code');
    order.qrCodeUrl = qrAction?.url || null;
    order.midtransTransactionId = charge.transaction_id;
    await order.save();

    return res.status(201).json({
      orderId: order.orderId,
      qrCodeUrl: order.qrCodeUrl,
      grossAmount: order.grossAmount,
      plan: order.plan,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create API key order', error: error.message });
  }
}

/** GET /api/user/api-key-orders/:orderId — polling status dari sisi client. */
async function getApiKeyOrderStatus(req, res) {
  try {
    const order = await ApiKeyOrder.findOne({ orderId: req.params.orderId, ownerUid: req.user.uid });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const response = { orderId: order.orderId, paymentStatus: order.paymentStatus, plan: order.plan };

    if (order.paymentStatus === 'completed' && order.issuedApiKey) {
      response.issued = true;
    }

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch order status', error: error.message });
  }
}

/** Dipanggil dari webhook Midtrans bersama pas order_id berawalan KYYKEY-. Bikin ApiKey begitu settlement masuk. */
async function issueApiKeyForOrder(order) {
  if (order.issuedApiKey) return; // sudah pernah diproses, jangan dobel

  const planConfig = API_KEY_PLANS[order.plan];
  const { plaintext, keyId, hashedSecret } = generateApiKey();

  const apiKey = await ApiKey.create({
    keyId,
    hashedSecret,
    label: order.label,
    ownerEmail: order.ownerEmail,
    ownerType: 'user',
    ownerUid: order.ownerUid,
    scopes: order.scopes,
    rateLimitTier: 'pro',
    plan: order.plan,
    requestLimit: planConfig.requestLimit,
  });

  order.issuedApiKey = apiKey._id;
  order.issuedPlaintext = plaintext;
  await order.save();

  return { apiKey, plaintext };
}

/** GET /api/user/api-key-orders/:orderId/reveal — ambil plaintext key SEKALI, lalu langsung dihapus dari DB. */
async function revealIssuedApiKey(req, res) {
  try {
    const order = await ApiKeyOrder.findOne({ orderId: req.params.orderId, ownerUid: req.user.uid });
    if (!order || order.paymentStatus !== 'completed' || !order.issuedPlaintext) {
      return res.status(404).json({ message: 'No key available to reveal for this order' });
    }

    const plaintext = order.issuedPlaintext;
    order.issuedPlaintext = null;
    await order.save();

    return res.status(200).json({ apiKey: plaintext });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to reveal API key', error: error.message });
  }
}

module.exports = {
  createApiKeyOrder,
  getApiKeyOrderStatus,
  issueApiKeyForOrder,
  revealIssuedApiKey,
  ORDER_ID_PREFIX,
};
