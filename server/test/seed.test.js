const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const Invoice = require('../src/models/Invoice');
const InvoiceLine = require('../src/models/InvoiceLine');
const Payment = require('../src/models/Payment');
const { seedDatabase, SAMPLE_INVOICES } = require('../scripts/seed');
const {
  connectTestDatabase,
  closeTestDatabase,
  resetCollections,
  createInvoice,
} = require('./helpers');

describe('seedDatabase', () => {
  let mongod;

  before(async () => {
    mongod = await connectTestDatabase();
  });

  after(async () => {
    await closeTestDatabase(mongod);
  });

  beforeEach(resetCollections);

  it('loads the sample invoices into an empty database', async () => {
    await seedDatabase();

    assert.equal(await Invoice.countDocuments(), SAMPLE_INVOICES.length);
    assert.equal(await Payment.countDocuments(), 2);
  });

  it('gives every sample line a total derived from quantity and unit price', async () => {
    await seedDatabase();

    for (const line of await InvoiceLine.find()) {
      assert.equal(line.lineTotal, line.quantity * line.unitPrice, line.description);
    }
  });

  it('keeps each sample invoice total equal to the sum of its lines', async () => {
    await seedDatabase();

    for (const invoice of await Invoice.find()) {
      const lines = await InvoiceLine.find({ invoiceId: invoice._id });
      const sum = lines.reduce((total, line) => total + line.lineTotal, 0);

      assert.equal(invoice.total, sum, invoice.invoiceNumber);
    }
  });

  it('refuses to replace existing invoices without force', async () => {
    await createInvoice({ invoiceNumber: 'KEEP-ME', total: 10 });

    await assert.rejects(seedDatabase(), /--force/);
    assert.ok(await Invoice.exists({ invoiceNumber: 'KEEP-ME' }));
    assert.equal(await Invoice.countDocuments(), 1);
  });

  it('replaces existing data when forced', async () => {
    await createInvoice({ invoiceNumber: 'OLD', total: 10 });

    await seedDatabase({ force: true });

    assert.equal(await Invoice.countDocuments({ invoiceNumber: 'OLD' }), 0);
    assert.equal(await Invoice.countDocuments(), SAMPLE_INVOICES.length);
  });
});
