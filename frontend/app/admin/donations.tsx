import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { api } from '../../utils/api';
import { unwrapData } from '../../utils/dataApi';

type Donation = {
  id: string;
  donor_name: string;
  donor_email: string;
  donor_phone?: string;
  amount: number;
  currency: string;
  status: string;
  razorpay_payment_id?: string;
  created_at: string;
};

export default function AdminDonationsScreen() {
  const router = useRouter();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadDonations = async () => {
    setLoading(true);
    try {
      const response = await api.get('/donations/admin/history', { params: { search } });
      setDonations(unwrapData(response));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDonations().catch(() => setLoading(false));
  }, []);

  const renderItem = ({ item }: { item: Donation }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.amount}>{item.currency} {item.amount}</Text>
        <Text style={[styles.status, item.status === 'paid' && styles.paid]}>{item.status}</Text>
      </View>
      <Text style={styles.name}>{item.donor_name}</Text>
      <Text style={styles.text}>{item.donor_email}{item.donor_phone ? ` • ${item.donor_phone}` : ''}</Text>
      <Text style={styles.text}>{item.razorpay_payment_id || item.id}</Text>
      <Text style={styles.text}>{new Date(item.created_at).toLocaleString()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#FF9933', '#FF7722']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Donations</Text>
      </LinearGradient>
      <View style={styles.searchRow}>
        <TextInput style={styles.searchInput} placeholder="Search donations" value={search} onChangeText={setSearch} />
        <TouchableOpacity style={styles.searchButton} onPress={loadDonations}>
          <Ionicons name="search" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
      {loading ? (
        <View style={styles.loading}><ActivityIndicator size="large" color="#FF9933" /></View>
      ) : (
        <FlatList data={donations} renderItem={renderItem} keyExtractor={(item) => item.id} contentContainerStyle={styles.list} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { paddingTop: 50, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' },
  backButton: { marginRight: 12 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  searchRow: { flexDirection: 'row', margin: 20, marginBottom: 8 },
  searchInput: { flex: 1, backgroundColor: '#FFF', borderRadius: 12, padding: 12, fontSize: 16 },
  searchButton: { width: 48, marginLeft: 8, borderRadius: 12, backgroundColor: '#FF9933', alignItems: 'center', justifyContent: 'center' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 20, paddingTop: 8 },
  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 12, elevation: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  amount: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  status: { color: '#999', textTransform: 'capitalize' },
  paid: { color: '#138808', fontWeight: 'bold' },
  name: { marginTop: 8, fontSize: 16, fontWeight: 'bold', color: '#333' },
  text: { color: '#666', marginTop: 4 },
});
