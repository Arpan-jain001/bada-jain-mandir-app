import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { api } from '../../../utils/api';
import { unwrapData } from '../../../utils/dataApi';
import { usePreferencesStore } from '../../../stores/preferencesStore';

export default function LiveDarshanScreen() {
  const t = usePreferencesStore((state) => state.t);
  const [live, setLive] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/live-darshan').then((response) => setLive(unwrapData(response))).finally(() => setLoading(false));
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#FF9933', '#FF7722']} style={styles.header}>
        <Text style={styles.headerTitle}>{t('liveDarshan')}</Text>
      </LinearGradient>
      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#FF9933" /></View>
      ) : live?.is_live && live?.embed_url ? (
        <WebView source={{ uri: live.embed_url }} style={styles.video} allowsFullscreenVideo javaScriptEnabled />
      ) : (
        <View style={styles.center}>
          <Ionicons name="videocam-off" size={80} color="#CCC" />
          <Text style={styles.emptyText}>{t('offlineLiveDarshan')}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#FFF' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  emptyText: { marginTop: 16, color: '#999', fontSize: 16 },
  video: { flex: 1, backgroundColor: '#000' },
});
