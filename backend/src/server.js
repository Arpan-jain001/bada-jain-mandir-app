const app = require('./app');
const connectDatabase = require('./config/db');
const env = require('./config/env');
const logger = require('./utils/logger');
const seedAdmin = require('./jobs/seedAdmin');

async function start() {
  await connectDatabase();
  await seedAdmin();
  app.listen(env.port, () => {
    logger.info(`${env.appName} API listening on port ${env.port}`);
  });
}

start().catch((error) => {
  logger.error(error);
  process.exit(1);
});
