export type HoldResponse = {
  holdId: string;
  totalFare: number;
  expiry_timestamp: number;
};

// Backend creates a Razorpay order and returns the hosted payment URL.
// Frontend simply redirects to this URL; all payment processing happens on Razorpay's portal.
export type RazorpayInitResponse = {
  paymentUrl: string; // e.g. https://rzp.io/l/xyz123
};
