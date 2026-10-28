const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');

const DECIMAL_STRING = /^\d+(\.\d{1,2})?$/;

// Accepts a positive JSON number or a decimal string with at most two places.
// Returns null for anything else so callers never add a string to a number.
const parsePaymentAmount = (value) => {
  const trimmed = typeof value === 'string' ? value.trim() : value;
  const amount =
    typeof trimmed === 'string' && DECIMAL_STRING.test(trimmed) ? Number(trimmed) : trimmed;

  if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  if (Number(amount.toFixed(2)) !== amount) {
    return null;
  }

  return amount;
};

// Applied inside MongoDB so concurrent requests cannot read a stale balance.
const applyPaymentPipeline = (amount) => [
  { $set: { amountPaid: { $round: [{ $add: ['$amountPaid', amount] }, 2] } } },
  {
    $set: {
      balanceDue: { $max: [0, { $round: [{ $subtract: ['$total', '$amountPaid'] }, 2] }] },
    },
  },
  { $set: { status: { $cond: [{ $lte: ['$balanceDue', 0] }, 'PAID', 'PARTIALLY_PAID'] } } },
];

const rejectionReason = async (invoiceId) => {
  const invoice = await Invoice.findById(invoiceId, { isArchived: 1 });

  if (!invoice) {
    return 'not_found';
  }

  return invoice.isArchived ? 'archived' : 'exceeds_balance';
};

// Records the payment first, then applies it with a guarded update. If the guard
// does not match (balance too small, archived, or deleted), the payment is removed
// so the payment history never disagrees with the invoice.
const recordPayment = async (invoiceId, amount) => {
  const payment = await Payment.create({ invoiceId, amount });

  let invoice;
  try {
    invoice = await Invoice.findOneAndUpdate(
      { _id: invoiceId, isArchived: false, balanceDue: { $gte: amount } },
      applyPaymentPipeline(amount),
      { new: true },
    );
  } catch (error) {
    await Payment.deleteOne({ _id: payment._id });
    throw error;
  }

  if (!invoice) {
    await Payment.deleteOne({ _id: payment._id });
    return { error: await rejectionReason(invoiceId) };
  }

  return { invoice, payment };
};

module.exports = {
  parsePaymentAmount,
  recordPayment,
};
