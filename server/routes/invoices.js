const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const InvoiceLine = require('../models/InvoiceLine');
const Payment = require('../models/Payment');
const { parsePaymentAmount, recordPayment } = require('../services/payments');

const OBJECT_ID = /^[0-9a-fA-F]{24}$/;

// Accepts either the Mongo ObjectId or the human-facing invoice number
const findInvoice = (ref) =>
  OBJECT_ID.test(ref) ? Invoice.findById(ref) : Invoice.findOne({ invoiceNumber: ref });

const PAYMENT_REJECTIONS = {
  not_found: { status: 404, message: 'Invoice not found' },
  archived: { status: 409, message: 'Invoice is archived. Restore it before recording a payment' },
  exceeds_balance: { status: 400, message: 'Payment amount exceeds balance due' },
};

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
    const invoice = await findInvoice(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const lines = await InvoiceLine.find({ invoiceId: invoice._id });
    const payments = await Payment.find({ invoiceId: invoice._id }).sort({ paymentDate: -1 });

    res.json({ invoice, lines, payments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/invoices/:id/payments
router.post('/:id/payments', async (req, res) => {
  try {
    const amount = parsePaymentAmount(req.body?.amount);
    if (amount === null) {
      return res.status(400).json({
        message: 'Amount must be a positive number with at most two decimal places',
      });
    }

    const invoice = await findInvoice(req.params.id);
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

const setArchived = (isArchived, message) => async (req, res) => {
  try {
    const id = req.body?.id;
    if (id === undefined || id === '') {
      return res.status(400).json({ message: 'Invoice ID is required' });
    }
    if (typeof id !== 'string') {
      return res.status(400).json({ message: 'Invoice ID must be a string' });
    }

    const invoice = await findInvoice(id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    invoice.isArchived = isArchived;
    await invoice.save();

    res.json({ message, invoice });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/invoices/archive
router.post('/archive', setArchived(true, 'Invoice archived'));

// POST /api/invoices/restore
router.post('/restore', setArchived(false, 'Invoice restored'));

module.exports = router;
