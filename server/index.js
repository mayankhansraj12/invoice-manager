const dotenv = require('dotenv');
const connectDB = require('./db');
const createApp = require('./app');

dotenv.config();

const PORT = process.env.PORT || 5000;

connectDB();

createApp().listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
