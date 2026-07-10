const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const { snap } = require('../config/midtrans');
const Order = require('../models/Order');
const Product = require('../models/Product');
const PurchasedPanel = require('../models/PurchasedPanel');
const { provisionServer } = require('../services/pterodactylService');

async function createOrder(req, res) {
  try {
    const { guestEmail, productId } = req.body;

    if (!guestEmail || !productId) {
      return res.status(400).json({ message: 'guestEmail and productId are required' });
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ message: 'Product not found or unavailable' });
    }

    const orderId = `KYY-${Date.now()}-${uuidv4().slice(0, 8)}`;

    const order = await Order.create({
      orderId,
      guestEmail,
      product: product._id,
      grossAmount: product.price,
      paymentStatus: 'pending',
    });

    const transaction = await snap.createTransaction({
      transaction_details: {
        order_id: orderId,
        gross_amount: product.price,
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

async function handleWebhook(req, res) {
  try {
    const payload = req.body;
    const { order_id, transaction_status, fraud_status } = payload;

    const isValid = verifySignature(payload);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid signature' });
    }

    const order = await Order.findOne({ orderId: order_id }).populate('product');
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
    const order = await Order.findOne({ orderId }).populate('product');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    return res.status(200).json({
      orderId: order.orderId,
      paymentStatus: order.paymentStatus,
      productName: order.product.name,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch order status', error: error.message });
  }
}

module.exports = { createOrder, handleWebhook, getOrderStatus };
