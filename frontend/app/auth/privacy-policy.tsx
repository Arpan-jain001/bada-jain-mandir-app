import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#FF9933', '#FF7722']} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.updatedText}>Last updated: May 15, 2026</Text>

        <Text style={styles.sectionTitle}>Information We Collect</Text>
        <Text style={styles.paragraph}>
          We collect the details you provide during signup, such as name, email, phone number, and account password. We may also store donation records, notification preferences, and device tokens required for app notifications.
        </Text>

        <Text style={styles.sectionTitle}>How We Use Information</Text>
        <Text style={styles.paragraph}>
          Your information is used to manage your account, send temple updates, process app features, improve the user experience, and help the temple team communicate important announcements.
        </Text>

        <Text style={styles.sectionTitle}>Notifications</Text>
        <Text style={styles.paragraph}>
          If you allow notifications, the app may send announcements, event updates, donation updates, and app-related alerts. You can change notification preferences from the app settings.
        </Text>

        <Text style={styles.sectionTitle}>Data Protection</Text>
        <Text style={styles.paragraph}>
          We use reasonable technical safeguards to protect account data. Passwords are stored securely in encrypted form and are never shown back to temple staff.
        </Text>

        <Text style={styles.sectionTitle}>Sharing</Text>
        <Text style={styles.paragraph}>
          We do not sell your personal data. Information may be shared only with trusted services needed to run the app, such as email, hosting, payment, or notification providers.
        </Text>

        <Text style={styles.sectionTitle}>Your Choices</Text>
        <Text style={styles.paragraph}>
          You can update your profile details, change notification preferences, or contact the temple team for account-related help.
        </Text>

        <Text style={styles.sectionTitle}>Contact</Text>
        <Text style={styles.paragraph}>
          For privacy questions, please contact the temple administration through the Contact section of the app.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    paddingTop: 50,
    paddingBottom: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: { marginRight: 12 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  content: { padding: 20, paddingBottom: 40 },
  updatedText: { fontSize: 13, color: '#777', marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginTop: 18, marginBottom: 8 },
  paragraph: { fontSize: 15, color: '#666', lineHeight: 23 },
});
