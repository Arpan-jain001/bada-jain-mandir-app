import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  resetNotificationPreferences,
  NotificationPreferences,
  DEFAULT_PREFERENCES,
} from '../../services/preferencesService';
import { usePreferencesStore } from '../../stores/preferencesStore';

interface PreferenceToggleProps {
  label: string;
  description?: string;
  value: boolean;
  onToggle: (value: boolean) => void;
  disabled?: boolean;
  icon?: string;
}

interface DeliveryModeOption {
  label: string;
  value: 'push' | 'email' | 'both';
}

const PreferenceToggle: React.FC<PreferenceToggleProps> = ({
  label,
  description,
  value,
  onToggle,
  disabled = false,
  icon = 'notifications',
}) => (
  <View style={styles.preferenceRow}>
    <View style={styles.preferenceContent}>
      <View style={styles.preferenceHeader}>
        <Ionicons name={icon as any} size={20} color="#FF9933" style={styles.preferenceIcon} />
        <Text style={styles.preferenceLabel}>{label}</Text>
      </View>
      {description && <Text style={styles.preferenceDescription}>{description}</Text>}
    </View>
    <Switch
      value={value}
      onValueChange={onToggle}
      disabled={disabled}
      trackColor={{ false: '#DDD', true: '#FFE4D0' }}
      thumbColor={value ? '#FF9933' : '#888'}
    />
  </View>
);

interface NotificationPreferencesProps {
  onSave?: () => void;
  showHeader?: boolean;
}

