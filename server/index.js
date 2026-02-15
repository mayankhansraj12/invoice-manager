const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./db');
const invoiceRoutes = require('./routes/invoices');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
connectDB();

// Routes
app.use('/api/invoices', invoiceRoutes);

app.get('/', (req, res) => {
  res.send('Invoice API is running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
