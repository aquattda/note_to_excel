const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const env = require('./config/env');
const notesRoutes = require('./routes/notesRoutes');
const groupsRoutes = require('./routes/groupsRoutes');
const excelRoutes = require('./routes/excelRoutes');
const { errorHandler } = require('./middlewares/errorHandler');

function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.corsOrigin }));
  app.use(express.json());
  app.use(morgan('dev'));

  app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Backend is running' });
  });

  app.use('/api/notes', notesRoutes);
  app.use('/api/groups', groupsRoutes);
  app.use('/api/excel', excelRoutes);

  const frontendDistPath = path.resolve(__dirname, '..', '..', 'frontend', 'dist');
  app.use(express.static(frontendDistPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return next();
    }
    return res.sendFile(path.join(frontendDistPath, 'index.html'));
  });

  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
