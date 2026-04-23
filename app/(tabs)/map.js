import { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import FilterBar from '../../components/FilterBar';
import ParkingDetail from '../../components/ParkingDetail';
import { fetchParkingsNearby } from '../../services/parkingApi';
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

export default function MapScreen() {
  const [location, setLocation] = useState(null);
  const [parkings, setParkings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Åtkomst nekad', 'Platsbehörighet krävs för att visa din position på kartan.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
      setLoading(true);
      try {
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

  const initialRegion = location
    ? { latitude: location.latitude, longitude: location.longitude, latitudeDelta: 0.05, longitudeDelta: 0.05 }
    : { latitude: 59.3293, longitude: 18.0686, latitudeDelta: 0.08, longitudeDelta: 0.08 };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FilterBar selected={filter} onSelect={setFilter} />
      <MapView style={styles.map} initialRegion={initialRegion} showsUserLocation>
        {filtered.map((p) => (
          <Marker
            key={p.id}
            coordinate={{ latitude: p.lat, longitude: p.lng }}
            pinColor={p.isFree ? Colors.free : Colors.paid}
            onPress={() => setSelected(p)}
          />
        ))}
      </MapView>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      )}
      <ParkingDetail parking={selected} onClose={() => setSelected(null)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  map: { flex: 1 },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
});
