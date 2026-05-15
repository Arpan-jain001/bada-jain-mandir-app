const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

const env = require('./config/env');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(compression());

app.use(
  cors({
    origin:
      env.appOrigin === '*'
        ? true
        : env.appOrigin.split(',').map((item) => item.trim()),
    credentials: true
  })
);

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

app.use(mongoSanitize());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: env.nodeEnv === 'production' ? 300 : 2000,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.use(
  morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  })
);

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Bada Jain Mandir Parham API Running Successfully'
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy'
  });
});

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;