import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

export type AppLanguage = 'en' | 'hi';

type TranslationKey =
  | 'about'
  | 'aboutUs'
  | 'cancel'
  | 'committeeMembers'
  | 'committee'
  | 'communityOutreach'
  | 'communityOutreachDesc'
  | 'contact'
  | 'culturalEvents'
  | 'culturalEventsDesc'
  | 'detailsSaved'
  | 'donate'
  | 'editProfile'
  | 'email'
  | 'english'
  | 'events'
  | 'gallery'
  | 'hindi'
  | 'home'
  | 'jaiJinendra'
  | 'language'
  | 'liveDarshan'
  | 'loading'
  | 'loadingCommittee'
  | 'loadingNotifications'
  | 'loadingEvents'
  | 'loadingGallery'
  | 'noItems'
  | 'location'
  | 'logout'
  | 'markAllRead'
  | 'name'
  | 'noNotifications'
  | 'noEvents'
  | 'noPhotos'
  | 'offlineLiveDarshan'
  | 'notifications'
  | 'phone'
  | 'profile'
  | 'projects'
  | 'projectsAndWork'
  | 'projectDetails'
  | 'recentWork'
  | 'saveChanges'
  | 'settings'
  | 'spiritualGuidance'
  | 'spiritualGuidanceDesc'
  | 'templeGallery'
  | 'photos'
  | 'templeVideo'
  | 'unread'
  | 'viewOnYoutube'
  | 'viewDetails'
  | 'watchVideo'
  | 'watchTempleVideo'
  | 'welcomeTitle'
  | 'welcomeDesc1'
  | 'welcomeDesc2'
  | 'welcomeDesc3'
  | 'ourServices';

const LANGUAGE_KEY = 'app_language';

