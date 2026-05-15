const AppVersion = require('../models/AppVersion');
const Setting = require('../models/Setting');
const asyncHandler = require('../utils/asyncHandler');
const env = require('../config/env');
const { sendPushToUsers } = require('../services/notificationService');

function compareBuild(current, latest) {
  return Number(latest || 0) > Number(current || 0);
}

exports.checkVersion = asyncHandler(async (req, res) => {
  const platform = req.query.platform || req.body.platform || 'android';
  const build = req.query.build_number || req.body.build_number || 1;
  const latest = await AppVersion.findOne({ platform, is_active: true }).sort('-build_number');
  if (!latest) {
    return res.json({ update_available: false, force_update: false, play_store_url: env.playStoreUrl });
  }
  res.json({
    update_available: compareBuild(build, latest.build_number),
    force_update: latest.force_update,
    latest_version: latest.version,
    latest_build_number: latest.build_number,
    update_message: latest.update_message,
    changelog: latest.changelog || [],
    play_store_url: latest.store_url || env.playStoreUrl,
    indus_appstore_url: latest.indus_store_url || env.indusAppstoreUrl,
    android_package_name: env.androidPackageName,
    indus_installer_package: env.indusInstallerPackage
  });
});

exports.upsertVersion = asyncHandler(async (req, res) => {
  const version = await AppVersion.create({
    platform: req.body.platform || 'android',
    version: req.body.version,
    build_number: req.body.build_number,
    force_update: !!req.body.force_update,
    update_message: req.body.update_message,
    changelog: req.body.changelog || [],
    store_url: req.body.store_url || env.playStoreUrl,
    indus_store_url: req.body.indus_store_url || env.indusAppstoreUrl
  });

  let notification = null;
  if (req.body.notify_users ?? true) {
    notification = await sendPushToUsers({
      title: req.body.notification_title || 'App Update Available',
      message: req.body.update_message || 'A new version is available. Please update the app.',
      category: 'updates'
    });
  }

  res.status(201).json({ version, notification });
});

exports.forceUpdateConfig = asyncHandler(async (req, res) => {
  const latest = await AppVersion.findOne({ platform: req.query.platform || 'android', is_active: true }).sort('-build_number');
  res.json({
    force_update: !!latest?.force_update,
    latest_version: latest?.version,
    latest_build_number: latest?.build_number,
    update_message: latest?.update_message,
    changelog: latest?.changelog || [],
    play_store_url: latest?.store_url || env.playStoreUrl,
    indus_appstore_url: latest?.indus_store_url || env.indusAppstoreUrl
  });
});

exports.publicSettings = asyncHandler(async (req, res) => {
  const settings = await Setting.find({ public: true });
  res.json({
    app_name: env.appName,
    website_url: env.websiteUrl,
    play_store_url: env.playStoreUrl,
    settings
  });
});

exports.upsertSetting = asyncHandler(async (req, res) => {
  const setting = await Setting.findOneAndUpdate(
    { key: req.params.key },
    { key: req.params.key, value: req.body.value, public: !!req.body.public },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  res.json(setting);
});
