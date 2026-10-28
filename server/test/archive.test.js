const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const createApp = require('../src/app');
const Invoice = require('../src/models/Invoice');
const {
  connectTestDatabase,
  closeTestDatabase,
  resetCollections,
  listen,
  close,
  createInvoice,
} = require('./helpers');

describe('POST /api/invoices/archive and /restore', () => {
  let mongod;
  let server;
  let baseUrl;

  const postJson = (action, body) =>
    fetch(`${baseUrl}/api/invoices/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

  const isArchived = async () => (await Invoice.findOne({ invoiceNumber: 'INV-9' })).isArchived;

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
    await createInvoice({ invoiceNumber: 'INV-9', total: 100 });
  });

  it('archives an invoice by number and restores it', async () => {
    const archived = await postJson('archive', { id: 'INV-9' });
    assert.equal(archived.status, 200);
    assert.equal(await isArchived(), true);

    const restored = await postJson('restore', { id: 'INV-9' });
    assert.equal(restored.status, 200);
    assert.equal(await isArchived(), false);
  });

  it('accepts an ObjectId as well as an invoice number', async () => {
    const invoice = await Invoice.findOne({ invoiceNumber: 'INV-9' });

    const response = await postJson('archive', { id: String(invoice._id) });

    assert.equal(response.status, 200);
    assert.equal(await isArchived(), true);
  });

  it('responds 400 when the id is missing', async () => {
    const response = await postJson('archive', {});

    assert.equal(response.status, 400);
    assert.equal(await isArchived(), false);
  });

  it('responds 400 instead of a server error when the id is not a string', async () => {
    for (const id of [{ $ne: null }, 12345, ['INV-9'], true]) {
      const response = await postJson('archive', { id });

      assert.equal(response.status, 400, `id ${JSON.stringify(id)} should be rejected`);
    }

    assert.equal(await isArchived(), false);
  });

  it('responds 400 when the request has no JSON body', async () => {
    const response = await fetch(`${baseUrl}/api/invoices/restore`, { method: 'POST' });

    assert.equal(response.status, 400);
  });

  it('responds 404 for an unknown invoice', async () => {
    const response = await postJson('restore', { id: 'NOPE' });

    assert.equal(response.status, 404);
  });
});
