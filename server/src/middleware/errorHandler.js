const notFound = (req, res) => {
  res.status(404).json({ message: 'Route not found' });
};

// Express recognises error handlers by their four-argument signature, so next stays even though it is unused.
const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Request body must be valid JSON' });
  }

  if (error.status >= 400 && error.status < 500 && error.expose) {
    return res.status(error.status).json({ message: error.message });
  }

  console.error(error);
  res.status(500).json({ message: 'Internal server error' });
};

module.exports = {
  notFound,
  errorHandler,
};
