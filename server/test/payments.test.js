const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const createApp = require('../app');
const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const {
  connectTestDatabase,
  closeTestDatabase,
  resetCollections,
  listen,
  close,
  createInvoice,
} = require('./helpers');

describe('POST /api/invoices/:id/payments amount validation', () => {
  let mongod;
  let server;
  let baseUrl;

  const postPayment = (id, body) =>
    fetch(`${baseUrl}/api/invoices/${id}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });

  const postAmount = (id, amount) => postPayment(id, JSON.stringify({ amount }));

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
    await createInvoice({ invoiceNumber: 'INV-1', total: 125000, amountPaid: 50000 });
  });

  it('adds a numeric string as a number instead of concatenating it', async () => {
    const response = await postAmount('INV-1', '1000');

    assert.equal(response.status, 201);
    const invoice = await Invoice.findOne({ invoiceNumber: 'INV-1' });
    assert.equal(invoice.amountPaid, 51000);
    assert.equal(invoice.balanceDue, 74000);
    assert.equal(invoice.status, 'PARTIALLY_PAID');
  });

  it('accepts amounts with exactly two decimal places', async () => {
    const response = await postAmount('INV-1', 10.25);

    assert.equal(response.status, 201);
    const invoice = await Invoice.findOne({ invoiceNumber: 'INV-1' });
    assert.equal(invoice.amountPaid, 50010.25);
    assert.equal(invoice.balanceDue, 74989.75);
  });

  it('rejects values that are not numbers with a 400 and records nothing', async () => {
    for (const amount of ['abc', '', '12abc', 'Infinity', true, null, {}, []]) {
      const response = await postAmount('INV-1', amount);

      assert.equal(response.status, 400, `amount ${JSON.stringify(amount)} should be rejected`);
      assert.match((await response.json()).message, /amount/i);
    }

    const invoice = await Invoice.findOne({ invoiceNumber: 'INV-1' });
    assert.equal(invoice.amountPaid, 50000);
    assert.equal(await Payment.countDocuments(), 0);
  });

  it('rejects zero, negative and sub-cent amounts', async () => {
    for (const amount of [0, -5, 0.001, 0.004]) {
      const response = await postAmount('INV-1', amount);

      assert.equal(response.status, 400, `amount ${amount} should be rejected`);
    }

    assert.equal(await Payment.countDocuments(), 0);
  });

  it('rejects amounts with more than two decimal places', async () => {
    const response = await postAmount('INV-1', 10.123);

    assert.equal(response.status, 400);
    assert.equal(await Payment.countDocuments(), 0);
  });

  it('rejects a request with no JSON body with a 400 instead of a server error', async () => {
    const response = await fetch(`${baseUrl}/api/invoices/INV-1/payments`, { method: 'POST' });

    assert.equal(response.status, 400);
  });
});
