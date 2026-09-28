import Order from "../models/Order.js";
import { decodeEsewaData, verifyPayment } from "../utils/esewa.js";

function redirectToFrontend(res, path, query = {}) {
  const frontendBase = process.env.FRONTEND_URL;
  if (!frontendBase) {
    console.error(
      "FRONTEND_URL is missing; cannot redirect to the payment result page.",
    );
    return res
      .status(500)
      .send(
        "Payment result redirect is not configured. Set FRONTEND_URL in the backend .env.",
      );
  }

  let target;
  try {
    target = new URL(path, frontendBase);
  } catch (error) {
    console.error("Invalid FRONTEND_URL:", error.message);
    return res
      .status(500)
      .send("Payment result redirect is not configured correctly.");
  }

  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null)
      target.searchParams.set(key, String(value));
  }
  return res.redirect(target.toString());
}

// eSewa redirects here with ?data=<base64 JSON>.
export const paymentSuccess = async (req, res) => {
  try {
    const decoded = decodeEsewaData(req.query.data);
    const { transaction_code, transaction_uuid, total_amount, status } =
      decoded;

    const order = await Order.findOne({ transactionUuid: transaction_uuid });
    if (!order) {
      return redirectToFrontend(res, "/payment/error", {
        reason: "order_not_found",
      });
    }

    // Server-to-server check — never trust the redirect params alone.
    const result = await verifyPayment(transaction_uuid, total_amount);
    if (result.status !== "COMPLETE" || status !== "COMPLETE") {
      order.status = "FAILED";
      await order.save();
      return redirectToFrontend(res, "/payment/failed");
    }

    order.status = "COMPLETE";
    order.esewaRefId = transaction_code;
    await order.save();

    // The frontend fetches the private customization link for this paid order owner.
    return redirectToFrontend(res, "/payment/success", { order: order._id });
  } catch (err) {
    console.error("eSewa success handler error:", err);
    return redirectToFrontend(res, "/payment/error");
  }
};

export const paymentFailure = async (req, res) => {
  try {
    const decoded = decodeEsewaData(req.query.data);
    await Order.findOneAndUpdate(
      { transactionUuid: decoded.transaction_uuid },
      { status: "FAILED" },
    );
  } catch (err) {
    console.error("eSewa failure handler error:", err);
  }
  return redirectToFrontend(res, "/payment/failed");
};
