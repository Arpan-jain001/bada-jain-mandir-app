import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { api } from '../../utils/api';
import { unwrapData } from '../../utils/dataApi';

export default function AdminLiveDarshanScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('Live Darshan');
  const [embedCode, setEmbedCode] = useState('');
  const [isLive, setIsLive] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/live-darshan').then((response) => {
      const data = unwrapData(response);
      setTitle(data.title || 'Live Darshan');
      setEmbedCode(data.embed_code || data.embed_url || '');
      setIsLive(!!data.is_live);
    }).catch(() => undefined);
  }, []);

  const save = async (goLive: boolean) => {
    if (goLive && !embedCode) {
      Alert.alert('Error', 'Please paste YouTube embed code or embed URL');
      return;
    }
    setSaving(true);
    try {
      await api.put('/live-darshan', { title, embed_code: embedCode, is_live: goLive, notify: goLive });
      setIsLive(goLive);
      Alert.alert('Success', goLive ? 'Live Darshan started and users notified' : 'Live Darshan stopped');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to update Live Darshan');
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
        <Text style={styles.headerTitle}>Live Darshan</Text>
      </LinearGradient>
      <View style={styles.form}>
        <Text style={styles.label}>Title</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} />
        <Text style={styles.label}>YouTube Embed Code / URL</Text>
        <TextInput style={[styles.input, styles.textArea]} value={embedCode} onChangeText={setEmbedCode} multiline textAlignVertical="top" />
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Currently Live</Text>
          <Switch value={isLive} onValueChange={(value) => save(value)} trackColor={{ false: '#CCC', true: '#FF9933' }} thumbColor="#FFF" />
        </View>
        <TouchableOpacity style={styles.button} onPress={() => save(!isLive)} disabled={saving}>
          <LinearGradient colors={['#FF9933', '#FF7722']} style={styles.buttonGradient}>
            {saving ? <ActivityIndicator color="#FFF" /> : <Ionicons name={isLive ? 'stop-circle' : 'radio'} size={22} color="#FFF" />}
            <Text style={styles.buttonText}>{isLive ? 'Stop Live' : 'Go Live'}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { paddingTop: 50, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' },
  backButton: { marginRight: 12 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  form: { backgroundColor: '#FFF', margin: 20, padding: 20, borderRadius: 16, elevation: 2 },
  label: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#DDD', borderRadius: 12, padding: 12, fontSize: 16, marginBottom: 16, backgroundColor: '#F9F9F9' },
  textArea: { height: 150 },
  switchContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  switchLabel: { fontSize: 16, fontWeight: '600', color: '#333' },
  button: { borderRadius: 12, overflow: 'hidden' },
  buttonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16 },
  buttonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginLeft: 8 },
});
