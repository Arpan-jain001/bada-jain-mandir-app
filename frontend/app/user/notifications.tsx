import React, { useEffect } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { usePreferencesStore } from '../../stores/preferencesStore';
import { UserNotification, useUserNotificationStore } from '../../stores/userNotificationStore';

const getItemTime = (item: UserNotification) => item.sent_at || item.created_at;

export default function NotificationsScreen() {
  const t = usePreferencesStore((state) => state.t);
  const { notifications, unreadCount, loading, fetchNotifications, markAllRead } = useUserNotificationStore();

  useEffect(() => {
    fetchNotifications().catch(() => undefined);
  }, [fetchNotifications]);

  const renderItem = ({ item }: { item: UserNotification }) => (
    <View style={styles.notificationCard}>
      <View style={styles.iconWrap}>
        <Ionicons name="notifications" size={22} color="#FF9933" />
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationMessage}>{item.message}</Text>
        {getItemTime(item) && (
          <Text style={styles.notificationDate}>
            {new Date(getItemTime(item) as string).toLocaleString()}
          </Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#FF9933', '#FF7722']} style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{t('notifications')}</Text>
          <Text style={styles.headerSubtitle}>{unreadCount} {t('unread')}</Text>
        </View>
        {notifications.length > 0 && (
          <TouchableOpacity style={styles.readButton} onPress={markAllRead}>
            <Text style={styles.readButtonText}>{t('markAllRead')}</Text>
          </TouchableOpacity>
        )}
      </LinearGradient>

      {loading && notifications.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FF9933" />
          <Text style={styles.loadingText}>{t('loadingNotifications')}</Text>
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="notifications-off-outline" size={80} color="#CCC" />
          <Text style={styles.emptyText}>{t('noNotifications')}</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item, index) => item._id || item.id || String(index)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={fetchNotifications} colors={['#FF9933']} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#FFF' },
  headerSubtitle: { fontSize: 14, color: '#FFF', opacity: 0.9, marginTop: 4 },
  readButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 8,
  },
  readButtonText: { color: '#FFF', fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  loadingText: { marginTop: 12, fontSize: 16, color: '#666' },
  emptyText: { marginTop: 16, fontSize: 16, color: '#999' },
  listContent: { padding: 16 },
  notificationCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    elevation: 2,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFF3E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationContent: { flex: 1 },
  notificationTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  notificationMessage: { fontSize: 14, color: '#666', lineHeight: 20 },
  notificationDate: { fontSize: 12, color: '#999', marginTop: 8 },
});
