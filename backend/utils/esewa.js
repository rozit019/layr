import crypto from "crypto";

function getProductCode() {
  const productCode = process.env.ESEWA_PRODUCT_CODE;
  if (!productCode)
    throw new Error("ESEWA_PRODUCT_CODE is missing from the backend .env");
  return productCode;
}

function amountString(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error("Invalid eSewa total amount");
  }
  return String(amount);
}

// eSewa ePay v2 signature:
// base64(HMAC-SHA256(secret, "total_amount=X,transaction_uuid=Y,product_code=Z"))
export function generateSignature(totalAmount, transactionUuid, productCode) {
  const secret = process.env.ESEWA_SECRET;
  if (!secret) throw new Error("ESEWA_SECRET is missing from the backend .env");
  const data = `total_amount=${amountString(totalAmount)},transaction_uuid=${transactionUuid},product_code=${productCode}`;
  return crypto.createHmac("sha256", secret).update(data).digest("base64");
}

export function buildEsewaFormParams({
  amount,
  transactionUuid,
  successUrl,
  failureUrl,
}) {
  const productCode = getProductCode();
  const amountValue = amountString(amount);
  const totalAmount = amountString(Number(amountValue)); // No tax/service/delivery charge for these digital products.
  const signature = generateSignature(
    totalAmount,
    transactionUuid,
    productCode,
  );

  return {
    amount: amountValue,
    tax_amount: "0",
    total_amount: totalAmount,
    transaction_uuid: transactionUuid,
    product_code: productCode,
    product_service_charge: "0",
    product_delivery_charge: "0",
    success_url: successUrl,
    failure_url: failureUrl,
    signed_field_names: "total_amount,transaction_uuid,product_code",
    signature,
  };
}

// Server-to-server status check after eSewa redirects back.
// The V2 payment-form host and transaction-status host are different.
export async function verifyPayment(transactionUuid, totalAmount) {
  const productCode = getProductCode();
  const testMode = productCode === "EPAYTEST";
  const statusEndpoint =
    process.env.ESEWA_STATUS_URL ||
    (testMode
      ? "https://uat.esewa.com.np/api/epay/transaction/status/"
      : "https://epay.esewa.com.np/api/epay/transaction/status/");
  const url = new URL(statusEndpoint);
  url.search = new URLSearchParams({
    product_code: productCode,
    total_amount: amountString(totalAmount),
    transaction_uuid: String(transactionUuid),
  }).toString();

  const response = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  const responseText = await response.text();
  if (!response.ok) {
    throw new Error(
      `eSewa status check failed (${response.status}): ${responseText.slice(0, 300)}`,
    );
  }

  try {
    return JSON.parse(responseText);
  } catch {
    throw new Error(
      `eSewa status check returned non-JSON (${response.status}): ${responseText.slice(0, 300)}`,
    );
  }
}

export function decodeEsewaData(base64Data) {
  if (!base64Data) throw new Error("Missing eSewa callback data");
  return JSON.parse(Buffer.from(base64Data, "base64").toString("utf-8"));
}
