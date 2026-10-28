const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { readConfig } = require('../config');

const withUri = (env = {}) => ({ MONGODB_URI: 'mongodb://127.0.0.1:27017/test', ...env });

describe('readConfig', () => {
  it('requires MONGODB_URI and says how to provide it', () => {
    assert.throws(() => readConfig({}), /MONGODB_URI is not set/);
  });

  it('defaults the port to 5000', () => {
    assert.equal(readConfig(withUri()).port, 5000);
  });

  it('reads PORT as a number', () => {
    assert.equal(readConfig(withUri({ PORT: '10000' })).port, 10000);
  });

  it('rejects a PORT that is not a whole number between 0 and 65535', () => {
    for (const PORT of ['abc', '70000', '-1', '80.5']) {
      assert.throws(() => readConfig(withUri({ PORT })), /PORT must be an integer/, `PORT=${PORT}`);
    }
  });

  it('reads CORS_ORIGIN as a list and leaves CORS unrestricted when it is unset', () => {
    const restricted = readConfig(withUri({ CORS_ORIGIN: 'https://a.test, https://b.test' }));

    assert.deepEqual(restricted.corsOrigins, ['https://a.test', 'https://b.test']);
    assert.equal(readConfig(withUri()).corsOrigins, null);
  });
});
