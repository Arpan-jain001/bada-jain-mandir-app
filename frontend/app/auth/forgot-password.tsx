import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { api } from '../../utils/api';
import { getApiErrorMessage } from '../../utils/errorMessage';

type ResetStep = 'email' | 'otp';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [step, setStep] = useState<ResetStep>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const normalizedEmail = useMemo(() => email.trim().toLowerCase(), [email]);

  const sendOtp = async (resend = false) => {
    if (!normalizedEmail) {
      Alert.alert('Email required', 'Please enter your registered email address.');
      return;
    }

    if (resend) {
      setResending(true);
    } else {
      setLoading(true);
    }
    try {
      await api.post(resend ? '/auth/resend-reset-otp' : '/auth/forgot-password', {
        email: normalizedEmail,
      });
      setStep('otp');
      Alert.alert('OTP Sent', resend ? 'A new OTP has been sent to your email.' : 'OTP has been sent to your email.');
    } catch (error: any) {
      const message = error?.response?.status === 404
        ? 'No account exists with this email address.'
        : getApiErrorMessage(error, 'Unable to send OTP');
      Alert.alert('Error', message);
    } finally {
      if (resend) {
        setResending(false);
      } else {
        setLoading(false);
      }
    }
  };

  const resetPassword = async () => {
    if (!otp || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill all fields.');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        token: otp.trim(),
        password,
      });
      Alert.alert('Password Updated', 'You can now login with your new password.', [
        { text: 'Login', onPress: () => router.replace('/auth/login') },
      ]);
    } catch (error: any) {
      Alert.alert('Error', getApiErrorMessage(error, 'Unable to reset password'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#FF9933', '#FFFFFF', '#138808']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>

          <View style={styles.logoContainer}>
            <Image
              source={{ uri: 'https://drive.google.com/uc?export=view&id=1oOVTe_rJxvK9YCFcYMjvEdBcHLR5gMNI' }}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.title}>Forgot Password</Text>
          <Text style={styles.subtitle}>
            {step === 'email' ? 'Enter your email to receive an OTP' : 'Enter OTP and create a new password'}
          </Text>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Registered Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#999"
                editable={step === 'email'}
              />
            </View>

            {step === 'email' ? (
              <TouchableOpacity style={styles.primaryButton} onPress={() => sendOtp(false)} disabled={loading}>
                <LinearGradient colors={['#FF9933', '#FF7722']} style={styles.buttonGradient}>
                  {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryButtonText}>Send OTP</Text>}
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <>
                <View style={styles.inputContainer}>
                  <Ionicons name="keypad-outline" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="6 Digit OTP"
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="number-pad"
                    maxLength={6}
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="New Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    placeholderTextColor="#999"
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color="#666" />
                  </TouchableOpacity>
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showPassword}
                    placeholderTextColor="#999"
                  />
                </View>

                <TouchableOpacity style={styles.primaryButton} onPress={resetPassword} disabled={loading}>
                  <LinearGradient colors={['#FF9933', '#FF7722']} style={styles.buttonGradient}>
                    {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryButtonText}>Reset Password</Text>}
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.resendButton} onPress={() => sendOtp(true)} disabled={resending}>
                  <Ionicons name="refresh" size={18} color="#FF9933" />
                  <Text style={styles.resendButtonText}>{resending ? 'Resending...' : 'Resend OTP'}</Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity style={styles.loginLink} onPress={() => router.replace('/auth/login')}>
              <Text style={styles.loginLinkText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: 20, paddingTop: 60 },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logoContainer: { alignItems: 'center', marginBottom: 20 },
  logo: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'white' },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', color: '#333', marginBottom: 5 },
  subtitle: { fontSize: 16, textAlign: 'center', color: '#666', marginBottom: 30 },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: '#333' },
  primaryButton: { borderRadius: 12, overflow: 'hidden', marginTop: 8 },
  buttonGradient: { paddingVertical: 16, alignItems: 'center' },
  primaryButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  resendButton: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  resendButtonText: { color: '#FF9933', fontSize: 15, fontWeight: '700' },
  loginLink: { marginTop: 18, alignItems: 'center' },
  loginLinkText: { color: '#666', fontSize: 14, fontWeight: '600' },
});
