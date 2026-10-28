const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const createApp = require('../src/app');
const { listen, close } = require('./helpers');

const withServer = async (options, check) => {
  const server = await listen(createApp(options));
  try {
    await check(`http://127.0.0.1:${server.address().port}`);
  } finally {
    await close(server);
  }
};

const originFor = (baseUrl, origin) =>
  fetch(`${baseUrl}/`, { headers: { Origin: origin } }).then((response) =>
    response.headers.get('access-control-allow-origin'),
  );

describe('CORS', () => {
  it('allows any origin when no origins are configured', () =>
    withServer({}, async (baseUrl) => {
      assert.equal(await originFor(baseUrl, 'https://anywhere.example'), '*');
    }));

  it('allows only the configured origins when a list is given', () =>
    withServer({ corsOrigins: ['https://app.example'] }, async (baseUrl) => {
      assert.equal(await originFor(baseUrl, 'https://app.example'), 'https://app.example');
      assert.equal(await originFor(baseUrl, 'https://evil.example'), null);
    }));
});
