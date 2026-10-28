const dotenv = require('dotenv');
const connectDB = require('./db');
const createApp = require('./app');
const { readConfig } = require('./config');

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
