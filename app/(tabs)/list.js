import { FlatList, View, Text, TouchableOpacity, StyleSheet, Platform, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import FilterBar from '../../components/FilterBar';
import { MOCK_PARKINGS } from '../../constants/mockData';
import { Colors } from '../../constants/colors';

function applyFilter(parkings, filter) {
  switch (filter) {
    case 'free':
      return parkings.filter((p) => p.isFree);
    case 'under25':
      return parkings.filter((p) => p.pricePerHour <= 25);
    case 'under50':
      return parkings.filter((p) => p.pricePerHour <= 50);
    default:
      return parkings;
  }
}

function navigateTo(lat, lng, name) {
  const label = encodeURIComponent(name);
  const url = Platform.select({
    ios: `maps:0,0?q=${label}@${lat},${lng}`,
    android: `geo:0,0?q=${lat},${lng}(${label})`,
  });
  Linking.canOpenURL(url).then((supported) => {
    if (supported) {
      Linking.openURL(url);
    } else {
      Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
    }
  });
}

function ParkingCard({ item }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.name}>{item.name}</Text>
        <View style={[styles.badge, item.isFree ? styles.badgeFree : styles.badgePaid]}>
          <Text style={styles.badgeText}>
            {item.isFree ? 'Gratis' : `${item.pricePerHour} kr/h`}
          </Text>
        </View>
      </View>
      <Text style={styles.address}>{item.address}</Text>
      {item.description ? <Text style={styles.desc}>{item.description}</Text> : null}
      <TouchableOpacity
        style={styles.navButton}
        onPress={() => navigateTo(item.lat, item.lng, item.name)}
      >
        <Text style={styles.navButtonText}>Navigera hit</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function ListScreen() {
  const [filter, setFilter] = useState('all');
  const filtered = applyFilter(MOCK_PARKINGS, filter);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FilterBar selected={filter} onSelect={setFilter} />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ParkingCard item={item} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No parkings found</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { padding: 12, gap: 10 },
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
  navButton: {
    marginTop: 10,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  navButtonText: { color: Colors.white, fontWeight: '600', fontSize: 13 },
  empty: { textAlign: 'center', color: Colors.subtext, marginTop: 40 },
});
