import crypto from 'crypto';

export const createRazorpayOrder = async (amountInINR, receiptId) => {
  // If Razorpay SDK is enabled or mocked
  return {
    id: `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    amount: amountInINR * 100, // paise
    currency: 'INR',
    receipt: receiptId || `rcpt_${Date.now()}`,
    status: 'created'
  };
};

export const verifyRazorpaySignature = (orderId, paymentId, signature) => {
  const secret = process.env.RAZORPAY_KEY_SECRET || 'sample_secret_key';
  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return generatedSignature === signature;
};
