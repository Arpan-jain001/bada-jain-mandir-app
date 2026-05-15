import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/authStore';
import { useRouter } from 'expo-router';
import * as Animatable from 'react-native-animatable';

const menuItems = [
  { id: 'gallery', title: 'Gallery', icon: 'images', color: '#FF9933', route: '/admin/gallery' },
  { id: 'projects', title: 'Projects', icon: 'folder-open', color: '#2196F3', route: '/admin/projects' },
  { id: 'work', title: 'Recent Work', icon: 'briefcase', color: '#4CAF50', route: '/admin/recent-work' },
  { id: 'committee', title: 'Committee', icon: 'people', color: '#9C27B0', route: '/admin/committee' },
  { id: 'events', title: 'Events', icon: 'calendar', color: '#FF5722', route: '/admin/events' },
  { id: 'notifications', title: 'Send Notification', icon: 'notifications', color: '#00BCD4', route: '/admin/notifications' },
  { id: 'video', title: 'Temple Video', icon: 'logo-youtube', color: '#E53935', route: '/admin/temple-video' },
  { id: 'update', title: 'App Update', icon: 'cloud-upload', color: '#607D8B', route: '/admin/app-update' },
  { id: 'donations', title: 'Donations', icon: 'heart', color: '#D32F2F', route: '/admin/donations' },
  { id: 'live', title: 'Live Darshan', icon: 'radio', color: '#795548', route: '/admin/live-darshan' },
];

export default function AdminDashboard() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/auth/login');
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FF9933', '#FF7722']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.welcomeText}>Admin Panel</Text>
            <Text style={styles.userName}>{user?.name}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Animatable.View animation="fadeInUp" style={styles.welcomeCard}>
          <Ionicons name="shield-checkmark" size={48} color="#FF9933" />
          <Text style={styles.welcomeTitle}>Welcome to Admin Dashboard</Text>
          <Text style={styles.welcomeDescription}>
            Manage all temple content, committee members, events and send notifications to users.
          </Text>
        </Animatable.View>

        <Text style={styles.sectionTitle}>Management</Text>

        <View style={styles.menuGrid}>
          {menuItems.map((item, index) => (
            <Animatable.View
              key={item.id}
              animation="fadeInUp"
              delay={index * 100}
              style={styles.menuItemContainer}
            >
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => router.push(item.route as any)}
              >
                <LinearGradient
                  colors={[item.color, item.color + 'CC']}
                  style={styles.menuItemGradient}
                >
                  <Ionicons name={item.icon as any} size={32} color="#FFF" />
                  <Text style={styles.menuItemText}>{item.title}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animatable.View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: '#FFF',
    opacity: 0.9,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 4,
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  welcomeCard: {
    backgroundColor: '#FFF',
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 24,
    elevation: 2,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  welcomeDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuItemContainer: {
    width: '48%',
    marginBottom: 16,
  },
  menuItem: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  menuItemGradient: {
    padding: 20,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  menuItemText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
    textAlign: 'center',
  },
});
