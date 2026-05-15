import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { api } from '../../utils/api';

const DEFAULT_EMBED = '<iframe width="560" height="315" src="https://www.youtube.com/embed/GgxAAJe2sMM?si=rIQV2ychNU6JGwfg" title="YouTube video player" frameborder="0" allowfullscreen></iframe>';

export default function AdminTempleVideoScreen() {
  const router = useRouter();
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/app/settings')
      .then((response) => {
        const setting = response.data?.settings?.find((item: any) => item.key === 'temple_video_url');
        setVideoUrl(setting?.value || DEFAULT_EMBED);
      })
      .catch(() => setVideoUrl(DEFAULT_EMBED))
      .finally(() => setLoading(false));
  }, []);

  const saveVideo = async () => {
    if (!videoUrl.trim()) {
      Alert.alert('Error', 'Please enter YouTube embed URL or iframe');
      return;
    }

    setSaving(true);
    try {
      await api.put('/app/settings/temple_video_url', {
        value: videoUrl.trim(),
        public: true,
      });
      Alert.alert('Success', 'Temple video updated successfully');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to update temple video');
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
        <Text style={styles.headerTitle}>Temple Video</Text>
      </LinearGradient>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.infoCard}>
          <Ionicons name="logo-youtube" size={24} color="#E53935" />
          <Text style={styles.infoText}>
            Paste a YouTube embed URL or iframe. The login screen video will update automatically.
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>YouTube Embed URL / iframe</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={videoUrl}
            onChangeText={setVideoUrl}
            placeholder="https://www.youtube.com/embed/..."
            multiline
            numberOfLines={7}
            textAlignVertical="top"
          />

          <TouchableOpacity style={styles.saveButton} onPress={saveVideo} disabled={loading || saving}>
            <LinearGradient colors={['#FF9933', '#FF7722']} style={styles.saveButtonGradient}>
              {saving || loading ? <ActivityIndicator color="#FFF" /> : <Ionicons name="save" size={20} color="#FFF" />}
              <Text style={styles.saveButtonText}>{saving ? '  Saving...' : '  Save Video'}</Text>
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
  infoCard: { flexDirection: 'row', backgroundColor: '#FFEBEE', padding: 16, borderRadius: 12, marginBottom: 20 },
  infoText: { flex: 1, marginLeft: 12, fontSize: 14, color: '#C62828', lineHeight: 20 },
  form: { backgroundColor: '#FFF', borderRadius: 20, padding: 20 },
  label: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#DDD', borderRadius: 12, padding: 12, fontSize: 16, marginBottom: 20, backgroundColor: '#F9F9F9' },
  textArea: { height: 170 },
  saveButton: { borderRadius: 12, overflow: 'hidden', marginTop: 4 },
  saveButtonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16 },
  saveButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});
