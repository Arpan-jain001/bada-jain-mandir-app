import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../utils/api';
import { getResource, postResource, putResource, deleteResource } from '../../utils/dataApi';
import { pickImage } from '../../utils/imageHelper';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time?: string;
  status?: string;
  image_url?: string;
}

const EVENT_STATUSES = ['upcoming', 'ongoing', 'completed', 'cancelled'];
const STATUS_EMOJIS = {
  upcoming: '📅',
  ongoing: '🔴',
  completed: '✅',
  cancelled: '❌'
};

export default function AdminEventsScreen() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [status, setStatus] = useState('upcoming');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);

  const loadEvents = async () => {
    try {
      const response = await getResource('/events', '/admin/events');
      setEvents(response as any);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handlePickImage = async () => {
    const image = await pickImage();
    if (image) {
      setSelectedImage(image.base64);
    }
  };

  const validateTime = (timeStr: string) => {
    const pattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return pattern.test(timeStr);
  };

  const validateDate = (dateStr: string) => {
    const pattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!pattern.test(dateStr)) return false;
    const date = new Date(dateStr);
    return date instanceof Date && !isNaN(date.getTime());
  };

  const handleSubmit = async () => {
    if (!title || !description || !date) {
      Alert.alert('Error', 'Please fill all required fields (Title, Description, Date)');
      return;
    }

    if (!validateDate(date)) {
      Alert.alert('Error', 'Invalid date format. Use YYYY-MM-DD');
      return;
    }

    if (time && !validateTime(time)) {
      Alert.alert('Error', 'Invalid time format. Use HH:MM (24-hour format)');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('date', date);
      if (time) formData.append('time', time);
      formData.append('status', status);
      if (selectedImage) formData.append('image_data', selectedImage);

      await postResource('/events', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Alert.alert('Success', 'Event added successfully. Notification will be sent to users.');
      resetForm();
      loadEvents();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to add event');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this event?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteResource(`/events/${id}`, `/admin/events/${id}`);
            Alert.alert('Success', 'Event deleted successfully');
            loadEvents();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete event');
          }
        },
      },
    ]);
  };

  const getStatusEmoji = (eventStatus: string = 'upcoming') => {
    return STATUS_EMOJIS[eventStatus as keyof typeof STATUS_EMOJIS] || '📅';
  };

  const resetForm = () => {
    setModalVisible(false);
    setTitle('');
    setDescription('');
    setDate('');
    setTime('');
    setStatus('upcoming');
    setSelectedImage(null);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#FF9933', '#FF7722']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Events</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF9933" />
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          {events.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={80} color="#CCC" />
              <Text style={styles.emptyText}>No events yet. Tap + to add.</Text>
            </View>
          ) : (
            events.map((event) => (
              <View key={event.id} style={styles.eventCard}>
                {event.image_url && (
                  <Image source={{ uri: event.image_url }} style={styles.eventImage} />
                )}
                <View style={styles.eventContent}>
                  <View style={styles.headerRow}>
                    <View style={styles.dateContainer}>
                      <Ionicons name="calendar" size={16} color="#FF9933" />
                      <Text style={styles.eventDate}>
                        {new Date(event.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: event.status === 'ongoing' ? '#FF6B6B' : event.status === 'completed' ? '#51CF66' : '#FFB84D' }]}>
                      <Text style={styles.statusBadgeText}>{getStatusEmoji(event.status)} {event.status?.toUpperCase()}</Text>
                    </View>
                  </View>
                  {event.time && (
                    <View style={styles.timeContainer}>
                      <Ionicons name="time" size={14} color="#666" />
                      <Text style={styles.timeText}>{event.time}</Text>
                    </View>
                  )}
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventDescription} numberOfLines={3}>
                    {event.description}
                  </Text>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(event.id)}
                  >
                    <Ionicons name="trash" size={16} color="#FFF" />
                    <Text style={styles.deleteText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <ScrollView style={styles.modalScrollView}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add Event</Text>

              <TextInput
                style={styles.input}
                placeholder="Event Title *"
                value={title}
                onChangeText={setTitle}
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Description *"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
              />

              <TextInput
                style={styles.input}
                placeholder="Date (YYYY-MM-DD) *"
                value={date}
                onChangeText={setDate}
              />

              <TextInput
                style={styles.input}
                placeholder="Time (HH:MM) - Optional"
                value={time}
                onChangeText={setTime}
              />

              <Text style={styles.label}>Event Status *</Text>
              <TouchableOpacity
                style={styles.statusDropdown}
                onPress={() => setShowStatusPicker(!showStatusPicker)}
              >
                <Text style={styles.statusDropdownText}>
                  {getStatusEmoji(status)} {status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
                <Ionicons name={showStatusPicker ? 'chevron-up' : 'chevron-down'} size={20} color="#FF9933" />
              </TouchableOpacity>

              {showStatusPicker && (
                <View style={styles.statusPickerContainer}>
                  {EVENT_STATUSES.map((s) => (
                    <TouchableOpacity
                      key={s}
                      style={[styles.statusOption, status === s && styles.statusOptionSelected]}
                      onPress={() => {
                        setStatus(s);
                        setShowStatusPicker(false);
                      }}
                    >
                      <Text style={[styles.statusOptionText, status === s && styles.statusOptionTextSelected]}>
                        {getStatusEmoji(s)} {s.charAt(0).toUpperCase() + s.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <TouchableOpacity style={styles.pickButton} onPress={handlePickImage}>
                <Ionicons name="image" size={24} color="#FFF" />
                <Text style={styles.pickButtonText}>Pick Image (optional)</Text>
              </TouchableOpacity>

              {selectedImage && (
                <Image source={{ uri: selectedImage }} style={styles.previewImage} />
              )}

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={resetForm}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.saveButton]}
                  onPress={handleSubmit}
                  disabled={uploading}
                >
                  {uploading ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.buttonText}>Add</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: { marginRight: 12 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF', flex: 1 },
  addButton: { padding: 8 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scrollView: { flex: 1 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { marginTop: 16, fontSize: 16, color: '#999' },
  eventCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
  },
  eventImage: { width: '100%', height: 180 },
  eventContent: { padding: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  dateContainer: { flexDirection: 'row', alignItems: 'center' },
  eventDate: { fontSize: 14, color: '#FF9933', fontWeight: '600', marginLeft: 6 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  statusBadgeText: { fontSize: 12, fontWeight: '700', color: '#FFF' },
  timeContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  timeText: { fontSize: 12, color: '#666', marginLeft: 6 },
  eventTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  eventDescription: { fontSize: 14, color: '#666', lineHeight: 20, marginBottom: 12 },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F44336',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  deleteText: { color: '#FFF', fontSize: 14, fontWeight: '600', marginLeft: 6 },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  modalScrollView: { flex: 1 },
  modalContent: {
    backgroundColor: '#FFF',
    margin: 20,
    marginTop: 60,
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  statusDropdown: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusDropdownText: { fontSize: 16, color: '#333', fontWeight: '600' },
  statusPickerContainer: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  statusOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  statusOptionSelected: { backgroundColor: '#FFF3E0' },
  statusOptionText: { fontSize: 15, color: '#333' },
  statusOptionTextSelected: { fontWeight: '700', color: '#FF9933' },
  pickButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  pickButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  previewImage: { width: '100%', height: 200, borderRadius: 8, marginBottom: 16 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  button: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center', marginHorizontal: 4 },
  cancelButton: { backgroundColor: '#999' },
  saveButton: { backgroundColor: '#FF9933' },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});

