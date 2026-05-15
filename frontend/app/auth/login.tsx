import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../stores/authStore';
import { api, setAuthToken } from '../../utils/api';
import { getApiErrorMessage } from '../../utils/errorMessage';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';

const DEFAULT_TEMPLE_VIDEO_URL = 'https://www.youtube.com/embed/GgxAAJe2sMM?si=rIQV2ychNU6JGwfg';

const getYoutubeEmbedUrl = (value: string) => {
  const trimmed = value.trim();
  const iframeSrc = trimmed.match(/src=["']([^"']+)["']/i)?.[1];
  const rawUrl = iframeSrc || trimmed;
  const videoId =
    rawUrl.match(/(?:youtube\.com\/embed\/|youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{6,})/)?.[1] ||
    rawUrl.match(/[?&]v=([A-Za-z0-9_-]{6,})/)?.[1];

  if (videoId) {
    return `https://www.youtube-nocookie.com/embed/${videoId}?playsinline=1&rel=0&modestbranding=1&origin=https%3A%2F%2Fjainmandirparham.netlify.app`;
  }

  return rawUrl.replace('youtube.com/embed', 'youtube-nocookie.com/embed');
};

const buildTempleVideoHtml = (videoUrl: string) => `
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      html, body, iframe {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        background: #000;
        overflow: hidden;
      }
      iframe {
        border: 0;
      }
    </style>
  </head>
  <body>
    <iframe
      src="${getYoutubeEmbedUrl(videoUrl)}"
      title="YouTube video player"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerpolicy="strict-origin-when-cross-origin"
      allowfullscreen>
    </iframe>
  </body>
</html>`;

export default function LoginScreen() {
  const router = useRouter();
  const { login, loading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [templeVideoUrl, setTempleVideoUrl] = useState(DEFAULT_TEMPLE_VIDEO_URL);

  useEffect(() => {
    api.get('/app/settings')
      .then((response) => {
        const setting = response.data?.settings?.find((item: any) => item.key === 'temple_video_url');
        if (typeof setting?.value === 'string' && setting.value.trim()) {
          setTempleVideoUrl(setting.value);
        }
      })
      .catch(() => undefined);
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    try {
      await login(email, password);
      const user = useAuthStore.getState().user;
      const token = useAuthStore.getState().token;
      
      if (token) {
        setAuthToken(token);
      }

      if (user?.is_admin) {
        router.replace('/admin');
      } else {
        router.replace('/user');
      }
    } catch (error: any) {
      Alert.alert('Error', getApiErrorMessage(error, 'Login failed'));
    }
  };

  return (
    <LinearGradient
      colors={['#FF9933', '#FFFFFF', '#138808']}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={{ uri: 'https://drive.google.com/uc?export=view&id=1oOVTe_rJxvK9YCFcYMjvEdBcHLR5gMNI' }}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Title */}
          <Text style={styles.title}>Shri Digamber Bada Jain Mandir</Text>
          <Text style={styles.subtitle}>Parham</Text>

          {/* Login Form */}
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>
              {isAdminMode ? 'Admin Login' : 'User Login'}
            </Text>

            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholderTextColor="#999"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color="#666"
                  style={styles.eyeIcon}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={loading}
            >
              <LinearGradient
                colors={['#FF9933', '#FF7722']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.loginButtonText}>
                  {loading ? 'Logging in...' : 'Login'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.forgotLink}
              onPress={() => router.push('/auth/forgot-password')}
            >
              <Text style={styles.forgotLinkText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.signupLink}
              onPress={() => router.push('/auth/signup')}
            >
              <Text style={styles.signupLinkText}>
                Don&apos;t have an account? <Text style={styles.signupLinkBold}>Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Theme Toggle Button */}
          <TouchableOpacity
            style={styles.themeToggle}
            onPress={() => setIsAdminMode(!isAdminMode)}
          >
            <Ionicons
              name={isAdminMode ? 'person-outline' : 'shield-checkmark-outline'}
              size={20}
              color="#FFF"
            />
            <Text style={styles.themeToggleText}>
              {isAdminMode ? 'Switch to User' : 'Switch to Admin'}
            </Text>
          </TouchableOpacity>

          {/* YouTube Video Embed */}
          <View style={styles.videoContainer}>
            <Text style={styles.videoTitle}>Temple Video</Text>
            <View style={styles.videoPlaceholder}>
              <WebView
                source={{ html: buildTempleVideoHtml(templeVideoUrl), baseUrl: 'https://jainmandirparham.netlify.app/' }}
                style={styles.video}
                allowsFullscreenVideo
                allowsInlineMediaPlayback
                javaScriptEnabled
                domStorageEnabled
                mediaPlaybackRequiresUserAction={false}
                userAgent="Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    color: '#666',
    marginBottom: 30,
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
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
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 8,
  },
  loginButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signupLink: {
    marginTop: 16,
    alignItems: 'center',
  },
  forgotLink: {
    marginTop: 14,
    alignItems: 'center',
  },
  forgotLinkText: {
    color: '#FF9933',
    fontSize: 14,
    fontWeight: '700',
  },
  signupLinkText: {
    fontSize: 14,
    color: '#666',
  },
  signupLinkBold: {
    color: '#FF9933',
    fontWeight: 'bold',
  },
  themeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 12,
    borderRadius: 25,
    marginBottom: 20,
  },
  themeToggleText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  videoContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  videoPlaceholder: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    height: 200,
    overflow: 'hidden',
  },
  video: {
    flex: 1,
  },
  videoText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
});
