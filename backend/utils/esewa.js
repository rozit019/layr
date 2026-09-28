import crypto from 'crypto';

// eSewa ePay v2 signature:
// base64( HMAC-SHA256( secret, "total_amount=X,transaction_uuid=Y,product_code=Z" ) )
export function generateSignature(totalAmount, transactionUuid, productCode) {
  const data = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;
  return crypto
    .createHmac('sha256', process.env.ESEWA_SECRET)
    .update(data)
    .digest('base64');
}

export function buildEsewaFormParams({ amount, transactionUuid, successUrl, failureUrl }) {
  const taxAmount = 0;
  const productCode = process.env.ESEWA_PRODUCT_CODE;
  const totalAmount = amount; // price + tax (no tax for digital goods)
  const signature = generateSignature(totalAmount, transactionUuid, productCode);
  return {
    amount: amount.toString(),
    tax_amount: taxAmount.toString(),
    total_amount: totalAmount.toString(),
    transaction_uuid: transactionUuid,
    product_code: productCode,
    product_service_charge: '0',
    product_delivery_charge: '0',
    success_url: successUrl,
    failure_url: failureUrl,
    signed_field_names: 'total_amount,transaction_uuid,product_code',
    signature
  };
}

// Server-to-server verification after eSewa redirects back.
export async function verifyPayment(transactionUuid, totalAmount) {
  const url =
    `${process.env.ESEWA_BASE_URL}/api/epay/main/v2/status` +
    `?product_code=${process.env.ESEWA_PRODUCT_CODE}` +
    `&total_amount=${totalAmount}&transaction_uuid=${encodeURIComponent(transactionUuid)}`;

  const res = await fetch(url, { method: 'GET' });
  if (!res.ok) throw new Error('eSewa verification request failed');
  return res.json(); // { status: "COMPLETE", transaction_code, ... }
}

export function decodeEsewaData(b64) {
  return JSON.parse(Buffer.from(b64, 'base64').toString('utf-8'));
}
