const mongoose = require('mongoose');

const InvoiceLineSchema = new mongoose.Schema({
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
    required: true
  },
  description: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  lineTotal: {
    type: Number,
    required: true
  }
});

// Runs before required checks, so lineTotal is always derived from quantity and unit price
InvoiceLineSchema.pre('validate', function () {
  this.lineTotal = this.quantity * this.unitPrice;
});

module.exports = mongoose.model('InvoiceLine', InvoiceLineSchema);
