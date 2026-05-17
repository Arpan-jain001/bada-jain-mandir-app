import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

export type AppLanguage = 'en' | 'hi';

type TranslationKey =
  | 'about'
  | 'aboutUs'
  | 'allNotifications'
  | 'allNotificationsDesc'
  | 'announcementNotifications'
  | 'announcementDesc'
  | 'appUpdateNotifications'
  | 'appUpdateDesc'
  | 'both'
  | 'cancel'
  | 'chatNotifications'
  | 'chatDesc'
  | 'committeeMembers'
  | 'committee'
  | 'communityOutreach'
  | 'communityOutreachDesc'
  | 'confirmReset'
  | 'contact'
  | 'culturalEvents'
  | 'culturalEventsDesc'
  | 'deliveryMode'
  | 'deliveryModeDesc'
  | 'detailsSaved'
  | 'donate'
  | 'editProfile'
  | 'email'
  | 'emailNotifications'
  | 'emailNotificationsDesc'
  | 'emailOnly'
  | 'emailSettings'
  | 'enableQuietMode'
  | 'english'
  | 'error'
  | 'events'
  | 'eventNotifications'
  | 'eventDesc'
  | 'failedToLoadPreferences'
  | 'failedToResetPreferences'
  | 'failedToUpdatePreferences'
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
  | 'mainSettings'
  | 'noItems'
  | 'location'
  | 'logout'
  | 'markAllRead'
  | 'name'
  | 'noNotifications'
  | 'noEvents'
  | 'noPhotos'
  | 'notificationPreferences'
  | 'notificationTypes'
  | 'offlineLiveDarshan'
  | 'notifications'
  | 'phone'
  | 'preferencesReset'
  | 'preferencesUpdated'
  | 'profile'
  | 'projects'
  | 'projectsAndWork'
  | 'projectDetails'
  | 'promotionalEmails'
  | 'promotionalEmailsDesc'
  | 'promotionalNotifications'
  | 'promotionalDesc'
  | 'pushOnly'
  | 'quietMode'
  | 'quietModeDesc'
  | 'quietModeNote'
  | 'recentWork'
  | 'reset'
  | 'resetPreferencesMessage'
  | 'resetToDefaults'
  | 'saveChanges'
  | 'securityEmailsNote'
  | 'settings'
  | 'spiritualGuidance'
  | 'spiritualGuidanceDesc'
  | 'success'
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
    allNotifications: 'All Push Notifications',
    allNotificationsDesc: 'Enable or disable all push notifications',
    announcementNotifications: 'Announcement Notifications',
    announcementDesc: 'Receive temple announcements',
    appUpdateNotifications: 'App Update Notifications',
    appUpdateDesc: 'Get notified about app updates',
    both: 'Both (Push + Email)',
    cancel: 'Cancel',
    chatNotifications: 'Chat Notifications',
    chatDesc: 'Receive new messages',
    committeeMembers: 'Committee Members',
    committee: 'Committee',
    communityOutreach: 'Community Outreach',
    communityOutreachDesc: 'Join us in making a positive impact in the community through various charitable and outreach initiatives.',
    confirmReset: 'Reset to Defaults?',
    contact: 'Contact',
    culturalEvents: 'Cultural Events',
    culturalEventsDesc: 'Participate in a variety of cultural events and activities that celebrate our rich heritage and traditions.',
    deliveryMode: 'Notification Delivery Method',
    deliveryModeDesc: 'Choose how you want to receive notifications',
    detailsSaved: 'Profile details saved',
    donate: 'Donate',
    editProfile: 'Edit Profile',
    email: 'Email',
    emailNotifications: 'Email Notifications',
    emailNotificationsDesc: 'Receive notifications via email',
    emailOnly: 'Email Only',
    emailSettings: 'Email Preferences',
    enableQuietMode: 'Quiet Mode',
    english: 'English',
    error: 'Error',
    events: 'Events',
    eventNotifications: 'Event Notifications',
    eventDesc: 'Get alerts about upcoming events',
    failedToLoadPreferences: 'Failed to load notification preferences',
    failedToResetPreferences: 'Failed to reset preferences',
    failedToUpdatePreferences: 'Failed to update preferences',
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
    mainSettings: 'Main Settings',
    noItems: 'No items available',
    location: 'Location',
    logout: 'Logout',
    markAllRead: 'Mark all read',
    name: 'Name',
    noNotifications: 'No notifications yet',
    noEvents: 'No events scheduled',
    noPhotos: 'No photos available',
    notificationPreferences: 'Notification Preferences',
    notificationTypes: 'Notification Types',
    offlineLiveDarshan: 'Live Darshan is currently offline',
    notifications: 'Notifications',
    phone: 'Phone',
    preferencesReset: 'Preferences reset to defaults',
    preferencesUpdated: 'Notification preferences updated',
    profile: 'Profile',
    projects: 'Projects',
    projectsAndWork: 'Projects & Work',
    projectDetails: 'Project Details',
    promotionalNotifications: 'Promotional Notifications',
    promotionalDesc: 'Receive special offers and promotions',
    promotionalEmails: 'Promotional Emails',
    promotionalEmailsDesc: 'Receive marketing emails and special offers',
    pushOnly: 'Push Only',
    quietMode: 'Quiet Mode',
    quietModeDesc: 'Mute all notifications temporarily',
    quietModeNote: 'When enabled, you won\'t receive any notifications',
    recentWork: 'Recent Work',
    reset: 'Reset',
    resetPreferencesMessage: 'This will restore all notification settings to their default values. Continue?',
    resetToDefaults: 'Reset to Defaults',
    saveChanges: 'Save Changes',
    securityEmailsNote: 'Security and password reset emails will always be sent.',
    settings: 'Settings',
    spiritualGuidance: 'Spiritual Guidance',
    spiritualGuidanceDesc: 'Receive personalized guidance and support on your spiritual journey from our knowledgeable team.',
    success: 'Success',
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
    allNotifications: 'सभी पुश नोटिफिकेशन',
    allNotificationsDesc: 'सभी पुश नोटिफिकेशन को सक्षम या अक्षम करें',
    announcementNotifications: 'घोषणा नोटिफिकेशन',
    announcementDesc: 'मंदिर की घोषणाएं प्राप्त करें',
    appUpdateNotifications: 'ऐप अपडेट नोटिफिकेशन',
    appUpdateDesc: 'ऐप अपडेट के बारे में सूचित रहें',
    both: 'दोनों (पुश + ईमेल)',
    cancel: 'रद्द करें',
    chatNotifications: 'चैट नोटिफिकेशन',
    chatDesc: 'नए संदेश प्राप्त करें',
    committeeMembers: 'समिति सदस्य',
    committee: 'समिति',
    communityOutreach: 'समुदाय सेवा',
    communityOutreachDesc: 'विभिन्न सेवा और सहयोग कार्यों के माध्यम से समाज में सकारात्मक योगदान दें।',
    confirmReset: 'डिफ़ॉल्ट पर रीसेट करें?',
    contact: 'संपर्क',
    culturalEvents: 'सांस्कृतिक कार्यक्रम',
    culturalEventsDesc: 'हमारी समृद्ध परंपरा और संस्कृति से जुड़े कार्यक्रमों और गतिविधियों में भाग लें।',
    deliveryMode: 'नोटिफिकेशन डिलीवरी विधि',
    deliveryModeDesc: 'चुनें कि आप नोटिफिकेशन कैसे प्राप्त करना चाहते हैं',
    detailsSaved: 'प्रोफाइल सेव हो गई',
    donate: 'दान करें',
    editProfile: 'प्रोफाइल बदलें',
    email: 'ईमेल',
    emailNotifications: 'ईमेल नोटिफिकेशन',
    emailNotificationsDesc: 'ईमेल के माध्यम से नोटिफिकेशन प्राप्त करें',
    emailOnly: 'केवल ईमेल',
    emailSettings: 'ईमेल प्राथमिकताएं',
    enableQuietMode: 'शांत मोड',
    english: 'English',
    error: 'त्रुटि',
    events: 'कार्यक्रम',
    eventNotifications: 'कार्यक्रम नोटिफिकेशन',
    eventDesc: 'आने वाले कार्यक्रमों के बारे में सतर्क रहें',
    failedToLoadPreferences: 'नोटिफिकेशन प्राथमिकताएं लोड करने में विफल',
    failedToResetPreferences: 'प्राथमिकताओं को रीसेट करने में विफल',
    failedToUpdatePreferences: 'प्राथमिकताओं को अपडेट करने में विफल',
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
    mainSettings: 'मुख्य सेटिंग्स',
    noItems: 'अभी कोई आइटम उपलब्ध नहीं',
    location: 'स्थान',
    logout: 'लॉगआउट',
    markAllRead: 'सभी पढ़े',
    name: 'नाम',
    noNotifications: 'अभी कोई सूचना नहीं',
    noEvents: 'अभी कोई कार्यक्रम नहीं',
    noPhotos: 'अभी कोई फोटो उपलब्ध नहीं',
    notificationPreferences: 'नोटिफिकेशन प्राथमिकताएं',
    notificationTypes: 'नोटिफिकेशन के प्रकार',
    offlineLiveDarshan: 'लाइव दर्शन अभी उपलब्ध नहीं है',
    notifications: 'सूचनाएं',
    phone: 'फोन',
    preferencesReset: 'प्राथमिकताएं डिफ़ॉल्ट पर रीसेट की गईं',
    preferencesUpdated: 'नोटिफिकेशन प्राथमिकताएं अपडेट की गईं',
    profile: 'प्रोफाइल',
    projects: 'प्रोजेक्ट',
    projectsAndWork: 'प्रोजेक्ट और कार्य',
    projectDetails: 'प्रोजेक्ट विवरण',
    promotionalNotifications: 'प्रचारात्मक नोटिफिकेशन',
    promotionalDesc: 'विशेष ऑफर और प्रचार प्राप्त करें',
    promotionalEmails: 'प्रचारात्मक ईमेल',
    promotionalEmailsDesc: 'विपणन ईमेल और विशेष ऑफर प्राप्त करें',
    pushOnly: 'केवल पुश',
    quietMode: 'शांत मोड',
    quietModeDesc: 'सभी नोटिफिकेशन को अस्थायी रूप से म्यूट करें',
    quietModeNote: 'जब सक्षम हो, आपको कोई नोटिफिकेशन नहीं मिलेगी',
    recentWork: 'हाल का कार्य',
    reset: 'रीसेट करें',
    resetPreferencesMessage: 'यह सभी नोटिफिकेशन सेटिंग्स को उनके डिफ़ॉल्ट मानों पर पुनः स्थापित करेगा। जारी रखें?',
    resetToDefaults: 'डिफ़ॉल्ट पर रीसेट करें',
    saveChanges: 'सेव करें',
    securityEmailsNote: 'सुरक्षा और पासवर्ड रीसेट ईमेल हमेशा भेजे जाएंगे।',
    settings: 'सेटिंग्स',
    spiritualGuidance: 'आध्यात्मिक मार्गदर्शन',
    spiritualGuidanceDesc: 'हमारी टीम से अपनी आध्यात्मिक यात्रा के लिए मार्गदर्शन और सहयोग प्राप्त करें।',
    success: 'सफलता',
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
