const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

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

module.exports = {
  connectTestDatabase,
  closeTestDatabase,
  resetCollections,
  listen,
  close,
};
