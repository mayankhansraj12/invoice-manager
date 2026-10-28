const express = require('express');
const cors = require('cors');
const invoiceRoutes = require('./routes/invoices');

const createApp = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/', (req, res) => {
    res.send('Invoice API is running');
  });

  app.use('/api/invoices', invoiceRoutes);

  return app;
};

module.exports = createApp;
