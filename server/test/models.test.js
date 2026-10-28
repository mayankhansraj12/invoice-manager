const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const Payment = require('../src/models/Payment');
const InvoiceLine = require('../src/models/InvoiceLine');
const { connectTestDatabase, closeTestDatabase } = require('./helpers');

const hasIndexOn = (indexes, field) => indexes.some((index) => index.key[field] === 1);

describe('model indexes', () => {
  let mongod;

  before(async () => {
    mongod = await connectTestDatabase();
  });

  after(async () => {
    await closeTestDatabase(mongod);
  });

  it('indexes payments by invoice so invoice details do not scan every payment', async () => {
    await Payment.init();

    assert.ok(hasIndexOn(await Payment.collection.indexes(), 'invoiceId'));
  });

  it('indexes invoice lines by invoice so invoice details do not scan every line', async () => {
    await InvoiceLine.init();

    assert.ok(hasIndexOn(await InvoiceLine.collection.indexes(), 'invoiceId'));
  });
});
