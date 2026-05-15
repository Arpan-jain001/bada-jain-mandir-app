import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../stores/authStore';

import { usePreferencesStore } from '../../../stores/preferencesStore';

import { useUserNotificationStore } from '../../../stores/userNotificationStore';
import { useRouter } from 'expo-router';
import * as Animatable from 'react-native-animatable';

export default function UserHomeScreen() {
  const { user, logout } = useAuthStore();
  const t = usePreferencesStore((state) => state.t);
  const unreadCount = useUserNotificationStore((state) => state.unreadCount);
  const router = useRouter();

  const handleWhatsApp = () => {
    Linking.openURL('https://api.whatsapp.com/send/?phone=916399003541&text=Hello%2C%20I%20want%20more%20information%20about%20Temple.&type=phone_number&app_absent=0');
  };

  const handleYouTube = () => {
    Linking.openURL('https://www.youtube.com/@its_arpan__jain');
  };

  const handleLogout = async () => {
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
        colors={['#FF9933', '#FFFFFF']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.welcomeText}>{t('jaiJinendra')}</Text>
            <Text style={styles.userName}>{user?.name}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => router.push('/(protected)/user/notifications')} style={styles.headerIconButton}>
              <Ionicons name="notifications-outline" size={24} color="#FFF" />
              {unreadCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} style={styles.headerIconButton}>
              <Ionicons name="log-out-outline" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <Animatable.View animation="fadeInUp" duration={800} style={styles.heroSection}>
          <Image
            source={{ uri: 'https://drive.google.com/uc?export=view&id=1oOVTe_rJxvK9YCFcYMjvEdBcHLR5gMNI' }}
            style={styles.heroLogo}
            resizeMode="contain"
          />
          <Text style={styles.heroTitle}>Shri Digamber Bada Jain Mandir</Text>
          <Text style={styles.heroSubtitle}>Parham, Uttar Pradesh</Text>
          <Text style={styles.heroDescription}>
            An Ancient Temple with Thousands Years of History
          </Text>
        </Animatable.View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Animatable.View animation="fadeInLeft" delay={200}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(protected)/user/gallery')}
            >
              <LinearGradient
                colors={['#FF9933', '#FF7722']}
                style={styles.actionGradient}
              >
                <Ionicons name="images" size={32} color="#FFF" />
                <Text style={styles.actionText}>{t('gallery')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animatable.View>

          <Animatable.View animation="fadeInRight" delay={200}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(protected)/user/projects')}
            >
              <LinearGradient
                colors={['#138808', '#0a5a05']}
                style={styles.actionGradient}
              >
                <Ionicons name="folder-open" size={32} color="#FFF" />
                <Text style={styles.actionText}>{t('projects')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animatable.View>
        </View>
        <View style={styles.quickActions}>
          <Animatable.View animation="fadeInLeft" delay={300}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(protected)/user/events')}
            >
              <LinearGradient
                colors={['#9C27B0', '#7B1FA2']}
                style={styles.actionGradient}
              >
                <Ionicons name="calendar" size={32} color="#FFF" />
                <Text style={styles.actionText}>{t('events')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animatable.View>

          <Animatable.View animation="fadeInRight" delay={300}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(protected)/user/recent-work')}
            >
              <LinearGradient
                colors={['#2196F3', '#1976D2']}
                style={styles.actionGradient}
              >
                <Ionicons name="briefcase" size={32} color="#FFF" />
                <Text style={styles.actionText}>{t('recentWork')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animatable.View>
        </View>

        <View style={styles.quickActions}>
          <Animatable.View animation="fadeInLeft" delay={400}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(protected)/user/committee')}
            >
              <LinearGradient
                colors={['#FF5722', '#E64A19']}
                style={styles.actionGradient}
              >
                <Ionicons name="people" size={32} color="#FFF" />
                <Text style={styles.actionText}>{t('committee')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animatable.View>

          <Animatable.View animation="fadeInRight" delay={400}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(protected)/user/about')}
            >
              <LinearGradient
                colors={['#FF9800', '#F57C00']}
                style={styles.actionGradient}
              >
                <Ionicons name="information-circle" size={32} color="#FFF" />
                <Text style={styles.actionText}>{t('about')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animatable.View>
        </View>

        <View style={styles.quickActions}>
          <Animatable.View animation="fadeInLeft" delay={500}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(protected)/user/donations')}
            >
              <LinearGradient
                colors={['#D32F2F', '#B71C1C']}
                style={styles.actionGradient}
              >
                <Ionicons name="heart" size={32} color="#FFF" />
                <Text style={styles.actionText}>{t('donate')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animatable.View>
          <Animatable.View animation="fadeInRight" delay={500}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(protected)/user/live-darshan')}
            >
              <LinearGradient
                colors={['#795548', '#5D4037']}
                style={styles.actionGradient}
              >
                <Ionicons name="radio" size={32} color="#FFF" />
                <Text style={styles.actionText}>{t('liveDarshan')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animatable.View>
        </View>

        {/* Services Section */}
        <Animatable.View animation="fadeInUp" delay={400} style={styles.section}>
          <Text style={styles.sectionTitle}>{t('ourServices')}</Text>
          
          <View style={styles.serviceCard}>
            <Ionicons name="book" size={32} color="#FF9933" />
            <View style={styles.serviceContent}>
              <Text style={styles.serviceTitle}>{t('spiritualGuidance')}</Text>
              <Text style={styles.serviceDescription}>
                {t('spiritualGuidanceDesc')}
              </Text>
            </View>
          </View>

          <View style={styles.serviceCard}>
            <Ionicons name="calendar" size={32} color="#FF9933" />
            <View style={styles.serviceContent}>
              <Text style={styles.serviceTitle}>{t('culturalEvents')}</Text>
              <Text style={styles.serviceDescription}>
                {t('culturalEventsDesc')}
              </Text>
            </View>
          </View>

          <View style={styles.serviceCard}>
            <Ionicons name="people" size={32} color="#FF9933" />
            <View style={styles.serviceContent}>
              <Text style={styles.serviceTitle}>{t('communityOutreach')}</Text>
              <Text style={styles.serviceDescription}>
                {t('communityOutreachDesc')}
              </Text>
            </View>
          </View>
        </Animatable.View>

        {/* Location */}
        <Animatable.View animation="fadeInUp" delay={600} style={styles.section}>
          <Text style={styles.sectionTitle}>{t('location')}</Text>
          <View style={styles.locationCard}>
            <Ionicons name="location" size={24} color="#FF9933" />
            <View style={styles.locationContent}>
              <Text style={styles.locationText}>25 km from Shikohabad</Text>
              <Text style={styles.locationText}>25 km from Etah</Text>
              <Text style={styles.locationText}>Parham, Uttar Pradesh, India</Text>
            </View>
          </View>
        </Animatable.View>

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* Floating Action Buttons */}
      <TouchableOpacity style={styles.whatsappButton} onPress={handleWhatsApp}>
        <Ionicons name="logo-whatsapp" size={28} color="#FFF" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.youtubeButton} onPress={handleYouTube}>
        <Ionicons name="logo-youtube" size={28} color="#FFF" />
      </TouchableOpacity>
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#D32F2F',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    borderWidth: 1,
    borderColor: '#FFF',
  },
  notificationBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    backgroundColor: '#FFF',
    padding: 24,
    alignItems: 'center',
    marginTop: -20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  heroLogo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  heroDescription: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 24,
    gap: 16,
  },
  actionCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  actionGradient: {
    padding: 24,
    alignItems: 'center',
  },
  actionText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  serviceCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  serviceContent: {
    flex: 1,
    marginLeft: 16,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  locationCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 16,
    elevation: 2,
  },
  locationContent: {
    flex: 1,
    marginLeft: 16,
  },
  locationText: {
    fontSize: 15,
    color: '#666',
    marginBottom: 4,
  },
  bottomSpace: {
    height: 80,
  },
  whatsappButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#25D366',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  youtubeButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF0000',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
