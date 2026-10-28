const DEFAULT_PORT = 5000;

const parsePort = (value) => {
  if (value === undefined || value === '') {
    return DEFAULT_PORT;
  }

  const port = Number(value);
  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    throw new Error(`PORT must be an integer between 0 and 65535, got "${value}"`);
  }

  return port;
};

const parseOrigins = (value) => {
  const origins = (value || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return origins.length > 0 ? origins : null;
};

// Reads and validates environment variables once, so bad configuration fails at start-up.
const readConfig = (env = process.env) => {
  if (!env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not set. Copy server/.env.example to server/.env and set it.');
  }

  return {
    mongoUri: env.MONGODB_URI,
    port: parsePort(env.PORT),
    corsOrigins: parseOrigins(env.CORS_ORIGIN),
  };
};

module.exports = {
  readConfig,
};
