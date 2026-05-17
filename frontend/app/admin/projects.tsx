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

interface Project {
  id: string;
  title: string;
  description: string;
  image_url: string;
  youtube_url?: string;
  status?: string;
}

const PROJECT_STATUSES = ['upcoming', 'ongoing', 'completed'];
const STATUS_EMOJIS = {
  upcoming: '🚧',
  ongoing: '🔨',
  completed: '✅'
};

export default function AdminProjectsScreen() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [status, setStatus] = useState('ongoing');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);

  const loadProjects = async () => {
    try {
      const response = await getResource('/projects', '/admin/projects');
      setProjects(response as any);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handlePickImage = async () => {
    const image = await pickImage();
    if (image) {
      setSelectedImage(image.base64);
    }
  };

  const handleSubmit = async () => {
    if (!title || !description) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    if (!editMode && !selectedImage) {
      Alert.alert('Error', 'Please select an image');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('status', status);
      if (youtubeUrl) formData.append('youtube_url', youtubeUrl);
      if (selectedImage) formData.append('image_data', selectedImage);

      if (editMode && currentId) {
        await putResource(`/projects/${currentId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        }, `/admin/projects/${currentId}`);
        Alert.alert('Success', 'Project updated successfully. Notification will be sent to users.');
      } else {
        await postResource('/projects', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        Alert.alert('Success', 'Project added successfully. Notification will be sent to users.');
      }

      resetForm();
      loadProjects();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to save project');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (project: Project) => {
    setEditMode(true);
    setCurrentId(project.id);
    setTitle(project.title);
    setDescription(project.description);
    setYoutubeUrl(project.youtube_url || '');
    setStatus(project.status || 'ongoing');
    setSelectedImage(null);
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this project?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteResource(`/projects/${id}`, `/admin/projects/${id}`);
            Alert.alert('Success', 'Project deleted successfully');
            loadProjects();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete project');
          }
        },
      },
    ]);
  };

  const getStatusEmoji = (projectStatus: string = 'ongoing') => {
    return STATUS_EMOJIS[projectStatus as keyof typeof STATUS_EMOJIS] || '🚧';
  };

  const resetForm = () => {
    setModalVisible(false);
    setEditMode(false);
    setCurrentId(null);
    setTitle('');
    setDescription('');
    setYoutubeUrl('');
    setStatus('ongoing');
    setSelectedImage(null);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#FF9933', '#FF7722']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Projects</Text>
        <TouchableOpacity
          onPress={() => {
            resetForm();
            setModalVisible(true);
          }}
          style={styles.addButton}
        >
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF9933" />
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          {projects.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="folder-open-outline" size={80} color="#CCC" />
              <Text style={styles.emptyText}>No projects yet. Tap + to add.</Text>
            </View>
          ) : (
            projects.map((project) => (
              <View key={project.id} style={styles.projectCard}>
                <Image source={{ uri: project.image_url }} style={styles.projectImage} />
                <View style={styles.projectContent}>
                  <View style={styles.headerRow}>
                    <Text style={styles.projectTitle} numberOfLines={1}>{project.title}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: project.status === 'completed' ? '#51CF66' : project.status === 'ongoing' ? '#FFB84D' : '#90CAF9' }]}>
                      <Text style={styles.statusBadgeText}>{getStatusEmoji(project.status)}</Text>
                    </View>
                  </View>
                  <Text style={styles.projectDescription} numberOfLines={2}>
                    {project.description}
                  </Text>
                  {project.youtube_url && (
                    <Text style={styles.youtubeLabel}>YouTube: ✓</Text>
                  )}
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => handleEdit(project)}
                  >
                    <Ionicons name="create" size={20} color="#FFF" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDelete(project.id)}
                  >
                    <Ionicons name="trash" size={20} color="#FFF" />
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
              <Text style={styles.modalTitle}>
                {editMode ? 'Edit Project' : 'Add Project'}
              </Text>

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

              <Text style={styles.label}>Project Status *</Text>
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
                  {PROJECT_STATUSES.map((s) => (
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

              <TextInput
                style={styles.input}
                placeholder="YouTube URL (optional)"
                value={youtubeUrl}
                onChangeText={setYoutubeUrl}
              />

              <TouchableOpacity style={styles.pickButton} onPress={handlePickImage}>
                <Ionicons name="image" size={24} color="#FFF" />
                <Text style={styles.pickButtonText}>
                  {editMode ? 'Change Image (optional)' : 'Pick Image *'}
                </Text>
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
                    <Text style={styles.buttonText}>{editMode ? 'Update' : 'Add'}</Text>
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
  projectCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
  },
  projectImage: { width: '100%', height: 180 },
  projectContent: { padding: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  projectTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', flex: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginLeft: 8 },
  statusBadgeText: { fontSize: 18 },
  projectDescription: { fontSize: 14, color: '#666', lineHeight: 20, marginBottom: 8 },
  youtubeLabel: { fontSize: 12, color: '#FF0000', fontWeight: '600' },
  actions: {
    flexDirection: 'row',
    padding: 12,
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  actionButton: { padding: 10, borderRadius: 8, marginLeft: 8 },
  editButton: { backgroundColor: '#2196F3' },
  deleteButton: { backgroundColor: '#F44336' },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalScrollView: { flex: 1 },
  modalContent: { backgroundColor: '#FFF', margin: 20, marginTop: 60, borderRadius: 16, padding: 20, marginBottom: 30 },
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

