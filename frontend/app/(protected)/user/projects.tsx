import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getResource } from '../../../utils/dataApi';
import * as Animatable from 'react-native-animatable';
import { usePreferencesStore } from '../../../stores/preferencesStore';

type ProjectItem = {
  id: string;
  title: string;
  description: string;
  image_url: string;
  youtube_url?: string;
};

export default function ProjectsScreen() {
  const t = usePreferencesStore((state) => state.t);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [recentWork, setRecentWork] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('projects');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [projectsRes, workRes] = await Promise.all([
        getResource('/projects', '/admin/projects'),
        getResource('/recent-work', '/admin/recent-work'),
      ]);
      setProjects(projectsRes as any);
      setRecentWork(workRes as any);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openProject = (item: ProjectItem) => {
    setSelectedProject(item);
    setModalVisible(true);
  };

  const openYouTube = (url?: string) => {
    if (url) {
      Linking.openURL(url);
    }
  };

  const renderItem = ({ item, index }: { item: ProjectItem; index: number }) => (
    <Animatable.View animation="fadeInUp" delay={index * 100}>
      <TouchableOpacity
        style={styles.projectCard}
        onPress={() => openProject(item)}
      >
        <Image source={{ uri: item.image_url }} style={styles.projectImage} />
        <View style={styles.projectContent}>
          <Text style={styles.projectTitle}>{item.title}</Text>
          <Text style={styles.projectDescription} numberOfLines={2}>
            {item.description}
          </Text>
          <TouchableOpacity style={styles.viewButton}>
            <Text style={styles.viewButtonText}>{t('viewDetails')}</Text>
            <Ionicons name="arrow-forward" size={16} color="#FF9933" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animatable.View>
  );

  const data = activeTab === 'projects' ? projects : recentWork;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF9933" />
        <Text style={styles.loadingText}>{t('loading')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#FF9933', '#FF7722']} style={styles.header}>
        <Text style={styles.headerTitle}>{t('projectsAndWork')}</Text>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'projects' && styles.activeTab,
          ]}
          onPress={() => setActiveTab('projects')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'projects' && styles.activeTabText,
            ]}
          >
            {t('projects')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'work' && styles.activeTab,
          ]}
          onPress={() => setActiveTab('work')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'work' && styles.activeTabText,
            ]}
          >
            {t('recentWork')}
          </Text>
        </TouchableOpacity>
      </View>

      {data.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="folder-outline" size={80} color="#CCC" />
          <Text style={styles.emptyText}>{t('noItems')}</Text>
        </View>
      ) : (
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item: ProjectItem) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Project Detail Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <LinearGradient colors={['#FF9933', '#FF7722']} style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close" size={28} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>{t('projectDetails')}</Text>
          </LinearGradient>

          {selectedProject && (
            <ScrollView style={styles.modalContent}>
              <Image
                source={{ uri: selectedProject.image_url }}
                style={styles.modalImage}
              />
              <View style={styles.modalDetails}>
                <Text style={styles.modalTitle}>{selectedProject.title}</Text>
                <Text style={styles.modalDescription}>
                  {selectedProject.description}
                </Text>

                {selectedProject.youtube_url && (
                  <TouchableOpacity
                    style={styles.youtubeButton}
                    onPress={() => openYouTube(selectedProject.youtube_url)}
                  >
                    <Ionicons name="logo-youtube" size={24} color="#FFF" />
                    <Text style={styles.youtubeButtonText}>{t('watchVideo')}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>
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
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#FF9933',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#FFF',
  },
  listContainer: {
    padding: 20,
  },
  projectCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  projectImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#E0E0E0',
  },
  projectContent: {
    padding: 16,
  },
  projectTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  projectDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF9933',
    marginRight: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  modalHeader: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalClose: {
    marginRight: 12,
  },
  modalHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  modalContent: {
    flex: 1,
  },
  modalImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#E0E0E0',
  },
  modalDetails: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  modalDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 24,
  },
  youtubeButton: {
    flexDirection: 'row',
    backgroundColor: '#FF0000',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  youtubeButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});


