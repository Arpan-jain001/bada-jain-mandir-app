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
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../utils/api';
import { getResource, postResource, putResource, deleteResource } from '../../utils/dataApi';
import { pickImage } from '../../utils/imageHelper';

interface Work {
  id: string;
  title: string;
  description: string;
  image_url: string;
  youtube_url?: string;
}

export default function AdminRecentWorkScreen() {
  const router = useRouter();
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const loadRecentWork = async () => {
    try {
      const response = await getResource('/recent-work', '/admin/recent-work');
      setWorks(response as any);
    } catch (error) {
      console.error('Error loading recent work:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecentWork();
  }, []);

  const handlePickImage = async () => {
    const image = await pickImage();
    if (image) {
      setSelectedImage(image.base64);
    }
  };

  const handleSubmit = async () => {
    if (!title || !description || !selectedImage) {
      Alert.alert('Error', 'Please fill all required fields and select an image');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('image_data', selectedImage);
      if (youtubeUrl) formData.append('youtube_url', youtubeUrl);

      await postResource('/recent-work', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Alert.alert('Success', 'Recent work added successfully');
      resetForm();
      loadRecentWork();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to add work');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this work?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteResource(`/recent-work/${id}`, `/admin/recent-work/${id}`);
            Alert.alert('Success', 'Work deleted successfully');
            loadRecentWork();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete work');
          }
        },
      },
    ]);
  };

  const resetForm = () => {
    setModalVisible(false);
    setTitle('');
    setDescription('');
    setYoutubeUrl('');
    setSelectedImage(null);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#FF9933', '#FF7722']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Recent Work</Text>
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
          {works.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="briefcase-outline" size={80} color="#CCC" />
              <Text style={styles.emptyText}>No recent work yet. Tap + to add.</Text>
            </View>
          ) : (
            works.map((work) => (
              <View key={work.id} style={styles.workCard}>
                <Image source={{ uri: work.image_url }} style={styles.workImage} />
                <View style={styles.workContent}>
                  <Text style={styles.workTitle}>{work.title}</Text>
                  <Text style={styles.workDescription} numberOfLines={3}>
                    {work.description}
                  </Text>
                  {work.youtube_url && (
                    <Text style={styles.youtubeLabel}>YouTube: ✓</Text>
                  )}
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(work.id)}
                  >
                    <Ionicons name="trash" size={18} color="#FFF" />
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
              <Text style={styles.modalTitle}>Add Recent Work</Text>

              <TextInput
                style={styles.input}
                placeholder="Title *"
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
                placeholder="YouTube URL (optional)"
                value={youtubeUrl}
                onChangeText={setYoutubeUrl}
              />

              <TouchableOpacity style={styles.pickButton} onPress={handlePickImage}>
                <Ionicons name="image" size={24} color="#FFF" />
                <Text style={styles.pickButtonText}>Pick Image *</Text>
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
  workCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
  },
  workImage: { width: '100%', height: 180 },
  workContent: { padding: 16 },
  workTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  workDescription: { fontSize: 14, color: '#666', lineHeight: 20, marginBottom: 8 },
  youtubeLabel: { fontSize: 12, color: '#FF0000', marginBottom: 12, fontWeight: '600' },
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
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: { height: 100, textAlignVertical: 'top' },
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

