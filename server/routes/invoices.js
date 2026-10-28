const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const InvoiceLine = require('../models/InvoiceLine');
const { parsePaymentAmount, recordPayment } = require('../services/payments');

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

const PAYMENT_REJECTIONS = {
  not_found: { status: 404, message: 'Invoice not found' },
  archived: { status: 409, message: 'Invoice is archived. Restore it before recording a payment' },
  exceeds_balance: { status: 400, message: 'Payment amount exceeds balance due' },
};

// POST /api/invoices/:id/payments
router.post('/:id/payments', async (req, res) => {
  try {
    const amount = parsePaymentAmount(req.body?.amount);
    const idParam = req.params.id;

    if (amount === null) {
      return res.status(400).json({
        message: 'Amount must be a positive number with at most two decimal places',
      });
    }

    const invoice = await findInvoice(idParam);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Fast path so obvious rejections never write a payment record; recordPayment re-checks atomically.
    if (invoice.isArchived) {
      return res.status(409).json({ message: PAYMENT_REJECTIONS.archived.message });
    }
    if (amount > invoice.balanceDue) {
      return res.status(400).json({ message: PAYMENT_REJECTIONS.exceeds_balance.message });
    }

    const result = await recordPayment(invoice._id, amount);
    if (result.error) {
      const { status, message } = PAYMENT_REJECTIONS[result.error];
      return res.status(status).json({ message });
    }

    res.status(201).json({ payment: result.payment, invoice: result.invoice });
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
