const dotenv = require('dotenv');
const connectDB = require('./src/db');
const createApp = require('./src/app');
const { readConfig } = require('./src/config');

dotenv.config();

let config;
try {
  config = readConfig();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

connectDB(config.mongoUri);

createApp({ corsOrigins: config.corsOrigins }).listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
