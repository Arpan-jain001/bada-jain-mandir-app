import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../utils/api';
import { useRouter } from 'expo-router';

export default function AdminNotificationsScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sendEmail, setSendEmail] = useState(true);
  const [sendPush, setSendPush] = useState(true);
  const [sendSMS, setSendSMS] = useState(false);
  const [sendWhatsApp, setSendWhatsApp] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!title || !message) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    if (!sendEmail && !sendPush && !sendSMS && !sendWhatsApp) {
      Alert.alert('Error', 'Please select at least one notification channel');
      return;
    }

    Alert.alert(
      'Send Notification',
      'Are you sure you want to send this notification to all users?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: async () => {
            setSending(true);
            try {
              const response = await api.post('/notifications/send', {
                title,
                message,
                send_email: sendEmail,
                send_push: sendPush,
                send_sms: sendSMS,
                send_whatsapp: sendWhatsApp,
              });

              const results = response.data.results;
              Alert.alert(
                'Success',
                `Notification sent!\n\nEmail: ${results.email}\nPush: ${results.push || 0}\nSMS: ${results.sms}\nWhatsApp: ${results.whatsapp}${
                  results.errors.length > 0
                    ? `\n\nErrors: ${results.errors.length}`
                    : ''
                }`
              );

              setTitle('');
              setMessage('');
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.detail || 'Failed to send notification');
            } finally {
              setSending(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#FF9933', '#FF7722']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Send Notification</Text>
      </LinearGradient>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#2196F3" />
          <Text style={styles.infoText}>
            Send notifications to all registered users via email, SMS, or WhatsApp.
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            placeholder="Notification title"
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>Message</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Notification message"
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />

          <Text style={styles.label}>Notification Channels</Text>

          <View style={styles.switchContainer}>
            <View style={styles.switchRow}>
              <Ionicons name="mail" size={24} color="#2196F3" />
              <Text style={styles.switchLabel}>Email</Text>
            </View>
            <Switch
              value={sendEmail}
              onValueChange={setSendEmail}
              trackColor={{ false: '#CCC', true: '#FF9933' }}
              thumbColor={sendEmail ? '#FFF' : '#FFF'}
            />
          </View>

          <View style={styles.switchContainer}>
            <View style={styles.switchRow}>
              <Ionicons name="notifications" size={24} color="#FF9933" />
              <Text style={styles.switchLabel}>Push</Text>
            </View>
            <Switch
              value={sendPush}
              onValueChange={setSendPush}
              trackColor={{ false: '#CCC', true: '#FF9933' }}
              thumbColor="#FFF"
            />
          </View>

          <View style={styles.switchContainer}>
            <View style={styles.switchRow}>
              <Ionicons name="chatbubbles" size={24} color="#4CAF50" />
              <Text style={styles.switchLabel}>SMS</Text>
            </View>
            <Switch
              value={sendSMS}
              onValueChange={setSendSMS}
              trackColor={{ false: '#CCC', true: '#FF9933' }}
              thumbColor={sendSMS ? '#FFF' : '#FFF'}
            />
          </View>

          <View style={styles.switchContainer}>
            <View style={styles.switchRow}>
              <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
              <Text style={styles.switchLabel}>WhatsApp</Text>
            </View>
            <Switch
              value={sendWhatsApp}
              onValueChange={setSendWhatsApp}
              trackColor={{ false: '#CCC', true: '#FF9933' }}
              thumbColor={sendWhatsApp ? '#FFF' : '#FFF'}
            />
          </View>

          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSend}
            disabled={sending}
          >
            <LinearGradient
              colors={['#FF9933', '#FF7722']}
              style={styles.sendButtonGradient}
            >
              {sending ? (
                <>
                  <ActivityIndicator color="#FFF" />
                  <Text style={styles.sendButtonText}>  Sending...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="send" size={20} color="#FFF" />
                  <Text style={styles.sendButtonText}>  Send Notification</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
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
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#1976D2',
    lineHeight: 20,
  },
  form: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#F9F9F9',
  },
  textArea: {
    height: 120,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginLeft: 12,
  },
  sendButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 24,
  },
  sendButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  sendButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