export default function NotificationPreferencesComponent({
  onSave,
  showHeader = false,
}: NotificationPreferencesProps) {
  const { t } = usePreferencesStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);

  const deliveryModes: DeliveryModeOption[] = [
    { label: t('pushOnly'), value: 'push' },
    { label: t('emailOnly'), value: 'email' },
    { label: t('both'), value: 'both' },
  ];

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const prefs = await getNotificationPreferences();
      setPreferences(prefs);
    } catch (error: any) {
      console.error('Failed to load preferences:', error);
      Alert.alert(t('error'), t('failedToLoadPreferences'));
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key: keyof NotificationPreferences, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const handleDeliveryModeChange = (mode: 'push' | 'email' | 'both') => {
    setPreferences(prev => ({ ...prev, deliveryMode: mode }));
  };

  const savePreferences = async () => {
    try {
      setSaving(true);
      await updateNotificationPreferences(preferences);
      Alert.alert(t('success'), t('preferencesUpdated'));
      onSave?.();
    } catch (error: any) {
      const message = error?.response?.data?.message || t('failedToUpdatePreferences');
      Alert.alert(t('error'), message);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    Alert.alert(
      t('confirmReset'),
      t('resetPreferencesMessage'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('reset'),
          style: 'destructive',
          onPress: async () => {
            try {
              setSaving(true);
              const reset = await resetNotificationPreferences();
              setPreferences(reset);
              Alert.alert(t('success'), t('preferencesReset'));
            } catch (error: any) {
              Alert.alert(t('error'), t('failedToResetPreferences'));
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF9933" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {showHeader && (
        <LinearGradient colors={['#FF9933', '#FF7722']} style={styles.header}>
          <Text style={styles.headerTitle}>{t('notificationPreferences')}</Text>
        </LinearGradient>
      )}

      <View style={styles.content}>
        {/* Master Enable/Disable */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('mainSettings')}</Text>
          <View style={styles.sectionContent}>
            <PreferenceToggle
              label={t('allNotifications')}
              description={t('allNotificationsDesc')}
              value={preferences.pushEnabled}
              onToggle={(value) => handleToggle('pushEnabled', value)}
              icon="bell"
            />
          </View>
        </View>

        {/* Notification Types */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('notificationTypes')}</Text>
          <View style={styles.sectionContent}>
            <PreferenceToggle
              label={t('promotionalNotifications')}
              description={t('promotionalDesc')}
              value={preferences.promotionalEnabled}
              onToggle={(value) => handleToggle('promotionalEnabled', value)}
              icon="gift"
            />
            <PreferenceToggle
              label={t('appUpdateNotifications')}
              description={t('appUpdateDesc')}
              value={preferences.updateEnabled}
              onToggle={(value) => handleToggle('updateEnabled', value)}
              icon="download"
            />
            <PreferenceToggle
              label={t('announcementNotifications')}
              description={t('announcementDesc')}
              value={preferences.announcementsEnabled}
              onToggle={(value) => handleToggle('announcementsEnabled', value)}
              icon="megaphone"
            />
            <PreferenceToggle
              label={t('eventNotifications')}
              description={t('eventDesc')}
              value={preferences.eventEnabled}
              onToggle={(value) => handleToggle('eventEnabled', value)}
              icon="calendar"
            />
            <PreferenceToggle
              label={t('chatNotifications')}
              description={t('chatDesc')}
              value={preferences.chatEnabled}
              onToggle={(value) => handleToggle('chatEnabled', value)}
              icon="chatbubble"
            />
          </View>
        </View>

        {/* Delivery Mode */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('deliveryMode')}</Text>
          <Text style={styles.sectionDescription}>{t('deliveryModeDesc')}</Text>
          <View style={styles.sectionContent}>
            {deliveryModes.map((mode) => (
              <TouchableOpacity
                key={mode.value}
                style={[
                  styles.deliveryModeOption,
                  preferences.deliveryMode === mode.value && styles.deliveryModeOptionActive,
                ]}
                onPress={() => handleDeliveryModeChange(mode.value)}
                disabled={saving}
              >
                <View
                  style={[
                    styles.deliveryModeRadio,
                    preferences.deliveryMode === mode.value && styles.deliveryModeRadioActive,
                  ]}
                >
                  {preferences.deliveryMode === mode.value && (
                    <View style={styles.deliveryModeRadioDot} />
                  )}
                </View>
                <Text
                  style={[
                    styles.deliveryModeLabel,
                    preferences.deliveryMode === mode.value && styles.deliveryModeLabelActive,
                  ]}
                >
                  {mode.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Email Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('emailSettings')}</Text>
          <Text style={styles.sectionDescription}>{t('securityEmailsNote')}</Text>
          <View style={styles.sectionContent}>
            <PreferenceToggle
              label={t('promotionalEmails')}
              description={t('promotionalEmailsDesc')}
              value={preferences.promotionalEmailsEnabled}
              onToggle={(value) => handleToggle('promotionalEmailsEnabled', value)}
              icon="megaphone"
            />
          </View>
        </View>

        {/* Quiet Mode */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('quietMode')}</Text>
          <Text style={styles.sectionDescription}>{t('quietModeDesc')}</Text>
          <View style={styles.sectionContent}>
            <PreferenceToggle
              label={t('enableQuietMode')}
              description={t('quietModeNote')}
              value={preferences.quietMode}
              onToggle={(value) => handleToggle('quietMode', value)}
              icon="moon"
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.resetButton]}
            onPress={handleReset}
            disabled={saving}
          >
            <Ionicons name="refresh" size={20} color="#FF7722" />
            <Text style={styles.resetButtonText}>{t('resetToDefaults')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={savePreferences}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Ionicons name="save" size={20} color="#FFF" />
                <Text style={styles.saveButtonText}>{t('saveChanges')}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
  content: {
    padding: 16,
    paddingBottom: 24,
  },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  sectionDescription: {
    fontSize: 13,
    color: '#777',
    paddingHorizontal: 16,
    paddingBottom: 12,
    marginTop: -4,
  },
  sectionContent: {
    paddingHorizontal: 0,
    paddingBottom: 4,
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  preferenceContent: {
    flex: 1,
    marginRight: 12,
  },
  preferenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  preferenceIcon: {
    marginRight: 8,
  },
  preferenceLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  preferenceDescription: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  deliveryModeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  deliveryModeOptionActive: {
    backgroundColor: '#FFF9F5',
  },
  deliveryModeRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CCC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  deliveryModeRadioActive: {
    borderColor: '#FF9933',
  },
  deliveryModeRadioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF9933',
  },
  deliveryModeLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#666',
  },
  deliveryModeLabelActive: {
    color: '#FF9933',
    fontWeight: '600',
  },
  buttonContainer: {
    gap: 12,
    marginTop: 8,
  },
  button: {
    height: 48,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveButton: {
    backgroundColor: '#FF9933',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resetButton: {
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#FF7722',
  },
  resetButtonText: {
    color: '#FF7722',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
