const DECIMAL_STRING = /^\d+(\.\d{1,2})?$/;

// Accepts a positive JSON number or a decimal string with at most two places.
// Returns null for anything else so callers never add a string to a number.
const parsePaymentAmount = (value) => {
  const trimmed = typeof value === 'string' ? value.trim() : value;
  const amount = typeof trimmed === 'string' && DECIMAL_STRING.test(trimmed) ? Number(trimmed) : trimmed;

  if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  if (Number(amount.toFixed(2)) !== amount) {
    return null;
  }

  return amount;
};

module.exports = {
  parsePaymentAmount,
};
