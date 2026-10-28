const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const createApp = require('../app');
const Invoice = require('../models/Invoice');
const InvoiceLine = require('../models/InvoiceLine');
const Payment = require('../models/Payment');
const {
  connectTestDatabase,
  closeTestDatabase,
  resetCollections,
  listen,
  close,
  createInvoice,
} = require('./helpers');

describe('invoice read routes', () => {
  let mongod;
  let server;
  let baseUrl;
  let invoiceId;

  before(async () => {
    mongod = await connectTestDatabase();
    server = await listen(createApp());
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  });

  after(async () => {
    await close(server);
    await closeTestDatabase(mongod);
  });

  beforeEach(async () => {
    await resetCollections();

    const older = await createInvoice({
      invoiceNumber: 'INV-5',
      total: 300,
      amountPaid: 100,
      issueDate: new Date('2025-02-01'),
    });
    await createInvoice({
      invoiceNumber: 'INV-6',
      total: 50,
      issueDate: new Date('2025-03-01'),
    });
    invoiceId = older._id;

    await InvoiceLine.create({
      invoiceId,
      description: 'Consulting',
      quantity: 3,
      unitPrice: 100,
    });
    await Payment.create({ invoiceId, amount: 100 });
  });

  it('lists invoices with the most recently issued first', async () => {
    const response = await fetch(`${baseUrl}/api/invoices`);
    const invoices = await response.json();

    assert.equal(response.status, 200);
    assert.deepEqual(
      invoices.map((invoice) => invoice.invoiceNumber),
      ['INV-6', 'INV-5'],
    );
  });

  it('returns the invoice with its lines and payments when given an invoice number', async () => {
    const response = await fetch(`${baseUrl}/api/invoices/INV-5`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.invoice.invoiceNumber, 'INV-5');
    assert.equal(body.lines.length, 1);
    assert.equal(body.lines[0].description, 'Consulting');
    assert.equal(body.lines[0].lineTotal, 300);
    assert.equal(body.payments.length, 1);
    assert.equal(body.payments[0].amount, 100);
  });

  it('returns the same invoice when given its ObjectId', async () => {
    const response = await fetch(`${baseUrl}/api/invoices/${invoiceId}`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.invoice.invoiceNumber, 'INV-5');
  });

  it('responds 404 with a JSON message for an unknown invoice', async () => {
    const response = await fetch(`${baseUrl}/api/invoices/NOPE`);

    assert.equal(response.status, 404);
    assert.deepEqual(await response.json(), { message: 'Invoice not found' });
  });

  it('keeps archived invoices in the list so they can be restored', async () => {
    await Invoice.updateOne({ invoiceNumber: 'INV-5' }, { isArchived: true });

    const invoices = await (await fetch(`${baseUrl}/api/invoices`)).json();

    assert.equal(invoices.length, 2);
    assert.equal(invoices.find((invoice) => invoice.invoiceNumber === 'INV-5').isArchived, true);
  });
});
