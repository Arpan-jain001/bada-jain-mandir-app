import { Alert, Linking } from 'react-native';
import Constants from 'expo-constants';
import { api } from './api';

const extra = Constants.expoConfig?.extra || {};

const openUpdateUrl = async (update: any) => {
  const indusUrl = update.indus_appstore_url || extra.INDUS_APPSTORE_URL;
  const playUrl = update.play_store_url || extra.PLAY_STORE_URL;
  const target = indusUrl || playUrl;
  if (!target) return;

  const canOpen = await Linking.canOpenURL(target).catch(() => false);
  await Linking.openURL(canOpen ? target : playUrl || target);
};

export const checkForAppUpdate = async () => {
  const buildNumber = Number(Constants.expoConfig?.android?.versionCode || 1);
  const response = await api.get('/app/version/check', {
    params: {
      platform: 'android',
      build_number: buildNumber,
      version: Constants.expoConfig?.version,
    },
  });

  const update = response.data;
  if (!update?.update_available) return;

  const changelog = Array.isArray(update.changelog) && update.changelog.length > 0
    ? `\n\n${update.changelog.map((item: string) => `• ${item}`).join('\n')}`
    : '';

  Alert.alert(
    update.force_update ? 'Update Required' : 'Update Available',
    `${update.update_message || 'A new version is available.'}${changelog}`,
    [
      ...(update.force_update ? [] : [{ text: 'Later', style: 'cancel' as const }]),
      { text: 'Update Now', onPress: () => openUpdateUrl(update) },
    ],
    { cancelable: !update.force_update }
  );
};
