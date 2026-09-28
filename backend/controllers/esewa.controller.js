import Order from '../models/Order.js';
import { decodeEsewaData, verifyPayment } from '../utils/esewa.js';

const FRONTEND = () => process.env.FRONTEND_URL;

// eSewa redirects here with ?data=<base64 JSON>
export const paymentSuccess = async (req, res) => {
  try {
    const decoded = decodeEsewaData(req.query.data);
    const { transaction_code, transaction_uuid, total_amount, status } = decoded;

    const order = await Order.findOne({ transactionUuid: transaction_uuid });
    if (!order) {
      return res.redirect(`${FRONTEND()}/payment/error?reason=order_not_found`);
    }

    // Server-to-server check — never trust the redirect params alone.
    const result = await verifyPayment(transaction_uuid, total_amount);
    if (result.status !== 'COMPLETE' || status !== 'COMPLETE') {
      order.status = 'FAILED';
      await order.save();
      return res.redirect(`${FRONTEND()}/payment/failed`);
    }

    order.status = 'COMPLETE';
    order.esewaRefId = transaction_code;
    await order.save();

    // Redirect to frontend library — the download button appears there.
    res.redirect(`${FRONTEND()}/payment/success?order=${order._id}`);
  } catch (err) {
    console.error('eSewa success handler error:', err);
    res.redirect(`${FRONTEND()}/payment/error`);
  }
};

export const paymentFailure = async (req, res) => {
  try {
    const decoded = decodeEsewaData(req.query.data);
    await Order.findOneAndUpdate(
      { transactionUuid: decoded.transaction_uuid },
      { status: 'FAILED' }
    );
  } catch (err) {
    console.error('eSewa failure handler error:', err);
  }
  res.redirect(`${FRONTEND()}/payment/failed`);
};
