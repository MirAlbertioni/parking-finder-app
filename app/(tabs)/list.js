import { useEffect, useState } from 'react';
import { FlatList, View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FilterBar from '../../components/FilterBar';
import ParkingDetail from '../../components/ParkingDetail';
import { fetchParkingsNearby } from '../../services/parkingApi';
import * as Location from 'expo-location';
import { Colors } from '../../constants/colors';

function applyFilter(parkings, filter) {
  switch (filter) {
    case 'free':
      return parkings.filter((p) => p.isFree);
    case 'under25':
      return parkings.filter((p) => p.pricePerHour != null && p.pricePerHour <= 25);
    case 'under50':
      return parkings.filter((p) => p.pricePerHour != null && p.pricePerHour <= 50);
    default:
      return parkings;
  }
}

function priceLabel(p) {
  if (p.isFree) return 'Gratis';
  if (p.pricePerHour != null) return `${p.pricePerHour} kr/h`;
  return 'Betald';
}

function ParkingCard({ item, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(item)} activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <Text style={styles.name}>{item.name}</Text>
        <View style={[styles.badge, item.isFree ? styles.badgeFree : styles.badgePaid]}>
          <Text style={styles.badgeText}>{priceLabel(item)}</Text>
        </View>
      </View>
      {item.address ? <Text style={styles.address}>{item.address}</Text> : null}
      {item.description ? <Text style={styles.desc}>{item.description}</Text> : null}
      {item.maxHours ? <Text style={styles.desc}>Max {item.maxHours} timmar</Text> : null}
    </TouchableOpacity>
  );
}

export default function ListScreen() {
  const [parkings, setParkings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      setLoading(true);
      try {
        const loc = await Location.getCurrentPositionAsync({});
        const data = await fetchParkingsNearby(loc.coords.latitude, loc.coords.longitude);
        setParkings(data);
      } catch {
        Alert.alert('Kunde inte ladda parkeringsdata', 'Kontrollera din anslutning och försök igen.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = applyFilter(parkings, filter);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FilterBar selected={filter} onSelect={setFilter} />
      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color={Colors.primary} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ParkingCard item={item} onPress={setSelected} />}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>Inga parkeringar hittades</Text>}
        />
      )}
      <ParkingDetail parking={selected} onClose={() => setSelected(null)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { padding: 12, gap: 10 },
  loader: { flex: 1 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 15, fontWeight: '700', color: Colors.text, flex: 1 },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  badgeFree: { backgroundColor: Colors.free },
  badgePaid: { backgroundColor: Colors.paid },
  badgeText: { color: Colors.white, fontSize: 12, fontWeight: '600' },
  address: { fontSize: 13, color: Colors.subtext, marginTop: 4 },
  desc: { fontSize: 12, color: Colors.subtext, marginTop: 2 },
  empty: { textAlign: 'center', color: Colors.subtext, marginTop: 40 },
});
