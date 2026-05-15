import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  Linking,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getResource } from '../../../utils/dataApi';
import * as Animatable from 'react-native-animatable';
import { WebView } from 'react-native-webview';
import { usePreferencesStore } from '../../../stores/preferencesStore';

const TEMPLE_VIDEO_ID = 'GgxAAJe2sMM';
const TEMPLE_VIDEO_URL = `https://www.youtube.com/watch?v=${TEMPLE_VIDEO_ID}`;
const TEMPLE_EMBED_URL = `https://www.youtube-nocookie.com/embed/${TEMPLE_VIDEO_ID}?playsinline=1&rel=0&modestbranding=1&origin=https://www.youtube.com`;

type CommitteeMember = {
  id: string;
  name: string;
  position: string;
  image_url: string;
  phone?: string;
};

export default function AboutScreen() {
  const [committee, setCommittee] = useState<CommitteeMember[]>([]);
  const [loading, setLoading] = useState(true);
  const t = usePreferencesStore((state) => state.t);

  useEffect(() => {
    fetchCommittee();
  }, []);

  const fetchCommittee = async () => {
    try {
      const response = await getResource('/committee', '/admin/committee');
      setCommittee(response as any);
    } catch (error) {
      console.error('Error fetching committee:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#FF9933', '#FF7722']} style={styles.header}>
        <Text style={styles.headerTitle}>{t('aboutUs')}</Text>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <Animatable.View animation="fadeInUp" style={styles.section}>
          <View style={styles.logoContainer}>
            <Image
              source={{ uri: 'https://drive.google.com/uc?export=view&id=1oOVTe_rJxvK9YCFcYMjvEdBcHLR5gMNI' }}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.sectionTitle}>{t('welcomeTitle')}</Text>
          <Text style={styles.description}>
            {t('welcomeDesc1')}
          </Text>
          <Text style={styles.description}>
            {t('welcomeDesc2')}
          </Text>
          <Text style={styles.description}>
            {t('welcomeDesc3')}
          </Text>
        </Animatable.View>

        {/* Services */}
        <Animatable.View animation="fadeInUp" delay={200} style={styles.section}>
          <Text style={styles.sectionTitle}>{t('ourServices')}</Text>
          
          <View style={styles.serviceCard}>
            <View style={styles.serviceIconContainer}>
              <Ionicons name="book" size={32} color="#FF9933" />
            </View>
            <View style={styles.serviceContent}>
              <Text style={styles.serviceTitle}>{t('spiritualGuidance')}</Text>
              <Text style={styles.serviceDescription}>
                {t('spiritualGuidanceDesc')}
              </Text>
            </View>
          </View>

          <View style={styles.serviceCard}>
            <View style={styles.serviceIconContainer}>
              <Ionicons name="calendar" size={32} color="#FF9933" />
            </View>
            <View style={styles.serviceContent}>
              <Text style={styles.serviceTitle}>{t('culturalEvents')}</Text>
              <Text style={styles.serviceDescription}>
                {t('culturalEventsDesc')}
              </Text>
            </View>
          </View>

          <View style={styles.serviceCard}>
            <View style={styles.serviceIconContainer}>
              <Ionicons name="people" size={32} color="#FF9933" />
            </View>
            <View style={styles.serviceContent}>
              <Text style={styles.serviceTitle}>{t('communityOutreach')}</Text>
              <Text style={styles.serviceDescription}>
                {t('communityOutreachDesc')}
              </Text>
            </View>
          </View>
        </Animatable.View>

        {/* Committee Members */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#FF9933" />
            <Text style={styles.loadingText}>{t('loadingCommittee')}</Text>
          </View>
        ) : committee.length > 0 ? (
          <Animatable.View animation="fadeInUp" delay={400} style={styles.section}>
            <Text style={styles.sectionTitle}>{t('committeeMembers')}</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.committeeScroll}
            >
              {committee.map((member, index) => (
                <Animatable.View
                  key={member.id}
                  animation="fadeInRight"
                  delay={index * 100}
                  style={styles.committeeCard}
                >
                  <Image
                    source={{ uri: member.image_url }}
                    style={styles.memberImage}
                  />
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{member.name}</Text>
                    <Text style={styles.memberPosition}>{member.position}</Text>
                    {member.phone && (
                      <View style={styles.memberContact}>
                        <Ionicons name="call" size={14} color="#666" />
                        <Text style={styles.memberPhone}>{member.phone}</Text>
                      </View>
                    )}
                  </View>
                </Animatable.View>
              ))}
            </ScrollView>
          </Animatable.View>
        ) : null}

        {/* YouTube Video */}
        <Animatable.View animation="fadeInUp" delay={600} style={styles.section}>
          <Text style={styles.sectionTitle}>{t('templeVideo')}</Text>
          <View style={styles.videoContainer}>
            <WebView
              source={{
                uri: TEMPLE_EMBED_URL,
                headers: {
                  Referer: 'https://www.youtube.com/',
                },
              }}
              style={styles.video}
              allowsFullscreenVideo
              allowsInlineMediaPlayback
              javaScriptEnabled
              mediaPlaybackRequiresUserAction={false}
              userAgent="Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 Chrome/120.0 Mobile Safari/537.36"
            />
          </View>
          <TouchableOpacity style={styles.youtubeButton} onPress={() => Linking.openURL(TEMPLE_VIDEO_URL)}>
            <Ionicons name="logo-youtube" size={22} color="#FFF" />
            <Text style={styles.youtubeButtonText}>{t('viewOnYoutube')}</Text>
          </TouchableOpacity>
        </Animatable.View>

        <View style={styles.bottomSpace} />
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
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    color: '#666',
    lineHeight: 24,
    marginBottom: 12,
    textAlign: 'justify',
  },
  serviceCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  serviceIconContainer: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  serviceContent: {
    flex: 1,
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
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  committeeScroll: {
    paddingRight: 20,
  },
  committeeCard: {
    width: 180,
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginRight: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  memberImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#E0E0E0',
  },
  memberInfo: {
    padding: 12,
  },
  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  memberPosition: {
    fontSize: 14,
    color: '#FF9933',
    marginBottom: 8,
  },
  memberContact: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberPhone: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
  },
  videoContainer: {
    backgroundColor: '#000',
    borderRadius: 16,
    overflow: 'hidden',
    height: 220,
  },
  video: {
    flex: 1,
  },
  youtubeButton: {
    marginTop: 12,
    backgroundColor: '#FF0000',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  youtubeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  bottomSpace: {
    height: 20,
  },
});
