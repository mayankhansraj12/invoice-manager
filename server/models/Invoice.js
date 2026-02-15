const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },
  customerName: {
    type: String,
    required: true
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['DRAFT', 'PAID', 'PARTIALLY_PAID', 'OVERDUE'],
    default: 'DRAFT'
  },
  total: {
    type: Number,
    default: 0
  },
  amountPaid: {
    type: Number,
    default: 0
  },
  balanceDue: {
    type: Number,
    default: 0
  },
  isArchived: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Invoice', InvoiceSchema);
