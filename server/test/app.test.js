const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const createApp = require('../app');
const {
  connectTestDatabase,
  closeTestDatabase,
  resetCollections,
  listen,
  close,
} = require('./helpers');

describe('app', () => {
  let mongod;
  let server;
  let baseUrl;

  before(async () => {
    mongod = await connectTestDatabase();
    server = await listen(createApp());
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  });

  after(async () => {
    await close(server);
    await closeTestDatabase(mongod);
  });

  beforeEach(resetCollections);

  it('answers the health route', async () => {
    const response = await fetch(`${baseUrl}/`);

    assert.equal(response.status, 200);
    assert.equal(await response.text(), 'Invoice API is running');
  });

  it('lists no invoices when the database is empty', async () => {
    const response = await fetch(`${baseUrl}/api/invoices`);

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), []);
  });
});
