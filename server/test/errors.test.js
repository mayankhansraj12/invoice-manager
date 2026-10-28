const { describe, it, before, after, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const createApp = require('../app');
const Invoice = require('../models/Invoice');
const { connectTestDatabase, closeTestDatabase, listen, close } = require('./helpers');

describe('error responses', () => {
  let mongod;
  let server;
  let baseUrl;
  const originalFind = Invoice.find;

  before(async () => {
    mongod = await connectTestDatabase();
    server = await listen(createApp());
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  });

  after(async () => {
    await close(server);
    await closeTestDatabase(mongod);
  });

  afterEach(() => {
    Invoice.find = originalFind;
  });

  it('answers unknown routes with a JSON 404', async () => {
    const response = await fetch(`${baseUrl}/api/nowhere`);

    assert.equal(response.status, 404);
    assert.match(response.headers.get('content-type'), /application\/json/);
    assert.deepEqual(await response.json(), { message: 'Route not found' });
  });

  it('answers malformed JSON bodies with a JSON 400', async () => {
    const response = await fetch(`${baseUrl}/api/invoices/INV-1/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{not json',
    });

    assert.equal(response.status, 400);
    assert.match(response.headers.get('content-type'), /application\/json/);
    assert.deepEqual(await response.json(), { message: 'Request body must be valid JSON' });
  });

  it('hides internal error details behind a generic 500', async () => {
    Invoice.find = () => {
      throw new Error('connection string leaked: mongodb://user:secret@host');
    };

    const response = await fetch(`${baseUrl}/api/invoices`);
    const text = await response.text();

    assert.equal(response.status, 500);
    assert.deepEqual(JSON.parse(text), { message: 'Internal server error' });
    assert.ok(!text.includes('secret'));
  });

  it('does not advertise the framework in response headers', async () => {
    const response = await fetch(`${baseUrl}/`);

    assert.equal(response.headers.get('x-powered-by'), null);
  });
});
