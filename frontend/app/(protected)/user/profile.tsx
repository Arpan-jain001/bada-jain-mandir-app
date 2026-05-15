import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../stores/authStore';
import { AppLanguage, usePreferencesStore } from '../../../stores/preferencesStore';

export default function ProfileScreen() {
  const { user, loading, updateProfile } = useAuthStore();
  const { language, setLanguage, t } = usePreferencesStore();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');

  useEffect(() => {
    setName(user?.name || '');
    setPhone(user?.phone || '');
  }, [user]);

  const saveProfile = async () => {
    try {
      await updateProfile({ name: name.trim(), phone: phone.trim() });
      Alert.alert(t('profile'), t('detailsSaved'));
    } catch (error: any) {
      Alert.alert(t('profile'), error?.response?.data?.message || 'Unable to save profile');
    }
  };

  const selectLanguage = async (nextLanguage: AppLanguage) => {
    await setLanguage(nextLanguage);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#FF9933', '#FF7722']} style={styles.header}>
        <Text style={styles.headerTitle}>{t('profile')}</Text>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={52} color="#FF9933" />
        </View>
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('editProfile')}</Text>
          <Text style={styles.label}>{t('name')}</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            style={styles.input}
            placeholder={t('name')}
          />
          <Text style={styles.label}>{t('phone')}</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            style={styles.input}
            placeholder={t('phone')}
            keyboardType="phone-pad"
          />
          <TouchableOpacity style={styles.saveButton} onPress={saveProfile} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Ionicons name="save" size={20} color="#FFF" />
                <Text style={styles.saveButtonText}>{t('saveChanges')}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('language')}</Text>
          <View style={styles.languageRow}>
            {(['en', 'hi'] as AppLanguage[]).map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.languageButton, language === item && styles.activeLanguageButton]}
                onPress={() => selectLanguage(item)}
              >
                <Text style={[styles.languageText, language === item && styles.activeLanguageText]}>
                  {item === 'en' ? t('english') : t('hindi')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#FFF' },
  content: { padding: 20 },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 12,
    elevation: 2,
  },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#333', textAlign: 'center' },
  userEmail: { fontSize: 14, color: '#777', textAlign: 'center', marginTop: 4, marginBottom: 20 },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 14 },
  label: { fontSize: 14, color: '#555', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 16,
    color: '#333',
  },
  saveButton: {
    height: 48,
    borderRadius: 10,
    backgroundColor: '#FF9933',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  saveButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  languageRow: { flexDirection: 'row', gap: 12 },
  languageButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeLanguageButton: { backgroundColor: '#FF9933', borderColor: '#FF9933' },
  languageText: { fontSize: 16, fontWeight: '600', color: '#666' },
  activeLanguageText: { color: '#FFF' },
});
