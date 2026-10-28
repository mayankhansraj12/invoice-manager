const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const Invoice = require('../models/Invoice');

const connectTestDatabase = async () => {
  const mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  return mongod;
};

const closeTestDatabase = async (mongod) => {
  await mongoose.disconnect();
  await mongod.stop();
};

const resetCollections = () =>
  Promise.all(
    Object.values(mongoose.connection.collections).map((collection) => collection.deleteMany({})),
  );

const listen = (app) =>
  new Promise((resolve) => {
    const server = app.listen(0, '127.0.0.1', () => resolve(server));
  });

const close = (server) =>
  new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });

const createInvoice = ({ total = 0, amountPaid = 0, ...fields }) =>
  Invoice.create({
    invoiceNumber: 'INV-TEST-001',
    customerName: 'Test Customer',
    dueDate: new Date('2025-01-31'),
    total,
    amountPaid,
    balanceDue: total - amountPaid,
    ...fields,
  });

module.exports = {
  connectTestDatabase,
  closeTestDatabase,
  resetCollections,
  listen,
  close,
  createInvoice,
};
