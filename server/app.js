const express = require('express');
const cors = require('cors');
const invoiceRoutes = require('./routes/invoices');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const createApp = () => {
  const app = express();

  app.disable('x-powered-by');
  app.use(cors());
  app.use(express.json());

  app.get('/', (req, res) => {
    res.send('Invoice API is running');
  });

  app.use('/api/invoices', invoiceRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};

module.exports = createApp;
