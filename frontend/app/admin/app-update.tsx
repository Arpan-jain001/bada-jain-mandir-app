import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { api } from '../../utils/api';

export default function AdminAppUpdateScreen() {
  const router = useRouter();
  const [version, setVersion] = useState('1.0.1');
  const [buildNumber, setBuildNumber] = useState('2');
  const [message, setMessage] = useState('A new version is available. Please update the app.');
  const [changelog, setChangelog] = useState('');
  const [forceUpdate, setForceUpdate] = useState(false);
  const [notifyUsers, setNotifyUsers] = useState(true);
  const [saving, setSaving] = useState(false);

  const publishUpdate = async () => {
    const build = Number(buildNumber);
    if (!version.trim() || !build || build < 1) {
      Alert.alert('Error', 'Please enter valid version and build number');
      return;
    }

    setSaving(true);
    try {
      const response = await api.post('/app/versions', {
        platform: 'android',
        version: version.trim(),
        build_number: build,
        force_update: forceUpdate,
        update_message: message.trim(),
        changelog: changelog.split('\n').map((item) => item.trim()).filter(Boolean),
        notify_users: notifyUsers,
      });
      const sent = response.data?.notification?.sent || 0;
      Alert.alert('Success', `App update published.${notifyUsers ? `\nPush sent: ${sent}` : ''}`);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to publish app update');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#FF9933', '#FF7722']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>App Update</Text>
      </LinearGradient>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.infoCard}>
          <Ionicons name="cloud-upload" size={24} color="#455A64" />
          <Text style={styles.infoText}>
            Publish a new build number after releasing an APK. Users will see update alerts and can receive a push notification.
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Version</Text>
          <TextInput style={styles.input} value={version} onChangeText={setVersion} placeholder="1.0.1" />

          <Text style={styles.label}>Build Number</Text>
          <TextInput style={styles.input} value={buildNumber} onChangeText={setBuildNumber} keyboardType="numeric" placeholder="2" />

          <Text style={styles.label}>Update Message</Text>
          <TextInput style={[styles.input, styles.textArea]} value={message} onChangeText={setMessage} multiline numberOfLines={4} textAlignVertical="top" />

          <Text style={styles.label}>Changelog</Text>
          <TextInput style={[styles.input, styles.textArea]} value={changelog} onChangeText={setChangelog} placeholder="One change per line" multiline numberOfLines={5} textAlignVertical="top" />

          <View style={styles.switchContainer}>
            <View style={styles.switchRow}>
              <Ionicons name="alert-circle" size={24} color="#FF5722" />
              <Text style={styles.switchLabel}>Force Update</Text>
            </View>
            <Switch value={forceUpdate} onValueChange={setForceUpdate} trackColor={{ false: '#CCC', true: '#FF9933' }} thumbColor="#FFF" />
          </View>

          <View style={styles.switchContainer}>
            <View style={styles.switchRow}>
              <Ionicons name="notifications" size={24} color="#FF9933" />
              <Text style={styles.switchLabel}>Notify Users</Text>
            </View>
            <Switch value={notifyUsers} onValueChange={setNotifyUsers} trackColor={{ false: '#CCC', true: '#FF9933' }} thumbColor="#FFF" />
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={publishUpdate} disabled={saving}>
            <LinearGradient colors={['#FF9933', '#FF7722']} style={styles.saveButtonGradient}>
              {saving ? <ActivityIndicator color="#FFF" /> : <Ionicons name="cloud-upload" size={20} color="#FFF" />}
              <Text style={styles.saveButtonText}>{saving ? '  Publishing...' : '  Publish Update'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { paddingTop: 50, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' },
  backButton: { marginRight: 12 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20 },
  infoCard: { flexDirection: 'row', backgroundColor: '#ECEFF1', padding: 16, borderRadius: 12, marginBottom: 20 },
  infoText: { flex: 1, marginLeft: 12, fontSize: 14, color: '#455A64', lineHeight: 20 },
  form: { backgroundColor: '#FFF', borderRadius: 20, padding: 20 },
  label: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#DDD', borderRadius: 12, padding: 12, fontSize: 16, marginBottom: 20, backgroundColor: '#F9F9F9' },
  textArea: { height: 110 },
  switchContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  switchRow: { flexDirection: 'row', alignItems: 'center' },
  switchLabel: { fontSize: 16, fontWeight: '500', color: '#333', marginLeft: 12 },
  saveButton: { borderRadius: 12, overflow: 'hidden', marginTop: 24 },
  saveButtonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16 },
  saveButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});
