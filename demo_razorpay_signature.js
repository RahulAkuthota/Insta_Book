import crypto from "crypto";

const orderId = "order_SAroD0P8CwR8a4";
const paymentId = "pay_test_123456";
const secret = "B6HhfqK6UCqDdiASO5Q3iR0O";

const signature = crypto
  .createHmac("sha256", secret)
  .update(`${orderId}|${paymentId}`)
  .digest("hex");

console.log(signature);
