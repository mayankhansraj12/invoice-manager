const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const InvoiceLine = require('../models/InvoiceLine');
const Payment = require('../models/Payment');

// GET /api/invoices
router.get('/', async (req, res) => {
  try {
    const invoices = await Invoice.find().sort({ issueDate: -1 });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/invoices/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let invoice;

    // Check if valid ObjectId, otherwise search by invoiceNumber
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      invoice = await Invoice.findById(id);
    } else {
      invoice = await Invoice.findOne({ invoiceNumber: id });
    }

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const lines = await InvoiceLine.find({ invoiceId: invoice._id });
    const payments = await Payment.find({ invoiceId: invoice._id }).sort({ paymentDate: -1 });

    res.json({
      invoice,
      lines,
      payments
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Helper to find invoice by ID or Number
const findInvoice = async (id) => {
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    return await Invoice.findById(id);
  } else {
    return await Invoice.findOne({ invoiceNumber: id });
  }
};

// POST /api/invoices/:id/payments
router.post('/:id/payments', async (req, res) => {
  try {
    const { amount } = req.body;
    const idParam = req.params.id;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }

    const invoice = await findInvoice(idParam);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    if (amount > invoice.balanceDue) {
      return res.status(400).json({ message: 'Payment amount exceeds balance due' });
    }

    // Create Payment using the resolved _id
    const payment = new Payment({
      invoiceId: invoice._id,
      amount
    });
    await payment.save();

    // Update Invoice
    invoice.amountPaid += amount;
    invoice.balanceDue = invoice.total - invoice.amountPaid;

    if (invoice.balanceDue <= 0.01) { // Floating point tolerance
        invoice.balanceDue = 0;
        invoice.status = 'PAID';
    } else {
        invoice.status = 'PARTIALLY_PAID';
    }

    await invoice.save();

    res.status(201).json({ payment, invoice });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/invoices/archive
router.post('/archive', async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ message: 'Invoice ID is required' });
    }

    const invoice = await findInvoice(id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    invoice.isArchived = true;
    await invoice.save();

    res.json({ message: 'Invoice archived', invoice });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/invoices/restore
router.post('/restore', async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ message: 'Invoice ID is required' });
    }

    const invoice = await findInvoice(id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    invoice.isArchived = false;
    await invoice.save();

    res.json({ message: 'Invoice restored', invoice });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
