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

// Calculate lineTotal before saving
InvoiceLineSchema.pre('save', function(next) {
  this.lineTotal = this.quantity * this.unitPrice;
  next();
});

module.exports = mongoose.model('InvoiceLine', InvoiceLineSchema);