const translations: Record<AppLanguage, Record<TranslationKey, string>> = {
  en: {
    about: 'About',
    aboutUs: 'About Us',
    cancel: 'Cancel',
    committeeMembers: 'Committee Members',
    committee: 'Committee',
    communityOutreach: 'Community Outreach',
    communityOutreachDesc: 'Join us in making a positive impact in the community through various charitable and outreach initiatives.',
    contact: 'Contact',
    culturalEvents: 'Cultural Events',
    culturalEventsDesc: 'Participate in a variety of cultural events and activities that celebrate our rich heritage and traditions.',
    detailsSaved: 'Profile details saved',
    donate: 'Donate',
    editProfile: 'Edit Profile',
    email: 'Email',
    english: 'English',
    events: 'Events',
    gallery: 'Gallery',
    hindi: 'Hindi',
    home: 'Home',
    jaiJinendra: 'Jai Jinendra',
    language: 'Language',
    liveDarshan: 'Live Darshan',
    loading: 'Loading...',
    loadingCommittee: 'Loading Committee...',
    loadingNotifications: 'Loading notifications...',
    loadingEvents: 'Loading events...',
    loadingGallery: 'Loading Gallery...',
    noItems: 'No items available',
    location: 'Location',
    logout: 'Logout',
    markAllRead: 'Mark all read',
    name: 'Name',
    noNotifications: 'No notifications yet',
    noEvents: 'No events scheduled',
    noPhotos: 'No photos available',
    offlineLiveDarshan: 'Live Darshan is currently offline',
    notifications: 'Notifications',
    phone: 'Phone',
    profile: 'Profile',
    projects: 'Projects',
    projectsAndWork: 'Projects & Work',
    projectDetails: 'Project Details',
    recentWork: 'Recent Work',
    saveChanges: 'Save Changes',
    settings: 'Settings',
    spiritualGuidance: 'Spiritual Guidance',
    spiritualGuidanceDesc: 'Receive personalized guidance and support on your spiritual journey from our knowledgeable team.',
    templeGallery: 'Temple Gallery',
    photos: 'Photos',
    templeVideo: 'Temple Video',
    unread: 'unread',
    viewOnYoutube: 'View on YouTube',
    viewDetails: 'View Details',
    watchVideo: 'Watch Video',
    watchTempleVideo: 'Watch Temple Video',
    welcomeTitle: 'Welcome to Bada Digambar Jain Mandir Parham',
    welcomeDesc1: 'This is an ancient temple which has been in existence for thousands of years. A prominent Jain temple located in Parham, Uttar Pradesh, India.',
    welcomeDesc2: 'Our temple provides a spiritual haven for devotees and visitors seeking peace and tranquility.',
    welcomeDesc3: 'We invite you to experience the beauty and spirituality of Bada Digambar Jain Mandir Parham.',
    ourServices: 'Our Services',
  },
  hi: {
    about: 'परिचय',
    aboutUs: 'हमारे बारे में',
    cancel: 'रद्द करें',
    committeeMembers: 'समिति सदस्य',
    committee: 'समिति',
    communityOutreach: 'समुदाय सेवा',
    communityOutreachDesc: 'विभिन्न सेवा और सहयोग कार्यों के माध्यम से समाज में सकारात्मक योगदान दें।',
    contact: 'संपर्क',
    culturalEvents: 'सांस्कृतिक कार्यक्रम',
    culturalEventsDesc: 'हमारी समृद्ध परंपरा और संस्कृति से जुड़े कार्यक्रमों और गतिविधियों में भाग लें।',
    detailsSaved: 'प्रोफाइल सेव हो गई',
    donate: 'दान करें',
    editProfile: 'प्रोफाइल बदलें',
    email: 'ईमेल',
    english: 'English',
    events: 'कार्यक्रम',
    gallery: 'गैलरी',
    hindi: 'हिन्दी',
    home: 'होम',
    jaiJinendra: 'जय जिनेन्द्र',
    language: 'भाषा',
    liveDarshan: 'लाइव दर्शन',
    loading: 'लोड हो रहा है...',
    loadingCommittee: 'समिति लोड हो रही है...',
    loadingNotifications: 'सूचनाएं लोड हो रही हैं...',
    loadingEvents: 'कार्यक्रम लोड हो रहे हैं...',
    loadingGallery: 'गैलरी लोड हो रही है...',
    noItems: 'अभी कोई आइटम उपलब्ध नहीं',
    location: 'स्थान',
    logout: 'लॉगआउट',
    markAllRead: 'सभी पढ़े',
    name: 'नाम',
    noNotifications: 'अभी कोई सूचना नहीं',
    noEvents: 'अभी कोई कार्यक्रम नहीं',
    noPhotos: 'अभी कोई फोटो उपलब्ध नहीं',
    offlineLiveDarshan: 'लाइव दर्शन अभी उपलब्ध नहीं है',
    notifications: 'सूचनाएं',
    phone: 'फोन',
    profile: 'प्रोफाइल',
    projects: 'प्रोजेक्ट',
    projectsAndWork: 'प्रोजेक्ट और कार्य',
    projectDetails: 'प्रोजेक्ट विवरण',
    recentWork: 'हाल का कार्य',
    saveChanges: 'सेव करें',
    settings: 'सेटिंग्स',
    spiritualGuidance: 'आध्यात्मिक मार्गदर्शन',
    spiritualGuidanceDesc: 'हमारी टीम से अपनी आध्यात्मिक यात्रा के लिए मार्गदर्शन और सहयोग प्राप्त करें।',
    templeGallery: 'मंदिर गैलरी',
    photos: 'फोटो',
    templeVideo: 'मंदिर वीडियो',
    unread: 'नए',
    viewOnYoutube: 'YouTube पर देखें',
    viewDetails: 'विवरण देखें',
    watchVideo: 'वीडियो देखें',
    watchTempleVideo: 'मंदिर वीडियो देखें',
    welcomeTitle: 'बड़ा दिगंबर जैन मंदिर परहम में आपका स्वागत है',
    welcomeDesc1: 'यह हजारों वर्षों से विद्यमान एक प्राचीन मंदिर है, जो परहम, उत्तर प्रदेश में स्थित है।',
    welcomeDesc2: 'हमारा मंदिर श्रद्धालुओं और आगंतुकों के लिए शांति और आध्यात्मिकता का पावन स्थान है।',
    welcomeDesc3: 'हम आपको बड़ा दिगंबर जैन मंदिर परहम की सुंदरता और आध्यात्मिकता का अनुभव करने के लिए आमंत्रित करते हैं।',
    ourServices: 'हमारी सेवाएं',
  },
};

interface PreferencesState {
  language: AppLanguage;
  initialized: boolean;
  loadLanguage: () => Promise<void>;
  setLanguage: (language: AppLanguage) => Promise<void>;
  t: (key: TranslationKey) => string;
}

export const usePreferencesStore = create<PreferencesState>((set, get) => ({
  language: 'en',
  initialized: false,
  loadLanguage: async () => {
    const storedLanguage = await SecureStore.getItemAsync(LANGUAGE_KEY);
    set({
      language: storedLanguage === 'hi' ? 'hi' : 'en',
      initialized: true,
    });
  },
  setLanguage: async (language) => {
    await SecureStore.setItemAsync(LANGUAGE_KEY, language);
    set({ language });
  },
  t: (key) => translations[get().language][key] || translations.en[key] || key,
}));
