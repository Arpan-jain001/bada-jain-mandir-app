import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Switch,
  Alert,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';

import { Ionicons } from '@expo/vector-icons';

import * as Animatable from 'react-native-animatable';

import {
  loadNotificationPreferences,
  NotificationPreferences,
  registerForPushNotifications,
  saveNotificationPreferences,
} from '../../../utils/notifications';

const WEBSITE_URL =
  'https://jainmandirparham.netlify.app/';

export default function ContactScreen() {
  const [preferences, setPreferences] =
    useState<NotificationPreferences>({
      push: true,
      email: true,
      announcements: true,
      updates: true,
    });

  useEffect(() => {
    loadNotificationPreferences()
      .then(setPreferences)
      .catch(() => undefined);
  }, []);

  const updatePreference = async (
    key: keyof NotificationPreferences,
    value: boolean
  ) => {
    const next = {
      ...preferences,
      [key]: value,
    };

    setPreferences(next);

    try {
      await saveNotificationPreferences(
        next
      );

      if (key === 'push' && value) {
        await registerForPushNotifications(
          {
            forcePrompt: true,
          }
        );
      }
    } catch (error) {
      setPreferences(preferences);

      Alert.alert(
        'Error',
        'Failed to update notification settings'
      );
    }
  };

  const handleCall = () => {
    Linking.openURL(
      'tel:+916399003541'
    );
  };

  const handleEmail = () => {
    Linking.openURL(
      'mailto:jainarpan207@gmail.com'
    );
  };

  const handleWhatsApp = () => {
    Linking.openURL(
      'https://api.whatsapp.com/send/?phone=916399003541&text=Hello%2C%20I%20want%20more%20information%20about%20Temple.&type=phone_number&app_absent=0'
    );
  };

  const handleWebsite = () => {
    Linking.openURL(WEBSITE_URL);
  };

  const openMaps = () => {
    Linking.openURL(
      'https://www.google.com/maps/search/?api=1&query=27.3184662,78.6643286'
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FF9933', '#FF7722']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>
          Contact Us
        </Text>

        <Text
          style={styles.headerSubtitle}
        >
          We&apos;re here to help
        </Text>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* Phone */}
        <Animatable.View
          animation="fadeInUp"
          delay={100}
        >
          <TouchableOpacity
            style={styles.contactCard}
            onPress={handleCall}
          >
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor:
                    '#4CAF50',
                },
              ]}
            >
              <Ionicons
                name="call"
                size={28}
                color="#FFF"
              />
            </View>

            <View
              style={styles.contactInfo}
            >
              <Text
                style={
                  styles.contactLabel
                }
              >
                Phone
              </Text>

              <Text
                style={
                  styles.contactValue
                }
              >
                +91 6399003541
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={24}
              color="#999"
            />
          </TouchableOpacity>
        </Animatable.View>

        {/* Email */}
        <Animatable.View
          animation="fadeInUp"
          delay={200}
        >
          <TouchableOpacity
            style={styles.contactCard}
            onPress={handleEmail}
          >
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor:
                    '#2196F3',
                },
              ]}
            >
              <Ionicons
                name="mail"
                size={28}
                color="#FFF"
              />
            </View>

            <View
              style={styles.contactInfo}
            >
              <Text
                style={
                  styles.contactLabel
                }
              >
                Email
              </Text>

              <Text
                style={
                  styles.contactValue
                }
              >
                jainarpan207@gmail.com
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={24}
              color="#999"
            />
          </TouchableOpacity>
        </Animatable.View>

        {/* WhatsApp */}
        <Animatable.View
          animation="fadeInUp"
          delay={300}
        >
          <TouchableOpacity
            style={styles.contactCard}
            onPress={handleWhatsApp}
          >
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor:
                    '#25D366',
                },
              ]}
            >
              <Ionicons
                name="logo-whatsapp"
                size={28}
                color="#FFF"
              />
            </View>

            <View
              style={styles.contactInfo}
            >
              <Text
                style={
                  styles.contactLabel
                }
              >
                WhatsApp
              </Text>

              <Text
                style={
                  styles.contactValue
                }
              >
                Chat with us
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={24}
              color="#999"
            />
          </TouchableOpacity>
        </Animatable.View>

        {/* Website */}
        <Animatable.View
          animation="fadeInUp"
          delay={400}
        >
          <TouchableOpacity
            style={styles.contactCard}
            onPress={handleWebsite}
          >
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor:
                    '#FF9933',
                },
              ]}
            >
              <Ionicons
                name="globe-outline"
                size={28}
                color="#FFF"
              />
            </View>

            <View
              style={styles.contactInfo}
            >
              <Text
                style={
                  styles.contactLabel
                }
              >
                Website
              </Text>

              <Text
                style={
                  styles.contactValue
                }
              >
                jainmandirparham.netlify.app
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={24}
              color="#999"
            />
          </TouchableOpacity>
        </Animatable.View>

        {/* Location */}
        <Animatable.View
          animation="fadeInUp"
          delay={500}
        >
          <View style={styles.contactCard}>
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor:
                    '#FF9933',
                },
              ]}
            >
              <Ionicons
                name="location"
                size={28}
                color="#FFF"
              />
            </View>

            <View
              style={styles.contactInfo}
            >
              <Text
                style={
                  styles.contactLabel
                }
              >
                Location
              </Text>

              <Text
                style={
                  styles.contactValue
                }
              >
                Parham, Uttar Pradesh,
                India
              </Text>

              <Text
                style={
                  styles.contactDetail
                }
              >
                25 km from Shikohabad
              </Text>

              <Text
                style={
                  styles.contactDetail
                }
              >
                25 km from Etah
              </Text>
            </View>
          </View>
        </Animatable.View>

        {/* Google Maps */}
        <Animatable.View
          animation="fadeInUp"
          delay={600}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>
            Find Us
          </Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={openMaps}
          >
            <LinearGradient
              colors={[
                '#FF9933',
                '#FF7722',
              ]}
              style={
                styles.actionGradient
              }
            >
              <Ionicons
                name="location"
                size={24}
                color="#FFF"
              />

              <Text
                style={
                  styles.actionButtonText
                }
              >
                Open in Google Maps
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animatable.View>

        {/* Quick Actions */}
        <Animatable.View
          animation="fadeInUp"
          delay={700}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>
            Quick Actions
          </Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleWhatsApp}
          >
            <LinearGradient
              colors={[
                '#25D366',
                '#20BA5A',
              ]}
              style={
                styles.actionGradient
              }
            >
              <Ionicons
                name="logo-whatsapp"
                size={24}
                color="#FFF"
              />

              <Text
                style={
                  styles.actionButtonText
                }
              >
                Message on WhatsApp
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleCall}
          >
            <LinearGradient
              colors={[
                '#4CAF50',
                '#388E3C',
              ]}
              style={
                styles.actionGradient
              }
            >
              <Ionicons
                name="call"
                size={24}
                color="#FFF"
              />

              <Text
                style={
                  styles.actionButtonText
                }
              >
                Call Now
              </Text>
            </LinearGradient>
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

  headerSubtitle: {
    fontSize: 16,
    color: '#FFF',
    opacity: 0.9,
    marginTop: 4,
  },

  scrollView: {
    flex: 1,
  },

  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    elevation: 2,
  },

  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },

  contactInfo: {
    flex: 1,
    marginLeft: 16,
  },

  contactLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },

  contactValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },

  contactDetail: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
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

  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },

  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },

  actionButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },

  bottomSpace: {
    height: 30,
  },
});