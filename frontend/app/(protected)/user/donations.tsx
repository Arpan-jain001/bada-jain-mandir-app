import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  Modal,
  NativeModules,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import RazorpayCheckout from 'react-native-razorpay';
import { api, BACKEND_URL } from '../../../utils/api';
import { useAuthStore } from '../../../stores/authStore';
import { unwrapData } from '../../../utils/dataApi';

type Donation = {
  id: string;
  donor_name: string;
  donor_email?: string;
  donor_phone?: string;
  amount: number;
  currency: string;
  status: string;
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  created_at: string;
  receipt?: { id: string; receipt_number: string };
};

type RazorpayOrder = {
  key_id?: string;
  razorpayKey?: string;
  order_id?: string;
  orderId?: string;
  amount: number;
  currency: string;
  donation_id: string;
  donor_name: string;
  donor_email: string;
  donor_phone?: string;
};

export default function DonationsScreen() {
  const { user, token } = useAuthStore();
  const [donorName, setDonorName] = useState(user?.name || '');
  const [donorEmail, setDonorEmail] = useState(user?.email || '');
  const [donorPhone, setDonorPhone] = useState(user?.phone || '');
  const [amount, setAmount] = useState('');
  const [history, setHistory] = useState<Donation[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);

  const isRazorpayAvailable = () =>
    Boolean(NativeModules.RNRazorpayCheckout) && typeof RazorpayCheckout?.open === 'function';

  const fetchHistory = async () => {
    const response = await api.get('/donations/history', { params: { search, status: 'paid' } });
    setHistory(unwrapData(response));
  };

  useEffect(() => {
    fetchHistory().catch(() => undefined);
  }, []);

  const donate = async () => {
    const donationAmount = Number(amount);
    if (!donorName || !donorEmail || !donorPhone || !donationAmount || donationAmount < 1) {
      Alert.alert('Error', 'Please enter donor name, email, phone number and a valid donation amount');
      return;
    }

    setLoading(true);
    try {
      if (!isRazorpayAvailable()) {
        throw new Error('RAZORPAY_NATIVE_MODULE_MISSING');
      }

      const order = await api.post('/donations/create-order', {
        amount: donationAmount,
        donor_name: donorName,
        donor_email: donorEmail,
        donor_phone: donorPhone,
      });
      const orderData = unwrapData(order) as RazorpayOrder;
      const razorpayKey = orderData.key_id || orderData.razorpayKey;
      const razorpayOrderId = orderData.order_id || orderData.orderId;
      if (!razorpayKey || !razorpayOrderId || !orderData?.amount) {
        throw new Error('Payment order could not be created');
      }
      const payment = await RazorpayCheckout.open({
        key: razorpayKey,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Shri Digamber Bada Jain Mandir Parham',
        description: 'Temple Donation',
        order_id: razorpayOrderId,
        image: 'https://jainmandirparham.netlify.app/favicon.ico',
        prefill: {
          name: donorName,
          email: donorEmail,
          contact: donorPhone,
        },
        notes: {
          donation_id: orderData.donation_id,
        },
        theme: { color: '#FF9933' },
      });

      if (!payment?.razorpay_order_id || !payment?.razorpay_payment_id || !payment?.razorpay_signature) {
        throw new Error('Payment response was incomplete. Please try again.');
      }

      setVerifying(true);
      await api.post('/donations/verify-payment', payment);
      setSuccessVisible(true);
      setAmount('');
      await fetchHistory();
    } catch (error: any) {
      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.description ||
        error.error?.description ||
        error.message ||
        'Donation could not be completed';
      const missingNativeModule =
        message === 'RAZORPAY_NATIVE_MODULE_MISSING' ||
        message.includes('Native module') ||
        message.includes('open of null');
      Alert.alert('Payment Failed', missingNativeModule ? 'Razorpay native checkout is not linked in this app build. Create and install a development/APK build, then payment will open inside the app.' : message);
    } finally {
      setLoading(false);
      setVerifying(false);
    }
  };

  const openReceipt = (receiptId?: string) => {
    if (!receiptId) {
      Alert.alert('Receipt Pending', 'Receipt will be available after payment verification.');
      return;
    }
    Linking.openURL(`${BACKEND_URL}/api/donations/receipts/${receiptId}/download?token=${encodeURIComponent(token || '')}`);
  };

  const resendReceipt = async (receiptId?: string) => {
    if (!receiptId) return;
    await api.post(`/donations/receipts/${receiptId}/resend`);
    Alert.alert('Success', 'Receipt emailed successfully');
  };

  const shareReceipt = async (item: Donation) => {
    await Share.share({
      message: `Donation Receipt\nBada Jain Mandir Parham\nDonor: ${item.donor_name}\nAmount: ${item.currency} ${item.amount}\nTransaction: ${item.razorpay_payment_id || item.id}`,
    });
  };

  const renderHeader = () => (
    <>
      <View style={styles.form}>
        <Text style={styles.label}>Donor Name</Text>
        <TextInput
          style={styles.input}
          value={donorName}
          onChangeText={setDonorName}
          placeholder="Enter donor name"
        />
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={donorEmail}
          onChangeText={setDonorEmail}
          placeholder="Enter email"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          value={donorPhone}
          onChangeText={setDonorPhone}
          placeholder="Enter phone number"
          keyboardType="phone-pad"
        />
        <Text style={styles.label}>Donation Amount</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
          placeholder="Enter amount"
        />
        <TouchableOpacity style={styles.donateButton} onPress={donate} disabled={loading || verifying}>
          <LinearGradient colors={['#FF9933', '#FF7722']} style={styles.buttonGradient}>
            {loading || verifying ? <ActivityIndicator color="#FFF" /> : <Ionicons name="heart" size={20} color="#FFF" />}
            <Text style={styles.buttonText}>{verifying ? 'Verifying Payment...' : loading ? 'Opening Payment...' : 'Donate Now'}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={styles.searchRow}>
        <TextInput style={styles.searchInput} placeholder="Search donation history" value={search} onChangeText={setSearch} />
        <TouchableOpacity style={styles.searchButton} onPress={() => fetchHistory()}>
          <Ionicons name="search" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
    </>
  );

  const renderItem = ({ item }: { item: Donation }) => (
    <View style={styles.historyCard}>
      <View style={styles.historyTop}>
        <Text style={styles.historyAmount}>{item.currency} {item.amount}</Text>
        <Text style={[styles.status, item.status === 'paid' && styles.statusPaid]}>{item.status}</Text>
      </View>
      <Text style={styles.historyText}>{item.razorpay_payment_id || item.id}</Text>
      <Text style={styles.historyText}>{item.donor_name}{item.donor_phone ? ` • ${item.donor_phone}` : ''}</Text>
      <Text style={styles.historyText}>{new Date(item.created_at).toLocaleString()}</Text>
      <View style={styles.receiptActions}>
        <TouchableOpacity style={styles.smallButton} onPress={() => openReceipt(item.receipt?.id)}>
          <Ionicons name="download" size={16} color="#FF9933" />
          <Text style={styles.smallButtonText}>Download</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.smallButton} onPress={() => resendReceipt(item.receipt?.id)}>
          <Ionicons name="mail" size={16} color="#FF9933" />
          <Text style={styles.smallButtonText}>Email Again</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.smallButton} onPress={() => shareReceipt(item)}>
          <Ionicons name="share-social" size={16} color="#FF9933" />
          <Text style={styles.smallButtonText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#FF9933', '#FF7722']} style={styles.header}>
        <Text style={styles.headerTitle}>Donations</Text>
      </LinearGradient>

      <FlatList
        data={history}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.emptyText}>No donations yet</Text>}
        keyboardShouldPersistTaps="handled"
      />

      <Modal visible={successVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <Animatable.View animation="zoomIn" duration={450} style={styles.successCard}>
            <Ionicons name="checkmark-circle" size={72} color="#138808" />
            <Text style={styles.successTitle}>Donation Successful</Text>
            <TouchableOpacity style={styles.doneButton} onPress={() => setSuccessVisible(false)}>
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </Animatable.View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#FFF' },
  form: { backgroundColor: '#FFF', margin: 20, padding: 20, borderRadius: 16, elevation: 2 },
  label: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#DDD', borderRadius: 12, padding: 12, fontSize: 16, backgroundColor: '#F9F9F9' },
  donateButton: { borderRadius: 12, overflow: 'hidden', marginTop: 16 },
  buttonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16 },
  buttonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginLeft: 8 },
  searchRow: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 8 },
  searchInput: { flex: 1, backgroundColor: '#FFF', borderRadius: 12, padding: 12, fontSize: 16 },
  searchButton: { width: 48, marginLeft: 8, borderRadius: 12, backgroundColor: '#FF9933', alignItems: 'center', justifyContent: 'center' },
  list: { padding: 20, paddingTop: 8 },
  historyCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 12, elevation: 2 },
  historyTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  historyAmount: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  status: { fontSize: 13, color: '#999', textTransform: 'capitalize' },
  statusPaid: { color: '#138808', fontWeight: 'bold' },
  historyText: { color: '#666', marginTop: 6 },
  receiptActions: { flexDirection: 'row', marginTop: 12 },
  smallButton: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  smallButtonText: { color: '#FF9933', fontWeight: '600', marginLeft: 4 },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 30 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' },
  successCard: { width: '80%', backgroundColor: '#FFF', borderRadius: 20, padding: 24, alignItems: 'center' },
  successTitle: { fontSize: 22, fontWeight: 'bold', color: '#333', marginVertical: 16 },
  doneButton: { backgroundColor: '#FF9933', paddingHorizontal: 28, paddingVertical: 12, borderRadius: 12 },
  doneButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});
