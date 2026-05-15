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

interface CommitteeMember {
  id: string;
  name: string;
  position: string;
  image_url: string;
  phone?: string;
}

export default function AdminCommitteeScreen() {
  const router = useRouter();
  const [members, setMembers] = useState<CommitteeMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const loadMembers = async () => {
    try {
      const response = await getResource('/committee', '/admin/committee');
      setMembers(response as any);
    } catch (error) {
      console.error('Error loading committee:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const handlePickImage = async () => {
    const image = await pickImage();
    if (image) {
      setSelectedImage(image.base64);
    }
  };

  const handleSubmit = async () => {
    if (!name || !position || !selectedImage) {
      Alert.alert('Error', 'Please fill all required fields and select an image');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('position', position);
      formData.append('image_data', selectedImage);
      if (phone) formData.append('phone', phone);

      await postResource('/committee', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Alert.alert('Success', 'Committee member added successfully');
      resetForm();
      loadMembers();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to add member');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this member?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteResource(`/committee/${id}`, `/admin/committee/${id}`);
            Alert.alert('Success', 'Member deleted successfully');
            loadMembers();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete member');
          }
        },
      },
    ]);
  };

  const resetForm = () => {
    setModalVisible(false);
    setName('');
    setPosition('');
    setPhone('');
    setSelectedImage(null);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#FF9933', '#FF7722']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Committee</Text>
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
          {members.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={80} color="#CCC" />
              <Text style={styles.emptyText}>No members yet. Tap + to add.</Text>
            </View>
          ) : (
            members.map((member) => (
              <View key={member.id} style={styles.memberCard}>
                <Image source={{ uri: member.image_url }} style={styles.memberImage} />
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <Text style={styles.memberPosition}>{member.position}</Text>
                  {member.phone && (
                    <Text style={styles.memberPhone}>{member.phone}</Text>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(member.id)}
                >
                  <Ionicons name="trash" size={20} color="#FFF" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <ScrollView style={styles.modalScrollView}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add Committee Member</Text>

              <TextInput
                style={styles.input}
                placeholder="Name *"
                value={name}
                onChangeText={setName}
              />

              <TextInput
                style={styles.input}
                placeholder="Position *"
                value={position}
                onChangeText={setPosition}
              />

              <TextInput
                style={styles.input}
                placeholder="Phone (optional)"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
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
  memberCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 3,
    alignItems: 'center',
  },
  memberImage: { width: 70, height: 70, borderRadius: 35, marginRight: 16 },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  memberPosition: { fontSize: 14, color: '#666', marginBottom: 4 },
  memberPhone: { fontSize: 12, color: '#999' },
  deleteButton: {
    backgroundColor: '#F44336',
    padding: 10,
    borderRadius: 20,
  },
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

