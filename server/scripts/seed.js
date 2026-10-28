const mongoose = require('mongoose');
const Invoice = require('../src/models/Invoice');
const InvoiceLine = require('../src/models/InvoiceLine');
const Payment = require('../src/models/Payment');

const DAY_MS = 86400000;

const SAMPLE_INVOICES = [
  {
    invoiceNumber: 'INV-2024-001',
    customerName: 'Reliance Industries',
    issueDate: new Date('2024-01-15'),
    dueDate: new Date('2024-02-15'),
    status: 'PAID',
    total: 50000,
    amountPaid: 50000,
    balanceDue: 0,
    lines: [
      { description: 'Enterprise Software License - Jan', quantity: 1, unitPrice: 30000 },
      { description: 'On-site Support (Mumbai)', quantity: 10, unitPrice: 2000 },
    ],
  },
  {
    invoiceNumber: 'INV-2024-002',
    customerName: 'Tata Consultancy Services',
    issueDate: new Date('2024-02-01'),
    dueDate: new Date('2024-02-15'),
    status: 'PARTIALLY_PAID',
    total: 125000,
    amountPaid: 50000,
    balanceDue: 75000,
    lines: [
      { description: 'Cloud Migration Project (Phase 1)', quantity: 1, unitPrice: 100000 },
      { description: 'DevOps Consultation', quantity: 5, unitPrice: 5000 },
    ],
  },
  {
    invoiceNumber: 'INV-2024-003',
    customerName: 'Flipkart Internet Pvt Ltd',
    issueDate: new Date('2024-02-10'),
    dueDate: new Date('2024-03-10'),
    status: 'DRAFT',
    total: 850000,
    amountPaid: 0,
    balanceDue: 850000,
    lines: [
      { description: 'AI Recommendation Engine', quantity: 1, unitPrice: 500000 },
      { description: 'Data Analysis Services', quantity: 100, unitPrice: 3500 },
    ],
  },
  {
    invoiceNumber: 'INV-2024-004',
    customerName: 'Infosys Limited',
    issueDate: new Date('2023-12-01'),
    dueDate: new Date('2024-01-01'),
    status: 'OVERDUE',
    total: 25000,
    amountPaid: 0,
    balanceDue: 25000,
    lines: [{ description: 'Cybersecurity Audit', quantity: 1, unitPrice: 25000 }],
  },
];

// Replaces every invoice, line and payment. Refuses to do so without force when data exists.
const seedDatabase = async ({ force = false } = {}) => {
  const existing = await Invoice.countDocuments();
  if (existing > 0 && !force) {
    throw new Error(
      `The database already has ${existing} invoice(s). Run the seed with --force to replace them.`,
    );
  }

  await Promise.all([Invoice.deleteMany(), InvoiceLine.deleteMany(), Payment.deleteMany()]);

  for (const { lines, ...fields } of SAMPLE_INVOICES) {
    const invoice = await Invoice.create(fields);
    await InvoiceLine.create(lines.map((line) => ({ ...line, invoiceId: invoice._id })));

    if (invoice.amountPaid > 0) {
      await Payment.create({
        invoiceId: invoice._id,
        amount: invoice.amountPaid,
        paymentDate: new Date(invoice.issueDate.getTime() + 5 * DAY_MS),
      });
    }
  }
};

const main = async () => {
  require('dotenv').config();
  const { readConfig } = require('../src/config');

  const config = readConfig();
  await mongoose.connect(config.mongoUri);

  try {
    await seedDatabase({ force: process.argv.includes('--force') });
    console.log(`Seeded ${SAMPLE_INVOICES.length} sample invoices`);
  } finally {
    await mongoose.disconnect();
  }
};

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}

module.exports = {
  seedDatabase,
  SAMPLE_INVOICES,
};
