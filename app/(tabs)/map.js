import { useEffect, useState } from 'react';
import { View, StyleSheet, Platform, Linking, Alert } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { Text, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
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

export default function MapScreen() {
  const [location, setLocation] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location access is needed to show your position on the map.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
    })();
  }, []);

  const filtered = applyFilter(MOCK_PARKINGS, filter);

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
          >
            <Callout onPress={() => navigateTo(p.lat, p.lng, p.name)}>
              <View style={styles.callout}>
                <Text style={styles.calloutName}>{p.name}</Text>
                <Text style={styles.calloutPrice}>
                  {p.isFree ? 'Gratis' : `${p.pricePerHour} kr/h`}
                </Text>
                {p.maxHours && <Text style={styles.calloutSub}>Max {p.maxHours}h</Text>}
                <Text style={styles.calloutNav}>Navigera →</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  map: { flex: 1 },
  callout: { width: 160, padding: 4 },
  calloutName: { fontWeight: '700', fontSize: 14, color: Colors.text },
  calloutPrice: { fontSize: 13, color: Colors.primary, marginTop: 2 },
  calloutSub: { fontSize: 12, color: Colors.subtext },
  calloutNav: { fontSize: 12, color: Colors.primary, marginTop: 6, fontWeight: '600' },
});
