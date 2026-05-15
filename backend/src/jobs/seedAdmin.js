const User = require('../models/User');
const AppVersion = require('../models/AppVersion');
const env = require('../config/env');
const logger = require('../utils/logger');

async function seedAdmin() {
  const existing = await User.findOne({ email: env.admin.email });
  if (!existing) {
    await User.create({
      name: env.admin.name,
      email: env.admin.email,
      password: env.admin.password,
      phone: env.admin.phone,
      is_admin: true
    });
    logger.info('Default admin user created');
  }

  const version = await AppVersion.findOne({ platform: 'android', is_active: true });
  if (!version) {
    await AppVersion.create({
      platform: 'android',
      version: '1.0.0',
      build_number: 1,
      force_update: false,
      store_url: env.playStoreUrl
    });
    logger.info('Default Android app version created');
  }
}

if (require.main === module) {
  const connectDatabase = require('../config/db');
  connectDatabase()
    .then(seedAdmin)
    .then(() => process.exit(0))
    .catch((error) => {
      logger.error(error);
      process.exit(1);
    });
}

module.exports = seedAdmin;
